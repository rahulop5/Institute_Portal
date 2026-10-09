// Academic Office: read-only on marks and grades. The ONLY writes here are
// release (status approved -> released + history) and importing past F's into
// CourseAttempt. There is deliberately no route that touches GradeEntry.
import mongoose from "mongoose";
import Course from "../../models/feedback/Course.js";
import Student from "../../models/feedback/Student.js";
import Faculty from "../../models/Faculty.js";
import BTP from "../../models/BTP.js";
import Honors from "../../models/Honors.js";
import AP from "../../models/AP.js";
import CourseGrading from "../../models/grades/CourseGrading.js";
import CourseGradingVersion from "../../models/grades/CourseGradingVersion.js";
import CourseAttempt from "../../models/grades/CourseAttempt.js";
import GradeEntry from "../../models/grades/GradeEntry.js";
import {openBacklogsFrom, semesterRank} from "../../utils/gradeEngine.js";
import {GradeError, handle, histEntry} from "../../utils/gradeGuards.js";
import SectionSheet from "../../models/grades/SectionSheet.js";
import {snapshot, writeAttempts, ensureGrading, openBacklogPool, placeBacklog, assertBacklogOpen} from "../../utils/gradeService.js";
import {getCurrentSemester} from "../../utils/semesterUtils.js";

export const listCourses = handle(async (req, res) => {
    const courses = await Course.find().populate("faculty", "name").sort({semester: -1, name: 1}).lean();
    res.json({courses: courses.map((c) => ({_id: c._id, name: c.name, code: c.code, abbreviation: c.abbreviation, semester: c.semester, department: c.department, credits: c.credits, faculty: c.faculty.map((f) => f.name)}))});
});

// No feedback / ratings here, only identity and what they teach.
export const listFaculty = handle(async (req, res) => {
    const faculty = await Faculty.find().select("name email dept emp_no").lean();
    const courses = await Course.find().select("name code semester faculty").lean();
    res.json({faculty: faculty.map((f) => ({
        _id: f._id, name: f.name, email: f.email, dept: f.dept,
        courses: courses.filter((c) => c.faculty.map(String).includes(String(f._id))).map((c) => ({name: c.name, code: c.code, semester: c.semester})),
    }))});
});

export const listProjects = handle(async (req, res) => {
    const out = [];
    for (const [program, Model] of [["BTP", BTP], ["Honors", Honors], ["AP", AP]]) {
        const projects = await Model.find({status: "active"})
            .populate("guide", "name email")
            .populate({path: "students.student", populate: {path: "student", select: "name email rollNumber"}})
            .lean();
        for (const p of projects)
            for (const s of p.students || []) {
                const st = s.student?.student;
                if (!st) continue;
                out.push({program, student: {name: st.name, rollNumber: st.rollNumber, email: st.email}, guide: p.guide ? {name: p.guide.name, email: p.guide.email} : null, topic: p.name || null});
            }
    }
    res.json({projects: out});
});

export const listGradings = handle(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = {$in: String(req.query.status).split(",")};
    const gradings = await CourseGrading.find(filter).populate({path: "course", select: "name code faculty", populate: {path: "faculty", select: "name"}}).sort({updatedAt: -1}).lean();
    const ids = gradings.map((g) => g._id);
    const released = await CourseGradingVersion.find({courseGrading: {$in: ids}, kind: "released"}).sort({version: -1}).lean();
    const latest = {};
    for (const v of released) if (!latest[String(v.courseGrading)]) latest[String(v.courseGrading)] = v;
    res.json({gradings: gradings.map((g) => {
        const v = latest[String(g._id)];
        const counts = {};
        for (const r of v?.rows || []) if (r.finalGrade && !r.absent) counts[r.finalGrade] = (counts[r.finalGrade] || 0) + 1;
        return {
            _id: g._id, course: g.course?.name, code: g.course?.code, semester: g.semester, status: g.status, version: g.version,
            amendment: g.amendment?.type || null, faculty: (g.course?.faculty || []).map((f) => f.name), releasedAt: g.releasedAt,
            distribution: v ? counts : null,
        };
    })});
});

async function viewFor(grading, version) {
    // The AO sees the submitted/approved draft before release and fixed snapshots after.
    const v = version ? Number(version) : grading.version;
    const snap = (await CourseGradingVersion.findOne({courseGrading: grading._id, version: v, kind: "released"}).lean())
        || (await CourseGradingVersion.findOne({courseGrading: grading._id, version: v, kind: "submitted"}).lean());
    if (!snap) throw new GradeError("No snapshot for that version yet.", 404);
    return snap;
}

export const getGrading = handle(async (req, res) => {
    const grading = await CourseGrading.findById(req.params.id).populate("course", "name code").populate("approvals.faculty", "name").lean();
    if (!grading) throw new GradeError("Not found", 404);
    const versions = await CourseGradingVersion.find({courseGrading: grading._id}).select("version kind releasedAt createdAt versionNote amendment").sort({version: -1}).lean();
    let snap = null;
    if (["cc_review", "approved", "released"].includes(grading.status) || req.query.version) snap = await viewFor(grading, req.query.version);
    else if (versions.length) snap = await viewFor(grading, Math.max(...versions.map((v) => v.version))); // amendment in progress: show the last fixed version
    res.json({
        grading: {_id: grading._id, status: grading.status, version: grading.version, semester: grading.semester, course: grading.course, releasedAt: grading.releasedAt, approvals: grading.approvals, amendment: grading.amendment},
        versions: [...new Map(versions.map((v) => [v.version, v])).values()],
        snapshot: snap,
        chairs: (await Course.findById(grading.course._id).populate("faculty", "name").lean()).faculty.map((f) => f.name),
    });
});

// approved -> released, writes the fixed snapshot and every student's course history atomically.
export const release = handle(async (req, res) => {
    const session = await mongoose.startSession();
    let version;
    try {
        await session.withTransaction(async () => {
            const grading = await CourseGrading.findOneAndUpdate(
                {_id: req.body.gradingId, status: "approved"},
                {$set: {status: "released", releasedAt: new Date()}, $push: {history: histEntry("AcademicOffice", req.user.email, "released")}},
                {new: true, session}
            );
            if (!grading) throw new GradeError("This grading is not approved, or was already released.", 409);
            const course = await Course.findById(grading.course).session(session);
            await snapshot(grading, "released", {session, createdBy: req.user.email, releasedAt: grading.releasedAt});
            await writeAttempts(grading, course, {session});
            // the amendment is now history; amended flags and stashed prior values are done with
            await GradeEntry.updateMany({courseGrading: grading._id}, {$set: {amended: false}, $unset: {prev: ""}}, {session});
            version = grading.version;
        });
    } finally { await session.endSession(); }
    res.json({version, message: `Version ${version} released to students.`});
});

// ---------------------------------------------------------------- backlog
// The Academic Office hands backlog students to faculty. The assignment is the
// student's (empty) GradeEntry on that faculty member's section sheet.

// The offering a backlog student will sit: this semester's, else the latest later one.
async function offeringFor(courseKey, lastSemester) {
    const cur = getCurrentSemester();
    const later = (await Course.find({abbreviation: courseKey}).populate("faculty", "name").lean()).filter((c) => semesterRank(c.semester) > semesterRank(lastSemester));
    return later.find((c) => c.semester === cur) || later.sort((x, y) => semesterRank(y.semester) - semesterRank(x.semester))[0] || null;
}

export const backlog = handle(async (req, res) => {
    const attempts = await CourseAttempt.find().lean();
    const all = {};
    for (const a of attempts) (all[`${a.student}|${a.courseKey}`] ||= []).push(a);
    const open = openBacklogsFrom(attempts);
    const students = await Student.find({_id: {$in: open.map((a) => a.student)}}).select("name rollNumber batch").lean();
    const sBy = Object.fromEntries(students.map((s) => [String(s._id), s]));

    const offerings = {};
    for (const a of open) {
        const k = `${a.courseKey}|${a.semester}`;
        if (!(k in offerings)) offerings[k] = await offeringFor(a.courseKey, a.semester);
    }
    const ctx = {};
    for (const c of Object.values(offerings)) {
        if (!c || ctx[String(c._id)]) continue;
        const grading = await CourseGrading.findOne({course: c._id}).lean();
        const sheets = grading ? await SectionSheet.find({courseGrading: grading._id}).lean() : [];
        const entries = grading ? await GradeEntry.find({courseGrading: grading._id, isBacklog: true}).lean() : [];
        ctx[String(c._id)] = {grading, sheetBy: Object.fromEntries(sheets.map((x) => [String(x._id), x])), entryBy: Object.fromEntries(entries.map((e) => [String(e.student), e]))};
    }
    const nextSem = nextSemester(getCurrentSemester());
    res.json({backlog: open.map((a) => {
        const hist = all[`${a.student}|${a.courseKey}`].sort((x, y) => semesterRank(x.semester) - semesterRank(y.semester) || x.version - y.version);
        const c = offerings[`${a.courseKey}|${a.semester}`];
        const x = c && ctx[String(c._id)];
        const entry = x?.entryBy[String(a.student)];
        const sheet = entry && x.sheetBy[String(entry.sheet)];
        const marks = !!entry && (Object.keys(entry.marks || {}).length > 0 || entry.absent);
        const openForAssign = !!c && (!x.grading || (["setup", "collecting"].includes(x.grading.status) && !x.grading.amendment?.type));
        const locked = marks || (!!entry && sheet?.status === "ready") || (!!c && !openForAssign);
        return {
            studentId: a.student, rollNumber: sBy[String(a.student)]?.rollNumber, name: sBy[String(a.student)]?.name,
            courseKey: a.courseKey, courseName: a.courseName, attempts: hist.length, lastSemester: a.semester, nextOpportunity: c ? c.semester : nextSem,
            source: a.source,
            offering: c ? {courseId: c._id, name: c.name, code: c.code, semester: c.semester, faculty: c.faculty.map((f) => ({_id: f._id, name: f.name}))} : null,
            assignedFacultyId: sheet?.faculty || null,
            locked,
            reason: !c ? "No offering of this course yet" : marks ? "Marks already entered" : locked ? "Grading has moved on" : null,
        };
    }).sort((x, y) => String(x.rollNumber).localeCompare(String(y.rollNumber)))});
});

async function openOffering(courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new GradeError("That course offering doesn't exist", 404);
    const grading = await ensureGrading(course);
    assertBacklogOpen(grading);
    return {course, grading};
}

// Assign one student to a faculty member of the offering (facultyId null = unassign).
export const assignBacklog = handle(async (req, res) => {
    const {studentId, courseId, facultyId} = req.body;
    const {course, grading} = await openOffering(courseId);
    let sheet = null;
    if (facultyId) {
        if (!course.faculty.map(String).includes(String(facultyId))) throw new GradeError("That faculty member doesn't teach this course.");
        sheet = await SectionSheet.findOne({courseGrading: grading._id, faculty: facultyId});
        if (!sheet) throw new GradeError("Section not found", 404);
    }
    const pool = await openBacklogPool(grading);
    const session = await mongoose.startSession();
    try { await session.withTransaction(async () => placeBacklog(grading, pool, studentId, sheet, session)); }
    finally { await session.endSession(); }
    res.json({message: sheet ? "Assigned." : "Unassigned."});
});

// Random, even split: each unassigned student goes to a random one of the least-loaded faculty.
export const assignBacklogRandomly = handle(async (req, res) => {
    const only = req.body.courseId ? [String(req.body.courseId)] : null;
    const open = openBacklogsFrom(await CourseAttempt.find().lean());
    const byOffering = new Map();
    for (const a of open) {
        const c = await offeringFor(a.courseKey, a.semester);
        if (!c || (only && !only.includes(String(c._id)))) continue;
        if (!byOffering.has(String(c._id))) byOffering.set(String(c._id), {c, students: new Set()});
        byOffering.get(String(c._id)).students.add(String(a.student));
    }
    const out = {assigned: 0, skipped: []};
    for (const {c, students} of byOffering.values()) {
        let grading;
        try { ({grading} = await openOffering(c._id)); } catch (e) { out.skipped.push(`${c.name}: ${e.message}`); continue; }
        const pool = await openBacklogPool(grading);
        const placed = new Set((await GradeEntry.find({courseGrading: grading._id}).select("student").lean()).map((e) => String(e.student)));
        const todo = pool.map((p) => String(p.student)).filter((id) => students.has(id) && !placed.has(id));
        const sheets = (await SectionSheet.find({courseGrading: grading._id})).filter((x) => x.status === "editing");
        if (todo.length && !sheets.length) { out.skipped.push(`${c.name}: every section is marked ready`); continue; }
        const load = Object.fromEntries(await Promise.all(sheets.map(async (x) => [String(x._id), await GradeEntry.countDocuments({sheet: x._id, isBacklog: true})])));
        const order = todo.sort(() => Math.random() - 0.5);
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                for (const id of order) {
                    const min = Math.min(...sheets.map((x) => load[String(x._id)]));
                    const cands = sheets.filter((x) => load[String(x._id)] === min);
                    const target = cands[Math.floor(Math.random() * cands.length)];
                    await placeBacklog(grading, pool, id, target, session);
                    load[String(target._id)]++;
                }
            });
        } finally { await session.endSession(); }
        out.assigned += order.length;
        if (order.length) await CourseGrading.updateOne({_id: grading._id}, {$push: {history: histEntry("AcademicOffice", req.user.email, "backlog_assigned", `${order.length} student(s), random`)}});
    }
    res.json({...out, message: out.assigned ? `Assigned ${out.assigned} backlog student(s) at random.` : "Nothing left to assign."});
});

function nextSemester(code) {
    const [t, yy] = [code[0], Number(code.slice(1))];
    return t === "S" ? `M${String(yy).padStart(2, "0")}` : `S${String(yy + 1).padStart(2, "0")}`;
}

export const studentHistory = handle(async (req, res) => {
    const student = await Student.findById(req.params.studentId).select("name rollNumber").lean();
    if (!student) throw new GradeError("Student not found", 404);
    const attempts = await CourseAttempt.find({student: student._id}).lean();
    attempts.sort((a, b) => semesterRank(a.semester) - semesterRank(b.semester) || a.version - b.version);
    res.json({student, attempts: attempts.map((a) => ({courseKey: a.courseKey, courseName: a.courseName, semester: a.semester, attemptType: a.attemptType, grade: a.grade, version: a.version, source: a.source}))});
});

// One-off seeding of earlier F's (no history exists before the first release).
export const importBacklog = handle(async (req, res) => {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    if (!rows.length) throw new GradeError("No rows to import");
    const rolls = [...new Set(rows.map((r) => String(r.rollNumber || "").trim()))];
    const students = await Student.find({rollNumber: {$in: rolls}}).select("rollNumber").lean();
    const byRoll = Object.fromEntries(students.map((s) => [s.rollNumber.toUpperCase(), s]));
    const result = {imported: 0, skipped: 0, unmatched: [], invalid: []};
    for (const r of rows) {
        const roll = String(r.rollNumber || "").trim();
        const courseKey = String(r.courseKey || "").trim();
        const semester = String(r.semester || "").trim().toUpperCase();
        const st = byRoll[roll.toUpperCase()];
        if (!st) { result.unmatched.push(roll); continue; }
        if (!courseKey || !/^[MS]\d{2}$/.test(semester)) { result.invalid.push(roll); continue; }
        try {
            await CourseAttempt.create({student: st._id, courseKey, courseName: r.courseName, semester, grade: "F", source: "imported", attemptType: "regular"});
            result.imported++;
        } catch (e) {
            if (e.code !== 11000) throw e;
            result.skipped++;
        }
    }
    res.json(result);
});

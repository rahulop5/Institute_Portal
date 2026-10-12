// Academic Office: read-only on marks and grades. The ONLY writes here are
// release (status approved -> released + history) and importing past F's into
// CourseAttempt. There is deliberately no route that touches GradeEntry.
import mongoose from "mongoose";
import Course from "../../models/feedback/Course.js";
import Student from "../../models/feedback/Student.js";
import Question from "../../models/feedback/Question.js";
import Analytics from "../../models/feedback/Analytics.js";
import SectionSheet from "../../models/grades/SectionSheet.js";
import Faculty from "../../models/Faculty.js";
import BTP from "../../models/BTP.js";
import Honors from "../../models/Honors.js";
import AP from "../../models/AP.js";
import CourseGrading from "../../models/grades/CourseGrading.js";
import CourseGradingVersion from "../../models/grades/CourseGradingVersion.js";
import CourseAttempt from "../../models/grades/CourseAttempt.js";
import GradeEntry from "../../models/grades/GradeEntry.js";
import {semesterRank} from "../../utils/gradeEngine.js";
import {GradeError, handle, histEntry} from "../../utils/gradeGuards.js";
import {snapshot, writeAttempts} from "../../utils/gradeService.js";
import {getCurrentSemester} from "../../utils/semesterUtils.js";

export const listCourses = handle(async (req, res) => {
    const courses = await Course.find().populate("faculty", "name").sort({semester: -1, name: 1}).lean();
    const gradings = await CourseGrading.find({course: {$in: courses.map((c) => c._id)}}).select("course status").lean();
    const statusOf = Object.fromEntries(gradings.map((g) => [String(g.course), g.status]));
    res.json({courses: courses.map((c) => ({
        _id: c._id, name: c.name, code: c.code, abbreviation: c.abbreviation, semester: c.semester, department: c.department, credits: c.credits,
        faculty: c.faculty.map((f) => f.name),
        team: c.faculty.map((f) => ({_id: f._id, name: f.name})),
        coordinatorId: c.coordinator || null,
        // the team can change until the components are agreed
        teamLocked: !!statusOf[String(c._id)] && statusOf[String(c._id)] !== "setup",
    }))});
});

// The Academic Office picks who teaches a course and which of them is the coordinator
// (sets the components, submits the grading). Nothing about marks or grades is touched.
export const setCourseTeam = handle(async (req, res) => {
    const course = await Course.findById(req.body.courseId);
    if (!course) throw new GradeError("That course doesn't exist", 404);
    const facultyIds = [...new Set((req.body.facultyIds || []).map(String))];
    const coordinatorId = String(req.body.coordinatorId || "");
    if (!facultyIds.length) throw new GradeError("Pick at least one faculty member.");
    if (!facultyIds.includes(coordinatorId)) throw new GradeError("The coordinator must be one of the course's faculty.");
    const found = await Faculty.find({_id: {$in: facultyIds}}).select("_id").lean();
    if (found.length !== facultyIds.length) throw new GradeError("One of those faculty members doesn't exist.");

    const grading = await CourseGrading.findOne({course: course._id});
    if (grading && grading.status !== "setup")
        throw new GradeError("Marks are already being collected for this course, so the team can't change now.", 409);

    const before = course.faculty.map(String);
    const added = facultyIds.filter((id) => !before.includes(id));
    course.faculty = facultyIds;
    course.coordinator = coordinatorId;
    await course.save();

    if (grading) {
        // sheets and agreements belong to the people on the team, so start the setup step again
        const removed = before.filter((id) => !facultyIds.includes(id));
        if (removed.length) await SectionSheet.deleteMany({courseGrading: grading._id, faculty: {$in: removed}});
        await CourseGrading.updateOne({_id: grading._id}, {$set: {componentAgreements: []}, $push: {history: histEntry("AcademicOffice", req.user.email, "team_changed")}});
    }
    // the feedback module keeps per-faculty analytics for each course they teach
    if (added.length) {
        const questions = await Question.find();
        const blank = questions.map((q) => ({question: q._id, average: 0, min: 0, max: 0, responseCount: 0, textResponses: []}));
        for (const id of added) {
            const analytics = (await Analytics.findOne({faculty: id})) || new Analytics({faculty: id, courses: []});
            if (!analytics.courses.some((c) => String(c.course) === String(course._id))) {
                analytics.courses.push({course: course._id, questions: blank, totalResponses: 0});
                await analytics.save();
            }
        }
    }
    res.json({message: "Course team saved."});
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

// Send an approved grading back to the faculty with a remark. Marks and grades are not touched:
// the status goes back to the grading draft and earlier approvals are cleared, as in a CC send-back.
export const sendBack = handle(async (req, res) => {
    const remark = String(req.body.remark || "").trim();
    if (!remark) throw new GradeError("A remark is required to send this back.");
    const upd = await CourseGrading.findOneAndUpdate(
        {_id: req.body.gradingId, status: "approved"},
        {$set: {status: "grading", approvals: []}, $push: {history: histEntry("AcademicOffice", req.user.email, "ao_sent_back", remark)}},
        {new: true}
    );
    if (!upd) throw new GradeError("This grading is not waiting for release, or was already released.", 409);
    res.json({message: "Sent back to the faculty."});
});

// ---------------------------------------------------------------- backlog
// The Academic Office keeps the record of who has an open F. It does not decide
// who sits with which faculty: it shares its own list, and each faculty member
// adds those students to their section sheet.

// The offering a backlog student will sit: this semester's, else the latest later one.
async function offeringFor(courseKey, lastSemester) {
    const cur = getCurrentSemester();
    const later = (await Course.find({abbreviation: courseKey}).lean()).filter((c) => semesterRank(c.semester) > semesterRank(lastSemester));
    return later.find((c) => c.semester === cur) || later.sort((x, y) => semesterRank(y.semester) - semesterRank(x.semester))[0] || null;
}

// Everyone who has ever had an F in a course, with how it went since: still open (the latest
// attempt is an F) or cleared (a later pass). A student sitting it right now shows as "sitting".
export const backlog = handle(async (req, res) => {
    const attempts = await CourseAttempt.find().lean();
    const groups = {};
    for (const a of attempts) (groups[`${a.student}|${a.courseKey}`] ||= []).push(a);
    const byTime = (x, y) => semesterRank(x.semester) - semesterRank(y.semester) || x.version - y.version || new Date(x.createdAt) - new Date(y.createdAt);
    const failed = Object.values(groups).filter((list) => list.some((a) => a.grade === "F")).map((list) => list.sort(byTime));

    const studentIds = [...new Set(failed.map((l) => String(l[0].student)))];
    const students = await Student.find({_id: {$in: studentIds}}).select("name rollNumber batch").lean();
    const sBy = Object.fromEntries(students.map((s) => [String(s._id), s]));

    // students whose repeat attempt is on a sheet right now (grading not released yet)
    const keys = [...new Set(failed.map((l) => l[0].courseKey))];
    const live = await CourseGrading.find({courseKey: {$in: keys}, status: {$ne: "released"}}).select("courseKey semester status").lean();
    const liveBy = Object.fromEntries(live.map((g) => [String(g._id), g]));
    const entries = live.length ? await GradeEntry.find({courseGrading: {$in: live.map((g) => g._id)}, student: {$in: studentIds}}).select("courseGrading student").lean() : [];
    const sitting = {};
    for (const e of entries) {
        const g = liveBy[String(e.courseGrading)];
        sitting[`${e.student}|${g.courseKey}`] = {semester: g.semester, status: g.status};
    }

    const nextSem = nextSemester(getCurrentSemester());
    const offerings = {};
    const rows = [];
    for (const list of failed) {
        const last = list[list.length - 1];
        const open = last.grade === "F";
        const lastF = [...list].reverse().find((a) => a.grade === "F");
        let offering = null;
        if (open) {
            const k = `${last.courseKey}|${last.semester}`;
            if (!(k in offerings)) offerings[k] = await offeringFor(last.courseKey, last.semester);
            offering = offerings[k];
        }
        const s = sBy[String(last.student)];
        rows.push({
            studentId: last.student, rollNumber: s?.rollNumber, name: s?.name,
            courseKey: last.courseKey, courseName: last.courseName,
            status: open ? "open" : "cleared",
            attempts: list.length, lastSemester: lastF.semester,
            history: list.map((a) => ({semester: a.semester, grade: a.grade, source: a.source})),
            clearedIn: open ? null : last.semester,
            sitting: sitting[`${last.student}|${last.courseKey}`] || null,
            nextOpportunity: offering ? offering.semester : nextSem,
            source: lastF.source,
            offering: offering ? {courseId: offering._id, name: offering.name, code: offering.code, semester: offering.semester} : null,
        });
    }
    rows.sort((x, y) => (x.status === y.status ? 0 : x.status === "open" ? -1 : 1) || String(x.rollNumber).localeCompare(String(y.rollNumber)));
    res.json({backlog: rows});
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

import mongoose from "mongoose";
import Course from "../../models/feedback/Course.js";
import Enrollment from "../../models/feedback/Enrollment.js";
import Student from "../../models/feedback/Student.js";
import Faculty from "../../models/Faculty.js";
import CourseGrading from "../../models/grades/CourseGrading.js";
import SectionSheet from "../../models/grades/SectionSheet.js";
import GradeEntry from "../../models/grades/GradeEntry.js";
import CourseGradingVersion from "../../models/grades/CourseGradingVersion.js";
import GradeCorrectionRequest from "../../models/grades/GradeCorrectionRequest.js";
import {
    grade, computeTotal, validateComponents, normaliseBands, missingComponents, overMax, reexamPreview, finalGradeOf, BAND_KEYS,
} from "../../utils/gradeEngine.js";
import {canOverride} from "../../utils/gradePermissions.js";
import {GradeError, handle, getFaculty, requireCourseFaculty, requireSectionOwner, histEntry} from "../../utils/gradeGuards.js";
import {
    ensureGrading, openBacklogPool, computeAndStore, advanceIfAllReady, snapshot, buildCourseView, attemptLabel, LOCKED_STATUSES,
} from "../../utils/gradeService.js";

const q = (req) => ({...req.query, ...req.body});
const userCtx = (faculty, course) => ({facultyId: faculty._id, courseFacultyIds: course.faculty});
const lockMessage = async (grading) => {
    const map = {
        setup: "Components have not been agreed by everyone yet.",
        grading: "All sections are ready and the course is being graded. Reopen your section to change marks.",
        cc_review: "The grading is with the CC review. It is locked until it is approved or sent back.",
        approved: "The grading is approved and waiting for the Academic Office.",
        released: "The grading is released. Open an amendment to change it.",
    };
    return map[grading.status] || "This is locked right now.";
};
const slug = (s, i) => (String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "c") + "_" + i;


// ---------------------------------------------------------------- reads
export const myCourses = handle(async (req, res) => {
    const faculty = await getFaculty(req);
    const courses = await Course.find({faculty: faculty._id}).sort({semester: -1, name: 1}).lean();
    const out = [];
    for (const c of courses) {
        const grading = await CourseGrading.findOne({course: c._id}).lean();
        let sheets = [];
        let mine = null;
        if (grading) {
            sheets = await SectionSheet.find({courseGrading: grading._id}).lean();
            mine = sheets.find((s) => String(s.faculty) === String(faculty._id));
        }
        out.push({
            courseId: c._id, name: c.name, code: c.code, abbreviation: c.abbreviation, semester: c.semester,
            facultyCount: c.faculty.length, soleFaculty: c.faculty.length === 1,
            status: grading?.status || "setup", version: grading?.version || 1,
            sectionsReady: sheets.filter((s) => s.status === "ready").length, sectionsTotal: c.faculty.length,
            mySectionStatus: mine?.status || "editing", amendment: grading?.amendment?.type || null,
        });
    }
    res.json({courses: out});
});

export const getCourse = handle(async (req, res) => {
    const {faculty, course} = await requireCourseFaculty(req, q(req).courseId);
    const grading = await ensureGrading(course);
    const view = await buildCourseView(grading, course, faculty._id);
    const me = String(faculty._id);
    view.permissions = {
        cutoffs: canOverride(userCtx(faculty, course), "cutoffs"),
        moveToP: Object.fromEntries(view.rows.filter((r) => r.computedGrade === "F").map((r) => [String(r.id), canOverride(userCtx(faculty, course), "f_to_p", {sheetFacultyId: r.sectionFacultyId})])),
    };
    view.myApproved = grading.approvals.some((a) => String(a.faculty) === me);
    view.myAgreed = grading.componentAgreements.some((a) => String(a.faculty) === me);
    view.mySheetId = view.sections.find((s) => String(s.facultyId) === me)?._id;
    view.backlog = await backlogView(grading);
    res.json(view);
});

async function backlogView(grading) {
    const pool = await openBacklogPool(grading);
    if (!pool.length) return [];
    const students = await Student.find({_id: {$in: pool.map((p) => p.student)}}).select("name rollNumber").lean();
    const byId = Object.fromEntries(students.map((s) => [String(s._id), s]));
    const entries = await GradeEntry.find({courseGrading: grading._id, student: {$in: pool.map((p) => p.student)}}).lean();
    const entryBy = Object.fromEntries(entries.map((e) => [String(e.student), e]));
    return pool
        .map((p) => {
            const e = entryBy[String(p.student)];
            return {
                studentId: p.student, rollNumber: byId[String(p.student)]?.rollNumber, name: byId[String(p.student)]?.name,
                attempts: p.attempts, lastSemester: p.semester, note: attemptLabel(p.attempts, p.semester),
                sheetId: e?.sheet || null, hasMarks: !!e && (Object.keys(e.marks || {}).length > 0 || e.absent),
            };
        })
        .sort((a, b) => String(a.rollNumber).localeCompare(String(b.rollNumber)));
}

export const getSection = handle(async (req, res) => {
    const {faculty, course, grading, sheet} = await requireSectionOwner(req, q(req).courseId);
    const entries = await GradeEntry.find({courseGrading: grading._id, sheet: sheet._id}).populate("student", "name rollNumber").lean();
    const live = grading.components.length && entries.length;
    const rows = entries
        .map((e) => ({
            studentId: e.student._id, rollNumber: e.student.rollNumber, name: e.student.name, marks: e.marks || {},
            total: computeTotal(e.marks, grading.components), isBacklog: e.isBacklog, absent: e.absent, amended: e.amended,
        }))
        .sort((a, b) => Number(a.isBacklog) - Number(b.isBacklog) || String(a.rollNumber).localeCompare(String(b.rollNumber)));
    const backlog = await backlogView(grading);
    const noteBy = Object.fromEntries(backlog.map((b) => [String(b.studentId), b.note]));
    for (const r of rows) r.backlogNote = r.isBacklog ? noteBy[String(r.studentId)] || "Backlog" : null;

    const allSheets = await SectionSheet.find({courseGrading: grading._id}).populate("faculty", "name").lean();
    const conflicts = [];
    for (const s of allSheets)
        for (const c of s.conflicts || []) {
            const involved = String(s._id) === String(sheet._id) || String(c.claimedBy) === String(sheet._id);
            if (!involved) continue;
            const st = await Student.findById(c.student).select("name rollNumber").lean();
            const holder = allSheets.find((x) => String(x._id) === String(c.claimedBy));
            conflicts.push({studentId: c.student, rollNumber: st?.rollNumber, name: st?.name, enteredBy: s.faculty?.name, heldBy: holder?.faculty?.name, mine: String(s._id) === String(sheet._id)});
        }
    const editable = grading.componentsLocked && grading.status === "collecting" && sheet.status === "editing";
    const waiting = allSheets.filter((s) => s.status !== "ready" && String(s._id) !== String(sheet._id)).map((s) => s.faculty?.name);
    res.json({
        course: {_id: course._id, name: course.name, code: course.code, semester: course.semester},
        grading: {_id: grading._id, status: grading.status, version: grading.version, components: grading.components, componentsLocked: grading.componentsLocked, amendment: grading.amendment},
        sheet: {_id: sheet._id, status: sheet.status, readyAt: sheet.readyAt},
        rows, conflicts, editable,
        lockNotice: editable ? null : sheet.status === "ready" && grading.status === "collecting" ? "Section is marked ready. Reopen it to edit." : grading.componentsLocked ? await lockMessage(grading) : "Components are not agreed yet. Marks open once everyone agrees.",
        waitingOn: waiting,
        preview: live ? sectionPreview(rows) : null,
    });
});

function sectionPreview(rows) {
    const t = rows.filter((r) => !r.absent).map((r) => r.total);
    if (!t.length) return null;
    const mean = t.reduce((a, b) => a + b, 0) / t.length;
    return {n: t.length, mean: Math.round(mean * 100) / 100, highest: Math.max(...t), lowest: Math.min(...t)};
}

export const previousComponents = handle(async (req, res) => {
    const {course} = await requireCourseFaculty(req, q(req).courseId);
    const prev = await CourseGrading.find({courseKey: course.abbreviation, course: {$ne: course._id}, "components.0": {$exists: true}}).lean();
    prev.sort((a, b) => b.semester.localeCompare(a.semester));
    const p = prev[0];
    res.json(p ? {semester: p.semester, components: p.components} : {components: []});
});

// ---------------------------------------------------------------- components
export const setComponents = handle(async (req, res) => {
    const {faculty, course} = await requireCourseFaculty(req, req.body.courseId);
    const grading = await ensureGrading(course);
    if (!["setup", "collecting", "grading"].includes(grading.status) || grading.amendment?.type)
        throw new GradeError(await lockMessage(grading), 409);
    const components = (req.body.components || []).map((c, i) => ({
        key: c.key || slug(c.name, i), name: String(c.name || "").trim(), rawMax: Number(c.rawMax), weight: Number(c.weight),
    }));
    const err = validateComponents(components);
    if (err) throw new GradeError(err);
    const wasLocked = grading.componentsLocked;
    await CourseGrading.findOneAndUpdate(
        {_id: grading._id, status: grading.status},
        {
            $set: {components, componentAgreements: [{faculty: faculty._id, at: new Date()}], componentsLocked: false, status: "setup"},
            $push: {history: histEntry("Faculty", req.user.email, wasLocked ? "components_changed" : "components_set")},
        }
    );
    // changing agreed components sends every section back to editing
    await SectionSheet.updateMany({courseGrading: grading._id}, {$set: {status: "editing"}, $unset: {readyAt: ""}});
    await finishAgreement(grading._id, course);
    res.json({message: "Components saved. Waiting for the other faculty to agree."});
});

async function finishAgreement(gradingId, course) {
    const g = await CourseGrading.findById(gradingId);
    const agreed = new Set(g.componentAgreements.map((a) => String(a.faculty)));
    if (course.faculty.every((f) => agreed.has(String(f))) && g.components.length) {
        await CourseGrading.findOneAndUpdate(
            {_id: gradingId, status: "setup", componentsLocked: false},
            {$set: {componentsLocked: true, status: "collecting"}, $push: {history: histEntry("System", null, "components_locked")}}
        );
        return true;
    }
    return false;
}

export const agreeComponents = handle(async (req, res) => {
    const {faculty, course} = await requireCourseFaculty(req, req.body.courseId);
    const grading = await ensureGrading(course);
    if (grading.status !== "setup") throw new GradeError("Components are already locked.", 409);
    if (validateComponents(grading.components)) throw new GradeError("Draft the components first.");
    const upd = await CourseGrading.findOneAndUpdate(
        {_id: grading._id, status: "setup", "componentAgreements.faculty": {$ne: faculty._id}},
        {$push: {componentAgreements: {faculty: faculty._id, at: new Date()}, history: histEntry("Faculty", req.user.email, "components_agreed")}}
    );
    if (!upd) throw new GradeError("You have already agreed to these components.", 409);
    const locked = await finishAgreement(grading._id, course);
    res.json({locked, message: locked ? "Everyone has agreed. Components are locked and marks can be entered." : "Agreed. Waiting for the others."});
});

// ---------------------------------------------------------------- my section
function cleanMarks(raw, components) {
    const out = {};
    for (const c of components) {
        const v = raw?.[c.key];
        if (v === undefined || v === null || v === "") continue;
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0) throw new Error(`"${c.name}" must be a number of 0 or more`);
        out[c.key] = n;
    }
    return out;
}

export const saveMarks = handle(async (req, res) => {
    const {course, grading, sheet} = await requireSectionOwner(req, req.body.courseId);
    if (!grading.componentsLocked) throw new GradeError("Marks open once everyone has agreed to the components.", 409);
    if (grading.status !== "collecting") throw new GradeError(await lockMessage(grading), 409);
    if (sheet.status !== "editing") throw new GradeError("Your section is marked ready. Reopen it to edit.", 409);
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    if (!rows.length) throw new GradeError("No rows to save");
    if (rows.length > 2000) throw new GradeError("Too many rows in one save");
    const amending = !!grading.amendment?.type;

    const rolls = [...new Set(rows.map((r) => String(r.rollNumber ?? "").trim()).filter(Boolean))];
    const students = await Student.find({rollNumber: {$in: [...rolls, ...rolls.map((r) => r.toUpperCase())]}}).select("name rollNumber").lean();
    const byRoll = Object.fromEntries(students.map((s) => [s.rollNumber.toUpperCase(), s]));
    const enrolled = new Set((await Enrollment.find({course: course._id, student: {$in: students.map((s) => s._id)}}).select("student").lean()).map((e) => String(e.student)));
    const existing = await GradeEntry.find({courseGrading: grading._id, student: {$in: students.map((s) => s._id)}}).lean();
    const entryBy = Object.fromEntries(existing.map((e) => [String(e.student), e]));
    const pool = new Set((await openBacklogPool(grading)).map((p) => String(p.student)));
    const sheets = await SectionSheet.find({courseGrading: grading._id}).populate("faculty", "name").lean();
    const facOf = (id) => sheets.find((s) => String(s._id) === String(id))?.faculty?.name || "another section";

    const result = {saved: 0, unmatched: [], rejected: [], conflicts: []};
    const mySheet = await SectionSheet.findById(sheet._id);
    for (const r of rows) {
        const roll = String(r.rollNumber ?? "").trim();
        if (!roll) continue;
        const st = byRoll[roll.toUpperCase()];
        if (!st) { result.unmatched.push(roll); continue; }
        let marks;
        try { marks = cleanMarks(r.marks, grading.components); } catch (e) { result.rejected.push({rollNumber: roll, reason: e.message}); continue; }
        const entry = entryBy[String(st._id)];

        if (entry) {
            if (String(entry.sheet) !== String(sheet._id)) {
                if (entry.isBacklog) { result.rejected.push({rollNumber: roll, reason: `Backlog student assigned to ${facOf(entry.sheet)}`}); continue; }
                if (!mySheet.conflicts.some((c) => String(c.student) === String(st._id)))
                    mySheet.conflicts.push({student: st._id, marks, claimedBy: entry.sheet});
                result.conflicts.push({rollNumber: roll, heldBy: facOf(entry.sheet)});
                continue;
            }
            if (amending && !entry.amended) { result.rejected.push({rollNumber: roll, reason: "Not part of the open amendment"}); continue; }
            const set = {marks, total: computeTotal(marks, grading.components)};
            if (entry.isBacklog) set.absent = !!r.absent;
            await GradeEntry.updateOne({_id: entry._id}, {$set: set});
            result.saved++;
            continue;
        }
        if (amending) { result.rejected.push({rollNumber: roll, reason: "Amendments only change students already graded"}); continue; }
        if (!enrolled.has(String(st._id))) {
            result.rejected.push({rollNumber: roll, reason: pool.has(String(st._id)) ? "Open backlog: assign it to a section on the course page first" : "Not enrolled in this course"});
            continue;
        }
        try {
            await GradeEntry.create({courseGrading: grading._id, sheet: sheet._id, student: st._id, marks, total: computeTotal(marks, grading.components)});
            result.saved++;
        } catch (e) {
            if (e.code !== 11000) throw e;
            result.rejected.push({rollNumber: roll, reason: "Already in another section"});
        }
    }
    if (mySheet.isModified("conflicts")) await mySheet.save();
    res.json(result);
});

export const deleteRow = handle(async (req, res) => {
    const {grading, sheet} = await requireSectionOwner(req, req.body.courseId);
    if (grading.status !== "collecting" || sheet.status !== "editing" || grading.amendment?.type)
        throw new GradeError("This section can't be edited right now.", 409);
    const entry = await GradeEntry.findOne({courseGrading: grading._id, sheet: sheet._id, student: req.body.studentId});
    if (!entry) throw new GradeError("Student is not on your sheet", 404);
    if (entry.isBacklog) throw new GradeError("Backlog rows are managed from the backlog split on the course page.");
    await entry.deleteOne();
    // anyone who had entered this student as a conflict now holds the row
    const claimant = await SectionSheet.findOne({courseGrading: grading._id, "conflicts.student": entry.student});
    if (claimant) {
        const c = claimant.conflicts.find((x) => String(x.student) === String(entry.student));
        await GradeEntry.create({courseGrading: grading._id, sheet: claimant._id, student: entry.student, marks: c.marks || {}, total: computeTotal(c.marks, grading.components)});
        await SectionSheet.updateOne({_id: claimant._id}, {$pull: {conflicts: {student: entry.student}}});
    }
    res.json({message: "Removed"});
});

export const dropConflict = handle(async (req, res) => {
    const {sheet} = await requireSectionOwner(req, req.body.courseId);
    await SectionSheet.updateOne({_id: sheet._id}, {$pull: {conflicts: {student: req.body.studentId}}});
    res.json({message: "Removed from your sheet"});
});

function sheetProblems(grading, entries, sheet) {
    const problems = [];
    if (!entries.length) problems.push("Add at least one student");
    if (sheet.conflicts?.length) problems.push(`${sheet.conflicts.length} student(s) also appear in another section`);
    for (const e of entries) {
        if (e.absent) continue;
        if (missingComponents(e.marks, grading.components).length) problems.push(`${e.rollNumber || e.student}: marks incomplete`);
        else if (overMax(e.marks, grading.components).length) problems.push(`${e.rollNumber || e.student}: a mark is above its maximum`);
    }
    return problems;
}

export const markReady = handle(async (req, res) => {
    const {grading, sheet} = await requireSectionOwner(req, req.body.courseId);
    if (grading.status !== "collecting" || !grading.componentsLocked) throw new GradeError(await lockMessage(grading), 409);
    const entries = await GradeEntry.find({courseGrading: grading._id, sheet: sheet._id}).populate("student", "rollNumber");
    const problems = sheetProblems(grading, entries.map((e) => ({...e.toObject(), rollNumber: e.student?.rollNumber})), sheet);
    if (problems.length) return res.status(400).json({message: problems[0], problems: problems.slice(0, 20)});
    const upd = await SectionSheet.findOneAndUpdate(
        {_id: sheet._id, status: "editing"},
        {$set: {status: "ready", readyAt: new Date()}, $push: {history: histEntry("Faculty", req.user.email, "ready")}}
    );
    if (!upd) throw new GradeError("Section is already marked ready.", 409);
    const g = await advanceIfAllReady(grading._id);
    res.json({status: g.status, message: g.status === "grading" ? "All sections are ready. The course page now has the combined grading." : "Section marked ready."});
});

export const reopenSection = handle(async (req, res) => {
    const {grading, sheet} = await requireSectionOwner(req, req.body.courseId);
    if (!["collecting", "grading"].includes(grading.status)) throw new GradeError(await lockMessage(grading), 409);
    if (grading.amendment?.type && !(await GradeEntry.exists({sheet: sheet._id, amended: true})))
        throw new GradeError("Only sections with students in the amendment can be reopened.", 409);
    const upd = await SectionSheet.findOneAndUpdate(
        {_id: sheet._id, status: "ready"},
        {$set: {status: "editing"}, $unset: {readyAt: ""}, $push: {history: histEntry("Faculty", req.user.email, "reopened")}}
    );
    if (!upd) throw new GradeError("Section is already open.", 409);
    if (grading.status === "grading")
        await CourseGrading.findOneAndUpdate({_id: grading._id, status: "grading"}, {$set: {status: "collecting"}, $push: {history: histEntry("Faculty", req.user.email, "section_reopened")}});
    res.json({message: "Section reopened."});
});

// ---------------------------------------------------------------- backlog
export const getBacklog = handle(async (req, res) => {
    const {course} = await requireCourseFaculty(req, q(req).courseId);
    const grading = await ensureGrading(course);
    const sections = await SectionSheet.find({courseGrading: grading._id}).populate("faculty", "name").lean();
    res.json({
        backlog: await backlogView(grading),
        sections: sections.map((s) => ({_id: s._id, faculty: s.faculty?.name, status: s.status})),
        canAssign: false, // the Academic Office assigns backlog students
    });
});

// ---------------------------------------------------------------- grading
async function requireGradingStage(req, stages = ["grading"]) {
    const ctx = await requireCourseFaculty(req, req.body.courseId);
    const grading = await ensureGrading(ctx.course);
    if (!stages.includes(grading.status)) throw new GradeError(await lockMessage(grading), 409);
    return {...ctx, grading};
}

export const preview = handle(async (req, res) => {
    const {course} = await requireCourseFaculty(req, req.body.courseId);
    const grading = await ensureGrading(course);
    const entries = await GradeEntry.find({courseGrading: grading._id}).lean();
    const rows = entries.map((e) => ({id: String(e._id), total: computeTotal(e.marks, grading.components), isBacklog: e.isBacklog, absent: e.absent}));
    let bands, overrides;
    try {
        bands = normaliseBands(req.body.bands || grading.bandConfig);
        overrides = req.body.overrides ?? grading.cutoffOverride?.values;
        res.json(grade(rows, {bands, overrides}));
    } catch (e) { throw new GradeError(e.message); }
});

export const setBands = handle(async (req, res) => {
    const {grading, faculty} = await requireGradingStage(req);
    let bands;
    try { bands = normaliseBands(req.body.bands); } catch (e) { throw new GradeError(e.message); }
    const upd = await CourseGrading.findOneAndUpdate(
        {_id: grading._id, status: "grading"},
        {$set: {bandConfig: bands}, $push: {history: histEntry("Faculty", req.user.email, "bands_changed", BAND_KEYS.map((k) => `${k} ${bands[k]}%`).join(", "))}}, {new: true}
    );
    if (!upd) throw new GradeError("The grading just changed. Reload.", 409);
    try { await computeAndStore(upd); } catch (e) { throw new GradeError(e.message); }
    res.json({message: "Band percentages updated."});
});

export const overrideCutoffs = handle(async (req, res) => {
    const {grading, faculty, course} = await requireGradingStage(req);
    if (!canOverride(userCtx(faculty, course), "cutoffs")) throw new GradeError("You can't change the cutoffs for this course.", 403);
    if (req.body.clear) {
        await CourseGrading.updateOne({_id: grading._id, status: "grading"}, {$unset: {cutoffOverride: ""}, $push: {history: histEntry("Faculty", req.user.email, "cutoff_override_cleared")}});
        const g = await CourseGrading.findById(grading._id);
        await computeAndStore(g);
        return res.json({message: "Cutoffs reset to the calculated values."});
    }
    const reason = String(req.body.reason || "").trim();
    if (!reason) throw new GradeError("Give a reason for changing the cutoffs.");
    const values = {...(grading.cutoffOverride?.values || {})};
    for (const k of BAND_KEYS) if (req.body.values?.[k] !== undefined && req.body.values[k] !== null && req.body.values[k] !== "") values[k] = Number(req.body.values[k]);
    // validate against the current cohort before saving
    const entries = await GradeEntry.find({courseGrading: grading._id}).lean();
    try {
        grade(entries.map((e) => ({id: String(e._id), total: computeTotal(e.marks, grading.components), isBacklog: e.isBacklog, absent: e.absent})), {bands: grading.bandConfig, overrides: values});
    } catch (e) { throw new GradeError(e.message); }
    const upd = await CourseGrading.findOneAndUpdate(
        {_id: grading._id, status: "grading"},
        {$set: {cutoffOverride: {values, by: faculty._id, reason, at: new Date()}}, $push: {history: histEntry("Faculty", req.user.email, "cutoffs_overridden", `${reason} (${Object.entries(values).map(([k, v]) => `${k} ${v}`).join(", ")})`)}}, {new: true}
    );
    if (!upd) throw new GradeError("The grading just changed. Reload.", 409);
    await computeAndStore(upd);
    res.json({message: "Cutoffs updated."});
});

export const setFinalGrade = handle(async (req, res) => {
    const {grading, faculty, course} = await requireGradingStage(req);
    const entry = await GradeEntry.findOne({_id: req.body.entryId, courseGrading: grading._id});
    if (!entry) throw new GradeError("Student not found", 404);
    const sheet = await SectionSheet.findById(entry.sheet);
    if (!canOverride(userCtx(faculty, course), "f_to_p", {sheetFacultyId: sheet.faculty}))
        throw new GradeError(`Only ${(await Faculty.findById(sheet.faculty))?.name || "the section faculty"} can move this student.`, 403);
    if (entry.computedGrade !== "F") throw new GradeError("Only an F can be moved to P.");
    if (req.body.grade === null || req.body.grade === undefined || req.body.grade === "") {
        entry.override = undefined;
        entry.finalGrade = "F";
    } else {
        if (req.body.grade !== "P") throw new GradeError("An F can only be moved to P.");
        entry.override = {grade: "P", by: faculty._id, remark: String(req.body.remark || "").trim() || undefined, at: new Date()};
        entry.finalGrade = "P";
    }
    await entry.save();
    await CourseGrading.updateOne({_id: grading._id}, {$push: {history: histEntry("Faculty", req.user.email, entry.override ? "f_to_p" : "f_to_p_undone", (await Student.findById(entry.student).select("rollNumber").lean())?.rollNumber)}});
    res.json({finalGrade: entry.finalGrade});
});

export const submit = handle(async (req, res) => {
    const {grading, faculty, course} = await requireGradingStage(req);
    if (grading.amendment?.type && !grading.amendment.mode) throw new GradeError("Choose frozen or recompute for the amendment first.");
    const view = await buildCourseView(grading, course, faculty._id);
    if (view.sections.some((s) => s.status !== "ready")) throw new GradeError("Every section must be ready.");
    if (view.conflicts.length) throw new GradeError("Resolve the students listed in two sections first.");
    if (view.unassigned.length && !req.body.confirmUnassigned && !grading.amendment?.type)
        throw new GradeError(`${view.unassigned.length} enrolled student(s) are not on any sheet. Confirm to submit without them.`, 409);
    const upd = await CourseGrading.findOneAndUpdate(
        {_id: grading._id, status: "grading"},
        {$set: {status: "cc_review", submittedBy: faculty._id, approvals: [], versionNote: String(req.body.versionNote || "").trim() || undefined},
         $push: {history: histEntry("Faculty", req.user.email, "submitted", req.body.versionNote)}}, {new: true}
    );
    if (!upd) throw new GradeError("The grading just changed. Reload.", 409);
    await snapshot(upd, "submitted", {createdBy: req.user.email});
    res.json({message: "Submitted for CC review."});
});

// ---------------------------------------------------------------- amendments
export const openAmendment = handle(async (req, res) => {
    const {faculty, course} = await requireCourseFaculty(req, req.body.courseId);
    const grading = await ensureGrading(course);
    const type = req.body.type;
    if (!["correction", "reexam", "backlog"].includes(type)) throw new GradeError("Choose correction, re-exam or backlog.");
    const reason = String(req.body.reason || "").trim();
    if (!reason) throw new GradeError("Give a reason for the amendment.");
    if (grading.status !== "released") throw new GradeError("Only a released grading can be amended.", 409);
    const rolls = (req.body.rollNumbers || []).map((r) => String(r).trim()).filter(Boolean);
    const ids = req.body.studentIds || [];
    const students = await Student.find({$or: [{_id: {$in: ids}}, {rollNumber: {$in: rolls}}]}).select("_id").lean();
    if (!students.length) throw new GradeError("Pick at least one affected student.");
    const entries = await GradeEntry.find({courseGrading: grading._id, student: {$in: students.map((s) => s._id)}});
    if (entries.length !== students.length) throw new GradeError("Some students are not part of this grading.");

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const moved = await CourseGrading.findOneAndUpdate(
                {_id: grading._id, status: "released"},
                {$set: {status: "collecting", version: grading.version + 1, approvals: [], submittedBy: undefined, versionNote: undefined,
                    amendment: {type, reason, students: students.map((s) => s._id), openedBy: faculty._id, openedAt: new Date()}},
                 $push: {history: histEntry("Faculty", req.user.email, "amendment_opened", `${type}: ${reason}`)}},
                {session, new: true}
            );
            if (!moved) throw new GradeError("This grading was just changed. Reload.", 409);
            for (const e of entries) {
                e.prev = {marks: e.marks, total: e.total, computedGrade: e.computedGrade, finalGrade: e.finalGrade};
                e.amended = true;
                if (type === "reexam") e.attemptType = "reexam";
                await e.save({session});
            }
            const sheetIds = [...new Set(entries.map((e) => String(e.sheet)))];
            await SectionSheet.updateMany({_id: {$in: sheetIds}}, {$set: {status: "editing"}, $unset: {readyAt: ""}}, {session});
        });
    } finally { await session.endSession(); }
    res.json({message: `Amendment v${grading.version + 1} opened. Faculty can now update the affected students.`});
});

async function amendmentPreview(grading) {
    const entries = await GradeEntry.find({courseGrading: grading._id}).populate("student", "name rollNumber").lean();
    const rows = entries.map((e) => ({id: String(e._id), total: computeTotal(e.marks, grading.components), isBacklog: e.isBacklog, absent: e.absent}));
    const previousGrades = Object.fromEntries(entries.filter((e) => !e.absent && e.finalGrade).map((e) => [String(e._id), e.amended ? e.prev?.finalGrade ?? e.finalGrade : e.finalGrade]));
    const prevRows = entries.filter((e) => e.amended || true);
    const pv = reexamPreview({
        rows, reexamIds: entries.filter((e) => e.amended && !e.absent).map((e) => String(e._id)),
        previous: {threshold: grading.threshold, cutoffs: grading.cutoffs, calculated: grading.calculatedCutoffs},
        previousGrades, bands: grading.bandConfig, overrides: grading.cutoffOverride?.values,
    });
    const info = Object.fromEntries(entries.map((e) => [String(e._id), e]));
    const shape = (m) => ({
        changes: m.changes.map((c) => {
            const e = info[c.id];
            // an earlier F->P stays only while the new grade is still F
            const to = e.override?.grade && c.to === "F" ? e.override.grade : c.to;
            return {entryId: c.id, rollNumber: e.student.rollNumber, name: e.student.name, from: c.from, to, amended: e.amended};
        }).filter((c) => c.from !== c.to),
        unchanged: m.unchanged,
        threshold: m.result.threshold, cutoffs: m.result.cutoffs, counts: m.result.counts,
    });
    return {
        frozen: shape(pv.frozen), recompute: shape(pv.recompute),
        before: {threshold: grading.threshold, cutoffs: grading.cutoffs},
        beforeTotals: entries.filter((e) => !e.isBacklog && !e.absent).map((e) => (e.amended ? e.prev?.total ?? e.total : e.total)),
        afterTotals: rows.filter((r) => !r.isBacklog && !r.absent).map((r) => r.total),
    };
}

export const reexamPreviewHandler = handle(async (req, res) => {
    const {grading} = await requireGradingStage(req);
    if (!grading.amendment?.type) throw new GradeError("There is no open amendment.");
    res.json(await amendmentPreview(grading));
});
export {amendmentPreview};

export const reexamApply = handle(async (req, res) => {
    const {grading} = await requireGradingStage(req);
    if (!grading.amendment?.type) throw new GradeError("There is no open amendment.");
    const mode = req.body.mode;
    if (!["frozen", "recompute"].includes(mode)) throw new GradeError("Choose frozen or recompute.");
    // start from the released state so switching modes never leaves stale grades
    const rel = await CourseGradingVersion.findOne({courseGrading: grading._id, kind: "released"}).sort({version: -1}).lean();
    if (!rel) throw new GradeError("No released version to compare with.", 409);
    const byStudent = Object.fromEntries(rel.rows.map((r) => [String(r.student), r]));
    const entries = await GradeEntry.find({courseGrading: grading._id, amended: false});
    await GradeEntry.bulkWrite(entries.map((e) => {
        const r = byStudent[String(e.student)];
        return {updateOne: {filter: {_id: e._id}, update: r ? {$set: {computedGrade: r.computedGrade, finalGrade: r.finalGrade}} : {}}};
    }));
    const upd = await CourseGrading.findOneAndUpdate(
        {_id: grading._id, status: "grading"},
        {$set: {"amendment.mode": mode, threshold: rel.threshold, cutoffs: rel.cutoffs, calculatedCutoffs: rel.calculatedCutoffs},
         $push: {history: histEntry("Faculty", req.user.email, "amendment_mode", mode)}}, {new: true}
    );
    if (!upd) throw new GradeError("The grading just changed. Reload.", 409);
    await computeAndStore(upd);
    res.json({message: mode === "frozen" ? "Re-graded against the previous cutoffs. Nobody else changes." : "Curve recomputed with the new marks."});
});

// ---------------------------------------------------------------- corrections
export const listCorrections = handle(async (req, res) => {
    const faculty = await getFaculty(req);
    const items = await GradeCorrectionRequest.find({faculty: faculty._id}).sort({createdAt: -1}).populate("student", "name rollNumber").populate({path: "courseGrading", select: "courseKey semester course", populate: {path: "course", select: "name code"}}).lean();
    res.json({corrections: items.map((c) => ({
        _id: c._id, status: c.status, message: c.message, component: c.component, remark: c.remark, createdAt: c.createdAt,
        student: c.student, courseId: c.courseGrading?.course?._id, course: c.courseGrading?.course?.name, semester: c.courseGrading?.semester,
    }))});
});

export const decideCorrection = handle(async (req, res) => {
    const faculty = await getFaculty(req);
    const {id, decision} = req.body;
    const remark = String(req.body.remark || "").trim();
    if (!["accepted", "rejected"].includes(decision)) throw new GradeError("Choose accept or reject.");
    if (decision === "rejected" && !remark) throw new GradeError("Give the student a reason.");
    const upd = await GradeCorrectionRequest.findOneAndUpdate(
        {_id: id, faculty: faculty._id, status: "open"},
        {$set: {status: decision, remark: remark || undefined}, $push: {history: histEntry("Faculty", req.user.email, decision, remark)}}, {new: true}
    );
    if (!upd) throw new GradeError("This request is no longer open.", 409);
    res.json({message: decision === "accepted" ? "Accepted. Open an amendment on the course page to change the marks." : "Rejected."});
});

// ---------------------------------------------------------------- versions
async function snapshotFor(gradingId, version) {
    return (await CourseGradingVersion.findOne({courseGrading: gradingId, version, kind: "released"}).lean())
        || (await CourseGradingVersion.findOne({courseGrading: gradingId, version, kind: "submitted"}).lean());
}

export const listVersions = handle(async (req, res) => {
    const {course} = await requireCourseFaculty(req, q(req).courseId);
    const grading = await CourseGrading.findOne({course: course._id});
    if (!grading) return res.json({versions: []});
    const snaps = await CourseGradingVersion.find({courseGrading: grading._id}).select("version kind createdAt releasedAt versionNote amendment createdBy").sort({version: 1}).lean();
    const byVersion = new Map();
    for (const s of snaps) if (!byVersion.has(s.version) || s.kind === "released") byVersion.set(s.version, s);
    res.json({versions: [...byVersion.values()].map((s) => ({version: s.version, kind: s.kind, at: s.releasedAt || s.createdAt, note: s.versionNote, amendment: s.amendment?.type ? {type: s.amendment.type, reason: s.amendment.reason, mode: s.amendment.mode} : null}))});
});

// Only the rows whose total or grade differ between two versions.
export const compareVersions = handle(async (req, res) => {
    const {course} = await requireCourseFaculty(req, q(req).courseId);
    const grading = await CourseGrading.findOne({course: course._id});
    if (!grading) throw new GradeError("Nothing to compare", 404);
    const a = await snapshotFor(grading._id, Number(req.query.a));
    const b = await snapshotFor(grading._id, Number(req.query.b));
    if (!a || !b) throw new GradeError("One of those versions has no snapshot yet.", 404);
    const before = Object.fromEntries(a.rows.map((r) => [String(r.student), r]));
    const changes = [];
    for (const r of b.rows) {
        const o = before[String(r.student)];
        if (!o) { changes.push({rollNumber: r.rollNumber, name: r.name, section: r.section, added: true, toTotal: r.total, toGrade: r.finalGrade}); continue; }
        if (o.finalGrade !== r.finalGrade || o.total !== r.total)
            changes.push({rollNumber: r.rollNumber, name: r.name, section: r.section, fromTotal: o.total, toTotal: r.total, fromGrade: o.finalGrade, toGrade: r.finalGrade});
    }
    const regular = (snap) => snap.rows.filter((r) => !r.isBacklog && !r.absent);
    const tally = (snap) => { const c = {}; for (const r of snap.rows) if (!r.absent && r.finalGrade) c[r.finalGrade] = (c[r.finalGrade] || 0) + 1; return c; };
    res.json({a: Number(req.query.a), b: Number(req.query.b), changes, unchanged: b.rows.length - changes.length,
        thresholdA: a.threshold?.T, thresholdB: b.threshold?.T,
        beforeTotals: regular(a).map((r) => r.total), afterTotals: regular(b).map((r) => r.total),
        countsA: tally(a), countsB: tally(b), amendment: b.amendment || null, cutoffsA: a.cutoffs, cutoffsB: b.cutoffs});
});

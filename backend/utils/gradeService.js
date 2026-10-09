// Shared grading operations used by the faculty, CC, AO and student controllers.
import mongoose from "mongoose";
import Course from "../models/feedback/Course.js";
import Enrollment from "../models/feedback/Enrollment.js";
import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";
import CourseGrading from "../models/grades/CourseGrading.js";
import SectionSheet from "../models/grades/SectionSheet.js";
import GradeEntry from "../models/grades/GradeEntry.js";
import CourseGradingVersion from "../models/grades/CourseGradingVersion.js";
import CourseAttempt from "../models/grades/CourseAttempt.js";
import {
    grade, computeTotal, groupStats, openBacklogsFrom, semesterRank, finalGradeOf, normaliseBands,
} from "./gradeEngine.js";
import {GradeError, histEntry} from "./gradeGuards.js";

export const LOCKED_STATUSES = ["cc_review", "approved", "released"];

// One CourseGrading per course; created on first touch with one sheet per
// co-teaching faculty so nobody can be forgotten.
export async function ensureGrading(course) {
    let grading = await CourseGrading.findOne({course: course._id});
    if (!grading) {
        try {
            grading = await CourseGrading.create({
                course: course._id,
                courseKey: course.abbreviation,
                semester: course.semester,
                history: [histEntry("System", null, "created")],
            });
        } catch (err) {
            if (err.code !== 11000) throw err;
            grading = await CourseGrading.findOne({course: course._id});
        }
    }
    for (const f of course.faculty) {
        await SectionSheet.updateOne(
            {courseGrading: grading._id, faculty: f},
            {$setOnInsert: {courseGrading: grading._id, faculty: f, status: "editing"}},
            {upsert: true}
        );
    }
    return grading;
}

export async function isOpenBacklogFor(grading, studentId) {
    return (await openBacklogPool(grading)).some((a) => String(a.student) === String(studentId));
}

// Open backlogs for this course, from CourseAttempt only. Attempts of this
// offering (or later) don't count; students enrolled in this offering are
// repeating it as regular students and are left out.
export async function openBacklogPool(grading) {
    const attempts = await CourseAttempt.find({courseKey: grading.courseKey}).lean();
    const rank = semesterRank(grading.semester);
    const earlier = attempts.filter((a) => semesterRank(a.semester) < rank);
    const open = openBacklogsFrom(earlier);
    if (!open.length) return [];
    const enrolled = new Set(
        (await Enrollment.find({course: grading.course, student: {$in: open.map((a) => a.student)}}).select("student").lean()).map((e) => String(e.student))
    );
    const countFor = (sid) => earlier.filter((a) => String(a.student) === String(sid)).length;
    return open.filter((a) => !enrolled.has(String(a.student))).map((a) => ({...a, attempts: countFor(a.student)}));
}

export function attemptLabel(attempts, lastSemester) {
    const nth = attempts + 1;
    const ord = nth === 2 ? "2nd" : nth === 3 ? "3rd" : `${nth}th`;
    return `Backlog · ${ord} attempt (F in ${lastSemester})`;
}

// Re-run the engine on every entry and persist T, cutoffs and grades.
// amendment.mode === "frozen": only amended rows are regraded against the
// stored T / cutoffs; everyone else keeps their grade.
export async function computeAndStore(grading, {session} = {}) {
    const entries = await GradeEntry.find({courseGrading: grading._id}).session(session || null);
    for (const e of entries) e.total = computeTotal(e.marks, grading.components);

    const frozen = grading.amendment?.mode === "frozen";
    const rows = entries.map((e) => ({id: String(e._id), total: e.total, isBacklog: e.isBacklog, absent: e.absent}));
    const overrides = grading.cutoffOverride?.values;
    const res = frozen
        ? grade(rows.filter((r) => entries.find((e) => String(e._id) === r.id).amended), {
              frozen: {T: grading.threshold.T, threshold: grading.threshold, cutoffs: grading.cutoffs, calculated: grading.calculatedCutoffs},
          })
        : grade(rows, {bands: grading.bandConfig, overrides});

    const ops = [];
    for (const e of entries) {
        if (e.absent) {
            ops.push({updateOne: {filter: {_id: e._id}, update: {$set: {total: e.total}, $unset: {computedGrade: "", finalGrade: ""}}}});
            continue;
        }
        const computed = res.grades[String(e._id)] ?? e.computedGrade;
        // F -> P only stands while the computed grade is still F
        const ovGrade = e.override?.grade && computed === "F" ? e.override.grade : null;
        const set = {total: e.total, computedGrade: computed, finalGrade: finalGradeOf(computed, ovGrade)};
        const update = {$set: set};
        if (e.override?.grade && !ovGrade) update.$unset = {override: ""};
        ops.push({updateOne: {filter: {_id: e._id}, update}});
    }
    if (ops.length) await GradeEntry.bulkWrite(ops, {session});

    if (!frozen) {
        grading.threshold = res.threshold;
        grading.calculatedCutoffs = res.calculated;
        grading.cutoffs = res.cutoffs;
        grading.bandConfig = res.bands;
        await grading.save({session});
    }
    return res;
}

// collecting -> grading once every sheet is ready (stage-guarded).
export async function advanceIfAllReady(gradingId) {
    const grading = await CourseGrading.findById(gradingId);
    if (!grading || grading.status !== "collecting") return grading;
    const sheets = await SectionSheet.find({courseGrading: gradingId});
    if (!sheets.length || sheets.some((s) => s.status !== "ready")) return grading;
    const moved = await CourseGrading.findOneAndUpdate(
        {_id: gradingId, status: "collecting"},
        {$set: {status: "grading"}, $push: {history: histEntry("System", null, "all_sections_ready")}},
        {new: true}
    );
    if (!moved) return grading;
    // Amendments keep the previous grades until the faculty pick frozen/recompute.
    if (!moved.amendment?.type) await computeAndStore(moved);
    return moved;
}

export async function snapshot(grading, kind, {session, createdBy, releasedAt} = {}) {
    const course = await Course.findById(grading.course).lean();
    const sheets = await SectionSheet.find({courseGrading: grading._id}).populate("faculty", "name").lean();
    const facName = Object.fromEntries(sheets.map((s) => [String(s._id), s.faculty?.name || ""]));
    const entries = await GradeEntry.find({courseGrading: grading._id}).populate("student", "name rollNumber").session(session || null).lean();
    const doc = {
        courseGrading: grading._id,
        version: grading.version,
        kind,
        course: grading.course,
        courseKey: grading.courseKey,
        courseCode: course?.code,
        courseName: course?.name,
        semester: grading.semester,
        components: grading.components,
        bandConfig: grading.bandConfig,
        threshold: grading.threshold,
        calculatedCutoffs: grading.calculatedCutoffs,
        cutoffs: grading.cutoffs,
        cutoffOverride: grading.cutoffOverride,
        amendment: grading.amendment,
        approvals: grading.approvals,
        versionNote: grading.versionNote,
        sections: sheets.map((s) => ({sheet: s._id, faculty: s.faculty?._id, facultyName: s.faculty?.name})),
        rows: entries.map((e) => ({
            student: e.student?._id, rollNumber: e.student?.rollNumber, name: e.student?.name,
            sheet: e.sheet, section: facName[String(e.sheet)],
            attemptType: e.attemptType, isBacklog: e.isBacklog, absent: e.absent,
            marks: e.marks, total: e.total, computedGrade: e.computedGrade, finalGrade: e.finalGrade, override: e.override,
        })),
        createdBy,
        releasedAt,
    };
    // Re-submitting after a send-back replaces that version's earlier "submitted" snapshot
    return CourseGradingVersion.findOneAndUpdate(
        {courseGrading: grading._id, version: grading.version, kind},
        {$set: doc},
        {upsert: true, new: true, session, setDefaultsOnInsert: true}
    );
}

// Write each graded row to CourseAttempt (append-only). An amendment only adds
// a row when the final grade differs from what was already recorded.
export async function writeAttempts(grading, course, {session} = {}) {
    const entries = await GradeEntry.find({courseGrading: grading._id, absent: false}).session(session || null);
    const existing = await CourseAttempt.find({gradingRef: grading._id}).session(session || null).lean();
    const lastByStudent = new Map();
    for (const a of existing.sort((x, y) => x.version - y.version)) lastByStudent.set(String(a.student), a);
    const docs = [];
    for (const e of entries) {
        if (!e.finalGrade) continue;
        const last = lastByStudent.get(String(e.student));
        if (last && last.grade === e.finalGrade) continue;
        docs.push({
            student: e.student, courseKey: grading.courseKey, courseCode: course.code, courseName: course.name,
            semester: grading.semester, attemptType: e.attemptType, grade: e.finalGrade,
            gradingRef: grading._id, version: grading.version, source: "released",
        });
    }
    if (docs.length) await CourseAttempt.insertMany(docs, {session});
    return docs.length;
}

export function sectionEditable(grading, sheet, entry) {
    if (!grading.componentsLocked || grading.status !== "collecting") return false;
    if (sheet.status !== "editing") return false;
    if (grading.amendment?.type) return !!entry?.amended; // amendments touch only the affected rows
    return true;
}

// Put a backlog student on a section (or take them off with sheet = null).
// A GradeEntry (isBacklog) is the only record of who owns them. Called by the Academic Office.
export async function placeBacklog(grading, pool, student, sheet, session) {
    const entry = await GradeEntry.findOne({courseGrading: grading._id, student}).session(session);
    if (!pool.some((p) => String(p.student) === String(student)))
        throw new GradeError("That student has no open backlog in this course.");
    if (entry) {
        if (!entry.isBacklog) throw new GradeError("That student is already a regular student on a sheet.");
        if (Object.keys(entry.marks || {}).length || entry.absent) throw new GradeError("This backlog student already has marks entered. Clear them first.");
        const from = await SectionSheet.findById(entry.sheet).session(session);
        if (from.status === "ready") throw new GradeError("The current section is marked ready. Ask that faculty to reopen it.");
    }
    if (!sheet) { if (entry) await entry.deleteOne({session}); return; }
    if (sheet.status === "ready") throw new GradeError("That section is marked ready. Ask that faculty to reopen it.");
    if (entry) { entry.sheet = sheet._id; await entry.save({session}); }
    else await GradeEntry.create([{courseGrading: grading._id, sheet: sheet._id, student, isBacklog: true, attemptType: "repeat"}], {session});
}

export function assertBacklogOpen(grading) {
    if (!["setup", "collecting"].includes(grading.status) || grading.amendment?.type)
        throw new GradeError("Backlog students can only be assigned while sections are being collected.", 409);
}


// ------------ combined view ------------
export async function buildCourseView(grading, course, viewerFacultyId) {
    const sheets = await SectionSheet.find({courseGrading: grading._id}).populate("faculty", "name email").lean();
    const entries = await GradeEntry.find({courseGrading: grading._id}).populate("student", "name rollNumber email").lean();
    const sheetById = Object.fromEntries(sheets.map((s) => [String(s._id), s]));

    // live engine result (preview) so the chart always matches the rows
    let live = null;
    if (grading.componentsLocked && entries.length) {
        const rows = entries.map((e) => ({id: String(e._id), total: computeTotal(e.marks, grading.components), isBacklog: e.isBacklog, absent: e.absent}));
        const frozen = grading.amendment?.mode === "frozen";
        live = frozen
            ? grade(rows, {frozen: {T: grading.threshold.T, threshold: grading.threshold, cutoffs: grading.cutoffs, calculated: grading.calculatedCutoffs}})
            : grade(rows, {bands: grading.bandConfig, overrides: grading.cutoffOverride?.values});
    }

    const attempts = await CourseAttempt.find({courseKey: grading.courseKey}).lean();
    const attemptsBy = {};
    for (const a of attempts) (attemptsBy[String(a.student)] ||= []).push(a);

    const stored = ["grading", "cc_review", "approved", "released"].includes(grading.status);
    const rows = entries.map((e) => {
        const sheet = sheetById[String(e.sheet)];
        const past = (attemptsBy[String(e.student?._id)] || []).filter((a) => semesterRank(a.semester) < semesterRank(grading.semester));
        const lastF = past.sort((a, b) => semesterRank(b.semester) - semesterRank(a.semester))[0];
        return {
            id: e._id, studentId: e.student?._id, rollNumber: e.student?.rollNumber, name: e.student?.name,
            sheetId: e.sheet, section: sheet?.faculty?.name, sectionFacultyId: sheet?.faculty?._id,
            attemptType: e.attemptType, isBacklog: e.isBacklog, absent: e.absent, amended: e.amended,
            marks: e.marks,
            total: live ? computeTotal(e.marks, grading.components) : e.total,
            computedGrade: e.absent ? null : (stored ? e.computedGrade : live?.grades[String(e._id)] ?? null),
            finalGrade: e.absent ? null : (stored ? e.finalGrade : live?.grades[String(e._id)] ?? null),
            override: e.override,
            prev: e.prev,
            backlogNote: e.isBacklog && lastF ? attemptLabel(past.length, lastF.semester) : null,
        };
    });

    const enrolled = await Enrollment.find({course: course._id}).populate("student", "name rollNumber").lean();
    const inSheet = new Set(entries.map((e) => String(e.student?._id)));
    const conflicts = [];
    for (const s of sheets)
        for (const c of s.conflicts || []) {
            const st = await Student.findById(c.student).select("name rollNumber").lean();
            const holder = sheetById[String(c.claimedBy)];
            conflicts.push({studentId: c.student, rollNumber: st?.rollNumber, name: st?.name, sheetId: s._id, faculty: s.faculty?.name, heldBy: holder?.faculty?.name, heldBySheetId: c.claimedBy});
        }
    const conflictIds = new Set(conflicts.map((c) => String(c.studentId)));
    const unassigned = enrolled
        .filter((en) => en.student && !inSheet.has(String(en.student._id)) && !conflictIds.has(String(en.student._id)))
        .map((en) => ({studentId: en.student._id, rollNumber: en.student.rollNumber, name: en.student.name}));

    const present = rows.filter((r) => !r.absent);
    const regular = present.filter((r) => !r.isBacklog);
    const sectionStats = groupStats(regular, (r) => r.section || "");
    const componentStats = grading.components.map((c) => ({
        key: c.key, name: c.name,
        values: regular.map((r) => ({id: r.id, pct: Math.min(100, ((Number(r.marks?.[c.key]) || 0) / c.rawMax) * 100)})),
    }));

    return {
        grading: {
            _id: grading._id, course: grading.course, courseKey: grading.courseKey, semester: grading.semester,
            status: grading.status, version: grading.version, components: grading.components,
            componentsLocked: grading.componentsLocked,
            componentAgreements: grading.componentAgreements,
            bandConfig: grading.bandConfig, threshold: live?.threshold || grading.threshold,
            calculatedCutoffs: live?.calculated || grading.calculatedCutoffs, cutoffs: live?.cutoffs || grading.cutoffs,
            cutoffOverride: grading.cutoffOverride, approvals: grading.approvals, submittedBy: grading.submittedBy,
            amendment: grading.amendment, versionNote: grading.versionNote, history: grading.history, releasedAt: grading.releasedAt,
        },
        course: {_id: course._id, name: course.name, code: course.code, abbreviation: course.abbreviation, semester: course.semester},
        faculty: (await Faculty.find({_id: {$in: course.faculty}}).select("name email").lean()),
        sections: sheets.map((s) => ({
            _id: s._id, facultyId: s.faculty?._id, faculty: s.faculty?.name, status: s.status, readyAt: s.readyAt,
            students: entries.filter((e) => String(e.sheet) === String(s._id) && !e.isBacklog).length,
            backlog: entries.filter((e) => String(e.sheet) === String(s._id) && e.isBacklog).length,
        })),
        rows,
        counts: live ? {regular: live.cohort.regular, backlog: live.cohort.backlog, gradeCounts: live.counts, backlogCounts: live.backlogCounts, mean: live.mean} : null,
        sectionStats,
        componentStats,
        unassigned,
        conflicts,
        viewerFacultyId,
    };
}

export {CourseGrading, SectionSheet, GradeEntry, CourseGradingVersion, CourseAttempt, normaliseBands, mongoose, GradeError};

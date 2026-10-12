import Student from "../../models/feedback/Student.js";
import Course from "../../models/feedback/Course.js";
import Enrollment from "../../models/feedback/Enrollment.js";
import GradeEntry from "../../models/grades/GradeEntry.js";
import {getCurrentSemester} from "../../utils/semesterUtils.js";
import CourseGrading from "../../models/grades/CourseGrading.js";
import CourseGradingVersion from "../../models/grades/CourseGradingVersion.js";
import CourseAttempt from "../../models/grades/CourseAttempt.js";
import GradeCorrectionRequest from "../../models/grades/GradeCorrectionRequest.js";
import SectionSheet from "../../models/grades/SectionSheet.js";
import {openBacklogsFrom, semesterRank} from "../../utils/gradeEngine.js";
import {GradeError, handle, histEntry} from "../../utils/gradeGuards.js";

async function me(req) {
    const s = await Student.findOne({email: req.user.email});
    if (!s) throw new GradeError("Student profile not found", 404);
    return s;
}

// Latest RELEASED version per grading that contains this student.
async function releasedFor(studentId) {
    const snaps = await CourseGradingVersion.find({kind: "released", "rows.student": studentId}).sort({version: -1}).lean();
    const seen = new Set();
    const out = [];
    for (const s of snaps) {
        if (seen.has(String(s.courseGrading))) continue;
        seen.add(String(s.courseGrading));
        const row = s.rows.find((r) => String(r.student) === String(studentId));
        if (!row || row.absent) continue;
        out.push({snap: s, row});
    }
    return out;
}

// Every course the student is taking now, whether or not a grade is out yet: this semester's
// enrolments, plus any course they are repeating whose grading hasn't been released.
async function currentCourses(studentId, released) {
    const cur = getCurrentSemester();
    const gradeOfCourse = new Map(released.map(({snap, row}) => [String(snap.course), {gradingId: snap.courseGrading, grade: row.finalGrade, version: snap.version}]));
    const enrolled = await Enrollment.find({student: studentId}).populate({path: "course", populate: {path: "faculty", select: "name"}}).lean();
    const out = new Map();
    for (const e of enrolled) {
        const c = e.course;
        if (!c || c.semester !== cur) continue;
        out.set(String(c._id), {courseId: c._id, name: c.name, code: c.code, semester: c.semester, faculty: c.faculty.map((f) => f.name), repeating: false});
    }
    const repeats = await GradeEntry.find({student: studentId, isBacklog: true}).populate("courseGrading", "course status").lean();
    for (const r of repeats) {
        const g = r.courseGrading;
        if (!g || g.status === "released" || out.has(String(g.course))) continue;
        const c = await Course.findById(g.course).populate("faculty", "name").lean();
        if (c) out.set(String(c._id), {courseId: c._id, name: c.name, code: c.code, semester: c.semester, faculty: c.faculty.map((f) => f.name), repeating: true});
    }
    // released, but the student missed the exam: their grade waits for the re-exam
    const releasedGradings = await CourseGrading.find({course: {$in: [...out.keys()]}, status: "released"}).select("course").lean();
    const missed = new Set();
    if (releasedGradings.length) {
        const gById = Object.fromEntries(releasedGradings.map((g) => [String(g._id), String(g.course)]));
        for (const e of await GradeEntry.find({courseGrading: {$in: releasedGradings.map((g) => g._id)}, student: studentId, absent: true}).select("courseGrading").lean())
            missed.add(gById[String(e.courseGrading)]);
    }
    return [...out.values()].map((c) => ({...c, ...(gradeOfCourse.get(String(c.courseId)) || {}), missedExam: missed.has(String(c.courseId))})).sort((a, b) => a.name.localeCompare(b.name));
}

export const myGrades = handle(async (req, res) => {
    const student = await me(req);
    const items = await releasedFor(student._id);
    const attempts = await CourseAttempt.find({student: student._id}).lean();
    res.json({
        current: await currentCourses(student._id, items),
        grades: items
            .map(({snap, row}) => ({gradingId: snap.courseGrading, course: snap.courseName, code: snap.courseCode, semester: snap.semester, version: snap.version, grade: row.finalGrade, attemptType: row.attemptType}))
            .sort((a, b) => semesterRank(b.semester) - semesterRank(a.semester)),
        backlog: openBacklogsFrom(attempts).map((a) => ({courseKey: a.courseKey, course: a.courseName, lastSemester: a.semester})),
    });
});

export const courseDetail = handle(async (req, res) => {
    const student = await me(req);
    const hit = (await releasedFor(student._id)).find((i) => String(i.snap.courseGrading) === String(req.query.gradingId));
    if (!hit) throw new GradeError("No released grade for this course yet.", 404);
    const {snap, row} = hit;
    // The curve is shown as anonymous bin counts only; no other student's data leaves the server.
    const T = snap.threshold?.T ?? 0;
    const bins = {};
    for (const r of snap.rows) {
        if (r.isBacklog || r.absent || r.total < T) continue;
        const b = Math.floor(r.total / 2) * 2;
        bins[b] = (bins[b] || 0) + 1;
    }
    const sheet = await SectionSheet.findById(row.sheet).populate("faculty", "name").lean();
    const requests = await GradeCorrectionRequest.find({student: student._id, courseGrading: snap.courseGrading}).sort({createdAt: -1}).lean();
    res.json({
        gradingId: snap.courseGrading, course: snap.courseName, code: snap.courseCode, semester: snap.semester, version: snap.version,
        components: snap.components.map((c) => ({key: c.key, name: c.name, rawMax: c.rawMax, weight: c.weight, mark: row.marks?.[c.key] ?? null})),
        total: row.total, grade: row.finalGrade, movedToP: row.override?.grade === "P",
        threshold: T, cutoffs: snap.cutoffs, bins: Object.entries(bins).map(([start, count]) => ({start: Number(start), count})),
        isBacklog: row.isBacklog, sectionFaculty: sheet?.faculty?.name,
        requests: requests.map((r) => ({_id: r._id, status: r.status, message: r.message, component: r.component, remark: r.remark, createdAt: r.createdAt})),
    });
});

export const requestCorrection = handle(async (req, res) => {
    const student = await me(req);
    const message = String(req.body.message || "").trim();
    if (!message) throw new GradeError("Describe what looks wrong.");
    const hit = (await releasedFor(student._id)).find((i) => String(i.snap.courseGrading) === String(req.body.gradingId));
    if (!hit) throw new GradeError("No released grade for this course.", 404);
    const grading = await CourseGrading.findById(req.body.gradingId);
    if (hit.row.sheet == null) throw new GradeError("Your section could not be found.", 404);
    const sheet = await SectionSheet.findById(hit.row.sheet);
    if (await GradeCorrectionRequest.exists({student: student._id, courseGrading: grading._id, status: "open"}))
        throw new GradeError("You already have an open request for this course.", 409);
    await GradeCorrectionRequest.create({
        student: student._id, courseGrading: grading._id, faculty: sheet.faculty,
        component: req.body.component || undefined, message,
        history: [histEntry("Student", req.user.email, "submitted", message)],
    });
    res.json({message: "Sent to your section faculty."});
});

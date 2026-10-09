import Student from "../../models/feedback/Student.js";
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

export const myGrades = handle(async (req, res) => {
    const student = await me(req);
    const items = await releasedFor(student._id);
    const attempts = await CourseAttempt.find({student: student._id}).lean();
    res.json({
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

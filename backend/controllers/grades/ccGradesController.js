import Course from "../../models/feedback/Course.js";
import CourseGrading from "../../models/grades/CourseGrading.js";
import {GradeError, handle, getFaculty, requireCourseFaculty, histEntry} from "../../utils/gradeGuards.js";

// Every co-teaching faculty member must approve, including whoever submitted.
// Someone teaching a course alone is its CC chair.
export const queue = handle(async (req, res) => {
    const faculty = await getFaculty(req);
    const courses = await Course.find({faculty: faculty._id}).populate("faculty", "name").lean();
    const gradings = await CourseGrading.find({course: {$in: courses.map((c) => c._id)}, status: {$in: ["cc_review", "approved"]}}).lean();
    const byCourse = Object.fromEntries(gradings.map((g) => [String(g.course), g]));
    const items = [];
    for (const c of courses) {
        const g = byCourse[String(c._id)];
        if (!g) continue;
        const approved = new Set(g.approvals.map((a) => String(a.faculty)));
        items.push({
            courseId: c._id, name: c.name, code: c.code, semester: c.semester, status: g.status, version: g.version,
            amendment: g.amendment?.type || null, soleFaculty: c.faculty.length === 1,
            approvedBy: c.faculty.filter((f) => approved.has(String(f._id))).map((f) => f.name),
            waitingOn: c.faculty.filter((f) => !approved.has(String(f._id))).map((f) => f.name),
            myApproval: approved.has(String(faculty._id)),
        });
    }
    res.json({pending: items.filter((i) => i.status === "cc_review" && !i.myApproval), others: items.filter((i) => i.status !== "cc_review" || i.myApproval)});
});

export const approve = handle(async (req, res) => {
    const {faculty, course} = await requireCourseFaculty(req, req.body.courseId);
    const grading = await CourseGrading.findOne({course: course._id});
    if (!grading) throw new GradeError("Nothing to approve", 404);
    const upd = await CourseGrading.findOneAndUpdate(
        {_id: grading._id, status: "cc_review", "approvals.faculty": {$ne: faculty._id}},
        {$push: {approvals: {faculty: faculty._id, at: new Date()}, history: histEntry("Faculty", req.user.email, "approved")}}, {new: true}
    );
    if (!upd) throw new GradeError("This grading is no longer waiting on you.", 409);
    const done = course.faculty.every((f) => upd.approvals.some((a) => String(a.faculty) === String(f)));
    let status = upd.status;
    if (done) {
        const moved = await CourseGrading.findOneAndUpdate(
            {_id: grading._id, status: "cc_review"},
            {$set: {status: "approved"}, $push: {history: histEntry("System", null, "all_approved")}}, {new: true}
        );
        if (moved) status = "approved";
    }
    res.json({status, message: status === "approved" ? "Everyone has approved. It now goes to the Academic Office." : "Approved. Waiting on the other faculty."});
});

export const sendBack = handle(async (req, res) => {
    const {course} = await requireCourseFaculty(req, req.body.courseId);
    const remark = String(req.body.remark || "").trim();
    if (!remark) throw new GradeError("A remark is required to send this back.");
    const upd = await CourseGrading.findOneAndUpdate(
        {course: course._id, status: "cc_review"},
        {$set: {status: "grading", approvals: []}, $push: {history: histEntry("Faculty", req.user.email, "sent_back", remark)}}, {new: true}
    );
    if (!upd) throw new GradeError("This grading is no longer in CC review.", 409);
    res.json({message: "Sent back to the grading draft."});
});

import Faculty from "../models/Faculty.js";
import Course from "../models/feedback/Course.js";
import CourseGrading from "../models/grades/CourseGrading.js";
import SectionSheet from "../models/grades/SectionSheet.js";

// Thrown for expected failures; handlers map it to its status code.
export class GradeError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

export const handle = (fn) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (err) {
        if (err instanceof GradeError) return res.status(err.status).json({message: err.message});
        console.error(err);
        return res.status(500).json({message: "Something went wrong. Please try again."});
    }
};

export async function getFaculty(req) {
    const faculty = await Faculty.findOne({email: req.user.email});
    if (!faculty) throw new GradeError("Faculty profile not found", 404);
    return faculty;
}

// The user must be in Course.faculty[]. Returns { faculty, course }.
export async function requireCourseFaculty(req, courseId) {
    if (!courseId) throw new GradeError("courseId is required");
    const faculty = await getFaculty(req);
    const course = await Course.findById(courseId);
    if (!course) throw new GradeError("Course not found", 404);
    if (!course.faculty.map(String).includes(String(faculty._id)))
        throw new GradeError("You are not teaching this course", 403);
    return {faculty, course};
}

// The user must own the section sheet. Returns { faculty, course, grading, sheet }.
export async function requireSectionOwner(req, courseId) {
    const {faculty, course} = await requireCourseFaculty(req, courseId);
    const grading = await CourseGrading.findOne({course: course._id});
    if (!grading) throw new GradeError("Grading has not been started for this course", 404);
    const sheet = await SectionSheet.findOne({courseGrading: grading._id, faculty: faculty._id});
    if (!sheet) throw new GradeError("You do not have a section sheet for this course", 403);
    return {faculty, course, grading, sheet};
}

export const histEntry = (role, email, action, remark) => ({role, email, action, ...(remark ? {remark} : {}), at: new Date()});

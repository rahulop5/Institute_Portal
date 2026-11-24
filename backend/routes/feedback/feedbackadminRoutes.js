import express from "express";
import { 
    addCourse, 
    addFacultyCSV, 
    addFacultyStudentstoCourse, 
    addStudentsCSV,
    adminDashboardCourse,
    adminDashboardFaculty,
    adminDashboardStudent,
    deleteCourse,
    resetCourse,
    viewCourse,
    viewFaculty,
    viewFacultyCourseStatistics,
    updateCourseDetails,
    updateCourseStudents,
    resetFeedback,
    getAvailableSemesters,
    toggleFeedback,
    getFeedbackStatus,
    resetFeedbackPreview
} from "../../controllers/feedback/feedbackadminController.js";
import upload from "../../config/multer.js";
import { authAdminMiddleware, requireDeanMiddleware, requireRecordManagerMiddleware } from "../../controllers/authController.js";

const router = express.Router();

//admin for now later make it as privileged user

//dashboard
router.get("/dashboard/students", authAdminMiddleware, adminDashboardStudent);
router.get("/dashboard/faculty", authAdminMiddleware, adminDashboardFaculty);
router.get("/dashboard/courses", authAdminMiddleware, adminDashboardCourse);
router.get("/dashboard/course", authAdminMiddleware, viewCourse);

// database feeding
router.post("/addcourse", authAdminMiddleware, requireRecordManagerMiddleware, upload.single("file"), addCourse);
router.post("/addFacultyCSV", authAdminMiddleware, requireRecordManagerMiddleware, upload.single("file"), addFacultyCSV);
router.post("/addStudentsCSV", authAdminMiddleware, requireRecordManagerMiddleware, upload.single("file"), addStudentsCSV);

//course actions
router.get("/viewCourse", authAdminMiddleware, viewCourse);
router.get("/resetcourse", authAdminMiddleware, requireRecordManagerMiddleware, resetCourse);
router.delete("/deletecourse", authAdminMiddleware, requireRecordManagerMiddleware, deleteCourse);
router.post("/addFacultyStudentstoCourse", authAdminMiddleware, requireRecordManagerMiddleware, upload.single("file"), addFacultyStudentstoCourse);

// Update course details
router.post("/updateCourseDetails", authAdminMiddleware, requireRecordManagerMiddleware, updateCourseDetails);
// Update course students (CSV)
router.post("/updateCourseStudents", authAdminMiddleware, requireRecordManagerMiddleware, upload.single("file"), updateCourseStudents);

//Reset Feedback
// Two steps: the preview says what would be deleted, and the reset itself
// only runs when the request repeats that semester code.
router.get("/resetFeedbackPreview", authAdminMiddleware, requireDeanMiddleware, resetFeedbackPreview);
router.post("/resetFeedback", authAdminMiddleware, requireDeanMiddleware, resetFeedback);

//Feedback open/close control
router.post("/toggleFeedback", authAdminMiddleware, requireDeanMiddleware, toggleFeedback);
router.get("/feedbackStatus", authAdminMiddleware, getFeedbackStatus);

//Semester listing
router.get("/semesters", authAdminMiddleware, getAvailableSemesters);

//faculty actions(only viewing)
router.get("/viewFaculty", authAdminMiddleware, viewFaculty);
router.get("/viewFacultyCourseStatistics", authAdminMiddleware, viewFacultyCourseStatistics);


export default router;
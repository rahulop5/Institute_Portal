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
    getFeedbackStatus
} from "../../controllers/feedback/feedbackadminController.js";
import upload from "../../config/multer.js";
import { authAdminMiddleware, blockDeanWriteMiddleware } from "../../controllers/authController.js";

const router = express.Router();

//admin for now later make it as privileged user

//dashboard
router.get("/dashboard/students", authAdminMiddleware, adminDashboardStudent);
router.get("/dashboard/faculty", authAdminMiddleware, adminDashboardFaculty);
router.get("/dashboard/courses", authAdminMiddleware, adminDashboardCourse);
router.get("/dashboard/course", authAdminMiddleware, viewCourse);

// database feeding
router.post("/addcourse", authAdminMiddleware, blockDeanWriteMiddleware, upload.single("file"), addCourse);
router.post("/addFacultyCSV", authAdminMiddleware, blockDeanWriteMiddleware, upload.single("file"), addFacultyCSV);
router.post("/addStudentsCSV", authAdminMiddleware, blockDeanWriteMiddleware, upload.single("file"), addStudentsCSV);

//course actions
router.get("/viewCourse", authAdminMiddleware, viewCourse);
router.get("/resetcourse", authAdminMiddleware, blockDeanWriteMiddleware, resetCourse);
router.delete("/deletecourse", authAdminMiddleware, blockDeanWriteMiddleware, deleteCourse);
router.post("/addFacultyStudentstoCourse", authAdminMiddleware, blockDeanWriteMiddleware, upload.single("file"), addFacultyStudentstoCourse);

// Update course details
router.post("/updateCourseDetails", authAdminMiddleware, blockDeanWriteMiddleware, updateCourseDetails);
// Update course students (CSV)
router.post("/updateCourseStudents", authAdminMiddleware, blockDeanWriteMiddleware, upload.single("file"), updateCourseStudents);

//Reset Feedback
router.post("/resetFeedback", authAdminMiddleware, blockDeanWriteMiddleware, resetFeedback);

//Feedback open/close control
router.post("/toggleFeedback", authAdminMiddleware, blockDeanWriteMiddleware, toggleFeedback);
router.get("/feedbackStatus", authAdminMiddleware, getFeedbackStatus);

//Semester listing
router.get("/semesters", authAdminMiddleware, getAvailableSemesters);

//faculty actions(only viewing)
router.get("/viewFaculty", authAdminMiddleware, viewFaculty);
router.get("/viewFacultyCourseStatistics", authAdminMiddleware, viewFacultyCourseStatistics);


export default router;
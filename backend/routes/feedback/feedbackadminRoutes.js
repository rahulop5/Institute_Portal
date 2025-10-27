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
    viewFacultyCourseStatistics
} from "../../controllers/feedback/feedbackadminController.js";
import upload from "../../config/multer.js";
import { authAdminMiddleware } from "../../controllers/authController.js";

const router = express.Router();

//admin for now later make it as privileged user

//dashboard
router.get("/dashboard/students", authAdminMiddleware, adminDashboardStudent);
router.get("/dashboard/faculty", authAdminMiddleware, adminDashboardFaculty);
router.get("/dashboard/courses", authAdminMiddleware, adminDashboardCourse);
router.get("/dashboard/course", authAdminMiddleware, viewCourse);

// database feeding
router.post("/addcourse", authAdminMiddleware, upload.single("file"), addCourse);
router.post("/addFacultyCSV", authAdminMiddleware, upload.single("file"), addFacultyCSV);
router.post("/addStudentsCSV", authAdminMiddleware, upload.single("file"), addStudentsCSV);

//course actions
router.get("/resetcourse", authAdminMiddleware, resetCourse);
router.delete("/deletecourse", authAdminMiddleware, deleteCourse);
router.post("/addFacultyStudentstoCourse", authAdminMiddleware, upload.single("file"), addFacultyStudentstoCourse);

//faculty actions(only viewing)
router.get("/viewFaculty", authAdminMiddleware, viewFaculty);
router.get("/viewFacultyCourseStatistics", authAdminMiddleware, viewFacultyCourseStatistics);


export default router;
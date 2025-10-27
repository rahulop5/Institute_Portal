import express from "express";
import { 
    addCourse, 
    addFacultyCSV, 
    addStudentsCSV,
    adminDashboardCourse,
    adminDashboardFaculty,
    adminDashboardStudent,
    viewCourse
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


router.post("/addcourse", authAdminMiddleware, upload.single("file"), addCourse);
router.post("/addFacultyCSV", authAdminMiddleware, upload.single("file"), addFacultyCSV);
router.post("/addStudentsCSV", authAdminMiddleware, upload.single("file"), addStudentsCSV);

export default router;
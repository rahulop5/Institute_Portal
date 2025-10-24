import express from "express";
import { authFacultyMiddleware } from "../../controllers/authController.js";
import { facultyDashboard, viewCourseStatistics } from "../../controllers/feedback/feedbackfacultyController.js";

const router=express.Router();

router.get("/dashboard", authFacultyMiddleware, facultyDashboard);
router.get("/course", authFacultyMiddleware, viewCourseStatistics);

export default router;
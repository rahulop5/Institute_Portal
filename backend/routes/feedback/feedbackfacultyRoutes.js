import express from "express";
import { authFacultyMiddleware } from "../../controllers/authController.js";
import { facultyDashboard, viewCourseStatistics, getAvailableFacultySemesters } from "../../controllers/feedback/feedbackfacultyController.js";

const router=express.Router();

router.get("/dashboard", authFacultyMiddleware, facultyDashboard);
router.get("/course", authFacultyMiddleware, viewCourseStatistics);
router.get("/semesters", authFacultyMiddleware, getAvailableFacultySemesters);

export default router;
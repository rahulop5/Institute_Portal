import express from "express";
import {
    authFacultyMiddleware,
    getFacultyBTPDashboard,
    releaseTopics
} from "../controllers/facultyController.js";

const router=express.Router();

router.get("/btp", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/releasetopics", authFacultyMiddleware, releaseTopics);

export default router;
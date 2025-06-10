import express from "express";
import {
    authFacultyMiddleware,
    getFacultyBTPDashboard,
    releaseTopics
} from "../controllers/facultyController";

const router=express.Router();

router.get("/btp", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/releasetopics", authFacultyMiddleware, releaseTopics);

export default router;
import express from "express";
import {
    authFacultyMiddleware,
    getFacultyBTPDashboard,
    addTopic
} from "../controllers/facultyController.js";

const router=express.Router();

router.get("/btp", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/releasetopics", authFacultyMiddleware, addTopic);

export default router;
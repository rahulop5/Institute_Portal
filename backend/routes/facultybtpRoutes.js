import express from "express";
import { authFacultyMiddleware } from "../controllers/authController.js";
import {
    getFacultyBTPDashboard,
    addTopic,
    deleteTopic,
    approveTopicRequest
} from "../controllers/facultybtpController.js";

const router=express.Router();

router.get("/", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/releasetopics", authFacultyMiddleware, addTopic);
router.delete("/deletetopic", authFacultyMiddleware, deleteTopic);
router.post("/approvetopicrequest", authFacultyMiddleware, approveTopicRequest)

export default router;
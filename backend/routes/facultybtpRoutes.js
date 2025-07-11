import express from "express";
import { authFacultyMiddleware, authStaffMiddleware } from "../controllers/authController.js";
import {
    getFacultyBTPDashboard,
    addTopic,
    deleteTopic,
    approveTopicRequest,
    evaluateProjectasGuide,
    rejectTopicRequest
} from "../controllers/facultybtpController.js";

const router=express.Router();

//phase verification can be done outside
router.get("/", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/releasetopics", authFacultyMiddleware, addTopic);
router.delete("/deletetopic", authFacultyMiddleware, deleteTopic);
router.post("/approvetopicrequest", authFacultyMiddleware, approveTopicRequest);
router.delete("/rejecttopicreq", authFacultyMiddleware, rejectTopicRequest);
router.post("/evaluateguide", authFacultyMiddleware, evaluateProjectasGuide);

export default router;
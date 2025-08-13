import express from "express";
import { authFacultyMiddleware, authStaffMiddleware } from "../controllers/authController.js";
import {
    getFacultyBTPDashboard,
    addTopic,
    deleteTopic,
    approveTopicRequest,
    evaluateProjectasGuide,
    rejectTopicRequest,
    viewProject,
    evaluateProjectasEval,
    viewProjectEvaluator
} from "../controllers/facultybtpController.js";

const router=express.Router();

//phase verification can be done outside
router.get("/", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/addtopic", authFacultyMiddleware, addTopic);
router.delete("/deletetopic", authFacultyMiddleware, deleteTopic);
router.post("/approvetopicrequest", authFacultyMiddleware, approveTopicRequest);
router.delete("/rejecttopicreq", authFacultyMiddleware, rejectTopicRequest);
router.post("/evaluateguide", authFacultyMiddleware, evaluateProjectasGuide);
router.post("/evaluateevaluator", authFacultyMiddleware, evaluateProjectasEval);
router.get("/viewproject", authFacultyMiddleware, viewProject);
router.get("/viewprojectevaluator", authFacultyMiddleware, viewProjectEvaluator);

export default router;
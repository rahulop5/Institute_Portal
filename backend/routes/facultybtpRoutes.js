import express from "express";
import { authFacultyMiddleware } from "../controllers/authController.js";
import {
    getFacultyBTPDashboard,
    addTopic,
    deleteTopic,
    approveTopicRequest,
    rejectTopicRequest,
    evaluateProjectasGuide,
    evaluateProjectasEval,
    viewProject,
    viewProjectEvaluator
} from "../controllers/facultybtpController.js";

const router=express.Router();

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
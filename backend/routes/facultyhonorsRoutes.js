import express from "express";
import { authFacultyMiddleware } from "../controllers/authController.js";
import {
    getFacultyHonorsDashboard,
    addHonorsTopic,
    deleteHonorsTopic,
    approveHonorsTopicRequest,
    rejectHonorsTopicRequest,
    evaluateHonorsProjectasGuide,
    evaluateHonorsProjectasEval,
    releaseHonorsEvaluation,
    assignEvaluator,
    removeEvaluator,
    viewHonorsProject,
    viewHonorsProjectEvaluator
} from "../controllers/facultyhonorsController.js";

const router = express.Router();

router.get("/", authFacultyMiddleware, getFacultyHonorsDashboard);
router.post("/addtopic", authFacultyMiddleware, addHonorsTopic);
router.delete("/deletetopic", authFacultyMiddleware, deleteHonorsTopic);
router.post("/approvetopicrequest", authFacultyMiddleware, approveHonorsTopicRequest);
router.delete("/rejecttopicreq", authFacultyMiddleware, rejectHonorsTopicRequest);
router.post("/evaluateguide", authFacultyMiddleware, evaluateHonorsProjectasGuide);
router.post("/evaluateevaluator", authFacultyMiddleware, evaluateHonorsProjectasEval);
router.post("/releaseevaluation", authFacultyMiddleware, releaseHonorsEvaluation);
router.post("/assignevaluator", authFacultyMiddleware, assignEvaluator);
router.post("/removeevaluator", authFacultyMiddleware, removeEvaluator);
router.get("/viewproject", authFacultyMiddleware, viewHonorsProject);
router.get("/viewprojectevaluator", authFacultyMiddleware, viewHonorsProjectEvaluator);

export default router;

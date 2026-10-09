import express from "express";
import { updateInterests } from "../controllers/topicProposalController.js";
import { forwardTopicRequest } from "../controllers/enrollmentController.js";
import { authFacultyMiddleware } from "../controllers/authController.js";
import {
    getFacultyBTPDashboard,
    addTopic,
    deleteTopic,
    rejectTopicRequest,
    evaluateProjectasGuide,
    evaluateProjectasEval,
    releaseEvaluation,
    assignEvaluator,
    removeEvaluator,
    stopGuiding,
    completeProject,
    viewProject,
    viewProjectEvaluator
} from "../controllers/facultybtpController.js";

const router=express.Router();

router.get("/", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/interests", authFacultyMiddleware, updateInterests);
router.post("/addtopic", authFacultyMiddleware, addTopic);
router.delete("/deletetopic", authFacultyMiddleware, deleteTopic);
router.post("/approvetopicrequest", authFacultyMiddleware, forwardTopicRequest("btp"));
router.delete("/rejecttopicreq", authFacultyMiddleware, rejectTopicRequest);
router.post("/evaluateguide", authFacultyMiddleware, evaluateProjectasGuide);
router.post("/evaluateevaluator", authFacultyMiddleware, evaluateProjectasEval);
router.post("/releaseevaluation", authFacultyMiddleware, releaseEvaluation);
router.post("/assignevaluator", authFacultyMiddleware, assignEvaluator);
router.post("/removeevaluator", authFacultyMiddleware, removeEvaluator);
router.post("/stopguiding", authFacultyMiddleware, stopGuiding);
router.post("/completeproject", authFacultyMiddleware, completeProject);
router.get("/viewproject", authFacultyMiddleware, viewProject);
router.get("/viewprojectevaluator", authFacultyMiddleware, viewProjectEvaluator);

export default router;
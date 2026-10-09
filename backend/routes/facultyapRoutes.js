import express from "express";
import { updateInterests } from "../controllers/topicProposalController.js";
import { forwardAPRequest } from "../controllers/enrollmentController.js";
import { authFacultyMiddleware } from "../controllers/authController.js";
import {
    getFacultyAPDashboard,
    rejectAPRequest,
    evaluateAPProjectasGuide,
    evaluateAPProjectasEval,
    releaseAPEvaluation,
    assignEvaluator,
    removeEvaluator,
    stopGuiding,
    completeProject,
    viewAPProject,
    viewAPProjectEvaluator
} from "../controllers/facultyapController.js";

const router = express.Router();

router.get("/", authFacultyMiddleware, getFacultyAPDashboard);
router.post("/interests", authFacultyMiddleware, updateInterests);
router.post("/approverequest", authFacultyMiddleware, forwardAPRequest);
router.delete("/rejectrequest", authFacultyMiddleware, rejectAPRequest);
router.post("/evaluateguide", authFacultyMiddleware, evaluateAPProjectasGuide);
router.post("/evaluateevaluator", authFacultyMiddleware, evaluateAPProjectasEval);
router.post("/releaseevaluation", authFacultyMiddleware, releaseAPEvaluation);
router.post("/assignevaluator", authFacultyMiddleware, assignEvaluator);
router.post("/removeevaluator", authFacultyMiddleware, removeEvaluator);
router.post("/stopguiding", authFacultyMiddleware, stopGuiding);
router.post("/completeproject", authFacultyMiddleware, completeProject);
router.get("/viewproject", authFacultyMiddleware, viewAPProject);
router.get("/viewprojectevaluator", authFacultyMiddleware, viewAPProjectEvaluator);

export default router;

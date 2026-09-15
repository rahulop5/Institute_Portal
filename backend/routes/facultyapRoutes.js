import express from "express";
import { authFacultyMiddleware } from "../controllers/authController.js";
import {
    getFacultyAPDashboard,
    approveAPRequest,
    rejectAPRequest,
    evaluateAPProjectasGuide,
    evaluateAPProjectasEval,
    releaseAPEvaluation,
    assignEvaluator,
    removeEvaluator,
    viewAPProject,
    viewAPProjectEvaluator
} from "../controllers/facultyapController.js";

const router = express.Router();

router.get("/", authFacultyMiddleware, getFacultyAPDashboard);
router.post("/approverequest", authFacultyMiddleware, approveAPRequest);
router.delete("/rejectrequest", authFacultyMiddleware, rejectAPRequest);
router.post("/evaluateguide", authFacultyMiddleware, evaluateAPProjectasGuide);
router.post("/evaluateevaluator", authFacultyMiddleware, evaluateAPProjectasEval);
router.post("/releaseevaluation", authFacultyMiddleware, releaseAPEvaluation);
router.post("/assignevaluator", authFacultyMiddleware, assignEvaluator);
router.post("/removeevaluator", authFacultyMiddleware, removeEvaluator);
router.get("/viewproject", authFacultyMiddleware, viewAPProject);
router.get("/viewprojectevaluator", authFacultyMiddleware, viewAPProjectEvaluator);

export default router;

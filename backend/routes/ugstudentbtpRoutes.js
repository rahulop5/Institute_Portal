import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    approveTeamRequest,
    createTeam,
    facultyAssignmentRequest,
    getBTPDashboard,
    verifyBinAndPhase
} from "../controllers/ugstudentbtpController.js";

const router=express.Router();

router.get("/", authStudentMiddleware, getBTPDashboard);
router.post("/createteam", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "TEAM_FORMATION"}), createTeam);
router.post("/approverequest", authStudentMiddleware, verifyBinAndPhase({bin: [2, 3], phase: "TEAM_FORMATION"}), approveTeamRequest);
router.post("/requestfaculty", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "FACULTY_ASSIGNMENT"}), facultyAssignmentRequest);

export default router;
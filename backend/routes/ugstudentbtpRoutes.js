import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    addTeamMember,
    addUpdatetoProject,
    approveTeamRequest,
    createTeam,
    facultyAssignmentRequest,
    getBTPDashboard,
    rejectTeamRequest,
    verifyBinAndPhase
} from "../controllers/ugstudentbtpController.js";

const router=express.Router();

router.get("/", authStudentMiddleware, getBTPDashboard);
router.post("/createteam", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "TEAM_FORMATION"}), createTeam);
router.post("/approverequest", authStudentMiddleware, verifyBinAndPhase({bin: [2, 3], phase: "TEAM_FORMATION"}), approveTeamRequest);
router.delete("/rejectrequest", authStudentMiddleware, verifyBinAndPhase({bin: [2, 3], phase: "TEAM_FORMATION"}), rejectTeamRequest);
router.post("/addteammember", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "TEAM_FORMATION"}), addTeamMember);
router.post("/requestfaculty", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "FACULTY_ASSIGNMENT"}), facultyAssignmentRequest);
router.post("/addupdate", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "IN_PROGRESS"}), addUpdatetoProject)

export default router;
import express from "express";
import {
    approveTeamRequest,
    authStudentMiddleware,
    createTeam,
    facultyAssignmentRequest,
    getBTPDashboard,
    verifyBinAndPhase
} from "../controllers/ugstudentController.js";

const router=express.Router();

router.get("/btp", authStudentMiddleware, getBTPDashboard);
router.post("/btp/createteam", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "TEAM_FORMATION"}), createTeam);
router.post("/btp/approverequest", authStudentMiddleware, verifyBinAndPhase({bin: [2, 3], phase: "TEAM_FORMATION"}), approveTeamRequest);
router.post("/btp/requestfaculty", authStudentMiddleware, verifyBinAndPhase({bin: [1], phase: "FACULTY_ASSIGNMENT"}), facultyAssignmentRequest);

export default router;
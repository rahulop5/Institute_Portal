import express from "express";
import { authStaffMiddleware } from "../controllers/authController.js";
import {
    advancePreferenceRound,
    allocateFacultytoTeam,
    approveFacultyToTeam,
    assignEvaluator,
    assignGuideToTeam,
    createTeambyStaff,
    deallocateFacultyforTeam,
    deleteTeam,
    endFacultyAssignmentPhase,
    endTeamFormationPhase,
    getStaffBTPDashboard,
    rejectFacultyFromTeam,
    updateTeam,
    uploadCSVSheet,
    verifyPhase,
    viewProjectStaff
} from "../controllers/staffbtpController.js";
import upload from "../config/multer.js";

const router=express.Router();

router.get("/", authStaffMiddleware, getStaffBTPDashboard);
//for this phase verification is done inside the function
router.post("/binsrelease", authStaffMiddleware, upload.single("bins"), uploadCSVSheet);
router.post("/createteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), createTeambyStaff);
router.post("/updateteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), updateTeam);
router.delete("/deleteteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), deleteTeam);
//for this phase verification is done inside the function
router.get("/endTFphase", authStaffMiddleware, endTeamFormationPhase);
router.post("/allocatefaculty", authStaffMiddleware, assignGuideToTeam);
router.delete("/deallocatefaculty", authStaffMiddleware, deallocateFacultyforTeam);
router.get("/endFAphase", authStaffMiddleware, endFacultyAssignmentPhase);

router.get("/viewproject", authStaffMiddleware, viewProjectStaff);

router.post("/assignevaluator", authStaffMiddleware, assignEvaluator);
router.post("/advancepreferencernd", authStaffMiddleware, advancePreferenceRound);
router.post("/approvefacultytoteam", authStaffMiddleware, approveFacultyToTeam);
router.delete("/rejectfacultyfromteam", authStaffMiddleware, rejectFacultyFromTeam);

export default router;
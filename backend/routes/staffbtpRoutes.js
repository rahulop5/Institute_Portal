import express from "express";
import { authStaffMiddleware } from "../controllers/authController.js";
import {
    advancePreferenceRound,
    allocateFacultytoTeam,
    assignEvaluator,
    createTeambyStaff,
    deallocateFacultyforTeam,
    deleteTeam,
    endFacultyAssignmentPhase,
    endTeamFormationPhase,
    getStaffBTPDashboard,
    uploadCSVSheet,
    verifyPhase
} from "../controllers/staffbtpController.js";
import upload from "../config/multer.js";

const router=express.Router();

router.get("/", authStaffMiddleware, getStaffBTPDashboard);
//for this phase verification is done inside the function
router.post("/binsrelease", authStaffMiddleware, upload.single("bins"), uploadCSVSheet);
router.post("/createteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), createTeambyStaff);
router.delete("/deleteteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), deleteTeam);
//for this phase verification is done inside the function
router.get("/endTFphase", authStaffMiddleware, endTeamFormationPhase);
router.post("/allocatefaculty", authStaffMiddleware, allocateFacultytoTeam);
router.delete("/deallocatefaculty", authStaffMiddleware, deallocateFacultyforTeam);
router.get("/endFAphase", authStaffMiddleware, endFacultyAssignmentPhase);
router.post("/assignevaluator", authStaffMiddleware, assignEvaluator);
router.post("/advancepreferencernd", authStaffMiddleware, advancePreferenceRound);

export default router;
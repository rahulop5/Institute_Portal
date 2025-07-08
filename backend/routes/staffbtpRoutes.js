import express from "express";
import { authStaffMiddleware } from "../controllers/authController.js";
import {
    createTeambyStaff,
    deleteTeam,
    endTeamFormationPhase,
    getStaffBTPDashboard,
    uploadCSVSheet,
    verifyPhase
} from "../controllers/staffbtpController.js";
import upload from "../config/multer.js";

const router=express.Router();

router.get("/", authStaffMiddleware, getStaffBTPDashboard);
router.post("/binsrelease", authStaffMiddleware, verifyPhase({phase: "NOT_STARTED"}), upload.single("bins"), uploadCSVSheet);
router.post("/createteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), createTeambyStaff);
router.delete("/deleteteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), deleteTeam);
router.get("/endTFphase", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), endTeamFormationPhase);

export default router;
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
//for this phase verification is done inside the function
router.post("/binsrelease", authStaffMiddleware, upload.single("bins"), uploadCSVSheet);
router.post("/createteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), createTeambyStaff);
router.delete("/deleteteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), deleteTeam);
router.get("/endTFphase", authStaffMiddleware, endTeamFormationPhase);

export default router;
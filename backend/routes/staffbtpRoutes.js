import express from "express";
import { authStaffMiddleware } from "../controllers/authController.js";
import {
    createTeambyStaff,
    getStaffBTPDashboard,
    uploadCSVSheet,
    verifyPhase
} from "../controllers/staffbtpController.js";
import upload from "../config/multer.js";

const router=express.Router();

router.get("/", authStaffMiddleware, getStaffBTPDashboard);
router.post("/binsrelease", authStaffMiddleware, verifyPhase({phase: "NOT_STARTED"}), upload.single("bins"), uploadCSVSheet);
router.post("/createteam", authStaffMiddleware, verifyPhase({phase: "TEAM_FORMATION"}), createTeambyStaff);

export default router;
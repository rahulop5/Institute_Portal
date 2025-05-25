import express from "express";
import {
    authStaffMiddleware,
    getStaffBTPDashboard
} from "../controllers/staffController.js";

const router=express.Router();

router.get("/btp", authStaffMiddleware, getStaffBTPDashboard);

export default router;
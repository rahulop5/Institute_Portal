import express from "express";
import { authStaffMiddleware } from "../controllers/authController.js";
import {
    getStaffBTPDashboard,
    uploadCSVSheet
} from "../controllers/staffbtpController.js";
import upload from "../config/multer.js";

const router=express.Router();

router.get("/", authStaffMiddleware, getStaffBTPDashboard);
router.post("/binsrelease", authStaffMiddleware, upload.single("bins"), uploadCSVSheet);

export default router;
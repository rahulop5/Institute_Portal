import express from "express";
import {
    authStaffMiddleware,
    getStaffBTPDashboard,
    uploadCSVSheet
} from "../controllers/staffController.js";
import upload from "../config/multer.js";

const router=express.Router();

router.get("/btp", authStaffMiddleware, getStaffBTPDashboard);
router.post("/btp/binsrelease", authStaffMiddleware, upload.single("bins"), uploadCSVSheet);

export default router;
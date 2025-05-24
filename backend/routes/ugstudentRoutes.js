import express from "express";
import { authMiddleware } from "../controllers/authController.js";
import {
    getBTPDashboard
} from "../controllers/ugstudentcontroller.js";

const router=express.Router();

router.get("/btp", authMiddleware, getBTPDashboard);

export default router;
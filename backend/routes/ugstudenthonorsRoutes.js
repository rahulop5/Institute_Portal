import express from "express";
import { getHonorsStudentDashboard } from "../controllers/ugstudenthonorsController.js";
import { authHonorsStudentMiddleware } from "../controllers/authController.js";

const router=express.Router();

router.get("/", authHonorsStudentMiddleware, getHonorsStudentDashboard);

export default router;
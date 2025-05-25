import express from "express";
import {
    authStudentMiddleware,
    getBTPDashboard
} from "../controllers/ugstudentcontroller.js";

const router=express.Router();

router.get("/btp", authStudentMiddleware, getBTPDashboard);

export default router;
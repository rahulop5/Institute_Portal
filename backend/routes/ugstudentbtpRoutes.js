import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    getBTPDashboard,
    requestTopic,
    withdrawRequest,
    addUpdatetoProject
} from "../controllers/ugstudentbtpController.js";

const router=express.Router();

router.get("/", authStudentMiddleware, getBTPDashboard);
router.post("/requesttopic", authStudentMiddleware, requestTopic);
router.post("/withdrawrequest", authStudentMiddleware, withdrawRequest);
router.post("/addupdate", authStudentMiddleware, addUpdatetoProject);

export default router;
import express from "express";
import {
    authStudentMiddleware,
    createTeam,
    getBTPDashboard,
    verifyBin
} from "../controllers/ugstudentController.js";

const router=express.Router();

router.get("/btp", authStudentMiddleware, getBTPDashboard);
router.post("/btp/createteam", authStudentMiddleware, verifyBin({bin: [1]}), createTeam);

export default router;
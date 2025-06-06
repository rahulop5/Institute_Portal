import express from "express";
import {
    approveTeamRequest,
    authStudentMiddleware,
    createTeam,
    getBTPDashboard,
    verifyBin
} from "../controllers/ugstudentController.js";

const router=express.Router();

router.get("/btp", authStudentMiddleware, getBTPDashboard);
router.post("/btp/createteam", authStudentMiddleware, verifyBin({bin: [1]}), createTeam);
router.post("/btp/approverequest", authStudentMiddleware, verifyBin({bin: [2, 3]}), approveTeamRequest);

export default router;
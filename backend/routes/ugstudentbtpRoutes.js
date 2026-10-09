import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    getBTPDashboard,
    proposeBTPTopic,
    requestTopic,
    withdrawRequest,
    addUpdatetoProject
} from "../controllers/ugstudentbtpController.js";

import { editUpdate, deleteUpdate } from "../controllers/studentUpdatesController.js";
import BTP from "../models/BTP.js";
import BTPRegistration from "../models/BTPRegistration.js";

const router=express.Router();

router.get("/", authStudentMiddleware, getBTPDashboard);
router.post("/requesttopic", authStudentMiddleware, requestTopic);
router.post("/proposetopic", authStudentMiddleware, proposeBTPTopic);
router.post("/withdrawrequest", authStudentMiddleware, withdrawRequest);
router.post("/addupdate", authStudentMiddleware, addUpdatetoProject);
router.post("/editupdate", authStudentMiddleware, editUpdate(BTP, BTPRegistration, "BTP"));
router.post("/deleteupdate", authStudentMiddleware, deleteUpdate(BTP, BTPRegistration, "BTP"));

export default router;
import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    getHonorsDashboard,
    proposeHonorsTopic,
    requestHonorsTopic,
    withdrawHonorsRequest,
    addUpdatetoHonorsProject
} from "../controllers/ugstudenthonorsController.js";

import { editUpdate, deleteUpdate } from "../controllers/studentUpdatesController.js";
import Honors from "../models/Honors.js";
import HonorsRegistration from "../models/HonorsRegistration.js";

const router = express.Router();

router.get("/", authStudentMiddleware, getHonorsDashboard);
router.post("/requesttopic", authStudentMiddleware, requestHonorsTopic);
router.post("/proposetopic", authStudentMiddleware, proposeHonorsTopic);
router.post("/withdrawrequest", authStudentMiddleware, withdrawHonorsRequest);
router.post("/addupdate", authStudentMiddleware, addUpdatetoHonorsProject);
router.post("/editupdate", authStudentMiddleware, editUpdate(Honors, HonorsRegistration, "Honors"));
router.post("/deleteupdate", authStudentMiddleware, deleteUpdate(Honors, HonorsRegistration, "Honors"));

export default router;
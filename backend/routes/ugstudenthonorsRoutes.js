import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    getHonorsDashboard,
    requestHonorsTopic,
    withdrawHonorsRequest,
    addUpdatetoHonorsProject
} from "../controllers/ugstudenthonorsController.js";

const router = express.Router();

router.get("/", authStudentMiddleware, getHonorsDashboard);
router.post("/requesttopic", authStudentMiddleware, requestHonorsTopic);
router.post("/withdrawrequest", authStudentMiddleware, withdrawHonorsRequest);
router.post("/addupdate", authStudentMiddleware, addUpdatetoHonorsProject);

export default router;
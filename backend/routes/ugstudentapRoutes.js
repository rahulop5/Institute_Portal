import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    getAPDashboard,
    requestFaculty,
    withdrawRequest,
    addUpdatetoAPProject
} from "../controllers/ugstudentapController.js";

const router = express.Router();

router.get("/", authStudentMiddleware, getAPDashboard);
router.post("/requestfaculty", authStudentMiddleware, requestFaculty);
router.post("/withdrawrequest", authStudentMiddleware, withdrawRequest);
router.post("/addupdate", authStudentMiddleware, addUpdatetoAPProject);

export default router;

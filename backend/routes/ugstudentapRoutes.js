import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    getAPDashboard,
    requestFaculty,
    withdrawRequest,
    addUpdatetoAPProject
} from "../controllers/ugstudentapController.js";

import { editUpdate, deleteUpdate } from "../controllers/studentUpdatesController.js";
import AP from "../models/AP.js";
import APRegistration from "../models/APRegistration.js";

const router = express.Router();

router.get("/", authStudentMiddleware, getAPDashboard);
router.post("/requestfaculty", authStudentMiddleware, requestFaculty);
router.post("/withdrawrequest", authStudentMiddleware, withdrawRequest);
router.post("/addupdate", authStudentMiddleware, addUpdatetoAPProject);
router.post("/editupdate", authStudentMiddleware, editUpdate(AP, APRegistration, "AP"));
router.post("/deleteupdate", authStudentMiddleware, deleteUpdate(AP, APRegistration, "AP"));

export default router;

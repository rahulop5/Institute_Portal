import express from "express";
import { authStudentMiddleware } from "../../controllers/authController.js";
import { 
    feedbackStudentDashboard,
    selectFaculty
} from "../../controllers/feedback/feedbackstudentController.js";

const router=express.Router();

router.get("/", authStudentMiddleware, feedbackStudentDashboard);
router.post("/selectfaculty", authStudentMiddleware, selectFaculty);

export default router;
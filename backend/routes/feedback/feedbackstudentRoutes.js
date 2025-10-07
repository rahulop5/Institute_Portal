import express from "express";
import { authStudentMiddleware } from "../../controllers/authController.js";
import { 
    feedbackStudentDashboard,
    selectFaculty,
    submitFeedback,
    updateFeedback
} from "../../controllers/feedback/feedbackstudentController.js";

const router=express.Router();

router.get("/", authStudentMiddleware, feedbackStudentDashboard);
router.post("/selectfaculty", authStudentMiddleware, selectFaculty);
router.post("/updatefeedback", authStudentMiddleware, updateFeedback);
router.post("/submitfeedback", authStudentMiddleware, submitFeedback);

export default router;
import express from "express";
import { addCourse } from "../../controllers/feedback/feedbackadminController.js";
import { uploadstudents } from "../../config/multer.js";
import { authAdminMiddleware } from "../../controllers/authController.js";

const router = express.Router();

//admin for now later make it as privileged user
router.post("/addcourse", authAdminMiddleware, uploadstudents.single("file"), addCourse);

export default router;
import express from "express";
import { getQuestions } from "../../controllers/feedback/questionsController.js";
import { authMiddleware } from "../../controllers/authController.js";

const router = express.Router();

// GET /questions - Get all active questions (requires authentication)
router.get("/", authMiddleware, getQuestions);

export default router;

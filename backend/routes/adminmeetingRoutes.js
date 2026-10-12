import express from "express";
import { authAdminMiddleware } from "../controllers/authController.js";
import { listAllSlots } from "../controllers/facultymeetingController.js";

const router = express.Router();

// Admin: read-only view of every meeting slot
router.get("/", authAdminMiddleware, listAllSlots);

export default router;

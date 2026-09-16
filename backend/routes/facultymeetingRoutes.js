import express from "express";
import { authFacultyMiddleware } from "../controllers/authController.js";
import {
    createSlot,
    getFacultyMeetings,
    approveRequest,
    rejectRequest,
    cancelSlot,
} from "../controllers/facultymeetingController.js";

const router = express.Router();

router.get("/", authFacultyMiddleware, getFacultyMeetings);
router.post("/createslot", authFacultyMiddleware, createSlot);
router.post("/approve", authFacultyMiddleware, approveRequest);
router.post("/reject", authFacultyMiddleware, rejectRequest);
router.post("/cancel", authFacultyMiddleware, cancelSlot);

export default router;

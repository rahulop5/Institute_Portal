import express from "express";
import { authStudentMiddleware } from "../controllers/authController.js";
import {
    listFaculty,
    listFacultySlots,
    requestSlot,
    listMyMeetings,
    withdrawRequest,
} from "../controllers/studentmeetingController.js";

const router = express.Router();

router.get("/faculty", authStudentMiddleware, listFaculty);
router.get("/slots/:facultyId", authStudentMiddleware, listFacultySlots);
router.post("/request", authStudentMiddleware, requestSlot);
router.get("/mine", authStudentMiddleware, listMyMeetings);
router.post("/withdraw", authStudentMiddleware, withdrawRequest);

export default router;

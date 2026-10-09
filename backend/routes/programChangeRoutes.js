import express from "express";
import {
    authStudentMiddleware,
    authFacultyMiddleware,
    authUGProjectsMiddleware,
    authAssistantDeanMiddleware,
} from "../controllers/authController.js";
import {
    getStudentProgramChange,
    createProgramChangeRequest,
    withdrawProgramChangeRequest,
    listForReviewer,
    decideForReviewer,
    updateTopicAsStudent,
    updateTopicAsStaff,
    listProjectsForUGProjects,
    listFacultyForStudent,
    getStudentEnrollment,
} from "../controllers/programChangeController.js";

const router = express.Router();

// Student
router.get("/student", authStudentMiddleware, getStudentProgramChange);
router.post("/student/request", authStudentMiddleware, createProgramChangeRequest);
router.post("/student/withdraw", authStudentMiddleware, withdrawProgramChangeRequest);
router.get("/student/faculty", authStudentMiddleware, listFacultyForStudent);
router.get("/student/enrollment", authStudentMiddleware, getStudentEnrollment);
router.post("/student/topic", authStudentMiddleware, updateTopicAsStudent);

// Topic edits - no approval needed
router.get("/ugprojects/projects", authUGProjectsMiddleware, listProjectsForUGProjects);
router.post("/ugprojects/topic", authUGProjectsMiddleware, updateTopicAsStaff("UGProjects"));
router.post("/faculty/topic", authFacultyMiddleware, updateTopicAsStaff("Faculty"));

// Approval chain: UG Projects -> Assistant Dean Academics -> guide
router.get("/ugprojects", authUGProjectsMiddleware, listForReviewer("pending_ugprojects"));
router.post("/ugprojects/decide", authUGProjectsMiddleware, decideForReviewer("pending_ugprojects"));
router.get("/assistantdean", authAssistantDeanMiddleware, listForReviewer("pending_assistantdean"));
router.post("/assistantdean/decide", authAssistantDeanMiddleware, decideForReviewer("pending_assistantdean"));
router.get("/faculty", authFacultyMiddleware, listForReviewer("pending_faculty"));
router.post("/faculty/decide", authFacultyMiddleware, decideForReviewer("pending_faculty"));

export default router;

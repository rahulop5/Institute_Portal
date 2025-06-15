import express from "express";
import {
    authFacultyMiddleware,
    getFacultyBTPDashboard,
    addTopic,
    deleteTopic,
    approveTopicRequest
} from "../controllers/facultyController.js";

const router=express.Router();

router.get("/btp", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/btp/releasetopics", authFacultyMiddleware, addTopic);
router.delete("/btp/deletetopic", authFacultyMiddleware, deleteTopic);
router.post("/btp/approvetopicrequest", authFacultyMiddleware, approveTopicRequest)

export default router;
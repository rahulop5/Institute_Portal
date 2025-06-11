import express from "express";
import {
    authFacultyMiddleware,
    getFacultyBTPDashboard,
    addTopic,
    deleteTopic
} from "../controllers/facultyController.js";

const router=express.Router();

router.get("/btp", authFacultyMiddleware, getFacultyBTPDashboard);
router.post("/btp/releasetopics", authFacultyMiddleware, addTopic);
router.delete("/btp/deletetopic", authFacultyMiddleware, deleteTopic);

export default router;
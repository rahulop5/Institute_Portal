import express from "express";
import {authFacultyMiddleware} from "../controllers/authController.js";
import * as g from "../controllers/grades/facultyGradesController.js";
import * as cc from "../controllers/grades/ccGradesController.js";

const router = express.Router();

// Courses
router.get("/mycourses", authFacultyMiddleware, g.myCourses);
router.get("/course", authFacultyMiddleware, g.getCourse);
router.get("/section", authFacultyMiddleware, g.getSection);
router.get("/previouscomponents", authFacultyMiddleware, g.previousComponents);

// Components
router.post("/setcomponents", authFacultyMiddleware, g.setComponents);
router.post("/agreecomponents", authFacultyMiddleware, g.agreeComponents);

// My section
router.post("/savemarks", authFacultyMiddleware, g.saveMarks);
router.post("/deleterow", authFacultyMiddleware, g.deleteRow);
router.post("/dropconflict", authFacultyMiddleware, g.dropConflict);
router.post("/markready", authFacultyMiddleware, g.markReady);
router.post("/reopensection", authFacultyMiddleware, g.reopenSection);

// Backlog
router.get("/backlog", authFacultyMiddleware, g.getBacklog);

// Grading
router.post("/preview", authFacultyMiddleware, g.preview);
router.post("/setbands", authFacultyMiddleware, g.setBands);
router.post("/overridecutoffs", authFacultyMiddleware, g.overrideCutoffs);
router.post("/setfinalgrade", authFacultyMiddleware, g.setFinalGrade);
router.post("/submit", authFacultyMiddleware, g.submit);

// Amendments
router.post("/openamendment", authFacultyMiddleware, g.openAmendment);
router.post("/reexampreview", authFacultyMiddleware, g.reexamPreviewHandler);
router.post("/reexamapply", authFacultyMiddleware, g.reexamApply);

// Corrections
router.get("/corrections", authFacultyMiddleware, g.listCorrections);
router.post("/decidecorrection", authFacultyMiddleware, g.decideCorrection);

router.get("/versions", authFacultyMiddleware, g.listVersions);
router.get("/compare", authFacultyMiddleware, g.compareVersions);

// CC chair review
router.get("/cc/queue", authFacultyMiddleware, cc.queue);
router.post("/cc/approve", authFacultyMiddleware, cc.approve);
router.post("/cc/sendback", authFacultyMiddleware, cc.sendBack);

export default router;

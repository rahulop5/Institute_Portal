import express from "express";
import {authAcademicOfficeMiddleware} from "../controllers/authController.js";
import * as ao from "../controllers/grades/academicOfficeController.js";

// Academic Office: reads everything, edits no marks or grades.
// The only POSTs are release and importing earlier F's as course history.
const router = express.Router();

router.get("/courses", authAcademicOfficeMiddleware, ao.listCourses);
router.get("/faculty", authAcademicOfficeMiddleware, ao.listFaculty);
router.get("/projects", authAcademicOfficeMiddleware, ao.listProjects);
router.get("/gradings", authAcademicOfficeMiddleware, ao.listGradings);
router.get("/grading/:id", authAcademicOfficeMiddleware, ao.getGrading);
router.post("/release", authAcademicOfficeMiddleware, ao.release);
router.get("/backlog", authAcademicOfficeMiddleware, ao.backlog);
router.post("/assignbacklog", authAcademicOfficeMiddleware, ao.assignBacklog);
router.post("/assignbacklograndom", authAcademicOfficeMiddleware, ao.assignBacklogRandomly);
router.get("/studenthistory/:studentId", authAcademicOfficeMiddleware, ao.studentHistory);
router.post("/importbacklog", authAcademicOfficeMiddleware, ao.importBacklog);

export default router;

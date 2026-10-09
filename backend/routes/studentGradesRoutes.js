import express from "express";
import {authStudentMiddleware} from "../controllers/authController.js";
import * as s from "../controllers/grades/studentGradesController.js";

const router = express.Router();

router.get("/mygrades", authStudentMiddleware, s.myGrades);
router.get("/coursedetail", authStudentMiddleware, s.courseDetail);
router.post("/requestcorrection", authStudentMiddleware, s.requestCorrection);

export default router;

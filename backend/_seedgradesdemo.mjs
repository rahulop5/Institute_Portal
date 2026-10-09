// One-off dev seed for the course-grades flow. Run:  node _seedgradesdemo.mjs
// Creates: 3 faculty (dev.gradesA/B/C), Academic Office user, 30 enrolled students (GRD001-030),
// course "Grades Demo" (abbr GRDEMO, current semester), and 2 backlog students (GRDB01/02)
// with an imported F from an earlier semester. --reset wipes everything it made and recreates it.
// Delete this file once you're done testing - it is not part of the app.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "./models/User.js";
import Faculty from "./models/Faculty.js";
import AcademicOffice from "./models/AcademicOffice.js";
import Student from "./models/feedback/Student.js";
import Course from "./models/feedback/Course.js";
import Enrollment from "./models/feedback/Enrollment.js";
import CourseGrading from "./models/grades/CourseGrading.js";
import SectionSheet from "./models/grades/SectionSheet.js";
import GradeEntry from "./models/grades/GradeEntry.js";
import CourseGradingVersion from "./models/grades/CourseGradingVersion.js";
import CourseAttempt from "./models/grades/CourseAttempt.js";
import GradeCorrectionRequest from "./models/grades/GradeCorrectionRequest.js";
import {getCurrentSemester, getPreviousSemester} from "./utils/semesterUtils.js";
dotenv.config();

const password = crypto.randomBytes(9).toString("base64url");
const hash = await bcrypt.hash(password, 10);
const SEM = getCurrentSemester();
const PREV = getPreviousSemester(SEM);
const facEmails = ["A", "B", "C"].map((x) => `dev.grades${x.toLowerCase()}@iiits.in`);
const aoEmail = "dev.gradesao@iiits.in";

await mongoose.connect((process.env.MONGO_URI || "").trim().replace(/^"|"$/g, ""), {dbName: "clgproject"});
try {
    // wipe previous demo
    const oldCourse = await Course.findOne({code: "GRDEMO-" + SEM});
    if (oldCourse) {
        const g = await CourseGrading.findOne({course: oldCourse._id});
        if (g) {
            await GradeEntry.deleteMany({courseGrading: g._id});
            await SectionSheet.deleteMany({courseGrading: g._id});
            await CourseGradingVersion.deleteMany({courseGrading: g._id});
            await GradeCorrectionRequest.deleteMany({courseGrading: g._id});
            await CourseGrading.deleteOne({_id: g._id});
        }
        await Enrollment.deleteMany({course: oldCourse._id});
        await Course.deleteOne({_id: oldCourse._id});
    }
    const demoStudents = await Student.find({rollNumber: /^GRD/}).select("_id email");
    await CourseAttempt.deleteMany({courseKey: "GRDEMO"});
    await User.deleteMany({email: {$in: [...facEmails, aoEmail, ...demoStudents.map((s) => s.email)]}});
    await Student.deleteMany({rollNumber: /^GRD/});
    await Faculty.deleteMany({email: {$in: facEmails}});
    await AcademicOffice.deleteMany({email: aoEmail});

    const faculty = [];
    for (const [i, email] of facEmails.entries()) {
        const f = await Faculty.create({name: `Dr ${"ABC"[i]} Grades`, email, emp_no: `GRDF00${i + 1}`, dept: "CSE", role: "faculty"});
        await User.create({name: f.name, email, password: hash, role: "Faculty", referenceId: f._id, lastlogin: new Date()});
        faculty.push(f);
    }
    const ao = await AcademicOffice.create({name: "Dev Grades Office", email: aoEmail});
    await User.create({name: ao.name, email: aoEmail, password: hash, role: "AcademicOffice", referenceId: ao._id, lastlogin: new Date()});

    const course = await Course.create({
        name: "Grades Demo", abbreviation: "GRDEMO", credits: 4, department: "CSE", coursetype: "Program Core",
        code: "GRDEMO-" + SEM, faculty: faculty.map((f) => f._id), ug: 2, semester: SEM,
    });

    const students = [];
    for (let i = 1; i <= 30; i++) {
        const roll = `GRD${String(i).padStart(3, "0")}`;
        const s = await Student.create({name: `Demo Student ${i}`, email: `dev.${roll.toLowerCase()}@iiits.in`, rollNumber: roll, department: "CSE", batch: "2025"});
        students.push(s);
        await Enrollment.create({student: s._id, course: course._id});
    }
    // student logins for the first two
    for (const s of students.slice(0, 2)) await User.create({name: s.name, email: s.email, password: hash, role: "Student", referenceId: s._id, lastlogin: new Date()});

    for (const n of [1, 2]) {
        const s = await Student.create({name: `Demo Backlog ${n}`, email: `dev.grdb0${n}@iiits.in`, rollNumber: `GRDB0${n}`, department: "CSE", batch: "2024"});
        await CourseAttempt.create({student: s._id, courseKey: "GRDEMO", courseName: "Grades Demo", semester: PREV, grade: "F", source: "imported"});
        if (n === 1) await User.create({name: s.name, email: s.email, password: hash, role: "Student", referenceId: s._id, lastlogin: new Date()});
    }

    console.log(`Seeded course "${course.name}" (${course.code}, ${SEM}); backlog F is in ${PREV}.`);
    console.log(`Password for all accounts: ${password}`);
    console.log(`Faculty: ${facEmails.join(", ")}`);
    console.log(`Academic Office: ${aoEmail}`);
    console.log(`Students: dev.grd001@iiits.in, dev.grd002@iiits.in, dev.grdb01@iiits.in (backlog)`);
} catch (err) {
    console.error("Failed:", err);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}

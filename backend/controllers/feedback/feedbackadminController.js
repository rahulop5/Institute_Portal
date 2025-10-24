import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import Course from "../../models/feedback/Course.js";
import Faculty from "../../models/Faculty.js";
import Student from "../../models/feedback/Student.js";
import Enrollment from "../../models/feedback/Enrollment.js";
import Question from "../../models/feedback/Question.js";
import Analytics from "../../models/feedback/Analytics.js";

//this entire function is atomic and cant be performed on local mongo server
export const addCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, code, facultyEmails } = req.body;

    if (!name || !code || !facultyEmails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    let facultyEmailsJSON;
    if (typeof facultyEmails === "string") {
      try {
        facultyEmailsJSON = JSON.parse(facultyEmails);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid facultyEmails format. Must be a JSON array." });
      }
    } else {
      facultyEmailsJSON = facultyEmails;
    }

    //  Find faculties
    const facultyDocs = await Faculty.find({
      email: { $in: facultyEmailsJSON },
    }).session(session);

    if (facultyDocs.length !== facultyEmailsJSON.length) {
      const found = facultyDocs.map((f) => f.email);
      const missing = facultyEmailsJSON.filter((e) => !found.includes(e));
      return res.status(400).json({
        message: "Some faculty emails not found",
        missing,
      });
    }

    //  Check existing course
    const existingCourse = await Course.findOne({ code }).session(session);
    if (existingCourse) {
      return res.status(400).json({ message: "Course code already exists" });
    }

    //  Create course
    const course = await Course.create(
      [
        {
          name,
          code,
          faculty: facultyDocs.map((f) => f._id),
        },
      ],
      { session }
    );

    const courseId = course[0]._id;

    //  Parse CSV → get student emails
    const filePath = req.file.path;
    const studentEmails = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (row.email && row.email.trim() !== "") {
            studentEmails.push(row.email.trim());
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (studentEmails.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No valid student emails found in CSV" });
    }

    //  Find students
    const students = await Student.find({
      email: { $in: studentEmails },
    }).session(session);

    const foundEmails = students.map((s) => s.email);
    const missing = studentEmails.filter((e) => !foundEmails.includes(e));

    if (missing.length > 0) {
      return res.status(400).json({
        message: "Some student emails not found in database",
        missing,
      });
    }

    //  Enroll students
    const enrollments = students.map((s) => ({
      student: s._id,
      course: courseId,
    }));
    await Enrollment.insertMany(enrollments, { session });

    //  Create analytics entries for each faculty
    const allQuestions = await Question.find().session(session);
    const questionAnalytics = allQuestions.map((q) => ({
      question: q._id,
      average: 0,
      min: 0,
      max: 0,
      textResponses: [],
    }));

    for (const faculty of facultyDocs) {
      let analytics = await Analytics.findOne({ faculty: faculty._id }).session(session);

      if (!analytics) {
        // New faculty analytics doc
        analytics = new Analytics({
          faculty: faculty._id,
          courses: [
            {
              course: courseId,
              questions: questionAnalytics,
              totalResponses: 0,
            },
          ],
        });
      } else {
        // If course already exists under same faculty, prevent duplication
        const alreadyHas = analytics.courses.some(
          (c) => c.course.toString() === courseId.toString()
        );
        if (!alreadyHas) {
          analytics.courses.push({
            course: courseId,
            questions: questionAnalytics,
            totalResponses: 0,
          });
        }
      }

      await analytics.save({ session });
    }

    //  Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Cleanup uploaded CSV
    fs.unlink(filePath, () => {});

    return res.status(201).json({
      message:
        "Course created, faculty assigned, students enrolled, and analytics initialized successfully",
      courseId,
      totalStudents: students.length,
    });
  } catch (err) {
    console.error("Error adding course:", err);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ message: "Error adding course", error: err.message });
  }
};



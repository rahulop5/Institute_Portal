import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Course from "../../models/feedback/Course.js";
import Faculty from "../../models/Faculty.js";
import User from "../../models/User.js";
import Student from "../../models/feedback/Student.js";
import Enrollment from "../../models/feedback/Enrollment.js";
import Question from "../../models/feedback/Question.js";
import Analytics from "../../models/feedback/Analytics.js";
import Feedback from "../../models/feedback/Feedback.js";

//dashboard
export const adminDashboardStudent = async (req, res) => {
  try {
    // Fetch all students
    const allStudents = await Student.find().select("name email rollNumber batch").lean();

    // Fetch all submitted feedbacks
    const submittedFeedbacks = await Feedback.find({ submitted: true }).select("student").lean();

    // Extract submitted student IDs
    const submittedIds = new Set(submittedFeedbacks.map((f) => f.student.toString()));

    // Split into submitted / unsubmitted
    const submittedStudents = [];
    const unsubmittedStudents = [];

    for (const student of allStudents) {
      if (submittedIds.has(student._id.toString())) {
        submittedStudents.push(student);
      } else {
        unsubmittedStudents.push(student);
      }
    }

    // Return data
    return res.status(200).json({
      totalStudents: allStudents.length,
      totalSubmitted: submittedStudents.length,
      totalUnsubmitted: unsubmittedStudents.length,
      submittedStudents,
      unsubmittedStudents,
    });
  } catch (err) {
    console.error("Error fetching admin student dashboard:", err);
    return res.status(500).json({ message: "Error fetching student dashboard", error: err.message });
  }
};

export const adminDashboardFaculty = async (req, res) => {
  try {
    // Get all faculties
    const faculties = await Faculty.find().lean();

    if (!faculties || faculties.length === 0) {
      return res.status(200).json({ message: "No faculties found", faculties: [] });
    }

    const result = [];

    // For each faculty, gather analytics
    for (const faculty of faculties) {
      const analytics = await Analytics.findOne({ faculty: faculty._id })
        .populate({
          path: "courses.course",
          select: "name code",
        })
        .lean();

      if (!analytics || analytics.courses.length === 0) {
        result.push({
          name: faculty.name,
          email: faculty.email,
          department: faculty.dept,
          avgscore: 0,
          impress: 0,
          coursestaught: 0,
          courses: [],
        });
        continue;
      }

      let totalAvg = 0;
      let totalCourses = 0;
      let totalImpressions = 0;

      for (const c of analytics.courses) {
        if (!c.course) continue;

        const qAverages = c.questions.map((q) => q.average);
        const validAverages = qAverages.filter((a) => typeof a === "number");
        const courseAvg =
          validAverages.length > 0
            ? validAverages.reduce((a, b) => a + b, 0) / validAverages.length
            : 0;

        totalCourses++;
        totalAvg += courseAvg;
        totalImpressions += c.totalResponses;
      }

      const overallAvg = totalCourses > 0 ? totalAvg / totalCourses : 0;

      result.push({
        name: faculty.name,
        email: faculty.email,
        department: faculty.dept,
        avgscore: parseFloat(overallAvg.toFixed(2)),
        impress: totalImpressions,
        coursestaught: totalCourses,
      });
    }

    // Send final aggregated response
    return res.status(200).json({
      totalFaculties: faculties.length,
      faculties: result,
    });
  } catch (err) {
    console.error("Error fetching admin faculty dashboard:", err);
    return res.status(500).json({
      message: "Error fetching faculty dashboard data",
      error: err.message,
    });
  }
};

//upadte this with the new isreset thingy
export const adminDashboardCourse = async (req, res) => {
  try {
    // Fetch all courses
    const courses = await Course.find().lean();

    if (!courses || courses.length === 0) {
      return res.status(200).json({ message: "No courses found", courses: [] });
    }

    // Compute faculty count & enrollment strength for each course
    const courseData = await Promise.all(
      courses.map(async (course) => {
        const strength = await Enrollment.countDocuments({ course: course._id });
        return {
          name: course.name,
          code: course.code,
          coursetype: course.coursetype,
          facultycount: course.faculty ? course.faculty.length : 0,
          strength,
          isreset: course.isreset, // 🟩 Added: include isreset status in response
        };
      })
    );

    // Added: separate based on isreset
    const activeCourses = courseData.filter((c) => !c.isreset);
    const resetCourses = courseData.filter((c) => c.isreset);

    return res.status(200).json({
      totalCourses: courses.length,
      activeCourses,
      resetCourses,
    });
  } catch (err) {
    console.error("Error fetching admin course dashboard:", err);
    return res.status(500).json({
      message: "Error fetching course dashboard data",
      error: err.message,
    });
  }
};

//view individual course
export const viewCourse = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    // Fetch course with faculty details
    const course = await Course.findById(courseId)
      .populate("faculty", "name email dept role")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get enrolled students
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "name email rollNumber")
      .lean();

    const students = enrollments.map((e) => e.student);

    // If course is reset, fetch all faculties for assignment
    let allFaculties = [];
    if (course.isreset) {
      allFaculties = await Faculty.find({}, "name email dept").lean();
    }

    return res.status(200).json({
      message: "Course details fetched successfully",
      course,
      students,
      totalStudents: students.length,
      totalFaculties: course.faculty.length,
      isreset: course.isreset,
      ...(course.isreset && { allFaculties }), // only include when true
    });
  } catch (err) {
    console.error("Error in viewCourse:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

//view faculty
//view faculty course statistics

//this entire function is atomic and cant be performed on local mongo server
export const addCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, code, facultyEmails, abbreviation, credits, coursetype } = req.body;

    // Validate required fields
    if (!name || !code || !facultyEmails || !abbreviation || !credits || !coursetype) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    // Parse facultyEmails safely
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

    // Find faculties
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

    // Check for duplicate course code
    const existingCourse = await Course.findOne({ code }).session(session);
    if (existingCourse) {
      return res.status(400).json({ message: "Course code already exists" });
    }

    // Create new course with new fields
    const course = await Course.create(
      [
        {
          name,
          abbreviation,
          credits,
          coursetype,
          code,
          faculty: facultyDocs.map((f) => f._id),
          isreset: false,
        },
      ],
      { session }
    );

    const courseId = course[0]._id;

    // Parse CSV → get student emails
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

    // Find students
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

    // Enroll students in this course
    const enrollments = students.map((s) => ({
      student: s._id,
      course: courseId,
    }));
    await Enrollment.insertMany(enrollments, { session });

    // Create analytics entries for each faculty
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

    // Commit transaction
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

//add faculty csv
export const addFacultyCSV = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const filePath = req.file.path;
    const facultyData = [];

    // Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (row.email && row.name && row.dept) {
            facultyData.push({
              email: row.email.trim(),
              name: row.name.trim(),
              dept: row.dept.trim(),
              role: "faculty",
              achievements: [],
              custompermissions: [],
            });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (facultyData.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "No valid faculty records found in CSV" });
    }

    // Filter out already existing faculty emails
    const emails = facultyData.map((f) => f.email);
    const existingFaculties = await Faculty.find({ email: { $in: emails } }).session(session);
    const existingEmails = existingFaculties.map((f) => f.email);

    const newFacultyData = facultyData.filter((f) => !existingEmails.includes(f.email));

    if (newFacultyData.length === 0) {
      await session.abortTransaction();
      session.endSession();
      fs.unlink(filePath, () => {});
      return res.status(400).json({ message: "All faculty already exist in the database" });
    }

    // Insert new faculties
    const facultyDocs = await Faculty.insertMany(newFacultyData, { session });

    // Create corresponding user accounts
    const hashedPassword = await bcrypt.hash("yoyoyo", 10);
    const userDocs = facultyDocs.map((fac) => ({
      name: fac.name,
      email: fac.email,
      password: hashedPassword,
      role: "Faculty",
      referenceId: fac._id,
      lastlogin: new Date(),
    }));

    await User.insertMany(userDocs, { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Cleanup uploaded CSV
    fs.unlink(filePath, () => {});

    return res.status(201).json({
      message: "Faculties added and user accounts created successfully",
      added: facultyDocs.length,
      skipped: existingEmails.length,
    });
  } catch (err) {
    console.error("Error adding faculty:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Error adding faculty", error: err.message });
  }
};

//add students
export const addStudentsCSV = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const filePath = req.file.path;
    const studentsData = [];

    // Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (row.email && row.name && row.rollNumber) {
            studentsData.push({
              name: row.name.trim(),
              email: row.email.trim().toLowerCase(),
              rollNumber: row.rollNumber.trim(),
              department: row.department?.trim() || "",
              batch: row.batch?.trim() || "",
            });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (studentsData.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No valid student data found in CSV" });
    }

    // Filter out existing students
    const emails = studentsData.map((s) => s.email);
    const rollNumbers = studentsData.map((s) => s.rollNumber);

    const existingStudents = await Student.find({
      $or: [{ email: { $in: emails } }, { rollNumber: { $in: rollNumbers } }],
    }).session(session);

    const existingEmails = existingStudents.map((s) => s.email);
    const existingRolls = existingStudents.map((s) => s.rollNumber);

    const newStudents = studentsData.filter(
      (s) => !existingEmails.includes(s.email) && !existingRolls.includes(s.rollNumber)
    );

    if (newStudents.length === 0) {
      await session.abortTransaction();
      fs.unlink(filePath, () => {});
      return res.status(400).json({ message: "All students in CSV already exist" });
    }

    // Insert new students
    const createdStudents = await Student.insertMany(newStudents, { session });

    // Create corresponding user accounts
    const users = [];
    for (const student of createdStudents) {
      const hashedPassword = await bcrypt.hash("yoyoyo", 10); // rollNumber as default password
      users.push({
        name: student.name,
        email: student.email,
        password: hashedPassword,
        role: "Student",
        referenceId: student._id,
        lastlogin: new Date(),
      });
    }

    await User.insertMany(users, { session });

    await session.commitTransaction();
    session.endSession();

    // Cleanup
    fs.unlink(filePath, () => {});

    return res.status(201).json({
      message: `Successfully added ${createdStudents.length} new students.`,
      totalAdded: createdStudents.length,
      skippedExisting: existingStudents.length,
    });
  } catch (err) {
    console.error("Error adding students:", err);
    await session.abortTransaction();
    session.endSession();
    fs.unlink(req.file?.path || "", () => {});
    return res.status(500).json({ message: "Error adding students", error: err.message });
  }
};

//clear students and faculty to that course
export const resetCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Remove all faculty assignments
    course.faculty = [];
    course.isreset = true;

    await course.save({ session });

    // Delete all enrollments for this course
    await Enrollment.deleteMany({ course: courseId }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Course reset successfully — all faculty and enrollments removed",
    });
  } catch (err) {
    console.error("Error in resetCourse:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Error resetting course", error: err.message });
  }
};

export const addFacultyStudentstoCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { courseId, facultyEmails } = req.body;

    if (!courseId || !facultyEmails) {
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

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Faculties
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

    const facultyIds = facultyDocs.map((f) => f._id);
    const currentIds = course.faculty.map((f) => f.toString());
    const newFacultyIds = facultyIds.filter((id) => !currentIds.includes(id.toString()));

    course.faculty.push(...newFacultyIds);
    course.isreset = false;

    await course.save({ session });

    // Students (CSV)
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

    const students = await Student.find({
      email: { $in: studentEmails },
    }).session(session);

    const foundEmails = students.map((s) => s.email);
    const missingStudents = studentEmails.filter((e) => !foundEmails.includes(e));

    if (missingStudents.length > 0) {
      return res.status(400).json({
        message: "Some student emails not found in database",
        missing: missingStudents,
      });
    }

    const enrollments = students.map((s) => ({
      student: s._id,
      course: courseId,
    }));

    await Enrollment.insertMany(enrollments, { session });

    await session.commitTransaction();
    session.endSession();

    fs.unlink(filePath, () => {});

    return res.status(200).json({
      message: "Faculty and students successfully added to the course",
      totalFacultiesAdded: newFacultyIds.length,
      totalStudentsAdded: students.length,
      isreset: false,
    });
  } catch (err) {
    console.error("Error in addFacultyStudentstoCourse:", err);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ message: "Error adding faculty/students", error: err.message });
  }
};

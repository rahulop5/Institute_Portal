import Feedback from "../../models/Feedback.js";
import Enrollment from "../../models/Enrollment.js";
import Course from "../../models/Course.js";
import Student from "../../models/Student.js";
import Faculty from "../../models/Faculty.js";
import Question from "../../models/Question.js";

export const feedbackStudentDashboard = async (req, res) => {
  try {
    const stu = await Student.findOne({
      email: req.user.email,
    });
    if (!stu) {
      return res.status(404).json({
        message: "No Student Found",
      });
    }
    const studentId = stu._id;

    // 1. Check if feedback instance already exists for this student + semester
    let feedbackInstance = await Feedback.findOne({
      student: studentId,
    })
      .populate({
        path: "feedbacks.course",
        select: "name code",
      })
      .populate({
        path: "feedbacks.faculty",
        select: "name email dept",
      })
      .populate({
        path: "feedbacks.answers.question",
        select: "text type order isActive",
      });

    if (feedbackInstance) {
      // Already started / submitted
      if (feedbackInstance.submitted) {
        return res.status(200).json({
          email: stu.email,
          started: true,
          submitted: true,
          message: "Your feedback has been recorded",
        });
      }
      return res.status(200).json({
        email: stu.email,
        started: true,
        feedback: feedbackInstance,
      });
    }

    // 2. If not started → fetch student’s enrolled courses + assigned faculty
    const enrollments = await Enrollment.find({ student: studentId }).populate({
      path: "course",
      populate: { path: "faculty", select: "name email dept" },
    });

    if (!enrollments.length) {
      return res.status(404).json({
        message: "Student is not enrolled in any courses",
      });
    }

    // Format data → courses with faculty
    const coursesWithFaculty = enrollments.map((enrollment) => ({
      courseId: enrollment.course._id,
      courseName: enrollment.course.name,
      courseCode: enrollment.course.code,
      faculty: enrollment.course.faculty.map((f) => ({
        facultyId: f._id,
        name: f.name,
        email: f.email,
        dept: f.dept,
      })),
    }));

    return res.status(200).json({
      email: stu.email,
      started: false,
      courses: coursesWithFaculty,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error loading the student feedback dashboard",
    });
  }
};

export const selectFaculty = async (req, res) => {
  try {
    const { selections } = req.body;
    // selections = [
    //   { courseId: "68db5b79...", facultyIds: ["68db66d7...", "68db66d8..."] },
    //   { courseId: "68db5b80...", facultyIds: ["68db66e1..."] },
    // ]

    const stu = await Student.findOne({ email: req.user.email });
    if (!stu) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = stu._id;
    const semester = "Fall-2025"; // later make dynamic

    // Check if feedback already exists
    const existing = await Feedback.findOne({ student: studentId, semester });
    if (existing) {
      return res.status(400).json({ message: "Feedback already started" });
    }

    // Fetch all enrollments for this student
    const enrollments = await Enrollment.find({ student: studentId }).populate(
      "course"
    );
    const enrolledCourseIds = enrollments.map((e) => e.course._id.toString());

    // Validation 1: Student enrolled in each selected course
    for (const sel of selections) {
      if (!enrolledCourseIds.includes(sel.courseId)) {
        return res.status(400).json({
          message: `Student not enrolled in course ${sel.courseId}`,
        });
      }

      const course = await Course.findById(sel.courseId).populate("faculty");
      if (!course) {
        return res
          .status(404)
          .json({ message: `Course ${sel.courseId} not found` });
      }

      // Validation 2: Each faculty must belong to that course
      const courseFacultyIds = course.faculty.map((f) => f._id.toString());
      for (const facId of sel.facultyIds) {
        if (!courseFacultyIds.includes(facId)) {
          return res.status(400).json({
            message: `Incorrect faculty selected for some course or courses`,
          });
        }
      }

      // Validation 3: Must select at least one faculty per course
      if (sel.facultyIds.length < 1) {
        return res.status(400).json({
          message: `At least one faculty must be selected for ${course.code}`,
        });
      }
    }

    // Fetch all questions for feedback initialization
    const questions = await Question.find();
    const answersTemplate = questions.map((q) => ({
      question: q._id,
      response: null,
    }));

    // Build facultyFeedbacks array
    const feedbacks = [];
    for (const sel of selections) {
      for (const facId of sel.facultyIds) {
        feedbacks.push({
          course: sel.courseId,
          faculty: facId,
          answers: answersTemplate,
          completed: false,
        });
      }
    }

    // Create Feedback document
    const newFeedback = new Feedback({
      student: studentId,
      semester,
      feedbacks,
      currentPage: 0,
      submitted: false,
    });

    await newFeedback.save();

    return res.status(201).json({
      message: "Feedback initialized successfully",
      feedbackId: newFeedback._id,
      totalFaculty: feedbacks.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error selecting the faculty",
    });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error selecting the faculty",
    });
  }
};

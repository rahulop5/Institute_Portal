import Enrollment from "../../models/feedback/Enrollment.js";
import Faculty from "../../models/Faculty.js";
import Analytics from "../../models/feedback/Analytics.js";

export const facultyDashboard = async (req, res) => {
  try {
    // Get the faculty document
    const faculty = await Faculty.findOne({ email: req.user.email });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Find analytics for that faculty
    const analytics = await Analytics.findOne({
      faculty: faculty._id,
    }).populate({
      path: "courses.course",
      select: "name code",
    }).populate({
        path: "courses.questions.question",
        select: "type",
    });

    if (!analytics || analytics.courses.length === 0) {
      return res.status(200).json({
        name: faculty.name,
        department: faculty.dept,
        avgscore: 0,
        impress: 0,
        coursestaught: 0,
        courses: [],
      });
    }

    // Calculate per-course and overall stats
    let totalAvg = 0;
    let totalCourses = 0;
    let totalImpressions = 0;
    const coursesData = [];

    for (const c of analytics.courses) {
      if (!c.course) continue;
      const qAverages = c.questions
        .filter((q) => q.question && q.question.type === "rating")
        .map((q) => q.average);

      const validAverages = qAverages.filter((a) => typeof a === "number");
      const courseAvg =
        validAverages.length > 0
          ? validAverages.reduce((a, b) => a + b, 0) / validAverages.length
          : 0;

      totalCourses++;
      totalAvg += courseAvg;
      totalImpressions += c.totalResponses;
      coursesData.push({
        courseId: c.course._id,
        name: c.course.name,
        coursecode: c.course.code,
        avgscore: parseFloat(courseAvg.toFixed(2)),
      });
    }

    const overallAvg = totalCourses > 0 ? totalAvg / totalCourses : 0;

    // Send response
    return res.status(200).json({
      name: faculty.name,
      department: faculty.dept,
      avgscore: parseFloat(overallAvg.toFixed(2)),
      impress: totalImpressions,
      coursestaught: totalCourses,
      courses: coursesData,
    });
  } catch (err) {
    console.error("Error fetching faculty dashboard:", err);
    return res
      .status(500)
      .json({ message: "Error fetching faculty dashboard" });
  }
};

export const viewCourseStatistics = async (req, res) => {
  try {
    const { courseId } = req.query;

    const faculty = await Faculty.findOne({ email: req.user.email });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Get analytics record for this faculty and course
    const analytics = await Analytics.findOne({ faculty: faculty._id })
      .populate({
        path: "courses.course",
        select: "name code",
      })
      .populate({
        path: "courses.questions.question",
        select: "text order",
      });

    if (!analytics) {
      return res
        .status(404)
        .json({ message: "No analytics found for this faculty" });
    }

    const courseData = analytics.courses.find(
      (c) => c.course && c.course._id.toString() === courseId.toString()
    );

    if (!courseData) {
      return res.status(404).json({ message: "Course analytics not found" });
    }

    // Exclude text-based questions (order 16, 17)
    const ratingQuestions = courseData.questions.filter(
      (q) => q.question?.order !== 16 && q.question?.order !== 17
    );

    // Calculate overall average
    const avgscore =
      ratingQuestions.length > 0
        ? ratingQuestions.reduce((sum, q) => sum + q.average, 0) /
          ratingQuestions.length
        : 0;

    // Calculate responses stats
    const totalResponses = courseData.totalResponses || 0;
    const totalEnrolled = await Enrollment.countDocuments({ course: courseId });
    const yetToSubmit = Math.max(totalEnrolled - totalResponses, 0);

    // Prepare only rating-based questions for frontend
    const questions = ratingQuestions.map((q, idx) => ({
      qno: q.question?.order ?? idx + 1,
      avgscore: parseFloat(q.average.toFixed(2)),
    }));

    // Find min & max (from rating questions only)
    let minQ = null;
    let maxQ = null;

    if (ratingQuestions.length > 0) {
      minQ = ratingQuestions.reduce(
        (min, q) => (q.average < min.average ? q : min),
        ratingQuestions[0]
      );
      maxQ = ratingQuestions.reduce(
        (max, q) => (q.average > max.average ? q : max),
        ratingQuestions[0]
      );
    }

    // Extract faculty & course feedbacks (orders 16 & 17)
    const facultyFeedbackQ = courseData.questions.find(
      (q) => q.question?.order === 16
    );
    const courseFeedbackQ = courseData.questions.find(
      (q) => q.question?.order === 17
    );

    const formattedDate = new Date(courseData.lastUpdated)
      .toISOString()
      .split("T")[0];

    const feedback = {
      faculty: (facultyFeedbackQ?.textResponses || []).map((resp) => ({
        text: resp.text,
        score: resp.score ?? null,
        date: formattedDate,
      })),
      course: (courseFeedbackQ?.textResponses || []).map((resp) => ({
        text: resp.text,
        score: resp.score ?? null,
        date: formattedDate,
      })),
    };

    // Send final response
    return res.status(200).json({
      name: courseData.course.name,
      coursecode: courseData.course.code,
      avgscore: parseFloat(avgscore.toFixed(2)),
      responses: {
        submitted: totalResponses,
        yettosubmit: yetToSubmit,
      },
      questions, // only rating questions (no 16/17)
      min: {
        score: parseFloat(minQ?.average?.toFixed(2)) || 0,
        question: minQ?.question?.order || "N/A",
      },
      max: {
        score: parseFloat(maxQ?.average?.toFixed(2)) || 0,
        question: maxQ?.question?.order || "N/A",
      },
      feedback,
    });
  } catch (err) {
    console.error("Error fetching course statistics:", err);
    return res
      .status(500)
      .json({ message: "Error fetching course statistics" });
  }
};
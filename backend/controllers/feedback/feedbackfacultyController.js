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
    const analytics = await Analytics.findOne({ faculty: faculty._id })
      .populate({
        path: "courses.course",
        select: "name code",
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
      const qAverages = c.questions.map((q) => q.average);
      const validAverages = qAverages.filter((a) => typeof a === "number");
      const courseAvg =
        validAverages.length > 0
          ? validAverages.reduce((a, b) => a + b, 0) / validAverages.length
          : 0;

      totalCourses++;
      totalAvg += courseAvg;
      totalImpressions += c.totalResponses;

      coursesData.push({
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
    return res.status(500).json({ message: "Error fetching faculty dashboard" });
  }
};

export const viewCourseStatistics = async (req, res) => {
  try {
    const { courseId } = req.query;
    console.log(courseId)
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
      return res.status(404).json({ message: "No analytics found for this faculty" });
    }

    const courseData = analytics.courses.find(
      (c) => c.course && c.course._id.toString() === courseId
    );

    if (!courseData) {
      return res.status(404).json({ message: "Course analytics not found" });
    }

    // Calculate overall average
    const avgscore =
      courseData.questions.length > 0
        ? courseData.questions.reduce((sum, q) => sum + q.average, 0) /
          courseData.questions.length
        : 0;

    // Calculate submitted vs yet-to-submit (based on totalResponses)
    const totalResponses = courseData.totalResponses || 0;
    const totalEnrolled = await Enrollment.countDocuments({ course: courseId });
    const yetToSubmit = Math.max(totalEnrolled - totalResponses, 0);

    // Prepare question-wise data
    const questions = courseData.questions.map((q, idx) => ({
      qno: q.question?.order ?? idx + 1,
      avgscore: parseFloat(q.average.toFixed(2)),
    }));

    // Find min & max
    const ratingQuestions = courseData.questions.filter(
      (q) => typeof q.average === "number"
    );
    const minQ = ratingQuestions.reduce(
      (min, q) => (q.average < min.average ? q : min),
      ratingQuestions[0]
    );
    const maxQ = ratingQuestions.reduce(
      (max, q) => (q.average > max.average ? q : max),
      ratingQuestions[0]
    );

    // Extract faculty & course feedbacks from textResponses (order 16 → faculty, 17 → course)
    const facultyFeedbackQ = courseData.questions.find(
      (q) => q.question?.order === 16
    );
    const courseFeedbackQ = courseData.questions.find(
      (q) => q.question?.order === 17
    );

    const feedback = {
      faculty: (facultyFeedbackQ?.textResponses || []).map((text) => ({
        date: courseData.lastUpdated,
        text,
        score: null,
      })),
      course: (courseFeedbackQ?.textResponses || []).map((text) => ({
        date: courseData.lastUpdated,
        text,
        score: null,
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
      questions,
      min: {
        score: parseFloat(minQ?.average?.toFixed(2)) || 0,
        question: minQ?.question?.text || "N/A",
      },
      max: {
        score: parseFloat(maxQ?.average?.toFixed(2)) || 0,
        question: maxQ?.question?.text || "N/A",
      },
      feedback,
    });
  } catch (err) {
    console.error("Error fetching course statistics:", err);
    return res.status(500).json({ message: "Error fetching course statistics" });
  }
};

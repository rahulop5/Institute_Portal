import mongoose from "mongoose";
import Feedback from "../../models/feedback/Feedback.js";
import Enrollment from "../../models/feedback/Enrollment.js";
import Course from "../../models/feedback/Course.js";
import Student from "../../models/feedback/Student.js";
import Faculty from "../../models/Faculty.js";
import Analytics from "../../models/feedback/Analytics.js";
import Question from "../../models/feedback/Question.js";

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
//output
//if submitted
// {
//     "email": "rahul.k25@iiits.in",
//     "started": true,
//     "submitted": true,
//     "message": "Your feedback has been recorded"
// }


//if still filling the form
// {
//     "email": "rahul.k25@iiits.in",
//     "started": true,
//     "feedback": {
//         "_id": "68e397fcaf6ba064e4288efd",
//         "student": "68db666ee1907312cf0f03fa",
//         "semester": "Fall-2025",
//         "feedbacks": [
//             {
//                 "course": {
//                     "_id": "68db5b79d78fcafe6bb12607",
//                     "name": "Database Management Systems",
//                     "code": "DBMS101"
//                 },
//                 "faculty": {
//                     "_id": "68db66d77e93b1b3d114a14e",
//                     "name": "Dr. Ramesh",
//                     "email": "ramesh@iiits.in",
//                     "dept": "CSE"
//                 },
//                 "answers": [
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05be",
//                             "text": "Course objectives were clearly defined and articulated in the course plan",
//                             "type": "rating",
//                             "order": 1,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288eff"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05bf",
//                             "text": "The taught components were relevant to the course",
//                             "type": "rating",
//                             "order": 2,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f00"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c0",
//                             "text": "The prescribed syllabus were entirely completed",
//                             "type": "rating",
//                             "order": 3,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f01"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c1",
//                             "text": "Faculty is knowledgeable and makes the course interesting through concepts and applications",
//                             "type": "rating",
//                             "order": 4,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f02"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c2",
//                             "text": "Lectures were well prepared by the Faculty",
//                             "type": "rating",
//                             "order": 5,
//                             "isActive": true
//                         },
//                         "response": 7,
//                         "_id": "68e397fcaf6ba064e4288f03"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c3",
//                             "text": "Scheme of evaluation of assessments were discussed in the class",
//                             "type": "rating",
//                             "order": 6,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f04"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c4",
//                             "text": "Faculty encouraged interaction and cleared doubts regularly",
//                             "type": "rating",
//                             "order": 7,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f05"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c5",
//                             "text": "Classes were handled as per schedule",
//                             "type": "rating",
//                             "order": 8,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f06"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c6",
//                             "text": "Teacher communicated well during the course",
//                             "type": "rating",
//                             "order": 9,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f07"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c7",
//                             "text": "Assessment papers were evaluated and distributed in time",
//                             "type": "rating",
//                             "order": 10,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f08"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c8",
//                             "text": "Teacher was available for consultation outside the classroom",
//                             "type": "rating",
//                             "order": 11,
//                             "isActive": true
//                         },
//                         "response": 7,
//                         "_id": "68e397fcaf6ba064e4288f09"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c9",
//                             "text": "Teacher was impartial and offered counselling when required",
//                             "type": "rating",
//                             "order": 12,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f0a"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05ca",
//                             "text": "How do you rate effectiveness of tutorials for additional learning/problem solving",
//                             "type": "rating",
//                             "order": 13,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f0b"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cb",
//                             "text": "Projects (if any) under the course were relevant and useful",
//                             "type": "rating",
//                             "order": 14,
//                             "isActive": true
//                         },
//                         "response": 7,
//                         "_id": "68e397fcaf6ba064e4288f0c"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cc",
//                             "text": "Level of practical or industry orientation of the course",
//                             "type": "rating",
//                             "order": 15,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f0d"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cd",
//                             "text": "Feedback & Suggestions on the Faculty",
//                             "type": "text",
//                             "order": 16,
//                             "isActive": true
//                         },
//                         "response": "The faculty explained concepts very clearly and was approachable.",
//                         "_id": "68e397fcaf6ba064e4288f0e"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05ce",
//                             "text": "Feedback & Suggestions on the Course",
//                             "type": "text",
//                             "order": 17,
//                             "isActive": true
//                         },
//                         "response": "The course was well-structured and practical.",
//                         "_id": "68e397fcaf6ba064e4288f0f"
//                     }
//                 ],
//                 "completed": true,
//                 "_id": "68e397fcaf6ba064e4288efe"
//             },
//             {
//                 "course": {
//                     "_id": "68db5b79d78fcafe6bb12608",
//                     "name": "Operating Systems",
//                     "code": "OS102"
//                 },
//                 "faculty": {
//                     "_id": "68db66d77e93b1b3d114a152",
//                     "name": "Dr. Meena",
//                     "email": "meena@iiits.in",
//                     "dept": "CSE"
//                 },
//                 "answers": [
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05be",
//                             "text": "Course objectives were clearly defined and articulated in the course plan",
//                             "type": "rating",
//                             "order": 1,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f11"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05bf",
//                             "text": "The taught components were relevant to the course",
//                             "type": "rating",
//                             "order": 2,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f12"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c0",
//                             "text": "The prescribed syllabus were entirely completed",
//                             "type": "rating",
//                             "order": 3,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f13"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c1",
//                             "text": "Faculty is knowledgeable and makes the course interesting through concepts and applications",
//                             "type": "rating",
//                             "order": 4,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f14"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c2",
//                             "text": "Lectures were well prepared by the Faculty",
//                             "type": "rating",
//                             "order": 5,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f15"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c3",
//                             "text": "Scheme of evaluation of assessments were discussed in the class",
//                             "type": "rating",
//                             "order": 6,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f16"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c4",
//                             "text": "Faculty encouraged interaction and cleared doubts regularly",
//                             "type": "rating",
//                             "order": 7,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f17"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c5",
//                             "text": "Classes were handled as per schedule",
//                             "type": "rating",
//                             "order": 8,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f18"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c6",
//                             "text": "Teacher communicated well during the course",
//                             "type": "rating",
//                             "order": 9,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f19"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c7",
//                             "text": "Assessment papers were evaluated and distributed in time",
//                             "type": "rating",
//                             "order": 10,
//                             "isActive": true
//                         },
//                         "response": 7,
//                         "_id": "68e397fcaf6ba064e4288f1a"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c8",
//                             "text": "Teacher was available for consultation outside the classroom",
//                             "type": "rating",
//                             "order": 11,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f1b"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c9",
//                             "text": "Teacher was impartial and offered counselling when required",
//                             "type": "rating",
//                             "order": 12,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f1c"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05ca",
//                             "text": "How do you rate effectiveness of tutorials for additional learning/problem solving",
//                             "type": "rating",
//                             "order": 13,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f1d"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cb",
//                             "text": "Projects (if any) under the course were relevant and useful",
//                             "type": "rating",
//                             "order": 14,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f1e"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cc",
//                             "text": "Level of practical or industry orientation of the course",
//                             "type": "rating",
//                             "order": 15,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f1f"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cd",
//                             "text": "Feedback & Suggestions on the Faculty",
//                             "type": "text",
//                             "order": 16,
//                             "isActive": true
//                         },
//                         "response": "The professor motivated us to explore beyond the syllabus.",
//                         "_id": "68e397fcaf6ba064e4288f20"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05ce",
//                             "text": "Feedback & Suggestions on the Course",
//                             "type": "text",
//                             "order": 17,
//                             "isActive": true
//                         },
//                         "response": "Assignments were creative and encouraged deeper thinking.",
//                         "_id": "68e397fcaf6ba064e4288f21"
//                     }
//                 ],
//                 "completed": true,
//                 "_id": "68e397fcaf6ba064e4288f10"
//             },
//             {
//                 "course": {
//                     "_id": "68db5b79d78fcafe6bb12608",
//                     "name": "Operating Systems",
//                     "code": "OS102"
//                 },
//                 "faculty": {
//                     "_id": "68db66d77e93b1b3d114a154",
//                     "name": "Dr. Karthik",
//                     "email": "karthik@iiits.in",
//                     "dept": "CSE"
//                 },
//                 "answers": [
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05be",
//                             "text": "Course objectives were clearly defined and articulated in the course plan",
//                             "type": "rating",
//                             "order": 1,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f23"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05bf",
//                             "text": "The taught components were relevant to the course",
//                             "type": "rating",
//                             "order": 2,
//                             "isActive": true
//                         },
//                         "response": 7,
//                         "_id": "68e397fcaf6ba064e4288f24"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c0",
//                             "text": "The prescribed syllabus were entirely completed",
//                             "type": "rating",
//                             "order": 3,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f25"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c1",
//                             "text": "Faculty is knowledgeable and makes the course interesting through concepts and applications",
//                             "type": "rating",
//                             "order": 4,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f26"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c2",
//                             "text": "Lectures were well prepared by the Faculty",
//                             "type": "rating",
//                             "order": 5,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f27"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c3",
//                             "text": "Scheme of evaluation of assessments were discussed in the class",
//                             "type": "rating",
//                             "order": 6,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f28"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c4",
//                             "text": "Faculty encouraged interaction and cleared doubts regularly",
//                             "type": "rating",
//                             "order": 7,
//                             "isActive": true
//                         },
//                         "response": 7,
//                         "_id": "68e397fcaf6ba064e4288f29"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c5",
//                             "text": "Classes were handled as per schedule",
//                             "type": "rating",
//                             "order": 8,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f2a"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c6",
//                             "text": "Teacher communicated well during the course",
//                             "type": "rating",
//                             "order": 9,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f2b"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c7",
//                             "text": "Assessment papers were evaluated and distributed in time",
//                             "type": "rating",
//                             "order": 10,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f2c"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c8",
//                             "text": "Teacher was available for consultation outside the classroom",
//                             "type": "rating",
//                             "order": 11,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f2d"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05c9",
//                             "text": "Teacher was impartial and offered counselling when required",
//                             "type": "rating",
//                             "order": 12,
//                             "isActive": true
//                         },
//                         "response": 7,
//                         "_id": "68e397fcaf6ba064e4288f2e"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05ca",
//                             "text": "How do you rate effectiveness of tutorials for additional learning/problem solving",
//                             "type": "rating",
//                             "order": 13,
//                             "isActive": true
//                         },
//                         "response": 8,
//                         "_id": "68e397fcaf6ba064e4288f2f"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cb",
//                             "text": "Projects (if any) under the course were relevant and useful",
//                             "type": "rating",
//                             "order": 14,
//                             "isActive": true
//                         },
//                         "response": 9,
//                         "_id": "68e397fcaf6ba064e4288f30"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cc",
//                             "text": "Level of practical or industry orientation of the course",
//                             "type": "rating",
//                             "order": 15,
//                             "isActive": true
//                         },
//                         "response": 10,
//                         "_id": "68e397fcaf6ba064e4288f31"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05cd",
//                             "text": "Feedback & Suggestions on the Faculty",
//                             "type": "text",
//                             "order": 16,
//                             "isActive": true
//                         },
//                         "response": "The faculty provided detailed explanations and real-world examples.",
//                         "_id": "68e397fcaf6ba064e4288f32"
//                     },
//                     {
//                         "question": {
//                             "_id": "68dae571f78905d43acc05ce",
//                             "text": "Feedback & Suggestions on the Course",
//                             "type": "text",
//                             "order": 17,
//                             "isActive": true
//                         },
//                         "response": "I learned a lot from this course; it was engaging and insightful.",
//                         "_id": "68e397fcaf6ba064e4288f33"
//                     }
//                 ],
//                 "completed": true,
//                 "_id": "68e397fcaf6ba064e4288f22"
//             }
//         ],
//         "currentPage": 3,
//         "submitted": false,
//         "createdAt": "2025-10-06T10:20:44.439Z",
//         "updatedAt": "2025-10-07T13:19:15.013Z",
//         "__v": 0
//     }
// }


//if didnt select faculty
// {
//     "email": "ananya.g25@iiits.in",
//     "started": false,
//     "courses": [
//         {
//             "courseId": "68db5b79d78fcafe6bb12607",
//             "courseName": "Database Management Systems",
//             "courseCode": "DBMS101",
//             "faculty": [
//                 {
//                     "facultyId": "68db66d77e93b1b3d114a14e",
//                     "name": "Dr. Ramesh",
//                     "email": "ramesh@iiits.in",
//                     "dept": "CSE"
//                 },
//                 {
//                     "facultyId": "68db66d77e93b1b3d114a150",
//                     "name": "Dr. Priya",
//                     "email": "priya@iiits.in",
//                     "dept": "CSE"
//                 }
//             ]
//         },
//         {
//             "courseId": "68db5b79d78fcafe6bb12609",
//             "courseName": "Computer Networks",
//             "courseCode": "CN103",
//             "faculty": [
//                 {
//                     "facultyId": "68db66d77e93b1b3d114a156",
//                     "name": "Dr. Anil",
//                     "email": "anil@iiits.in",
//                     "dept": "ECE"
//                 },
//                 {
//                     "facultyId": "68db66d77e93b1b3d114a158",
//                     "name": "Dr. Sneha",
//                     "email": "sneha@iiits.in",
//                     "dept": "ECE"
//                 },
//                 {
//                     "facultyId": "68db66d77e93b1b3d114a14e",
//                     "name": "Dr. Ramesh",
//                     "email": "ramesh@iiits.in",
//                     "dept": "CSE"
//                 }
//             ]
//         },
//         {
//             "courseId": "68db5b79d78fcafe6bb1260a",
//             "courseName": "Machine Learning",
//             "courseCode": "ML104",
//             "faculty": [
//                 {
//                     "facultyId": "68db66d77e93b1b3d114a156",
//                     "name": "Dr. Anil",
//                     "email": "anil@iiits.in",
//                     "dept": "ECE"
//                 },
//                 {
//                     "facultyId": "68db66d77e93b1b3d114a15c",
//                     "name": "Dr. Kavya",
//                     "email": "kavya@iiits.in",
//                     "dept": "MDS"
//                 }
//             ]
//         }
//     ]
// }


// END OF DASHBOARD START OF SELECT FACULTY

//format for sending data
// {
//   "selections": [
//     {
//       "courseId": "68db5b79d78fcafe6bb12607",
//       "facultyIds": ["68db66d77e93b1b3d114a14e"]
//     },
//     {
//       "courseId": "68db5b79d78fcafe6bb12608",
//       "facultyIds": ["68db66d77e93b1b3d114a152", "68db66d77e93b1b3d114a154"]
//     }
//   ]
// }
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
    const { feedbacks, currentPage } = req.body;
    // console.log(feedbacks[0].answers);

    //  Identify the student
    const student = await Student.findOne({ email: req.user.email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find their feedback record
    const feedback = await Feedback.findOne({ student: student._id });
    if (!feedback) {
      return res.status(404).json({ message: "Feedback record not found" });
    }

    if (feedback.submitted) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }
    // console.log(feedback.feedbacks)

    //  Update each page strictly
    for (const page of feedbacks) {
      const { courseId, facultyId, answers } = page;

      const existingEntry = feedback.feedbacks.find(
        (f) =>
          f.course.toString() === courseId &&
          f.faculty.toString() === facultyId
      );
      // console.log(existingEntry)

      if (!existingEntry) {
        return res.status(400).json({
          message: `No feedback entry found for course ${courseId} and faculty ${facultyId}`,
        });
      }

      for (const ans of answers) {
        if(ans.response===null){
          continue;
        }

        const existingAns = existingEntry.answers.find(
          (a) => a.question.toString() === ans.question
        );

        if (!existingAns) {
          return res.status(400).json({
            message: `Unknown question ${ans.question} for course ${courseId} and faculty ${facultyId}`,
          });
        }

        const question = await Question.findById(ans.question).select("type");
        if (!question) {
          return res.status(400).json({
            message: `Question ${ans.question} not found in database`,
          });
        }

        // Validate response type
        if (question.type === "rating") {
          const val = Number(ans.response);
          if (!Number.isInteger(val) || val < 1 || val > 10) {
            return res.status(400).json({
              message: `Invalid rating (${ans.response}) for question ${question._id}. Expected 1–10.`,
            });
          }
          existingAns.response = val;
        } else if (question.type === "text") {
          if (typeof ans.response !== "string" || ans.response.trim() === "") {
            return res.status(400).json({
              message: `Invalid text response for question ${question._id}`,
            });
          }
          existingAns.response = ans.response.trim();
        }
      }

      // Mark as completed if all questions answered
      const everyAnswered = existingEntry.answers.every(
        (a) => a.response !== null && a.response !== ""
      );
      existingEntry.completed = everyAnswered;
    }

    // Update progress
    if (typeof currentPage === "number") {
      feedback.currentPage = currentPage;
    }

    await feedback.save();

    // Re-fetch fully populated updated instance for frontend
    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate({
        path: "feedbacks.course feedbacks.faculty feedbacks.answers.question",
        select: "name code text type",
      })
      .lean();

    return res.status(200).json({
      message: "Feedback progress updated successfully",
      currentPage: feedback.currentPage,
      feedback: updatedFeedback,
    });
  } catch (err) {
    console.error("Error updating feedback:", err);
    return res.status(500).json({
      message: "Error saving feedback progress",
    });
  }
};

export const submitFeedback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { feedbacks } = req.body;

    const student = await Student.findOne({ email: req.user.email }).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Student not found" });
    }

    const feedback = await Feedback.findOne({ student: student._id }).session(session);
    if (!feedback) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Feedback record not found" });
    }

    if (feedback.submitted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    // --- Validation and population of responses ---
    for (const page of feedbacks) {
      const { courseId, facultyId, answers } = page;

      const existingEntry = feedback.feedbacks.find(
        (f) =>
          f.course.toString() === courseId &&
          f.faculty.toString() === facultyId
      );

      if (!existingEntry) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `No feedback entry found for course ${courseId} and faculty ${facultyId}`,
        });
      }

      for (const ans of answers) {
        const existingAns = existingEntry.answers.find(
          (a) => a.question.toString() === ans.question
        );

        if (!existingAns) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Unknown question ${ans.question} for course ${courseId} and faculty ${facultyId}`,
          });
        }

        const question = await Question.findById(ans.question).select("type").session(session);
        if (!question) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Question ${ans.question} not found in database`,
          });
        }

        if (question.type === "rating") {
          const val = Number(ans.response);
          if (!Number.isInteger(val) || val < 1 || val > 10) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              message: `Invalid rating (${ans.response}) for question ${question._id}. Expected 1–10.`,
            });
          }
          existingAns.response = val;
        } else if (question.type === "text") {
          //  Text is now optional — only store if provided
          if (typeof ans.response === "string" && ans.response.trim() !== "") {
            existingAns.response = ans.response.trim();
          } else {
            existingAns.response = ""; // leave blank if not provided
          }
        }
      }

      //  Mark as completed only if all RATING questions are answered
      const everyAnswered = await Promise.all(
        existingEntry.answers.map(async (a) => {
          const q = await Question.findById(a.question).select("type").session(session);
          if (!q) return false;
          if (q.type === "rating") {
            return a.response !== null && a.response !== "";
          }
          return true; // text questions can be empty
        })
      );

      existingEntry.completed = everyAnswered.every(Boolean);
    }

    // Reject if any page incomplete (due to missing rating)
    const incomplete = feedback.feedbacks.filter((f) => !f.completed);
    if (incomplete.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Cannot submit. Some feedback pages are incomplete (missing ratings).",
        incompleteCount: incomplete.length,
      });
    }

    // --- Finalize submission ---
    feedback.submitted = true;
    feedback.currentPage = feedback.feedbacks.length;
    await feedback.save({ session });

    // --- Update Analytics ---
    for (const f of feedback.feedbacks) {
      const facultyId = f.faculty;
      const courseId = f.course;

      let analytics = await Analytics.findOne({ faculty: facultyId }).session(session);
      if (!analytics) {
        // Create if not exists (though typically addCourse does this, but for robustness)
        // Actually, if missing, we can't really update. Error? Or skip?
        // Code previously error'd.
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          message: "Analytics not found for faculty",
        });
      }

      let courseEntry = analytics.courses.find(
        (c) => c.course.toString() === courseId.toString()
      );

      if (!courseEntry) {
         await session.abortTransaction();
         session.endSession();
        return res.status(500).json({
          message: "Course analytics not found for faculty",
        });
      }

      // --- Compute this student's average rating for the page ---
      const ratingAnswers = f.answers.filter(
        (a) => typeof a.response === "number"
      );
      const avgScore =
        ratingAnswers.length > 0
          ? ratingAnswers.reduce((sum, a) => sum + a.response, 0) /
            ratingAnswers.length
          : 0;

      // --- Update question analytics ---
      for (const ans of f.answers) {
        const question = await Question.findById(ans.question).select(
          "type order"
        ).session(session);
        if (!question) continue;

        let qEntry = courseEntry.questions.find(
          (q) => q.question.toString() === ans.question.toString()
        );

        if (!qEntry) {
          await session.abortTransaction();
          session.endSession();
          return res.status(500).json({
            message: `Question ${ans.question} not found in analytics`,
          });
        }

        if (question.type === "rating") {
          const val = Number(ans.response);
          const totalResponses = courseEntry.totalResponses + 1;

          // Update average, min, max
          qEntry.average =
            (qEntry.average * courseEntry.totalResponses + val) / totalResponses;
          qEntry.min =
            courseEntry.totalResponses === 0 ? val : Math.min(qEntry.min, val);
          qEntry.max =
            courseEntry.totalResponses === 0 ? val : Math.max(qEntry.max, val);
        } else if (question.type === "text") {
          // Only store if non-empty
          if (ans.response && ans.response.trim() !== "") {
            qEntry.textResponses.push({
              text: ans.response.trim(),
              score: parseFloat(avgScore.toFixed(2)),
            });
          }
        }
      }

      // Increment response count and save
      courseEntry.totalResponses += 1;
      courseEntry.lastUpdated = new Date();
      await analytics.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Feedback successfully submitted and analytics updated!",
    });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Error submitting feedback",
      error: err.message,
    });
  }
};  
// update the statistics of faculty with each submission
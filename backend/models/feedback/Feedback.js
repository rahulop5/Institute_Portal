// models/Feedback.js
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  response: { type: mongoose.Schema.Types.Mixed, default: null }, // rating (1–10 → Number), text (String)
});

const facultyFeedbackSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  answers: [answerSchema],
  completed: { type: Boolean, default: false },
});

const feedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    semester: { type: String, required: true }, // e.g. "Fall-2025"
    feedbacks: [facultyFeedbackSchema], // one per faculty chosen
    currentPage: { type: Number, default: 0 }, // track progress across faculty pages
    submitted: { type: Boolean, default: false, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
  
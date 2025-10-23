// models/Analytics.js
import mongoose from "mongoose";

const questionAnalyticsSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  average: { type: Number, default: 0 }, // easier to handle in JS (no need for Decimal128)
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  textResponses: [{ type: String }], // store all text feedbacks for this question
});

const courseAnalyticsSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  questions: [questionAnalyticsSchema],
  totalResponses: { type: Number, default: 0 }, // how many students submitted feedback for this course
  lastUpdated: { type: Date, default: Date.now },
});

const analyticsSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    courses: [courseAnalyticsSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Analytics", analyticsSchema);

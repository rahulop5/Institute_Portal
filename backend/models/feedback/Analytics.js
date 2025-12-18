// models/Analytics.js
import mongoose from "mongoose";

const textResponseSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, required: true }, // student's average rating on that feedback page
});

const questionAnalyticsSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  average: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  responseCount: { type: Number, default: 0 }, // Track individual question responses
  textResponses: [textResponseSchema], // <-- Now holds objects with text + score
});

const courseAnalyticsSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  questions: [questionAnalyticsSchema],
  totalResponses: { type: Number, default: 0 },
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

// models/feedback/FeedbackConfig.js
import mongoose from "mongoose";

const feedbackConfigSchema = new mongoose.Schema(
  {
    semester: { type: String, required: true, unique: true, match: /^[MS]\d{2}$/ }, // e.g. "S26", "M25"
    isOpen: { type: Boolean, default: true }, // true = students can submit, false = submissions blocked
    closedAt: { type: Date, default: null }, // timestamp when admin closed it
    closedBy: { type: String, default: null }, // admin email who closed it
  },
  { timestamps: true }
);

export default mongoose.model("FeedbackConfig", feedbackConfigSchema);

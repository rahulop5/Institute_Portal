// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    abbreviation: {type: String, required: true},
    credits: {type: Number, required: true},
    isreset: { type: Boolean, required: true, default: false },
    coursetype: {
        type: String,
        enum: ["Institute Core", "Program Core", "Institute Elective", "Program Elective", "Elective"],
        required: true,
    },
    code: { type: String, required: true, unique: true }, // CS101wtevr
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }], // multiple faculty allowed
    batch: { type: String, required: true }, // like "2025", "2026"
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

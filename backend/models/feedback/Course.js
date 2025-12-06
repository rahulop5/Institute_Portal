// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    abbreviation: {type: String, required: true},
    credits: {type: Number, required: true},
    isreset: { type: Boolean, required: true, default: false },
    department: {type: String, enum: ["CSE", "ECE", "MDS"], required: true },
    coursetype: {
        type: String,
        enum: ["Institute Core", "Program Core", "Institute Elective", "Program Elective", "Elective"],
        required: true,
    },
    code: { type: String, required: true, unique: true }, // CS101wtevr
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }], // multiple faculty allowed
    ug: { type: Number, required: true }, // e.g., 1, 2, 3, 4
    semester: { type: String, enum: ["Monsoon", "Spring"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

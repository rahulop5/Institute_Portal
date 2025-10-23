// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // CS101wtevr
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }], // multiple faculty allowed
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

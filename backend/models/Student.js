import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },  
    email: { type: String, required: true, unique: true }, 
    rollNumber: { type: String, required: true, unique: true }, 
    department: { type: String },  
    batch: { type: String },       // "2025", "2026", etc.
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
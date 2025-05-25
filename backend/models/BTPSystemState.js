import mongoose from "mongoose";

const btpsysschema=new mongoose.Schema({
    academicYear: { type: String, required: true, unique: true }, // SYNTAX: "2024-2025"
    semester: { type: String, enum: ["ODD", "EVEN"], required: true },
    currentPhase: {
      type: String,
      enum: [
        "NOT_STARTED",
        "BIN_RELEASED",
        "TEAM_FORMATION",
        "FACULTY_ASSIGNMENT",
+        "IN_PROGRESS",
        "COMPLETED"
      ],
      default: "NOT_STARTED"
    },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("BTPSystemState", btpsysschema); 
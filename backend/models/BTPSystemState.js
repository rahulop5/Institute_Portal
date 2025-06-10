import mongoose from "mongoose";

const btpsysschema=new mongoose.Schema({
    studentbatch: {type: String, required: true, unique: true}, //joining year
    currentPhase: {
      type: String,
      enum: [
        "NOT_STARTED",
        "TEAM_FORMATION",
        "FACULTY_ASSIGNMENT",
        "IN_PROGRESS",
        "COMPLETED"
      ],
      default: "NOT_STARTED",
      required: true
    },
    updatedAt: { type: Date, default: Date.now },
    stulimitperfaculty: {type: Number}
});

export default mongoose.model("BTPSystemState", btpsysschema); 
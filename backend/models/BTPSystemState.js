import mongoose from "mongoose";

const btpsysschema = new mongoose.Schema({
  studentbatch: { type: String, required: true, unique: true }, // joining year
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
  currentPreferenceRound: { type: Number, default: 1 }, // new centralized round (1..4)
  stulimitperfaculty: { type: Number },
  updatedAt: { type: Date, default: Date.now },
});


export default mongoose.model("BTPSystemState", btpsysschema); 
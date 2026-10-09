import mongoose from "mongoose";

const studentSubSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "BTPRegistration", required: true }
}, { _id: false });

const btpschema = new mongoose.Schema({
  name: { type: String, required: true },
  about: { type: String, required: false },
  studentbatch: { type: String, required: true },
  students: [studentSubSchema],
  guide: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  evaluators: [
    {
      evaluator: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    }
  ],
  updates: [
    {
      update: { type: String, required: true },
      remark: { type: String, required: false },
      time: { type: Date, required: true },
    }
  ],
  // "discontinued" = guide stopped guiding before completion (e.g. the
  // student left the program) - distinct from "completed" so it's not
  // mistaken for a finished project.
  // "dropped" / "switched" = closed by an approved program change request
  // (see ProgramChangeRequest.js); the student is no longer on this project.
  status: { type: String, enum: ["active", "completed", "discontinued", "dropped", "switched"], default: "active" },
  // Per-semester evaluation schedule, set by the guide on approval. Repeats
  // identically each semester - e.g. [{maxMarks:25},{maxMarks:25},{maxMarks:50}]
  // means 3 evaluations per semester, weighted 25/25/50.
  // Every topic edit (by the student, guide or UG Projects, or through a
  // guide change), oldest first - the project keeps its evaluations.
  topicHistory: [
    {
      _id: false,
      name: { type: String, required: true },
      about: { type: String },
      role: { type: String, required: true },
      email: { type: String, required: true },
      at: { type: Date, default: Date.now },
    }
  ],
  evaluationConfig: {
    type: [{ maxMarks: { type: Number, required: true } }],
    default: () => [{ maxMarks: 50 }, { maxMarks: 50 }],
  }
});

export default mongoose.model("BTP", btpschema); 

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
  status: { type: String, enum: ["active", "completed", "discontinued"], default: "active" },
  // Per-semester evaluation schedule, set by the guide on approval. Repeats
  // identically each semester - e.g. [{maxMarks:25},{maxMarks:25},{maxMarks:50}]
  // means 3 evaluations per semester, weighted 25/25/50.
  evaluationConfig: {
    type: [{ maxMarks: { type: Number, required: true } }],
    default: () => [{ maxMarks: 50 }, { maxMarks: 50 }],
  }
});

export default mongoose.model("BTP", btpschema); 

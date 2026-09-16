import mongoose from "mongoose";

const apEvaluationSchema = new mongoose.Schema({
  projectRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AP",
    required: true,
  },
  time: { type: Date, required: true },
  canstudentsee: { type: Boolean, required: true },
  remark: { type: String, required: false },
  // Copied from the project's evaluationConfig at the time this round was
  // created - see BTPEvaluation.js for the same pattern.
  maxMarks: { type: Number, required: true, default: 50 },
  resources: [
    {
      resourceURL: { type: String, required: true },
    },
  ],
  // Guide + evaluator grades per student
  marksgiven: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "APRegistration",
        required: true,
      },
      guidemarks: { type: Number, required: true },
      totalgrade: { type: String },
    },
  ],
  // Panel marks per evaluator
  panelEvaluations: [
    {
      evaluator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true,
      },
      submitted: { type: Boolean, default: false },
      submittedAt: { type: Date },
      panelmarks: [
        {
          student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "APRegistration",
            required: true,
          },
          marks: { type: Number, required: true },
        },
      ],
      remark: { type: String },
    },
  ],
});

export default mongoose.model("APEvaluation", apEvaluationSchema);

import mongoose from "mongoose";

const btpevaluationSchema = new mongoose.Schema({
  projectRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BTP",
    required: true,
  },
  time: { type: Date, required: true },
  canstudentsee: { type: Boolean, required: true },
  remark: { type: String, required: false },
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
        ref: "UGStudentBTP",
        required: true,
      },
      guidemarks: { type: Number, required: true },
      totalgrade: { type: String }, // optional final grade by dean
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
            ref: "UGStudentBTP",
            required: true,
          },
          marks: { type: Number, required: true },
        },
      ],
      remark: { type: String }, 
    },
  ],
});

export default mongoose.model("BTPEvaluation", btpevaluationSchema);

import mongoose from "mongoose";

// A student's request to drop their BTP/Honors project, switch between BTP
// and Honors, or (when their guide has left the institute) move to a new
// guide. Passes UG Projects -> Assistant Dean Academics -> the guide (the
// proposed new guide for "guide_change"), any of whom can reject it with a
// remark; it's only applied once that last step approves (see
// programChangeController.js).
// A "topic_change" is a student's edit to their own topic: it skips UG
// Projects and the Assistant Dean and goes straight to the guide
// (pending_faculty), and doesn't block other requests while it waits.
const programChangeRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    program: { type: String, enum: ["btp", "honors"], required: true },
    type: { type: String, enum: ["drop", "switch", "guide_change", "topic_change"], required: true },
    // switch only: "continue" carries the project (and its marks) into the
    // other program, "fresh" closes it so the student applies for a new topic.
    switchMode: { type: String, enum: ["continue", "fresh"] },
    project: { type: mongoose.Schema.Types.ObjectId, refPath: "projectModel", required: true },
    projectModel: { type: String, enum: ["BTP", "Honors"], required: true },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    // guide_change only: the faculty member the student proposes, and the
    // topic to continue under them (absent = keep the current topic).
    // topic_change: the topic the student wants instead.
    newGuide: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
    newTopic: {
      name: { type: String },
      about: { type: String },
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending_ugprojects", "pending_assistantdean", "pending_faculty", "approved", "rejected", "withdrawn"],
      default: "pending_ugprojects",
    },
    history: [
      {
        _id: false,
        role: { type: String, enum: ["Student", "UGProjects", "AssistantDean", "Faculty"], required: true },
        email: { type: String, required: true },
        action: { type: String, enum: ["submitted", "approved", "rejected", "withdrawn"], required: true },
        remark: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ProgramChangeRequest", programChangeRequestSchema);

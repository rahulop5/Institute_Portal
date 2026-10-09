import mongoose from "mongoose";
import {historySchema} from "./historyEntry.js";

const correctionSchema = new mongoose.Schema({
    student: {type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true},
    courseGrading: {type: mongoose.Schema.Types.ObjectId, ref: "CourseGrading", required: true},
    faculty: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true}, // the student's own section faculty
    component: String,
    message: {type: String, required: true},
    status: {type: String, enum: ["open", "accepted", "rejected"], default: "open"},
    remark: String,
    history: [historySchema],
}, {timestamps: true});
correctionSchema.index({faculty: 1, status: 1});
correctionSchema.index({student: 1, courseGrading: 1});

export default mongoose.model("GradeCorrectionRequest", correctionSchema);

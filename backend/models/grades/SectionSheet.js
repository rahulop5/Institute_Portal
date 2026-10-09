import mongoose from "mongoose";
import {historySchema} from "./historyEntry.js";

const sectionSheetSchema = new mongoose.Schema({
    courseGrading: {type: mongoose.Schema.Types.ObjectId, ref: "CourseGrading", required: true},
    faculty: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true},
    status: {type: String, enum: ["editing", "ready"], default: "editing"},
    readyAt: Date,
    // Students this faculty entered who already sit in another section. The
    // other section keeps the row; this list is visible to both faculty.
    conflicts: [{_id: false, student: {type: mongoose.Schema.Types.ObjectId, ref: "Student"}, marks: Object, claimedBy: {type: mongoose.Schema.Types.ObjectId, ref: "SectionSheet"}}],
    history: [historySchema],
}, {timestamps: true});
sectionSheetSchema.index({courseGrading: 1, faculty: 1}, {unique: true});

export default mongoose.model("SectionSheet", sectionSheetSchema);

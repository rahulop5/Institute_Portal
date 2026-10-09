import mongoose from "mongoose";
import {historySchema} from "./historyEntry.js";

const gradeKeys = {O: Number, A: Number, B: Number, C: Number, D: Number};

// One per course offering: the course-level record sitting on top of the
// per-faculty section sheets.
const courseGradingSchema = new mongoose.Schema({
    course: {type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, unique: true},
    courseKey: {type: String, required: true, index: true}, // Course.abbreviation: stable across semesters
    semester: {type: String, required: true},

    components: [{_id: false, key: String, name: String, rawMax: Number, weight: Number}],
    componentAgreements: [{_id: false, faculty: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty"}, at: {type: Date, default: Date.now}}],
    componentsLocked: {type: Boolean, default: false},

    bandConfig: {type: gradeKeys, default: () => ({O: 10, A: 20, B: 30, C: 20, D: 10})},
    threshold: {_id: false, T: Number, basis: {type: String, enum: ["highest/3", "avg/2"]}, highest: Number, average: Number},
    calculatedCutoffs: {type: gradeKeys, default: undefined},
    cutoffs: {type: gradeKeys, default: undefined},
    cutoffOverride: {
        _id: false,
        values: {type: Object},
        by: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty"},
        reason: String,
        at: Date,
    },

    status: {type: String, enum: ["setup", "collecting", "grading", "cc_review", "approved", "released"], default: "setup"},
    version: {type: Number, default: 1},
    submittedBy: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty"},
    versionNote: String,
    approvals: [{_id: false, faculty: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty"}, at: {type: Date, default: Date.now}}],
    releasedAt: Date,

    // Backlog assignment is NOT stored here: a backlog student's GradeEntry
    // (isBacklog: true, sheet) is the single record of which section owns them.

    amendment: {
        _id: false,
        type: {type: String, enum: ["correction", "reexam", "backlog"]},
        mode: {type: String, enum: ["frozen", "recompute"]},
        reason: String,
        students: [{type: mongoose.Schema.Types.ObjectId, ref: "Student"}],
        openedBy: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty"},
        openedAt: Date,
    },

    history: [historySchema],
}, {timestamps: true});

export default mongoose.model("CourseGrading", courseGradingSchema);

import mongoose from "mongoose";

const gradeEntrySchema = new mongoose.Schema({
    courseGrading: {type: mongoose.Schema.Types.ObjectId, ref: "CourseGrading", required: true},
    sheet: {type: mongoose.Schema.Types.ObjectId, ref: "SectionSheet", required: true},
    student: {type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true},

    attemptType: {type: String, enum: ["regular", "reexam", "special_may", "repeat"], default: "regular"},
    isBacklog: {type: Boolean, default: false},
    absent: {type: Boolean, default: false}, // backlog student who did not appear: ungraded, stays an open backlog

    marks: {type: Object, default: {}}, // {componentKey: raw}
    total: {type: Number, default: 0},

    computedGrade: String,
    finalGrade: String,
    override: {_id: false, grade: String, by: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty"}, remark: String, at: Date},

    // Set while an amendment is open for this student; `prev` keeps what was released.
    amended: {type: Boolean, default: false},
    prev: {_id: false, marks: Object, total: Number, computedGrade: String, finalGrade: String},
}, {timestamps: true, minimize: false});
// A student can only sit in one section of a course grading.
gradeEntrySchema.index({courseGrading: 1, student: 1}, {unique: true});
gradeEntrySchema.index({sheet: 1});

export default mongoose.model("GradeEntry", gradeEntrySchema);

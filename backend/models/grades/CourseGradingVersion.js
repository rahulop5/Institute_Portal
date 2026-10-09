import mongoose from "mongoose";

// Fixed snapshot taken at every submission and release. Never edited.
const versionSchema = new mongoose.Schema({
    courseGrading: {type: mongoose.Schema.Types.ObjectId, ref: "CourseGrading", required: true},
    version: {type: Number, required: true},
    kind: {type: String, enum: ["submitted", "released"], required: true},
    course: {type: mongoose.Schema.Types.ObjectId, ref: "Course"},
    courseKey: String,
    courseCode: String,
    courseName: String,
    semester: String,
    components: [Object],
    bandConfig: Object,
    threshold: Object,
    calculatedCutoffs: Object,
    cutoffs: Object,
    cutoffOverride: Object,
    amendment: Object,
    approvals: [Object],
    versionNote: String,
    sections: [{_id: false, sheet: mongoose.Schema.Types.ObjectId, faculty: mongoose.Schema.Types.ObjectId, facultyName: String}],
    rows: [{
        _id: false,
        student: mongoose.Schema.Types.ObjectId,
        rollNumber: String,
        name: String,
        sheet: mongoose.Schema.Types.ObjectId,
        section: String, // faculty name
        attemptType: String,
        isBacklog: Boolean,
        absent: Boolean,
        marks: Object,
        total: Number,
        computedGrade: String,
        finalGrade: String,
        override: Object,
    }],
    createdBy: String,
    releasedAt: Date,
}, {timestamps: true, minimize: false});
versionSchema.index({courseGrading: 1, version: 1, kind: 1}, {unique: true});

export default mongoose.model("CourseGradingVersion", versionSchema);

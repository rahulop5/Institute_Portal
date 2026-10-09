import mongoose from "mongoose";

// Append-only result history, the single source for backlog tracking.
// A student has an open backlog for courseKey when their LATEST attempt is F
// (latest = highest semester, then version, then createdAt).
const courseAttemptSchema = new mongoose.Schema({
    student: {type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true},
    courseKey: {type: String, required: true},
    courseCode: String,
    courseName: String,
    semester: {type: String, required: true},
    attemptType: {type: String, enum: ["regular", "reexam", "special_may", "repeat"], default: "regular"},
    grade: {type: String, required: true},
    gradingRef: {type: mongoose.Schema.Types.ObjectId, ref: "CourseGrading"},
    version: {type: Number, default: 0},
    source: {type: String, enum: ["released", "imported"], default: "released"},
}, {timestamps: true});
courseAttemptSchema.index({student: 1, courseKey: 1});
courseAttemptSchema.index({gradingRef: 1, student: 1, version: 1}, {unique: true, partialFilterExpression: {source: "released"}});
courseAttemptSchema.index({student: 1, courseKey: 1, semester: 1}, {unique: true, partialFilterExpression: {source: "imported"}});

export default mongoose.model("CourseAttempt", courseAttemptSchema);

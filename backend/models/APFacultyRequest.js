import mongoose from "mongoose";

// Per-faculty request inbox for Additional Projects (replaces Topic model)
// Students propose their own projects, so there are no predefined topics
const apFacultyRequestSchema = new mongoose.Schema({
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true, unique: true },
    requests: [
        {
            _id: false,
            student: { type: mongoose.Schema.Types.ObjectId, ref: "APRegistration", required: true },
            proposalTitle: { type: String, required: true },
            proposalText: { type: String, required: true },
            // Other students on the proposal (Student ids); empty for a solo project.
            teammates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
            isapproved: { type: Boolean, required: true, default: false },
            // True once the faculty member has sent it on for UG Projects /
            // Assistant Dean approval (see enrollmentController.js).
            forwarded: { type: Boolean, default: false }
        }
    ]
});

export default mongoose.model("APFacultyRequest", apFacultyRequestSchema);

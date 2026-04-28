import mongoose from "mongoose";

// Tracks a student's AP participation: their project assignment and faculty requests
const apRegistrationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "AP", default: null },
    requests: [
        {
            _id: false,
            faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
            proposalTitle: { type: String, required: true },
            proposalText: { type: String, required: true },
            status: { type: String, enum: ["Pending", "Rejected"], default: "Pending" }
        }
    ]
});

export default mongoose.model("APRegistration", apRegistrationSchema);

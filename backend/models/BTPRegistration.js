import mongoose from "mongoose";

// Tracks a student's BTP participation: their project assignment and topic requests
const btpRegistrationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "BTP", default: null },
    requests: [
        {
            _id: false,
            topic: { type: mongoose.Schema.Types.ObjectId, ref: "BTPTopic", required: true },
            subTopicId: { type: mongoose.Schema.Types.ObjectId, required: true },
            status: { type: String, enum: ["Pending", "Rejected"], default: "Pending" },
            preference: { type: Number, required: true }
        }
    ]
});

export default mongoose.model("BTPRegistration", btpRegistrationSchema);

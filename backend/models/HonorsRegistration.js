import mongoose from "mongoose";

// Tracks a student's Honors participation: their project assignment and topic requests
const honorsRegistrationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Honors", default: null },
    requests: [
        {
            _id: false,
            topic: { type: mongoose.Schema.Types.ObjectId, ref: "HonorsTopic", required: true },
            subTopicId: { type: mongoose.Schema.Types.ObjectId, required: true },
            status: { type: String, enum: ["Pending", "Rejected"], default: "Pending" },
            preference: { type: Number, required: true }
        }
    ]
});

export default mongoose.model("HonorsRegistration", honorsRegistrationSchema);

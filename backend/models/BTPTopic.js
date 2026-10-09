import mongoose from "mongoose";

//ik this schema is not preferred when u want to scale it but there will be limited no of topics
const btptopicschema = new mongoose.Schema({
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true, unique: true },
    topics: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            topic: { type: String, required: true },
            about: { type: String, required: true },
            dept: { type: String, required: true, enum: ["CSE", "ECE", "MDS"] },
            // Set when a student proposed this topic themselves: only that
            // student and this faculty member see it.
            proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "BTPRegistration", default: null }
        }
    ],
    requests: [
        {
            _id: false,
            student: { type: mongoose.Schema.Types.ObjectId, ref: "BTPRegistration", required: true },
            topic: { type: mongoose.Schema.Types.ObjectId, required: true },
            isapproved: { type: Boolean, required: true, default: false },
            preference: { type: Number, required: true },
            // What the student wrote about their interest in the topic.
            message: { type: String, default: "" },
            // True once the faculty member has sent it on for UG Projects /
            // Assistant Dean approval (see enrollmentController.js).
            forwarded: { type: Boolean, default: false }
        }
    ]
});

export default mongoose.model("BTPTopic", btptopicschema);
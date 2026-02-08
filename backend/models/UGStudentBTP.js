import mongoose from "mongoose";

const stuschema=new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "BTP", default: null },
    //make sure 2 way binding is done as requests are stored in both this and btptopic.js
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

export default mongoose.model("UGStudentBTP", stuschema);
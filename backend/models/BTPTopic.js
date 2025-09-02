import mongoose from "mongoose";

//ik this schema is not preferred when u want to scale it but there will be limited no of topics
const btptopicschema=new mongoose.Schema({
    faculty: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true, unique: true},
    topics: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            topic: {type: String, required: true},
            about: {type: String, required: true},
            dept: {type: String, required: true, enum: ["CSE", "ECE", "MDS"]}
        }
    ],
    requests: [
        {
            _id: false,
            teamid: {type: mongoose.Schema.Types.ObjectId, ref: "BTPTeam", required: true},
            topic: { type: mongoose.Schema.Types.ObjectId, required: true },
            isapproved: {type: Boolean, required: true, default: false},
            preference: { type: Number, required: true }
        }
    ]
});

export default mongoose.model("BTPTopic", btptopicschema);
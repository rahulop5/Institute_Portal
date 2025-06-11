import mongoose from "mongoose";

const btptopicschema=new mongoose.Schema({
    faculty: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true, unique: true},
    topics: [
        {
            topic: {type: String, required: true},
            dept: {type: String, required: true, enum: ["CSE", "ECE", "MDS"]}
        }
    ],
    requests: [
        {
            _id: false,
            teamid: {type: mongoose.Schema.Types.ObjectId, required: true},
            topic: {type: String, required: true}
        }
    ]
});

export default mongoose.model("BTPTopic", btptopicschema);
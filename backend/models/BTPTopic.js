import mongoose from "mongoose";

const btptopicschema=new mongoose.Schema({
    faculty: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true},
    topics: [{type: String}],
    requests: [
        {
            _id: false,
            teamid: {type: mongoose.Schema.Types.ObjectId, required: true},
            topic: {type: String, required: true}
        }
    ]
});

export default mongoose.model("BTPTopic", btptopicschema);
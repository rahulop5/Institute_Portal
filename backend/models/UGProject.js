import mongoose from "mongoose";

const proschema=new mongoose.Schema({
    name: {type: String, required: true},
    about: {type: String, required: false},
    type: {type: String, enum:["BTP", "Honors"], required: false},
    guides: [
        {
            guide: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true},
        }
    ],
    evaluators: [
        {
            evaluator: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true},
        }
    ],
    students: [
        {
            guide: {type: mongoose.Schema.Types.ObjectId, ref: "UGStudent", required: true},
        }
    ],
    updates: [{type: String, required: true}]
});

export default mongoose.model("UGProject", proschema);
import mongoose from "mongoose";

const honorschema=new mongoose.Schema({
    name: {type: String, required: true},
    about: {type: String, required: false},
    student: {type: mongoose.Schema.Types.ObjectId, ref: "UGStudent", required: true},
    guide: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true},
    evaluators: [
        {
            evaluator: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true},
        }
    ],
    updates: [
        {
            update: {type: String, required: true},
            remark: {type: String, required: false},
            time: {type: Date, required: true},
            updatefor: {type: Number, required: true}
        }
    ]
});

export default mongoose.model("Honors", honorschema);
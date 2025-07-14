import mongoose from "mongoose";

const honorseschema=new mongoose.Schema({
    projectRef: {type: mongoose.Schema.Types.ObjectId, ref: "BTP", required: true},
    evaluationno: {type: Number, required: true},
    time: {type: Date, required: true},
    canstudentsee: {type: Boolean, required: true},
    resources: [
        {
            resourceURL: {type: String, required: true}
        }
    ],
    marksgiven: {
        student: {type: mongoose.Schema.Types.ObjectId, ref: "UGStudentHonors", required: true},
        guidemarks: {type: Number, required: false},
        panelmarks: {type: Number, required: false},
        totalgrade: {type: String,  required: false}
    }
});

export default mongoose.model("BTPEvaluation", honorseschema);
import mongoose from "mongoose";

const btpeschema=new mongoose.Schema({
    projectRef: {type: mongoose.Schema.Types.ObjectId, ref: "BTP", required: true},
    time: {type: Date, required: true},
    canstudentsee: {type: Boolean, required: true},
    remark: {type: String, required: false},
    resources: [
        {
            resourceURL: {type: String, required: true}
        }
    ],
    marksgiven: [
        {
            student: {type: mongoose.Schema.Types.ObjectId, ref: "UGStudentBTP", required: true},
            guidemarks: {type: Number, required: true},
            panelmarks: {type: Number, required: false},
            //totalgrade is decided by dean
            totalgrade: {type: String,  required: false}
        }
    ]
});

export default mongoose.model("BTPEvaluation", btpeschema);
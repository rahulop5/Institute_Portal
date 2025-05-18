import mongoose from "mongoose";

const couschema=new mongoose.Schema({
    name: {type: String, required: true},
    facultyassigned: {type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true},
    ug: {type: String, required: false},
    section: {type: String, required: false},
    credits: {type: Number, required: true},
    classeshappened: {type: Number, required: false},
    feedbackactive: {type: Boolean, required: true},
    iscore: {type: Boolean, required: true}
});

export default mongoose.model("Course", couschema);
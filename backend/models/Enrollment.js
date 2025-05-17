import mongoose from "mongoose";

const enrollschema=new mongoose.Schema({
    course: {type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true},
    ugstudent: {type: mongoose.Schema.Types.ObjectId, ref: "UGStudent", required: true},
    classespresent: {type: Number, required: false},
});

export default mongoose.model("Enrollment", enrollschema);
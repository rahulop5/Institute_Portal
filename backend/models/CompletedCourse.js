import mongoose from "mongoose";

const ccschema=new mongoose.Schema({
    course: {type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true},
    student: {type: mongoose.Schema.Types.ObjectId, ref: "UGStudent", required: true},
    grade: {type: String, required: false}
});

export default mongoose.model("CompletedCourse", ccschema);
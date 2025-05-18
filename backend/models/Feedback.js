import mongoose from "mongoose";

const fbschema=new mongoose.Schema({
    course: {type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true},
    student: {type: mongoose.Schema.Types.ObjectId, ref: "UGStudent", required: true},
    feedback: {
        rating: {type: Number, required: true, min: 1, max: 10},
        message: {type: String, required: false}
    }
});

export default mongoose.model("Feedback", fbschema);
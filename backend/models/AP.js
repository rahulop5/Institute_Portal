import mongoose from "mongoose";

const studentSubSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "APRegistration", required: true }
}, { _id: false });

const apschema = new mongoose.Schema({
    name: { type: String, required: true },
    about: { type: String, required: false },
    studentbatch: { type: String, required: true },
    students: [studentSubSchema],
    guide: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    evaluators: [
        {
            evaluator: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
        }
    ],
    updates: [
        {
            update: { type: String, required: true },
            remark: { type: String, required: false },
            time: { type: Date, required: true },
        }
    ],
    status: { type: String, enum: ["active", "completed"], default: "active" }
});

export default mongoose.model("AP", apschema);

import mongoose from "mongoose";

const studentSubSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "UGStudent", required: true }
}, { _id: false });

const btpschema = new mongoose.Schema({
  name: { type: String, required: true },
  about: { type: String, required: false },
  studentbatch: { type: String, required: true },
  students: [studentSubSchema], // using the subschema here
  guide: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  evaluators: [
    {
      evaluator: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    }
  ],
  updates: [
    {
      update: { type: String, required: true },
      //guide gicves the remark
      remark: { type: String, required: false },
      time: { type: Date, required: true },
      //can remove this but let it be for now
    }
  ]
});


export default mongoose.model("BTP", btpschema);
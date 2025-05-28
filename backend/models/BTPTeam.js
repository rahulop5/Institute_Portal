import mongoose from "mongoose";

const studentBinSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "UGStudent", required: true },
  approved: { type: Boolean, required: true },
}, { _id: false }); 

const teamSchema = new mongoose.Schema({
  bin1: {
    type: studentBinSchema,
    required: true,
  },
  bin2: {
    type: studentBinSchema,
    required: false,
  },
  bin3: {
    type: studentBinSchema,
    required: false,
  },
  isteamformed: { type: Boolean, required: true },
});

export default mongoose.model("BTPTeam", teamSchema);

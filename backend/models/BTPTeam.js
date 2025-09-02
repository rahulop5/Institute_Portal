import mongoose from "mongoose";

const studentBinSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "UGStudentBTP", required: true },
  approved: { type: Boolean, required: true },
}, { _id: false }); 

// BTPTeam schema additions
const teamSchema = new mongoose.Schema({
  batch: { type: String, required: true },
  bin1: { type: studentBinSchema, required: true },
  bin2: { type: studentBinSchema, required: false },
  bin3: { type: studentBinSchema, required: false },
  isteamformed: { type: Boolean, required: true },

  // NEW
  preferences: [
    {
      topicDoc: { type: mongoose.Schema.Types.ObjectId, ref: "BTPTopic", required: true }, // faculty's topic document
      topicId: { type: mongoose.Schema.Types.ObjectId, required: true }, // specific topic inside that doc
      order: { type: Number, required: true, enum: [1, 2, 3, 4] },
    }
  ],
  currentPreference: { type: Number, default: 0 }, // 0 = not started; 1..4 = active round
  facultyAssigned: { type: Boolean, default: false },
  assigned: {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
    topicDoc: { type: mongoose.Schema.Types.ObjectId, ref: "BTPTopic" },
    topicId: { type: mongoose.Schema.Types.ObjectId },
  }
});

export default mongoose.model("BTPTeam", teamSchema);

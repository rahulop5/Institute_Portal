import mongoose from "mongoose";

// One row per meeting request a student makes. Rows expire after 24h (TTL), so counting them gives a
// rolling-window rate limit that survives withdrawals/rejections (those clear the fields on the slot itself).
const meetingRequestLogSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  createdAt: { type: Date, default: Date.now, expires: 24 * 60 * 60 },
});

export default mongoose.model("MeetingRequestLog", meetingRequestLogSchema);

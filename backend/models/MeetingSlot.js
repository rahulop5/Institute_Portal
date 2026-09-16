import mongoose from "mongoose";

const meetingSlotSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    date: { type: Date, required: true }, // date-only, from <input type="date">
    startTime: { type: String, required: true }, // "HH:MM", from <input type="time">
    endTime: { type: String, required: true }, // "HH:MM"
    location: { type: String, required: true, trim: true }, // free text: room or link
    status: {
      type: String,
      enum: ["available", "requested", "booked", "cancelled"],
      default: "available",
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    purpose: { type: String, default: null },
    requestedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

meetingSlotSchema.index({ faculty: 1, status: 1, date: 1 });

export default mongoose.model("MeetingSlot", meetingSlotSchema);

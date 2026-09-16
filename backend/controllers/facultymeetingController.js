import Faculty from "../models/Faculty.js";
import MeetingSlot from "../models/MeetingSlot.js";
import { getSlotStart, isSlotInPast } from "../utils/slotTime.js";

export const createSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, location } = req.body;
    if (!date || !startTime || !endTime || !location || !location.trim()) {
      return res.status(400).json({ message: "Date, start time, end time and location are all required" });
    }
    if (endTime <= startTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const slot = new MeetingSlot({ faculty: fac._id, date: new Date(date), startTime, endTime, location: location.trim() });
    if (isSlotInPast(slot)) {
      return res.status(400).json({ message: "Cannot create a slot in the past" });
    }

    await slot.save();
    return res.status(201).json(slot);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error creating slot" });
  }
};

export const getFacultyMeetings = async (req, res) => {
  try {
    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const allSlots = await MeetingSlot.find({ faculty: fac._id })
      .populate("requestedBy", "name email rollNumber")
      .sort({ date: 1, startTime: 1 });

    const pendingRequests = allSlots.filter((s) => s.status === "requested");

    return res.json({ allSlots, pendingRequests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading meetings dashboard" });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const exists = await MeetingSlot.findOne({ _id: slotId, faculty: fac._id });
    if (!exists) return res.status(404).json({ message: "Slot not found" });

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, faculty: fac._id, status: "requested" },
      { $set: { status: "booked", approvedAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "This request is no longer pending" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error approving request" });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const exists = await MeetingSlot.findOne({ _id: slotId, faculty: fac._id });
    if (!exists) return res.status(404).json({ message: "Slot not found" });

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, faculty: fac._id, status: "requested" },
      {
        $set: { status: "available", rejectedAt: new Date() },
        $unset: { requestedBy: "", purpose: "", requestedAt: "" },
      },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "This request is no longer pending" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error rejecting request" });
  }
};

export const cancelSlot = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const existing = await MeetingSlot.findOne({ _id: slotId, faculty: fac._id });
    if (!existing) return res.status(404).json({ message: "Slot not found" });
    if (existing.status === "requested") {
      return res.status(409).json({ message: "Reject the pending request first" });
    }
    if (existing.status === "cancelled") {
      return res.status(409).json({ message: "This slot is already cancelled" });
    }

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, faculty: fac._id, status: { $in: ["available", "booked"] } },
      { $set: { status: "cancelled", cancelledAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "This slot can no longer be cancelled" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error cancelling slot" });
  }
};

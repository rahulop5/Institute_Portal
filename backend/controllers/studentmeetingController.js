import Faculty from "../models/Faculty.js";
import Student from "../models/feedback/Student.js";
import MeetingSlot from "../models/MeetingSlot.js";
import { isSlotInPast } from "../utils/slotTime.js";

export const listFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({}, "name email dept").sort({ name: 1 });
    return res.json({ faculty });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading faculty list" });
  }
};

export const listFacultySlots = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const fac = await Faculty.findById(facultyId);
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const candidateSlots = await MeetingSlot.find({ faculty: fac._id, status: "available" }).sort({
      date: 1,
      startTime: 1,
    });
    const slots = candidateSlots.filter((s) => !isSlotInPast(s));

    return res.json({ faculty: fac, slots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading faculty's slots" });
  }
};

export const requestSlot = async (req, res) => {
  try {
    const { slotId, purpose } = req.body;
    if (!slotId || !purpose || !purpose.trim()) {
      return res.status(400).json({ message: "slotId and purpose are required" });
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const slot = await MeetingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (isSlotInPast(slot)) {
      return res.status(400).json({ message: "This slot has already passed" });
    }

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, status: "available" },
      {
        $set: {
          status: "requested",
          requestedBy: student._id,
          purpose: purpose.trim(),
          requestedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "This slot is no longer available" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error requesting slot" });
  }
};

export const listMyMeetings = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const meetings = await MeetingSlot.find({ requestedBy: student._id })
      .populate("faculty", "name email dept")
      .sort({ date: -1, startTime: -1 });

    return res.json({ meetings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading your meetings" });
  }
};

export const withdrawRequest = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, status: "requested", requestedBy: student._id },
      { $set: { status: "available" }, $unset: { requestedBy: "", purpose: "", requestedAt: "" } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "This request can no longer be withdrawn" });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error withdrawing request" });
  }
};

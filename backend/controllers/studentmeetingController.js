import Faculty from "../models/Faculty.js";
import Student from "../models/feedback/Student.js";
import MeetingSlot from "../models/MeetingSlot.js";
import MeetingRequestLog from "../models/MeetingRequestLog.js";
import { isSlotInPast } from "../utils/slotTime.js";
import { notifyMeeting } from "../utils/meetingMailer.js";

// Anti-spam limits: each request emails the faculty, so cap how many a student can generate.
const MAX_PENDING_PER_FACULTY = 2;
const MAX_REQUESTS_PER_DAY = 3;

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
    if (!slotId) return res.status(400).json({ message: "slotId is required" });
    if (purpose && purpose.length > 500) {
      return res.status(400).json({ message: "Comment must be 500 characters or fewer" });
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const slot = await MeetingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (isSlotInPast(slot)) {
      return res.status(400).json({ message: "This slot has already passed" });
    }

    const pendingWithFaculty = await MeetingSlot.countDocuments({
      faculty: slot.faculty,
      requestedBy: student._id,
      status: "requested",
    });
    if (pendingWithFaculty >= MAX_PENDING_PER_FACULTY) {
      return res.status(429).json({
        message: `You already have ${MAX_PENDING_PER_FACULTY} pending requests with this faculty. Wait for a reply or withdraw one first.`,
      });
    }
    const requestsToday = await MeetingRequestLog.countDocuments({
      student: student._id,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (requestsToday >= MAX_REQUESTS_PER_DAY) {
      return res.status(429).json({
        message: `You can send at most ${MAX_REQUESTS_PER_DAY} meeting requests per 24 hours. Please try again later.`,
      });
    }

    const updated = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, status: "available" },
      {
        $set: {
          status: "requested",
          requestedBy: student._id,
          purpose: purpose?.trim() || null,
          requestedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "This slot is no longer available" });

    await MeetingRequestLog.create({ student: student._id, faculty: updated.faculty });

    const faculty = await Faculty.findById(updated.faculty, "name email");
    if (faculty) notifyMeeting("requested", { slot: updated, faculty, student });

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

export const cancelBooking = async (req, res) => {
  try {
    const { slotId, reason } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });
    if (reason && String(reason).length > 500) {
      return res.status(400).json({ message: "Reason must be 500 characters or fewer" });
    }

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const slot = await MeetingSlot.findOne({ _id: slotId, requestedBy: student._id });
    if (!slot) return res.status(404).json({ message: "Meeting not found" });
    if (slot.status !== "booked") {
      return res.status(409).json({ message: "Only a confirmed meeting can be cancelled" });
    }
    if (isSlotInPast(slot)) {
      return res.status(400).json({ message: "This meeting has already started" });
    }

    // Atomic: returns the pre-update doc so we still have the student's comment for the email.
    // The slot is freed (back to "available") so another student can take it.
    const before = await MeetingSlot.findOneAndUpdate(
      { _id: slotId, requestedBy: student._id, status: "booked" },
      {
        $set: { status: "available" },
        $unset: { requestedBy: "", purpose: "", requestedAt: "", approvedAt: "" },
      },
      { new: false }
    );
    if (!before) return res.status(409).json({ message: "This meeting can no longer be cancelled" });

    const faculty = await Faculty.findById(before.faculty, "name email");
    if (faculty) notifyMeeting("cancelled", { slot: before, faculty, student, cancelledBy: "student", reason });

    return res.json({ message: "Meeting cancelled" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error cancelling meeting" });
  }
};

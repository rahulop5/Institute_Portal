import Faculty from "../models/Faculty.js";
import Student from "../models/feedback/Student.js";
import BTP from "../models/BTP.js";
import Honors from "../models/Honors.js";
import AP from "../models/AP.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import APRegistration from "../models/APRegistration.js";
import BTPTopic from "../models/BTPTopic.js";
import HonorsTopic from "../models/HonorsTopic.js";
import BTPRegistration from "../models/BTPRegistration.js";
import HonorsRegistration from "../models/HonorsRegistration.js";
import ProgramChangeRequest from "../models/ProgramChangeRequest.js";
import { clearOpenRequests } from "./topicProposalController.js";
import { notifyEnrollment } from "../utils/programMailer.js";

// A student's BTP / Honors topic request, once the faculty member accepts it,
// is not a project yet: it goes to UG Projects, then the Assistant Dean, and
// only their approval creates the project. The request lives in
// ProgramChangeRequest (type "enrollment") so the same review queues handle it.

// Thrown inside the approval transaction for problems the caller should see
// as a 400 rather than a server error.
export class RequestError extends Error {}

const KINDS = {
  btp: { label: "BTP", model: "BTP", Project: BTP, Topic: BTPTopic, Registration: BTPRegistration, OtherRegistration: HonorsRegistration, otherLabel: "an Honors" },
  honors: { label: "Honors", model: "Honors", Project: Honors, Topic: HonorsTopic, Registration: HonorsRegistration, OtherRegistration: BTPRegistration, otherLabel: "a BTP" },
};

export const ENROLLMENT_OPEN = ["pending_ugprojects", "pending_assistantdean"];
// Where an approval moves an enrollment from each stage.
export const ENROLLMENT_NEXT = { pending_ugprojects: "pending_assistantdean", pending_assistantdean: "approved" };

const DEFAULT_EVALUATION_CONFIG = [{ maxMarks: 50 }, { maxMarks: 50 }];

function validateEvaluationConfig(evaluationConfig) {
  if (evaluationConfig === undefined) return DEFAULT_EVALUATION_CONFIG;
  if (!Array.isArray(evaluationConfig) || evaluationConfig.length === 0) return null;
  for (const slot of evaluationConfig) {
    if (typeof slot?.maxMarks !== "number" || slot.maxMarks <= 0) return null;
  }
  return evaluationConfig.map((slot) => ({ maxMarks: slot.maxMarks }));
}

// A student can have one request under review for BTP / Honors (they exclude
// each other) and, separately, one for an Additional Project.
export const findOpenEnrollment = (studentId, programs = ["btp", "honors"]) =>
  ProgramChangeRequest.findOne({ student: studentId, type: "enrollment", program: { $in: programs }, status: { $in: ENROLLMENT_OPEN } });

// What a student's topic page shows about their request under review: the
// open one, or the latest rejection (with who rejected it and why).
export async function reviewFor(studentId, programs = ["btp", "honors"]) {
  const format = async (request) => {
    if (!request) return null;
    await request.populate("guide", "name");
    return {
      _id: request._id,
      status: request.status,
      program: request.program,
      topicName: request.enrollment?.topicName,
      facultyName: request.guide?.name,
      history: request.history.map((h) => ({ role: h.role, action: h.action, remark: h.remark, at: h.at })),
    };
  };
  const open = await format(await findOpenEnrollment(studentId, programs));
  if (open) return { open, rejected: null };
  const since = new Date(Date.now() - 14 * 24 * 3600 * 1000);
  const rejected = await ProgramChangeRequest.findOne({ student: studentId, type: "enrollment", program: { $in: programs }, status: "rejected", updatedAt: { $gte: since } }).sort({ updatedAt: -1 });
  return { open: null, rejected: await format(rejected) };
}

// Faculty "Accept": sends the student's request on for approval instead of
// creating the project directly.
export const forwardTopicRequest = (program) => async (req, res) => {
  const K = KINDS[program];
  try {
    const { studentId, topicId, evaluationConfig: rawEvaluationConfig } = req.body; // studentId is the Student _id
    if (!studentId || !topicId) return res.status(400).json({ message: "Student and topic required" });

    const evaluationConfig = validateEvaluationConfig(rawEvaluationConfig);
    if (!evaluationConfig) {
      return res.status(400).json({ message: "Invalid evaluation config - each entry needs a positive maxMarks" });
    }

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const topicDoc = await K.Topic.findOne({ faculty: fac._id, "topics._id": topicId });
    if (!topicDoc) return res.status(400).json({ message: "Topic not found" });
    const topicSub = topicDoc.topics.id(topicId);

    const studentReg = await K.Registration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    const request = topicDoc.requests.find((r) => r.student.equals(studentReg._id) && r.topic.equals(topicId));
    if (!request) return res.status(400).json({ message: "Request not found" });
    if (request.forwarded) return res.status(400).json({ message: "This request has already been sent for approval" });
    if (studentReg.project) return res.status(400).json({ message: "Student already in a project" });

    const other = await K.OtherRegistration.findOne({ student: studentReg.student, project: { $ne: null } });
    if (other) {
      return res.status(400).json({ message: `Student is already enrolled in ${K.otherLabel} project. Cannot approve for ${K.label}.` });
    }
    if (await findOpenEnrollment(studentReg.student)) {
      return res.status(400).json({ message: "This student already has a request under review with another faculty member" });
    }

    const student = await Student.findById(studentReg.student);
    await ProgramChangeRequest.create({
      student: studentReg.student,
      program,
      type: "enrollment",
      guide: fac._id,
      reason: request.message || "Topic request",
      enrollment: {
        topicDoc: topicDoc._id,
        topicId,
        topicName: topicSub.topic,
        topicAbout: topicSub.about,
        message: request.message || "",
        proposed: !!topicSub.proposedBy,
        evaluationConfig,
      },
      status: "pending_ugprojects",
      history: [
        { role: "Student", email: student.email, action: "submitted", remark: request.message || undefined },
        { role: "Faculty", email: req.user.email, action: "approved" },
      ],
    });

    request.forwarded = true;
    await topicDoc.save();
    const registered = studentReg.requests.find((r) => r.topic.equals(topicDoc._id) && r.subTopicId.equals(topicId));
    if (registered) registered.status = "UnderReview";
    await studentReg.save();

    return res.status(200).json({ message: "Sent to UG Projects for approval" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error sending request for approval" });
  }
};

// Final approval: the project is created and the student and faculty
// member's pages follow. Runs inside the approval transaction.
export async function applyEnrollment(request, session) {
  if (request.program === "ap") return applyAPEnrollment(request, session);
  const K = KINDS[request.program];
  const e = request.enrollment;

  const registration = await K.Registration.findOne({ student: request.student }).session(session);
  if (!registration) throw new RequestError("Student record not found");
  if (registration.project) throw new RequestError("The student is already in a project");
  if (await K.OtherRegistration.findOne({ student: request.student, project: { $ne: null } }).session(session)) {
    throw new RequestError(`The student is already enrolled in ${K.otherLabel} project`);
  }
  const student = await Student.findById(request.student).session(session);

  const [project] = await K.Project.create(
    [
      {
        name: e.topicName,
        about: e.topicAbout,
        studentbatch: student?.batch || "2025",
        students: [{ student: registration._id }],
        guide: request.guide,
        status: "active",
        evaluationConfig: e.evaluationConfig.map((slot) => ({ maxMarks: slot.maxMarks })),
      },
    ],
    { session }
  );

  registration.project = project._id;
  registration.requests = [];
  await registration.save({ session });
  // Clears this request and any other pending ones (including the proposal
  // this project came from) from every faculty member's list.
  await clearOpenRequests(K.Topic, registration._id, session);
}

// A request that ended without a project: take it off the faculty member's
// Requests tab. A rejected one stays on the student's list as "Not accepted";
// a withdrawn one disappears entirely (including their own proposal).
export async function closeEnrollment(request, outcome) {
  if (request.program === "ap") return closeAPEnrollment(request, outcome);
  const K = KINDS[request.program];
  const e = request.enrollment || {};
  const registration = await K.Registration.findOne({ student: request.student });
  const topicDoc = await K.Topic.findById(e.topicDoc);
  if (topicDoc && registration) {
    topicDoc.requests = topicDoc.requests.filter((r) => !(r.student.equals(registration._id) && r.topic.equals(e.topicId)));
    const own = topicDoc.topics.id(e.topicId);
    if (outcome === "withdrawn" && own?.proposedBy?.equals(registration._id)) own.deleteOne();
    await topicDoc.save();
  }
  if (registration) {
    const entry = registration.requests.find((r) => r.topic.equals(e.topicDoc) && r.subTopicId.equals(e.topicId));
    if (entry) {
      if (outcome === "withdrawn") registration.requests = registration.requests.filter((r) => r !== entry);
      else entry.status = "Rejected";
      await registration.save();
    }
  }
}


// ---------- Additional Project ----------
// Same path as BTP / Honors, but the "topic" is the student's own proposal
// to a faculty member (APFacultyRequest / APRegistration).

export const forwardAPRequest = async (req, res) => {
  try {
    const { studentId, evaluationConfig: rawEvaluationConfig } = req.body; // studentId is the Student _id
    if (!studentId) return res.status(400).json({ message: "Student ID required" });
    const evaluationConfig = validateEvaluationConfig(rawEvaluationConfig);
    if (!evaluationConfig) {
      return res.status(400).json({ message: "Invalid evaluation config - each entry needs a positive maxMarks" });
    }

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });
    const facReqDoc = await APFacultyRequest.findOne({ faculty: fac._id });
    if (!facReqDoc) return res.status(400).json({ message: "No requests found" });
    const studentReg = await APRegistration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    const request = facReqDoc.requests.find((r) => r.student.equals(studentReg._id));
    if (!request) return res.status(400).json({ message: "Request not found" });
    if (request.forwarded) return res.status(400).json({ message: "This request has already been sent for approval" });
    if (studentReg.project) return res.status(400).json({ message: "Student already in an Additional Project" });
    if (await findOpenEnrollment(studentReg.student, ["ap"])) {
      return res.status(400).json({ message: "This student already has a request under review with another faculty member" });
    }

    const student = await Student.findById(studentReg.student);
    await ProgramChangeRequest.create({
      student: studentReg.student,
      program: "ap",
      type: "enrollment",
      guide: fac._id,
      reason: request.proposalText,
      enrollment: { topicName: request.proposalTitle, topicAbout: request.proposalText, message: "", proposed: true, evaluationConfig },
      status: "pending_ugprojects",
      history: [
        { role: "Student", email: student.email, action: "submitted" },
        { role: "Faculty", email: req.user.email, action: "approved" },
      ],
    });

    request.forwarded = true;
    await facReqDoc.save();
    const registered = studentReg.requests.find((r) => r.faculty.equals(fac._id));
    if (registered) registered.status = "UnderReview";
    await studentReg.save();

    return res.status(200).json({ message: "Sent to UG Projects for approval" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error sending request for approval" });
  }
};

async function applyAPEnrollment(request, session) {
  const e = request.enrollment;
  const registration = await APRegistration.findOne({ student: request.student }).session(session);
  if (!registration) throw new RequestError("Student record not found");
  if (registration.project) throw new RequestError("The student is already in an Additional Project");
  const student = await Student.findById(request.student).session(session);

  const [project] = await AP.create(
    [
      {
        name: e.topicName,
        about: e.topicAbout,
        studentbatch: student?.batch || "2025",
        students: [{ student: registration._id }],
        guide: request.guide,
        status: "active",
        evaluationConfig: e.evaluationConfig.map((slot) => ({ maxMarks: slot.maxMarks })),
      },
    ],
    { session }
  );
  registration.project = project._id;
  registration.requests = [];
  await registration.save({ session });
  // Their other proposals to other faculty members are no longer needed.
  await APFacultyRequest.updateMany({ "requests.student": registration._id }, { $pull: { requests: { student: registration._id } } }, { session });
}

async function closeAPEnrollment(request, outcome) {
  const registration = await APRegistration.findOne({ student: request.student });
  if (!registration) return;
  await APFacultyRequest.updateOne({ faculty: request.guide }, { $pull: { requests: { student: registration._id } } });
  const entry = registration.requests.find((r) => r.faculty.equals(request.guide));
  if (entry) {
    if (outcome === "withdrawn") registration.requests = registration.requests.filter((r) => r !== entry);
    else entry.status = "Rejected";
    await registration.save();
  }
}

// Email both sides once the outcome is final.
export const notifyOutcome = (request, outcome, extra) => notifyEnrollment(request, outcome, extra).catch((err) => console.error("Notification failed:", err.message));

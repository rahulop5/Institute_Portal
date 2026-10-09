import { projectStartSemester, studentSemesterOn, startWindowProblem } from "../utils/semesterUtils.js";
import mongoose from "mongoose";
import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";
import BTP from "../models/BTP.js";
import Honors from "../models/Honors.js";
import BTPRegistration from "../models/BTPRegistration.js";
import HonorsRegistration from "../models/HonorsRegistration.js";
import APRegistration from "../models/APRegistration.js";
import BTPEvaluation from "../models/BTPEvaluation.js";
import HonorsEvaluation from "../models/HonorsEvaluation.js";
import ProgramChangeRequest from "../models/ProgramChangeRequest.js";

const PROGRAMS = {
  btp: { label: "BTP", model: "BTP", Project: BTP, Registration: BTPRegistration, Evaluation: BTPEvaluation, semesters: 2, credits: 4 },
  honors: { label: "Honors", model: "Honors", Project: Honors, Registration: HonorsRegistration, Evaluation: HonorsEvaluation, semesters: 4, credits: 8 },
};
const OTHER_PROGRAM = { btp: "honors", honors: "btp" };
const DEFAULT_EVALUATION_CONFIG = [{ maxMarks: 50 }, { maxMarks: 50 }];

const OPEN_STATUSES = ["pending_ugprojects", "pending_assistantdean", "pending_faculty"];
// Who each open status is waiting on, and where an approval moves it next.
const STAGES = {
  pending_ugprojects: { role: "UGProjects", next: "pending_assistantdean" },
  pending_assistantdean: { role: "AssistantDean", next: "pending_faculty" },
  pending_faculty: { role: "Faculty", next: "approved" },
};

// Thrown inside the approval transaction for problems the caller should see
// as a 400 rather than a server error.
class RequestError extends Error {}

const GUIDE_CHANGE_REASON = "Current guide is no longer available on campus";

// Updates a project's topic and records who changed it.
function setTopic(project, name, about, actor) {
  project.name = name;
  project.about = about || "";
  project.topicHistory.push({ name, about: about || "", role: actor.role, email: actor.email, at: new Date() });
}

function evaluationsPerSemester(project) {
  return (project.evaluationConfig?.length ? project.evaluationConfig : DEFAULT_EVALUATION_CONFIG).length;
}

// Every program the student currently has a project in - at most one, since
// BTP and Honors are mutually exclusive (enforced on topic approval).
async function findEnrollments(studentId) {
  const enrollments = [];
  for (const program of Object.keys(PROGRAMS)) {
    const registration = await PROGRAMS[program].Registration.findOne({ student: studentId }).populate({
      path: "project",
      populate: { path: "guide", select: "name email" },
    });
    if (registration?.project) enrollments.push({ program, registration, project: registration.project });
  }
  return enrollments;
}

// The student's semester context for a project: the semester it started in
// and the one they're in now (both null if their batch is unknown).
async function semesterContext(student, program, project) {
  const evaluations = await PROGRAMS[program].Evaluation.find({ projectRef: project._id }, "time");
  return {
    startSemester: projectStartSemester(student.batch, project, evaluations),
    currentSemester: studentSemesterOn(student.batch, new Date()),
  };
}

// What the student may request, and why not when they can't. A switch that
// continues the project keeps its original start semester, so the other
// program must be allowed to start then; a fresh start begins now.
function requestOptions(program, project, { startSemester, currentSemester }) {
  const target = OTHER_PROGRAM[program];
  const targetLabel = PROGRAMS[target].label;
  // A finished BTP can still be extended into Honors.
  const switchable = project.status === "active" || (program === "btp" && project.status === "completed");
  const closed = `Not available for a completed ${PROGRAMS[program].label} project.`;

  const continueProblem = !switchable
    ? closed
    : startWindowProblem(target, startSemester) &&
      `${startWindowProblem(target, startSemester)} Your ${PROGRAMS[program].label} started in Semester ${startSemester}.`;
  const freshProblem = !switchable
    ? closed
    : startWindowProblem(target, currentSemester) &&
      `A new ${targetLabel} topic would start now. ${startWindowProblem(target, currentSemester)} You are in Semester ${currentSemester}.`;

  return {
    allowed: {
      drop: project.status === "active",
      switch: !continueProblem || !freshProblem,
      // Only when the current guide has left the institute.
      guide_change: project.status === "active",
    },
    switchModes: { continue: !continueProblem, fresh: !freshProblem },
    reasons: {
      drop: project.status === "active" ? null : closed,
      switch: continueProblem && freshProblem ? continueProblem : null,
      continue: continueProblem || null,
      fresh: freshProblem || null,
      guide_change: project.status === "active" ? null : closed,
    },
  };
}

function programSummary(program) {
  const { label, credits, semesters } = PROGRAMS[program];
  return { program, label, credits, semesters };
}

function formatRequest(request) {
  return {
    _id: request._id,
    program: request.program,
    programLabel: PROGRAMS[request.program].label,
    targetLabel: request.type === "switch" ? PROGRAMS[OTHER_PROGRAM[request.program]].label : null,
    newGuide: request.newGuide ? { name: request.newGuide.name, email: request.newGuide.email } : null,
    newTopic: request.newTopic?.name ? { name: request.newTopic.name, about: request.newTopic.about } : null,
    type: request.type,
    switchMode: request.switchMode || null,
    reason: request.reason,
    status: request.status,
    history: request.history,
    createdAt: request.createdAt,
    student: request.student
      ? { name: request.student.name, email: request.student.email, rollNumber: request.student.rollNumber }
      : null,
    guide: request.guide ? { name: request.guide.name, email: request.guide.email } : null,
    project: request.project ? { name: request.project.name } : null,
  };
}

function populateRequest(query) {
  return query
    .populate("student", "name email rollNumber")
    .populate("guide", "name email")
    .populate("newGuide", "name email")
    .populate("project", "name evaluationConfig");
}

// The project's evaluation rounds, oldest first. Marks are only included once
// released to the student, matching what the BTP/Honors pages show.
async function evaluationsFor(program, projectId) {
  const evaluations = await PROGRAMS[program].Evaluation.find({ projectRef: projectId }).sort({ time: 1 });
  return evaluations.map((ev) => {
    const entry = ev.marksgiven?.[0];
    const marks = ev.canstudentsee ? Number(entry?.totalgrade ?? entry?.guidemarks) : NaN;
    return {
      time: ev.time,
      maxMarks: ev.maxMarks ?? 50,
      released: ev.canstudentsee,
      marks: Number.isFinite(marks) ? marks : null,
    };
  });
}

// Reviewers see how far the project has got, so they know what a switch
// would carry over.
async function withEvaluationSummary(request) {
  return {
    ...formatRequest(request),
    evaluations: {
      done: request.project ? await PROGRAMS[request.program].Evaluation.countDocuments({ projectRef: request.project._id }) : 0,
      perSemester: request.project ? evaluationsPerSemester(request.project) : DEFAULT_EVALUATION_CONFIG.length,
    },
  };
}

// ---------- Student ----------

export const getStudentProgramChange = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const enrollments = await findEnrollments(student._id);
    const requests = await populateRequest(ProgramChangeRequest.find({ student: student._id }).sort({ createdAt: -1 }));
    const openRequests = requests.filter((r) => OPEN_STATUSES.includes(r.status));
    // Topic changes wait on the guide alongside any other request.
    const isTopicChange = (r) => r.type === "topic_change";

    const programs = await Promise.all(
      enrollments.map(async ({ program, project }) => {
        const openRequest = openRequests.find((r) => r.program === program && !isTopicChange(r));
        const pendingTopicChange = openRequests.find((r) => r.program === program && isTopicChange(r));
        return {
          ...programSummary(program),
          target: programSummary(OTHER_PROGRAM[program]),
          project: { _id: project._id, name: project.name, about: project.about, status: project.status },
          guide: project.guide ? { name: project.guide.name, email: project.guide.email } : null,
          evaluationsPerSemester: evaluationsPerSemester(project),
          evaluations: await evaluationsFor(program, project._id),
          ...(await (async () => {
            const context = await semesterContext(student, program, project);
            return { ...context, ...requestOptions(program, project, context) };
          })()),
          openRequest: openRequest ? formatRequest(openRequest) : null,
          pendingTopicChange: pendingTopicChange ? formatRequest(pendingTopicChange) : null,
        };
      })
    );

    return res.status(200).json({
      programs,
      pastRequests: requests.filter((r) => !openRequests.includes(r)).map(formatRequest),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading program change details" });
  }
};

export const createProgramChangeRequest = async (req, res) => {
  try {
    const { program, type, switchMode, newGuideId, newTopic } = req.body;
    // A guide change always has the same reason, so the student doesn't type one.
    const reason = type === "guide_change" ? GUIDE_CHANGE_REASON : req.body.reason;
    if (!PROGRAMS[program]) return res.status(400).json({ message: "Choose BTP or Honors" });
    if (!["drop", "switch", "guide_change"].includes(type)) return res.status(400).json({ message: "Choose a change to request" });
    if (type === "switch" && !["continue", "fresh"].includes(switchMode)) {
      return res.status(400).json({ message: "Choose whether to continue your project or start fresh" });
    }
    if (type === "guide_change" && newTopic && !newTopic.name?.trim()) {
      return res.status(400).json({ message: "Enter a title for the new topic" });
    }
    if (!reason?.trim()) return res.status(400).json({ message: "A reason is required" });

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { label } = PROGRAMS[program];
    const enrollment = (await findEnrollments(student._id)).find((e) => e.program === program);
    if (!enrollment) return res.status(400).json({ message: `You are not on a ${label} project` });

    const open = await ProgramChangeRequest.findOne({
      student: student._id,
      program,
      type: { $ne: "topic_change" },
      status: { $in: OPEN_STATUSES },
    });
    if (open) return res.status(400).json({ message: `You already have an open ${label} request` });

    const { project } = enrollment;
    const options = requestOptions(program, project, await semesterContext(student, program, project));
    if (!options.allowed[type]) {
      return res.status(400).json({ message: options.reasons[type] || `This change isn't available for your ${label} project` });
    }
    if (type === "switch" && !options.switchModes[switchMode]) {
      return res.status(400).json({ message: options.reasons[switchMode] });
    }

    let newGuide = null;
    if (type === "guide_change") {
      newGuide = await Faculty.findById(newGuideId);
      if (!newGuide) return res.status(400).json({ message: "Choose a faculty member to propose as your new guide" });
      if (newGuide._id.equals(project.guide._id)) return res.status(400).json({ message: "Choose a different faculty member from your current guide" });
    }

    const request = await ProgramChangeRequest.create({
      student: student._id,
      program,
      type,
      switchMode: type === "switch" ? switchMode : undefined,
      project: project._id,
      projectModel: PROGRAMS[program].model,
      guide: project.guide._id,
      newGuide: newGuide?._id,
      newTopic: type === "guide_change" && newTopic ? { name: newTopic.name.trim(), about: newTopic.about?.trim() } : undefined,
      reason: reason.trim(),
      history: [{ role: "Student", email: req.user.email, action: "submitted" }],
    });

    return res.status(201).json({ message: "Request submitted to UG Projects", requestId: request._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error submitting request" });
  }
};

export const withdrawProgramChangeRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: "Request ID required" });

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const request = await ProgramChangeRequest.findOneAndUpdate(
      { _id: requestId, student: student._id, status: { $in: OPEN_STATUSES } },
      {
        $set: { status: "withdrawn" },
        $push: { history: { role: "Student", email: req.user.email, action: "withdrawn" } },
      }
    );
    if (!request) return res.status(400).json({ message: "No open request to withdraw" });

    return res.status(200).json({ message: "Request withdrawn" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error withdrawing request" });
  }
};

// ---------- Reviewers (UG Projects, Assistant Dean, Faculty) ----------

// stage: the open status this reviewer acts on. Faculty see requests for
// projects they guide, and guide changes that propose them as the new guide.
export const listForReviewer = (stage) => async (req, res) => {
  try {
    const { role } = STAGES[stage];
    const scope = {};
    if (role === "Faculty") {
      const faculty = await Faculty.findOne({ email: req.user.email });
      if (!faculty) return res.status(404).json({ message: "Faculty not found" });
      scope.$or = [
        { type: { $ne: "guide_change" }, guide: faculty._id },
        { type: "guide_change", newGuide: faculty._id },
      ];
    }

    const [pending, history] = await Promise.all([
      populateRequest(ProgramChangeRequest.find({ ...scope, status: stage }).sort({ createdAt: 1 })),
      populateRequest(
        ProgramChangeRequest.find({ ...scope, "history.role": role, status: { $ne: stage } }).sort({ updatedAt: -1 })
      ),
    ]);

    return res.status(200).json({
      pending: await Promise.all(pending.map(withEvaluationSummary)),
      history: history.map(formatRequest),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading requests" });
  }
};

export const decideForReviewer = (stage) => async (req, res) => {
  const { role, next } = STAGES[stage];
  const { requestId, decision, remark } = req.body;
  if (!requestId) return res.status(400).json({ message: "Request ID required" });
  if (!["approve", "reject"].includes(decision)) return res.status(400).json({ message: "Decision must be approve or reject" });
  if (decision === "reject" && !remark?.trim()) return res.status(400).json({ message: "A reason is required to reject" });

  const entry = {
    role,
    email: req.user.email,
    action: decision === "approve" ? "approved" : "rejected",
    remark: remark?.trim() || undefined,
  };
  const update = { $set: { status: decision === "approve" ? next : "rejected" }, $push: { history: entry } };

  try {
    const request = await ProgramChangeRequest.findById(requestId).populate("guide", "email").populate("newGuide", "email");
    if (!request) return res.status(404).json({ message: "Request not found" });
    // A guide change is decided by the proposed new guide, everything else by the current one.
    const decider = request.type === "guide_change" ? request.newGuide : request.guide;
    if (role === "Faculty" && decider?.email !== req.user.email) {
      return res.status(403).json({ message: "Only the faculty member this request is addressed to can decide it" });
    }

    // Matching on the expected status makes a double click or a second
    // reviewer acting on the same request a no-op instead of a double move.
    if (decision === "reject" || next !== "approved") {
      const updated = await ProgramChangeRequest.findOneAndUpdate({ _id: requestId, status: stage }, update);
      if (!updated) return res.status(400).json({ message: "This request is no longer waiting on you" });
      return res.status(200).json({ message: decision === "approve" ? "Request approved and forwarded" : "Request rejected" });
    }

    // Final approval: the request and the project change land together.
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const updated = await ProgramChangeRequest.findOneAndUpdate({ _id: requestId, status: stage }, update, { session });
        if (!updated) throw new RequestError("This request is no longer waiting on you");
        await applyRequest(updated, session);
      });
    } finally {
      await session.endSession();
    }
    return res.status(200).json({ message: "Request approved and applied" });
  } catch (err) {
    if (err instanceof RequestError) return res.status(400).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Error deciding request" });
  }
};

// ---------- Applying an approved request ----------

async function applyRequest(request, session) {
  const from = PROGRAMS[request.program];
  const project = await from.Project.findById(request.project).session(session);
  if (!project || !["active", "completed"].includes(project.status)) {
    throw new RequestError(`This ${from.label} project is no longer open`);
  }
  if (request.type === "topic_change") {
    if (project.status !== "active") throw new RequestError(`This ${from.label} project is no longer active`);
    const student = await Student.findById(request.student).session(session);
    setTopic(project, request.newTopic.name, request.newTopic.about, { role: "Student", email: student.email });
    await project.save({ session });
    return;
  }
  if (request.type === "guide_change") {
    // Same project, new guide - every evaluation so far keeps counting.
    project.guide = request.newGuide;
    project.evaluators = project.evaluators.filter((e) => !e.evaluator.equals(request.newGuide));
    if (request.newTopic?.name) {
      const newGuide = await Faculty.findById(request.newGuide).session(session);
      setTopic(project, request.newTopic.name, request.newTopic.about, { role: "Faculty", email: newGuide.email });
    }
    await project.save({ session });
    return;
  }

  const registration = await from.Registration.findOne({ student: request.student }).session(session);

  if (request.type === "switch" && request.switchMode === "continue") {
    await carryProjectOver(request, project, registration, session);
  }

  // Marks stay in the database for now - what to do with a dropped
  // student's marks is still to be decided.
  project.status = request.type === "drop" ? "dropped" : "switched";
  await project.save({ session });
  if (registration) {
    registration.project = null;
    await registration.save({ session });
  }
}

// Recreates the project in the other program with the same topic, guide and
// evaluators, carrying over evaluations that fit the new program's length -
// all of them for BTP -> Honors, only Sem 1-2 for Honors -> BTP.
async function carryProjectOver(request, project, fromRegistration, session) {
  const to = PROGRAMS[OTHER_PROGRAM[request.program]];
  const from = PROGRAMS[request.program];

  let toRegistration = await to.Registration.findOne({ student: request.student }).session(session);
  if (toRegistration?.project) throw new RequestError(`Student already has a ${to.label} project`);
  if (!toRegistration) {
    [toRegistration] = await to.Registration.create([{ student: request.student }], { session });
  }

  const [newProject] = await to.Project.create(
    [
      {
        name: project.name,
        about: project.about,
        studentbatch: project.studentbatch,
        students: [{ student: toRegistration._id }],
        guide: project.guide,
        evaluators: project.evaluators.map((e) => ({ evaluator: e.evaluator })),
        updates: project.updates.map((u) => ({ update: u.update, remark: u.remark, time: u.time })),
        topicHistory: project.topicHistory.map((t) => ({ name: t.name, about: t.about, role: t.role, email: t.email, at: t.at })),
        status: "active",
        evaluationConfig: (project.evaluationConfig?.length ? project.evaluationConfig : DEFAULT_EVALUATION_CONFIG).map(
          (slot) => ({ maxMarks: slot.maxMarks })
        ),
      },
    ],
    { session }
  );
  toRegistration.project = newProject._id;
  await toRegistration.save({ session });

  const keep = evaluationsPerSemester(project) * to.semesters;
  const evaluations = (await from.Evaluation.find({ projectRef: project._id }).sort({ time: 1 }).session(session)).slice(0, keep);
  // Marks reference the student's registration, which differs per program.
  const studentRef = (id) => (fromRegistration && id.equals(fromRegistration._id) ? toRegistration._id : id);

  if (evaluations.length) {
    await to.Evaluation.insertMany(
      evaluations.map((ev) => ({
        projectRef: newProject._id,
        time: ev.time,
        canstudentsee: ev.canstudentsee,
        remark: ev.remark,
        maxMarks: ev.maxMarks,
        resources: ev.resources.map((r) => ({ resourceURL: r.resourceURL })),
        marksgiven: ev.marksgiven.map((m) => ({ student: studentRef(m.student), guidemarks: m.guidemarks, totalgrade: m.totalgrade })),
        panelEvaluations: ev.panelEvaluations.map((pe) => ({
          evaluator: pe.evaluator,
          submitted: pe.submitted,
          submittedAt: pe.submittedAt,
          remark: pe.remark,
          panelmarks: pe.panelmarks.map((pm) => ({ student: studentRef(pm.student), marks: pm.marks })),
        })),
      })),
      { session }
    );
  }
}

// ---------- Topic edits (no approval needed) ----------

// A topic change is agreed between student and guide, so the student, the
// guide or UG Projects can update it directly. The project and its
// evaluations stay the same.
function validTopic(body) {
  const name = body.name?.trim();
  if (!name) return null;
  return { name, about: body.about?.trim() || "" };
}

// A student's topic edit goes to their guide, who approves it before it
// takes effect (see applyRequest). Guides and UG Projects edit directly.
export const updateTopicAsStudent = async (req, res) => {
  try {
    const topic = validTopic(req.body);
    if (!topic) return res.status(400).json({ message: "Enter a topic title" });
    if (!PROGRAMS[req.body.program]) return res.status(400).json({ message: "Choose BTP or Honors" });

    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const enrollment = (await findEnrollments(student._id)).find((e) => e.program === req.body.program);
    if (!enrollment || enrollment.project.status !== "active") {
      return res.status(400).json({ message: "You don't have an active project to update" });
    }
    const { project } = enrollment;
    if (topic.name === project.name && topic.about === (project.about || "")) {
      return res.status(400).json({ message: "That is already your topic" });
    }

    const waiting = await ProgramChangeRequest.findOne({
      student: student._id,
      program: req.body.program,
      type: "topic_change",
      status: { $in: OPEN_STATUSES },
    });
    if (waiting) return res.status(400).json({ message: "Your guide hasn't responded to your last topic change yet" });

    await ProgramChangeRequest.create({
      student: student._id,
      program: req.body.program,
      type: "topic_change",
      project: project._id,
      projectModel: PROGRAMS[req.body.program].model,
      guide: project.guide._id,
      newTopic: topic,
      reason: "Topic change",
      status: "pending_faculty",
      history: [{ role: "Student", email: req.user.email, action: "submitted" }],
    });
    return res.status(201).json({ message: "Sent to your guide for approval" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error requesting topic change" });
  }
};

// role: "Faculty" (only for projects they guide) or "UGProjects" (any project).
export const updateTopicAsStaff = (role) => async (req, res) => {
  try {
    const topic = validTopic(req.body);
    if (!topic) return res.status(400).json({ message: "Enter a topic title" });
    const config = Object.values(PROGRAMS).find((p) => p.model === req.body.projectModel);
    if (!config || !req.body.projectId) return res.status(400).json({ message: "Project required" });

    const project = await config.Project.findById(req.body.projectId).populate("guide", "email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (role === "Faculty" && project.guide?.email !== req.user.email) {
      return res.status(403).json({ message: "Only the project's guide can update its topic" });
    }
    if (project.status !== "active") return res.status(400).json({ message: "Only active projects can be updated" });

    setTopic(project, topic.name, topic.about, { role, email: req.user.email });
    await project.save();
    return res.status(200).json({ message: "Topic updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating topic" });
  }
};

// Every active BTP/Honors project, for UG Projects to look up students and
// edit topics.
export const listProjectsForUGProjects = async (req, res) => {
  try {
    const rows = [];
    for (const [program, config] of Object.entries(PROGRAMS)) {
      const projects = await config.Project.find({ status: "active" })
        .populate("guide", "name email")
        .populate({ path: "students.student", populate: { path: "student", select: "name email rollNumber" } });
      for (const project of projects) {
        const student = project.students[0]?.student?.student;
        rows.push({
          _id: project._id,
          program,
          programLabel: config.label,
          projectModel: config.model,
          name: project.name,
          about: project.about,
          guide: project.guide ? { name: project.guide.name, email: project.guide.email } : null,
          student: student ? { name: student.name, email: student.email, rollNumber: student.rollNumber } : null,
          lastTopicChange: project.topicHistory.at(-1) || null,
        });
      }
    }
    rows.sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));
    return res.status(200).json({ projects: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading projects" });
  }
};

// Which of BTP / Honors the student currently has a project in (null if
// neither), so the sidebar can hide the program they're not part of.
export const getStudentEnrollment = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.user.email });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const [enrollment] = await findEnrollments(student._id);
    // Semester and AP status let the sidebar hide programs the student
    // can't take yet (AP before Semester 5, BTP/Honors before Semester 3).
    const ap = await APRegistration.findOne({ student: student._id, project: { $ne: null } });
    return res.status(200).json({
      program: enrollment?.program || null,
      semester: studentSemesterOn(student.batch, new Date()),
      hasAP: !!ap,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading enrollment" });
  }
};

// Faculty a student can propose as a new guide.
export const listFacultyForStudent = async (req, res) => {
  try {
    const faculty = await Faculty.find({}, "name email dept").sort({ name: 1 });
    return res.status(200).json({ faculty: faculty.map((f) => ({ _id: f._id, name: f.name, email: f.email, dept: f.dept })) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading faculty" });
  }
};

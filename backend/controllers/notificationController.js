// Sidebar badges: what is waiting for, or new to, the signed-in user. UI only -
// nothing here sends mail. Each item is an id per menu item; the browser keeps
// which ones the user has already seen (by opening that page) and shows the
// rest as the badge number.
//   Faculty, UG Projects, Assistant Dean: items waiting on them.
//   Students: decisions and released marks.
import Faculty from "../models/Faculty.js";
import Student from "../models/feedback/Student.js";
import BTP from "../models/BTP.js";
import Honors from "../models/Honors.js";
import AP from "../models/AP.js";
import BTPTopic from "../models/BTPTopic.js";
import HonorsTopic from "../models/HonorsTopic.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import BTPEvaluation from "../models/BTPEvaluation.js";
import HonorsEvaluation from "../models/HonorsEvaluation.js";
import APEvaluation from "../models/APEvaluation.js";
import BTPRegistration from "../models/BTPRegistration.js";
import HonorsRegistration from "../models/HonorsRegistration.js";
import APRegistration from "../models/APRegistration.js";
import ProgramChangeRequest from "../models/ProgramChangeRequest.js";

const PROGRAMS = {
  btp: { Project: BTP, Inbox: BTPTopic, Evaluation: BTPEvaluation, Registration: BTPRegistration },
  honors: { Project: Honors, Inbox: HonorsTopic, Evaluation: HonorsEvaluation, Registration: HonorsRegistration },
  ap: { Project: AP, Inbox: APFacultyRequest, Evaluation: APEvaluation, Registration: APRegistration },
};

// A faculty member's items in one program, by the tab they appear on:
//   requests   - student requests not yet sent for approval
//   guiding    - rounds ready to release, and projects they now guide
//   evaluating - rounds waiting for their marks, and projects they now evaluate
// Project ids start with "new:": they are news (a project approved or handed
// to them), not work, so they only count until the page is opened.
async function facultyItems(facultyId, { Project, Inbox, Evaluation }) {
  const [inbox, evaluating, guiding] = await Promise.all([
    Inbox.findOne({ faculty: facultyId }, "requests"),
    Project.find({ "evaluators.evaluator": facultyId, status: "active" }, "_id students"),
    Project.find({ guide: facultyId, status: "active" }, "_id students"),
  ]);
  const [toSubmit, toRelease] = await Promise.all([
    Evaluation.find({
      projectRef: { $in: evaluating.map((p) => p._id) },
      canstudentsee: false,
      panelEvaluations: { $elemMatch: { evaluator: facultyId, submitted: false } },
    }, "_id"),
    Evaluation.find({
      projectRef: { $in: guiding.map((p) => p._id) },
      canstudentsee: false,
      "panelEvaluations.submitted": { $ne: false },
    }, "_id"),
  ]);
  const requests = (inbox?.requests || []).filter((r) => !r.forwarded).map((r) => `request:${r.student}:${r.topic || ""}`);
  return {
    requests,
    // The team size is part of the id, so a teammate joining is news again.
    guiding: [...toRelease.map((e) => `release:${e._id}`), ...guiding.map((p) => `new:guiding:${p._id}:${p.students.length}`)],
    evaluating: [...toSubmit.map((e) => `submit:${e._id}`), ...evaluating.map((p) => `new:evaluating:${p._id}:${p.students.length}`)],
  };
}

// Same scope as the faculty member's Program Change "Pending" list.
const facultyProgramChanges = async (facultyId) =>
  (
    await ProgramChangeRequest.find(
      {
        status: "pending_faculty",
        $or: [
          { type: { $ne: "guide_change" }, guide: facultyId },
          { type: "guide_change", newGuide: facultyId },
        ],
      },
      "_id status"
    )
  ).map((r) => `change:${r._id}:${r.status}`);

async function forFaculty(email) {
  const faculty = await Faculty.findOne({ email }, "_id");
  if (!faculty) return { events: {} };
  const [btp, honors, ap, programchange] = await Promise.all([
    facultyItems(faculty._id, PROGRAMS.btp),
    facultyItems(faculty._id, PROGRAMS.honors),
    facultyItems(faculty._id, PROGRAMS.ap),
    facultyProgramChanges(faculty._id),
  ]);
  const all = (tabs) => Object.values(tabs).flat();
  return {
    events: { btp: all(btp), honors: all(honors), ap: all(ap), programchange },
    // The same items per tab, for the dots on the faculty's program pages.
    tabs: { btp, honors, ap },
  };
}

// UG Projects and the Assistant Dean: their two review queues.
async function forReviewer(stage) {
  const waiting = await ProgramChangeRequest.find({ status: stage }, "_id type");
  const ids = (list) => list.map((r) => `${r._id}:${stage}`);
  return {
    events: {
      changes: ids(waiting.filter((r) => !["enrollment", "team_add"].includes(r.type))),
      assignments: ids(waiting.filter((r) => ["enrollment", "team_add"].includes(r.type))),
    },
  };
}

// A student's news in one program: the outcome of each request sent for
// approval, requests a faculty member turned down, and released marks.
async function studentEvents(studentId, program, decided) {
  const { Registration, Evaluation } = PROGRAMS[program];
  const ids = decided.filter((r) => r.program === program).map((r) => `enrollment:${r._id}:${r.status}`);
  const registration = await Registration.findOne({ student: studentId });
  if (!registration) return ids;

  // A reviewer's rejection also marks the student's request "Rejected"; it is
  // already counted above, so only the faculty member's own rejections remain.
  const reviewed = new Set(
    decided.filter((r) => r.program === program).map((r) => String(program === "ap" ? r.guide : r.enrollment?.topicId))
  );
  for (const request of registration.requests) {
    if (request.status !== "Rejected") continue;
    const key = String(program === "ap" ? request.faculty : request.subTopicId);
    if (!reviewed.has(key)) ids.push(`rejected:${key}`);
  }
  if (registration.project) {
    // Keyed by the round's date, not its id: a BTP -> Honors switch copies
    // rounds (new ids, same dates), and those aren't new marks.
    const released = await Evaluation.find({ projectRef: registration.project, canstudentsee: true }, "time");
    ids.push(...released.map((ev) => `marks:${new Date(ev.time).getTime()}`));
  }
  return ids;
}

async function forStudent(email) {
  const student = await Student.findOne({ email }, "_id");
  if (!student) return { events: {} };
  const decided = await ProgramChangeRequest.find(
    { status: { $in: ["approved", "rejected"] }, $or: [{ student: student._id }, { "enrollment.teammates": student._id }] },
    "program type status guide enrollment.topicId student"
  );
  const enrollments = decided.filter((r) => r.type === "enrollment");
  const [btp, honors, ap] = await Promise.all(["btp", "honors", "ap"].map((p) => studentEvents(student._id, p, enrollments)));
  // Adding a teammate: everyone on the project (and the new member) hears the outcome on the AP page.
  const apReg = await APRegistration.findOne({ student: student._id }, "project");
  const teamAdds = await ProgramChangeRequest.find(
    {
      type: "team_add",
      status: { $in: ["approved", "rejected"] },
      $or: [{ student: student._id }, { newMember: student._id }, ...(apReg?.project ? [{ project: apReg.project }] : [])],
    },
    "status"
  );
  ap.push(...teamAdds.map((r) => `team:${r._id}:${r.status}`));
  const programchange = decided
    .filter((r) => !["enrollment", "team_add"].includes(r.type) && r.student.equals(student._id))
    .map((r) => `change:${r._id}:${r.status}`);
  // What happened before a student's first visit in a browser isn't news.
  return { events: { btp, honors, ap, programchange }, baseline: true };
}

export const getNotifications = async (req, res) => {
  try {
    const { role, email } = req.user;
    const body =
      role === "Faculty"
        ? await forFaculty(email)
        : role === "UGProjects"
        ? await forReviewer("pending_ugprojects")
        : role === "AssistantDean"
        ? await forReviewer("pending_assistantdean")
        : role === "Student"
        ? await forStudent(email)
        : {};
    return res.status(200).json(body);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading notifications" });
  }
};

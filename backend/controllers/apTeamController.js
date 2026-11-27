// Additional Project teams: the student who proposes can name teammates by
// email. The whole team goes through the usual approval (faculty -> UG
// Projects -> Assistant Dean) and becomes one project, evaluated once per
// round with marks for each member. A teammate can also be added after
// approval, before the first evaluation, through the same reviewers
// (guide -> UG Projects -> Assistant Dean) as a "team_add" request.
import Student from "../models/feedback/Student.js";
import AP from "../models/AP.js";
import APEvaluation from "../models/APEvaluation.js";
import APRegistration from "../models/APRegistration.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import ProgramChangeRequest from "../models/ProgramChangeRequest.js";
import { normEmail } from "../utils/security.js";
import { studentSemesterOn, startWindowProblem } from "../utils/semesterUtils.js";

// The proposer plus up to two teammates.
export const MAX_AP_TEAM = 3;
const OPEN = ["pending_ugprojects", "pending_assistantdean", "pending_faculty"];

// Why this student can't join (or start) an Additional Project team right
// now, or null if they can. `except` is a request id to ignore (the one being
// approved).
export async function apTeamBlock(studentId, except = null) {
  const registration = await APRegistration.findOne({ student: studentId }, "project");
  if (registration?.project) return "is already in an Additional Project";
  const notThis = except ? { _id: { $ne: except } } : {};
  const open = await ProgramChangeRequest.findOne({
    ...notThis,
    program: "ap",
    status: { $in: OPEN },
    $or: [
      { type: "enrollment", student: studentId },
      { type: "enrollment", "enrollment.teammates": studentId },
      { type: "team_add", newMember: studentId },
    ],
  });
  return open ? "is already part of an Additional Project request under review" : null;
}

// Turns the emails a student typed into teammates, or explains what's wrong.
// `existing` counts members already on the team (for adding after approval).
export async function resolveTeammates(rawEmails, self, existing = 1) {
  const emails = [...new Set((Array.isArray(rawEmails) ? rawEmails : []).map(normEmail).filter(Boolean))];
  if (emails.includes(normEmail(self.email))) return { error: "You don't need to add yourself as a teammate." };
  if (existing + emails.length > MAX_AP_TEAM) return { error: `A team can have at most ${MAX_AP_TEAM} students.` };
  const students = [];
  for (const email of emails) {
    const student = await Student.findOne({ email });
    if (!student) return { error: `No student account found for ${email}.` };
    const windowProblem = startWindowProblem("ap", studentSemesterOn(student.batch, new Date()));
    if (windowProblem) return { error: `${student.name} can't take an Additional Project now: ${windowProblem}` };
    const block = await apTeamBlock(student._id);
    if (block) return { error: `${student.name} ${block}.` };
    students.push(student);
  }
  return { students };
}

const person = (s) => (s ? { _id: s._id, name: s.name, email: s.email, rollNumber: s.rollNumber } : null);

// Proposals and requests under review that list this student as a teammate,
// for their own Additional Project page.
export async function teamInvitesFor(studentId) {
  const [inboxes, reviews] = await Promise.all([
    APFacultyRequest.find({ requests: { $elemMatch: { teammates: studentId, forwarded: { $ne: true } } } }).populate("faculty", "name"),
    ProgramChangeRequest.find({ type: "enrollment", program: "ap", status: { $in: OPEN }, "enrollment.teammates": studentId })
      .populate("student", "name email")
      .populate("guide", "name"),
  ]);
  const leads = await APRegistration.find({ _id: { $in: inboxes.flatMap((d) => d.requests.map((r) => r.student)) } }).populate("student", "name email");
  const leadOf = new Map(leads.map((r) => [String(r._id), r.student]));
  return [
    ...inboxes.flatMap((doc) =>
      doc.requests
        .filter((r) => !r.forwarded && r.teammates?.some((t) => t.equals(studentId)))
        .map((r) => ({ lead: person(leadOf.get(String(r.student))), title: r.proposalTitle, faculty: doc.faculty?.name, status: "with_faculty" }))
    ),
    ...reviews.map((r) => ({ lead: person(r.student), title: r.enrollment?.topicName, faculty: r.guide?.name, status: r.status })),
  ];
}

// Team members as people, for pages.
export async function teammatesOf(ids = []) {
  if (!ids.length) return [];
  const students = await Student.find({ _id: { $in: ids } }, "name email rollNumber");
  return students.map(person);
}

// Puts every member of an approved team onto the new project. Runs inside the
// approval transaction; `members` are Student ids other than the proposer.
export async function joinTeam(project, members, session, exceptRequest) {
  for (const studentId of members) {
    const block = await apTeamBlock(studentId, exceptRequest);
    if (block) {
      const s = await Student.findById(studentId, "name");
      throw Object.assign(new Error(`${s?.name || "A teammate"} ${block}`), { status: 400 });
    }
    let registration = await APRegistration.findOne({ student: studentId }).session(session);
    if (!registration) [registration] = await APRegistration.create([{ student: studentId }], { session });
    project.students.push({ student: registration._id });
    registration.project = project._id;
    registration.requests = [];
    await registration.save({ session });
    // Their own proposals elsewhere are no longer needed.
    await APFacultyRequest.updateMany({ "requests.student": registration._id }, { $pull: { requests: { student: registration._id } } }, { session });
  }
  await project.save({ session });
}

// Why a team member can't ask to add someone right now, or null.
export async function addTeammateProblem(project) {
  if (project.status !== "active") return "Teammates can only be added to a project in progress.";
  if (await APEvaluation.exists({ projectRef: project._id })) return "Teammates can only be added before the first evaluation.";
  if (project.students.length >= MAX_AP_TEAM) return `A team can have at most ${MAX_AP_TEAM} students.`;
  if (await ProgramChangeRequest.exists({ type: "team_add", project: project._id, status: { $in: OPEN } }))
    return "A teammate request for this project is already under review.";
  return null;
}

// Final approval of a "team_add" request: the new member joins the project.
export async function applyTeamAdd(request, session) {
  const project = await AP.findById(request.project).session(session);
  if (!project) throw Object.assign(new Error("The project no longer exists"), { status: 400 });
  if (project.status !== "active") throw Object.assign(new Error("The project is no longer in progress"), { status: 400 });
  if (await APEvaluation.exists({ projectRef: project._id }).session(session))
    throw Object.assign(new Error("The first evaluation has already happened, so no one can join now"), { status: 400 });
  if (project.students.length >= MAX_AP_TEAM) throw Object.assign(new Error(`The team already has ${MAX_AP_TEAM} students`), { status: 400 });
  await joinTeam(project, [request.newMember], session, request._id);
}

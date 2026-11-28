// Read-only tracking list for UG Projects and the Assistant Dean: where every
// student stands in BTP / Honors / Additional Project, from the first topic
// request to a finished or closed project. Seeing a request here does not let
// anyone decide it early - decisions stay in the review queues.
import { studentSemesterOn, startWindowProblem } from "../utils/semesterUtils.js";
import Student from "../models/feedback/Student.js";
import BTP from "../models/BTP.js";
import Honors from "../models/Honors.js";
import AP from "../models/AP.js";
import BTPTopic from "../models/BTPTopic.js";
import HonorsTopic from "../models/HonorsTopic.js";
import BTPRegistration from "../models/BTPRegistration.js";
import HonorsRegistration from "../models/HonorsRegistration.js";
import APRegistration from "../models/APRegistration.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import ProgramChangeRequest from "../models/ProgramChangeRequest.js";
import { ENROLLMENT_OPEN } from "./enrollmentController.js";

const PROGRAMS = [
  { program: "btp", label: "BTP", model: "BTP", Project: BTP, Topic: BTPTopic, Registration: BTPRegistration },
  { program: "honors", label: "Honors", model: "Honors", Project: Honors, Topic: HonorsTopic, Registration: HonorsRegistration },
  { program: "ap", label: "Additional Project", model: "AP", Project: AP, Registration: APRegistration },
];
const LABELS = Object.fromEntries(PROGRAMS.map((p) => [p.program, p.label]));
const STUDENT_FIELDS = "name email rollNumber batch";

const person = (p) => (p ? { name: p.name, email: p.email } : null);
const studentInfo = (s) => ({ name: s.name, email: s.email, rollNumber: s.rollNumber, batch: s.batch });

function row(student, program, stage, extra) {
  return { student: studentInfo(student), program, programLabel: LABELS[program], stage, topic: null, faculty: null, project: null, ...extra };
}

// Created projects, whatever their status.
async function projectRows({ program, model, Project }) {
  const projects = await Project.find({})
    .populate("guide", "name email")
    .populate({ path: "students.student", populate: { path: "student", select: STUDENT_FIELDS } });
  return projects.flatMap((project) =>
    project.students.map((s) => s.student?.student).filter(Boolean).map((student) => row(student, program, project.status, {
      key: `project:${project._id}:${student._id}`,
      topic: project.name,
      faculty: person(project.guide),
      project: { _id: project._id, program, projectModel: model, status: project.status, name: project.name, about: project.about },
    }))
  );
}

// Requests and proposals the faculty member has not sent on yet.
async function withFacultyRows({ program, Topic, Registration }) {
  const docs = await (program === "ap" ? APFacultyRequest : Topic).find({ "requests.0": { $exists: true } }).populate("faculty", "name email");
  const registrations = await Registration.find({ _id: { $in: docs.flatMap((d) => d.requests.map((r) => r.student)) } }).populate("student", STUDENT_FIELDS);
  const students = new Map(registrations.map((r) => [String(r._id), r.student]));
  return docs.flatMap((doc) =>
    doc.requests.flatMap((request, index) => {
      const student = students.get(String(request.student));
      if (request.forwarded || !student) return [];
      return row(student, program, "with_faculty", {
        key: `request:${doc._id}:${request.student}:${request.topic || index}`,
        topic: program === "ap" ? request.proposalTitle : doc.topics.id(request.topic)?.topic || null,
        faculty: person(doc.faculty),
      });
    })
  );
}

// Accepted by the faculty member and waiting on UG Projects or the Assistant Dean.
async function inReviewRows() {
  const requests = await ProgramChangeRequest.find({ type: "enrollment", status: { $in: ENROLLMENT_OPEN } })
    .populate("student", STUDENT_FIELDS)
    .populate("guide", "name email");
  return requests
    .filter((r) => r.student)
    .map((r) => row(r.student, r.program, r.status, { key: `review:${r._id}`, topic: r.enrollment?.topicName || null, faculty: person(r.guide), since: r.createdAt }));
}

// Turned down by the faculty member or a reviewer. The student's own
// registration keeps these until they get a project.
async function rejectedRows({ program, Topic, Registration }) {
  const registrations = await Registration.find({ "requests.status": "Rejected" }).populate("student", STUDENT_FIELDS);
  const isAP = program === "ap";
  const docs = isAP ? [] : await Topic.find({}).populate("faculty", "name email");
  const topicDocs = new Map(docs.map((d) => [String(d._id), d]));
  if (isAP) await APRegistration.populate(registrations, { path: "requests.faculty", select: "name email", model: "Faculty" });
  return registrations
    .filter((reg) => reg.student)
    .flatMap((reg) =>
      reg.requests
        .filter((request) => request.status === "Rejected")
        .map((request, index) => {
          const doc = topicDocs.get(String(request.topic));
          return row(reg.student, program, "rejected", {
            key: `rejected:${reg._id}:${request.subTopicId || index}`,
            topic: isAP ? request.proposalTitle : doc?.topics.id(request.subTopicId)?.topic || null,
            faculty: person(isAP ? request.faculty : doc?.faculty),
          });
        })
    );
}

// Students old enough (and not too late) to start BTP or Honors today who have
// no BTP or Honors request or project of any kind.
async function notStartedRows(rows) {
  const seen = new Set(rows.filter((r) => r.program !== "ap").map((r) => r.student.email));
  const students = await Student.find({}, STUDENT_FIELDS);
  const today = new Date();
  return students.flatMap((s) => {
    const semester = studentSemesterOn(s.batch, today);
    if (!semester || seen.has(s.email)) return [];
    const open = ["btp", "honors"].filter((p) => !startWindowProblem(p, semester));
    if (open.length === 0) return [];
    return {
      key: `none:${s._id}`,
      student: studentInfo(s),
      program: null,
      programLabel: open.map((p) => LABELS[p]).join(" or "),
      eligible: open,
      semester,
      stage: "not_started",
      topic: null,
      faculty: null,
      project: null,
    };
  });
}

export const getTracking = async (req, res) => {
  try {
    const perProgram = await Promise.all(PROGRAMS.map((p) => Promise.all([projectRows(p), withFacultyRows(p), rejectedRows(p)])));
    const rows = [...perProgram.flat(2), ...(await inReviewRows())];
    rows.push(...(await notStartedRows(rows)));
    rows.sort((a, b) => (a.student.name || "").localeCompare(b.student.name || ""));
    return res.status(200).json({ rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading the tracking list" });
  }
};

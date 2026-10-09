import nodemailer from "nodemailer";
import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";

// Emails the student and their guide when a topic request becomes a project
// (or is turned down). Best effort: a mail problem never blocks the approval.
// Set PROGRAM_EMAILS=off to disable (used when testing against dummy accounts).
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ROLE_LABEL = { UGProjects: "UG Projects", AssistantDean: "the Assistant Dean Academics", Faculty: "the guide" };

export async function notifyEnrollment(request, outcome, { rejectedBy, remark } = {}) {
  if (process.env.PROGRAM_EMAILS === "off" || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const [student, guide] = await Promise.all([Student.findById(request.student), Faculty.findById(request.guide)]);
  const to = [student?.email, guide?.email].filter(Boolean);
  if (!to.length) return;

  const topic = request.enrollment?.topicName || "the project";
  const program = { btp: "BTP", honors: "Honors", ap: "Additional Project" }[request.program] || "BTP";
  const approved = outcome === "approved";
  const subject = approved ? `${program} project approved: ${topic}` : `${program} request not approved: ${topic}`;
  const line = approved
    ? `The ${program} project <b>${esc(topic)}</b> has been approved. ${esc(student?.name || "The student")} is now working under ${esc(guide?.name || "the guide")}, and the project is open on both of their pages.`
    : `The ${program} request for <b>${esc(topic)}</b> was not approved by ${esc(ROLE_LABEL[rejectedBy] || "a reviewer")}.${remark ? ` Reason: ${esc(remark)}` : ""}`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222"><p>${line}</p><p style="color:#666">IIITS Institute Portal</p></div>`,
  });
}

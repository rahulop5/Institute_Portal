import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";
import UGProjects from "../models/UGProjects.js";
import AssistantDean from "../models/AssistantDean.js";
import BTP from "../models/BTP.js";
import Honors from "../models/Honors.js";
import { getTransporter, mailConfigured, esc } from "./mailer.js";

const PROGRAM_LABEL = { btp: "BTP", honors: "Honors" };
const OTHER = { btp: "honors", honors: "btp" };
const PROJECT_MODEL = { btp: BTP, honors: Honors };
const ROLE_LABEL = { UGProjects: "UG Projects", AssistantDean: "Assistant Dean Academics", Faculty: "Guide" };

const idOf = (x) => x?._id ?? x;

// Who the request has just landed on, keyed by the status it is now waiting at.
async function recipientsFor(request, stage) {
  if (stage === "pending_ugprojects") {
    return { stageLabel: "UG Projects", people: await UGProjects.find({}, "name email") };
  }
  if (stage === "pending_assistantdean") {
    return { stageLabel: "Assistant Dean Academics", people: await AssistantDean.find({}, "name email") };
  }
  // A guide change is decided by the proposed new guide, everything else by the current guide.
  const facultyId = idOf(request.type === "guide_change" ? request.newGuide : request.guide);
  const faculty = facultyId ? await Faculty.findById(facultyId, "name email") : null;
  return { stageLabel: "Guide", people: faculty ? [faculty] : [] };
}

// Plain-language summary of what is being asked.
async function describe(request) {
  const from = PROGRAM_LABEL[request.program];
  switch (request.type) {
    case "drop":
      return `Drop ${from} project`;
    case "switch":
      return `Switch from ${from} to ${PROGRAM_LABEL[OTHER[request.program]]} (${
        request.switchMode === "continue" ? "continue the current project and its marks" : "start fresh with a new topic"
      })`;
    case "guide_change": {
      const newGuide = await Faculty.findById(idOf(request.newGuide), "name email");
      const topic = request.newTopic?.name ? `, new topic "${request.newTopic.name}"` : ", keeping the current topic";
      return `Guide change: move ${from} project to ${newGuide?.name || "another faculty member"}${topic}`;
    }
    case "topic_change":
      return `Topic change on ${from} project to "${request.newTopic?.name}"`;
    default:
      return request.type;
  }
}

/**
 * Tell whoever a program-change request has just been routed to that it is waiting on them.
 * `stage` is the status the request is NOW at (pass it explicitly: after findOneAndUpdate the doc
 * you hold may still carry the old status).
 *
 * Fire-and-forget like the meeting mails: never throws, never delays the response, and a failure is
 * only logged because the request itself is already saved.
 */
export function notifyProgramChangeReceived(request, stage) {
  if (!mailConfigured()) {
    console.warn("[programChangeMailer] EMAIL_USER/EMAIL_PASS not set, skipping email");
    return;
  }
  (async () => {
    const { stageLabel, people } = await recipientsFor(request, stage);
    const to = people.map((p) => p.email).filter(Boolean);
    if (!to.length) {
      console.warn(`[programChangeMailer] no recipient for request ${request._id} at ${stage}`);
      return;
    }

    const student = await Student.findById(idOf(request.student), "name email rollNumber");
    const project = await PROJECT_MODEL[request.program].findById(idOf(request.project), "name");
    const what = await describe(request);
    const studentLine = `${student?.name || "A student"}${student?.rollNumber ? ` (${student.rollNumber})` : ""}`;

    // Earlier approvals the request has already collected, so later reviewers see the trail.
    const trail = (request.history || [])
      .filter((h) => h.action === "approved")
      .map((h) => `${ROLE_LABEL[h.role] || h.role} approved${h.remark ? `: "${h.remark}"` : ""}`);

    const rows = [
      ["Student", studentLine],
      ["Request", what],
      ["Project", project?.name],
      ["Reason", request.reason],
      ...(trail.length ? [["Approved so far", trail.join("; ")]] : []),
    ].filter(([, v]) => v);

    const intro = `A program change request is now waiting for your decision (${stageLabel}).`;
    const subject = `Action needed: ${what} - ${student?.name || "student"}`;

    await getTransporter().sendMail({
      from: `"IIITS Institute Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: [
        intro,
        "",
        ...rows.map(([k, v]) => `${k}: ${v}`),
        "",
        "Open Academics > Program Change in the portal to approve or reject it.",
      ].join("\n"),
      html: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
  <h2 style="margin-bottom:4px">Program change request received</h2>
  <p>${esc(intro)}</p>
  <table style="border-collapse:collapse;width:100%">
    ${rows.map(([k, v]) => `<tr><td style="padding:6px 0;color:#666;width:120px;vertical-align:top">${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}
  </table>
  <p>Open <b>Academics &rarr; Program Change</b> in the portal to approve or reject it.</p>
  <p style="color:#888;font-size:12px;margin-top:24px">This is an automated message from the IIIT Sri City Institute Portal.</p>
</div>`,
    });
  })().catch((err) => console.error(`[programChangeMailer] failed for request ${request._id}:`, err.message));
}

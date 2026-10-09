import { getTransporter, mailConfigured, esc } from "./mailer.js";

// slot.date is stored as UTC midnight of the picked calendar day, so format it in UTC.
const formatWhen = (slot) => {
  const day = new Date(slot.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${day}, ${slot.startTime} - ${slot.endTime}`;
};

const locationHtml = (loc) =>
  /^https?:\/\//i.test(loc) ? `<a href="${esc(loc)}">${esc(loc)}</a>` : esc(loc);

// Floating local time (no Z / TZID): calendar apps show it at the same wall-clock time for the recipient.
const icsStamp = (slot, time) =>
  `${new Date(slot.date).toISOString().slice(0, 10).replace(/-/g, "")}T${time.replace(":", "")}00`;
const icsEscape = (s = "") => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

const buildIcs = ({ slot, title, faculty, student, cancelled }) =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IIITS Institute Portal//Meetings//EN",
    `METHOD:${cancelled ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    // approvedAt makes each booking of a re-used slot a distinct calendar event (a later REQUEST with the
    // same UID but lower SEQUENCE than an earlier CANCEL would be ignored by calendar apps).
    `UID:meeting-${slot._id}-${new Date(slot.approvedAt || 0).getTime()}@institute-portal`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${icsStamp(slot, slot.startTime)}`,
    `DTEND:${icsStamp(slot, slot.endTime)}`,
    `SEQUENCE:${cancelled ? 1 : 0}`,
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(slot.location)}`,
    `ORGANIZER;CN=${icsEscape(faculty.name)}:mailto:${faculty.email}`,
    `ATTENDEE;CN=${icsEscape(student.name)};RSVP=FALSE:mailto:${student.email}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

const renderHtml = ({ heading, intro, slot, title, faculty, student, comment, reason, reasonLabel }) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
  <h2 style="margin-bottom:4px">${esc(heading)}</h2>
  <p>${intro}</p>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:6px 0;color:#666;width:110px">Title</td><td><b>${esc(title)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#666">When</td><td>${esc(formatWhen(slot))}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Where</td><td>${locationHtml(slot.location)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Faculty</td><td>${esc(faculty.name)} (${esc(faculty.email)})</td></tr>
    <tr><td style="padding:6px 0;color:#666">Student</td><td>${esc(student.name)}${student.rollNumber ? ` (${esc(student.rollNumber)})` : ""}</td></tr>
    ${comment ? `<tr><td style="padding:6px 0;color:#666">Student's note</td><td>${esc(comment)}</td></tr>` : ""}
    ${reason ? `<tr><td style="padding:6px 0;color:#666">${esc(reasonLabel)}</td><td>${esc(reason)}</td></tr>` : ""}
  </table>
  <p style="color:#888;font-size:12px;margin-top:24px">This is an automated message from the IIIT Sri City Institute Portal.</p>
</div>`;

const renderText = ({ heading, introText, slot, title, faculty, student, comment, reason, reasonLabel }) =>
  [
    heading,
    "",
    introText,
    "",
    `Title: ${title}`,
    `When: ${formatWhen(slot)}`,
    `Where: ${slot.location}`,
    `Faculty: ${faculty.name} (${faculty.email})`,
    `Student: ${student.name}${student.rollNumber ? ` (${student.rollNumber})` : ""}`,
    comment ? `Student's note: ${comment}` : null,
    reason ? `${reasonLabel}: ${reason}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

async function deliver({ to, subject, ctx, heading, intro, introText, cancelled, noInvite }) {
  await getTransporter().sendMail({
    from: `"IIITS Institute Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: renderText({ ...ctx, heading, introText }),
    html: renderHtml({ ...ctx, heading, intro }),
    // Request / withdrawal notices to the faculty are not calendar events.
    ...(noInvite ? {} : { icalEvent: { method: cancelled ? "CANCEL" : "REQUEST", content: buildIcs({ ...ctx, cancelled }) } }),
  });
}

/**
 * Fire-and-forget: never throws and never delays the HTTP response. A mail failure is only logged,
 * because the booking/cancellation itself has already been committed to the DB.
 *
 * @param {"requested"|"confirmed"|"cancelled"} kind
 * @param {{slot, faculty, student, cancelledBy?: "faculty"|"student", reason?: string}} data
 *   requested goes to the faculty only (withdrawals/rejections are deliberately not emailed, to limit spam);
 *   confirmed / cancelled go to both.
 *   `reason` is the canceller's optional message (cancelled only).
 */
export function notifyMeeting(kind, { slot, faculty, student, cancelledBy, reason }) {
  if (!mailConfigured()) {
    console.warn("[meetingMailer] EMAIL_USER/EMAIL_PASS not set, skipping meeting email");
    return;
  }
  const title = slot.title || "Meeting";
  const cleanReason = reason && String(reason).trim() ? String(reason).trim() : null;
  const ctx = {
    slot,
    title,
    faculty,
    student,
    comment: slot.purpose,
    reason: kind === "cancelled" ? cleanReason : null,
    reasonLabel: cancelledBy === "faculty" ? "Faculty's reason" : "Student's reason",
  };
  const when = formatWhen(slot);
  const jobs = [];

  const ymd = new Date(slot.date).toISOString().slice(0, 10);
  if (kind === "requested") {
    jobs.push({
      to: faculty.email,
      subject: `New meeting request: ${title} (${slot.startTime}, ${ymd})`,
      ctx,
      noInvite: true,
      heading: "New meeting request",
      intro: `Hi ${esc(faculty.name)}, ${esc(student.name)} has requested your slot on <b>${esc(when)}</b>. Please open <b>Academics &rarr; Meetings</b> in the portal to approve or reject it.`,
      introText: `Hi ${faculty.name}, ${student.name} has requested your slot on ${when}. Please open Academics > Meetings in the portal to approve or reject it.`,
    });
  } else if (kind === "confirmed") {
    const mk = (to, name) => ({
      to,
      subject: `Meeting confirmed: ${title} (${slot.startTime}, ${new Date(slot.date).toISOString().slice(0, 10)})`,
      ctx,
      heading: "Meeting confirmed",
      intro: `Hi ${esc(name)}, Your meeting is confirmed for <b>${esc(when)}</b>.`,
      introText: `Hi ${name}, Your meeting is confirmed for ${when}.`,
    });
    jobs.push(mk(student.email, student.name), mk(faculty.email, faculty.name));
  } else {
    // Returns [plain, html]; only the html variant escapes the user-supplied name.
    const byLine = (isFaculty) => {
      if (cancelledBy === "faculty" && !isFaculty) return [`${faculty.name} has cancelled this meeting.`, `${esc(faculty.name)} has cancelled this meeting.`];
      if (cancelledBy !== "faculty" && isFaculty) return [`${student.name} has cancelled this meeting.`, `${esc(student.name)} has cancelled this meeting.`];
      return ["You cancelled this meeting.", "You cancelled this meeting."];
    };
    const mk = (to, name, isFaculty) => ({
      to,
      subject: `Meeting cancelled: ${title} (${slot.startTime}, ${new Date(slot.date).toISOString().slice(0, 10)})`,
      ctx,
      cancelled: true,
      heading: "Meeting cancelled",
      intro: `Hi ${esc(name)}, ${byLine(isFaculty)[1]} The meeting scheduled for <b>${esc(when)}</b> will not take place.`,
      introText: `Hi ${name}, ${byLine(isFaculty)[0]} The meeting scheduled for ${when} will not take place.`,
    });
    jobs.push(mk(student.email, student.name, false), mk(faculty.email, faculty.name, true));
  }

  // Independent sends so one bad address can't block the other recipient.
  for (const job of jobs) {
    deliver(job).catch((err) => console.error(`[meetingMailer] failed to email ${job.to}:`, err.message));
  }
}

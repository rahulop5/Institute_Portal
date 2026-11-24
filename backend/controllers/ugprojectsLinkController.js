import mongoose from "mongoose";
import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";
import BTPRegistration from "../models/BTPRegistration.js";
import HonorsRegistration from "../models/HonorsRegistration.js";
import APRegistration from "../models/APRegistration.js";
import ProgramChangeRequest from "../models/ProgramChangeRequest.js";
import { RequestError, ENROLLMENT_OPEN, applyEnrollment, notifyOutcome } from "./enrollmentController.js";

// UG Projects linking a student straight to their guide, for students who are
// already working with a faculty member. Skips the student request / faculty
// accept / Assistant Dean steps: the project is created at once. The link is
// still recorded as an approved "enrollment" request (history: UG Projects),
// so it shows in UG Projects' History and the usual "project approved" email
// goes to the student and guide.

const PROGRAMS = {
  btp: { label: "BTP", inProject: "a BTP project", Registration: BTPRegistration, other: { Registration: HonorsRegistration, inProject: "an Honors project" }, group: ["btp", "honors"] },
  honors: { label: "Honors", inProject: "an Honors project", Registration: HonorsRegistration, other: { Registration: BTPRegistration, inProject: "a BTP project" }, group: ["btp", "honors"] },
  ap: { label: "Additional Project", inProject: "an Additional Project", Registration: APRegistration, other: null, group: ["ap"] },
};
// The page has two tabs: BTP / Honors (mutually exclusive) and Additional
// Project (independent of them). Searches and uploads are scoped to one.
const GROUPS = {
  btphonors: { label: "BTP / Honors", programs: ["btp", "honors"], registrations: [BTPRegistration, HonorsRegistration] },
  ap: { label: "Additional Project", programs: ["ap"], registrations: [APRegistration] },
};
// Program names as people write them. Matched on letters only, so "B.T.P",
// "A.P.", "Honours." and "Additional-Project" all work.
const PROGRAM_ALIASES = { btp: "btp", honors: "honors", honours: "honors", ap: "ap", additionalproject: "ap" };
const parseProgram = (value) => PROGRAM_ALIASES[String(value || "").toLowerCase().replace(/[^a-z]/g, "")];

// What to say when the program column can't be used, in the words of the tab
// the upload came from (or in general for the single-student form).
function programProblem(raw, group) {
  const value = String(raw || "").trim();
  const allowed = group ? group.programs.map((p) => PROGRAMS[p].label.replace("Additional Project", "AP")).join(" or ") : "BTP, Honors or AP";
  if (!value) return `Program is missing. Use ${allowed}.`;
  return `"${value.length > 40 ? value.slice(0, 40) + "…" : value}" is not a program. Use ${allowed}.`;
}
const DEFAULT_EVALUATION_CONFIG = [{ maxMarks: 50 }, { maxMarks: 50 }];
const MAX_ROWS = 500;
const LINK_REASON = "Linked directly by UG Projects (student already working with this guide)";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function findStudent(identifier) {
  const value = String(identifier || "").trim();
  if (!value) return null;
  return Student.findOne({
    $or: [{ email: new RegExp(`^${escapeRegex(value)}$`, "i") }, { rollNumber: new RegExp(`^${escapeRegex(value)}$`, "i") }],
  });
}

const findFaculty = (email) => {
  const value = String(email || "").trim();
  return value ? Faculty.findOne({ email: new RegExp(`^${escapeRegex(value)}$`, "i") }) : null;
};

// Which tab a program belongs to: a student can be in one BTP-or-Honors
// project and, separately, one Additional Project.
const groupOf = (program) => (program === "ap" ? "ap" : "btphonors");

const describe = (student, guide) => ({
  ...(student && { student: { name: student.name, email: student.email, rollNumber: student.rollNumber } }),
  ...(guide && { guide: { name: guide.name, email: guide.email } }),
});

// Every check a link must pass, without writing anything. `planned` holds the
// students earlier rows of the same upload already link (or would link, in a
// preview), keyed by student + tab, so the preview and the real run agree on
// rows that clash with each other.
// Returns { ok, message, student?, guide?, program?, ... }.
async function checkRow(row, planned = new Map(), group = null) {
  const program = parseProgram(row.program);
  const title = String(row.title || "").trim();
  const base = { program: program || null, programLabel: program ? PROGRAMS[program].label : null, title };

  const studentId = String(row.student || "").trim();
  const facultyEmail = String(row.faculty || "").trim();
  const [student, guide] = await Promise.all([findStudent(studentId), findFaculty(facultyEmail)]);
  const fail = (message) => ({ ok: false, message, ...base, ...describe(student, guide) });

  if (!studentId) return fail("Student is required (email or roll number)");
  if (!student) return fail(`No student found with email or roll number "${studentId}"`);
  if (!facultyEmail) return fail("Faculty email is required");
  if (!guide) return fail(`No faculty member found with email "${facultyEmail}"`);
  if (!program) return fail(programProblem(row.program, group));
  if (!title) return fail("Project title is required");
  if (title.length > 200) return fail("Project title is too long (200 characters max)");
  const P = PROGRAMS[program];

  const earlier = planned.get(`${student._id}|${groupOf(program)}`);
  if (earlier) {
    return fail(
      earlier.program === program
        ? `Duplicate: row ${earlier.row} already links ${student.name} to ${P.label}`
        : `Row ${earlier.row} already links ${student.name} to ${PROGRAMS[earlier.program].label}`
    );
  }

  const existing = await P.Registration.findOne({ student: student._id });
  if (existing?.project) return fail(`${student.name} is already in ${P.inProject}`);
  if (P.other && (await P.other.Registration.findOne({ student: student._id, project: { $ne: null } }))) {
    return fail(`${student.name} is already in ${P.other.inProject}`);
  }
  const open = await ProgramChangeRequest.findOne({
    student: student._id,
    type: "enrollment",
    program: { $in: P.group },
    status: { $in: ENROLLMENT_OPEN },
  });
  if (open) return fail(`${student.name} already has a request under review. Approve or reject it under New assignments instead.`);

  return {
    ok: true,
    message: `${student.name} will be linked to ${guide.name} for ${P.label}`,
    ...base,
    ...describe(student, guide),
    _student: student,
    _guide: guide,
    _existing: existing,
    _about: String(row.about || "").trim().slice(0, 2000),
  };
}

const publicResult = ({ _student, _guide, _existing, _about, ...rest }) => rest;

// Links one student. Returns { ok, message, ... }; never throws for bad input.
async function linkOne(row, actorEmail, planned, group) {
  const check = await checkRow(row, planned, group);
  if (!check.ok) return check;
  const { _student: student, _guide: guide, _existing: existing, _about: about, program, title } = check;
  const P = PROGRAMS[program];

  // Students who never opened the program page have no registration yet.
  if (!existing) {
    try {
      await P.Registration.create({ student: student._id });
    } catch (err) {
      if (err?.code !== 11000) throw err; // created concurrently - fine
    }
  }

  const session = await mongoose.startSession();
  let request = null;
  try {
    await session.withTransaction(async () => {
      [request] = await ProgramChangeRequest.create(
        [
          {
            student: student._id,
            program,
            type: "enrollment",
            guide: guide._id,
            reason: LINK_REASON,
            enrollment: { topicName: title, topicAbout: about, message: "", proposed: false, evaluationConfig: DEFAULT_EVALUATION_CONFIG },
            status: "approved",
            history: [{ role: "UGProjects", email: actorEmail, action: "approved", remark: "Linked directly by UG Projects" }],
          },
        ],
        { session }
      );
      await applyEnrollment(request, session);
    });
  } catch (err) {
    if (err instanceof RequestError) return { ...publicResult(check), ok: false, message: err.message };
    throw err;
  } finally {
    await session.endSession();
  }

  notifyOutcome(request, "approved");
  // Internal fields stay on: the bulk route needs _student for `planned`;
  // both routes strip them with publicResult before responding.
  return { ...check, message: `${student.name} linked to ${guide.name} for ${P.label}` };
}

// POST /programchange/ugprojects/link  { program, student, faculty, title, about? }
export const linkStudent = async (req, res) => {
  try {
    const result = publicResult(await linkOne(req.body || {}, req.user.email));
    return res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error linking the student" });
  }
};

// POST /programchange/ugprojects/link/bulk  { group, rows: [...], dryRun?, rowNumbers? }
// Rows are handled one by one; a bad row is reported and skipped, never
// blocking the others. With dryRun nothing is written: each row gets the
// result it would get (the upload review). `rowNumbers` gives each row its
// line in the original file when the page sends only some rows (the ones the
// review marked ready), in chunks.
export const linkStudentsBulk = async (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: "No rows to link" });
  if (rows.length > MAX_ROWS) return res.status(400).json({ message: `At most ${MAX_ROWS} rows per upload` });

  const group = GROUPS[req.body?.group] || null;
  const dryRun = req.body?.dryRun === true;
  const rowNumbers = Array.isArray(req.body?.rowNumbers) && req.body.rowNumbers.length === rows.length ? req.body.rowNumbers : null;

  const results = [];
  const planned = new Map();
  for (const [index, rawRow] of rows.entries()) {
    const rowNumber = Number.isInteger(rowNumbers?.[index]) ? rowNumbers[index] : index + 1;
    let row = rawRow || {};
    if (group) {
      // The AP tab's file doesn't need a program column.
      if (!String(row.program || "").trim() && group.programs.length === 1) row = { ...row, program: group.programs[0] };
      const program = parseProgram(row.program);
      if (program && !group.programs.includes(program)) {
        const other = Object.values(GROUPS).find((g) => g.programs.includes(program));
        results.push({
          row: rowNumber,
          ok: false,
          message: `This upload is for ${group.label}. Use the ${other.label} tab for this row.`,
          program,
          programLabel: PROGRAMS[program].label,
          title: String(row.title || "").trim(),
        });
        continue;
      }
    }
    try {
      const result = dryRun ? await checkRow(row, planned, group) : await linkOne(row, req.user.email, planned, group);
      if (result.ok) planned.set(`${result._student?._id || ""}|${groupOf(result.program)}`, { row: rowNumber, program: result.program });
      results.push({ row: rowNumber, ...publicResult(result) });
    } catch (err) {
      console.error(err);
      results.push({ row: rowNumber, ok: false, message: "Server error on this row" });
    }
  }
  const ok = results.filter((r) => r.ok).length;
  return res.status(200).json({ dryRun, linked: dryRun ? 0 : ok, ready: dryRun ? ok : undefined, failed: results.length - ok, results });
};

// GET /programchange/ugprojects/link/options?q=&group=btphonors|ap - faculty
// list, plus students matching q (name, email or roll number) who can still be
// linked in that group: anyone already in a project there is left out, and
// anyone with a request under review is flagged.
export const linkOptions = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const group = GROUPS[req.query.group] || GROUPS.btphonors;
    const faculty = (await Faculty.find({}, "name email dept").sort({ name: 1 })).map((f) => ({ name: f.name, email: f.email, dept: f.dept }));
    let students = [];
    if (q.length >= 2) {
      const re = new RegExp(escapeRegex(q), "i");
      const enrolled = (await Promise.all(group.registrations.map((R) => R.distinct("student", { project: { $ne: null } })))).flat();
      const found = await Student.find({ _id: { $nin: enrolled }, $or: [{ name: re }, { email: re }, { rollNumber: re }] }, "name email rollNumber batch")
        .sort({ name: 1 })
        .limit(20);
      const pending = new Set(
        (
          await ProgramChangeRequest.distinct("student", {
            student: { $in: found.map((s) => s._id) },
            type: "enrollment",
            program: { $in: group.programs },
            status: { $in: ENROLLMENT_OPEN },
          })
        ).map(String)
      );
      students = found.map((s) => ({ name: s.name, email: s.email, rollNumber: s.rollNumber, batch: s.batch, pending: pending.has(String(s._id)) }));
    }
    return res.status(200).json({ faculty, students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error loading options" });
  }
};

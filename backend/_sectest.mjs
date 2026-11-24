// Adversarial security suite. Runs real attacks against a LOCAL backend on a TEST database and
// reports PASS when the attack is blocked. Never point this at production.
//
//   (terminal 1)  MONGO_DB_NAME=clgproject_test PORT=4100 EMAIL_USER=mail-disabled@invalid EMAIL_PASS=disabled PROGRAM_EMAILS=off node index.js
//   (terminal 2)  MONGO_DB_NAME=clgproject_test node _sectest.mjs [http://localhost:4100]
//
// Uses the demo accounts in demo-accounts.txt / demo-accounts-fdfed.txt (shared password read from there).
// Side effects, all on the test DB: resets the FDFED demo grading, creates and removes a throwaway
// sectest.victim user.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const DB = process.env.MONGO_DB_NAME;
if (!DB || DB === "clgproject") { console.error("Refusing: set MONGO_DB_NAME to a test database."); process.exit(1); }
const API = process.argv[2] || "http://localhost:4100";
const PW = fs.readFileSync("demo-accounts.txt", "utf8").match(/shared password: (\S+)\)/)[1];
const D = "@iiits.in";

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail = "") {
    if (ok) { pass++; console.log(`  PASS  ${name}`); }
    else { fail++; failures.push(name); console.log(`  FAIL  ${name}${detail ? `  -> ${detail}` : ""}`); }
}
async function call(method, path, {token, body, raw} = {}) {
    const headers = {"Content-Type": "application/json"};
    if (token) headers.Authorization = `Bearer ${token}`;
    const r = await fetch(API + path, {method, headers, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined)});
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch { /* not json */ }
    return {status: r.status, json, text};
}
const short = (r) => `${r.status} ${r.text.slice(0, 160)}`;
const tokens = {};
async function login(email, pw = PW) {
    const r = await call("POST", "/auth/login", {body: {email, pass: pw}});
    if (!r.json?.token) throw new Error(`login failed for ${email}: ${short(r)}`);
    return (tokens[email] = r.json.token);
}

await mongoose.connect(process.env.MONGO_URI.trim().replace(/^"|"$/g, ""), {dbName: DB});
const db = mongoose.connection.db;
const oid = (s) => new mongoose.Types.ObjectId(String(s));

try {
    // ------------------------------------------------------------ setup
    const fresh = await db.collection("students").findOne({email: `demo.freshstudent${D}`});
    const VICTIM = `sectest.victim${D}`;
    await db.collection("users").deleteMany({email: VICTIM});
    await db.collection("users").insertOne({name: "Sectest Victim", email: VICTIM, password: await bcrypt.hash("victim-initial-pw-1", 10), role: "Student", referenceId: fresh._id, lastlogin: new Date(), otpAttemptCount: 0});

    for (const e of ["guide", "evaluator", "btpstudent", "freshstudent", "admin", "academicoffice", "ugprojects"]) await login(`demo.${e}${D}`);
    for (const e of ["fdfed1", "fdfed2", "fd001", "fd000"]) await login(`demo.${e}${D}`);
    const T = (n) => tokens[`demo.${n}${D}`];

    // ============================================================ A. authentication
    console.log("\nA. Authentication");
    let r = await call("POST", "/auth/login", {body: {email: {$regex: "^demo\\.guide"}, pass: PW}});
    check("login rejects operator object in email ($regex)", r.status === 400 && !r.json?.token, short(r));
    r = await call("POST", "/auth/login", {body: {email: {$ne: null}, pass: PW}});
    check("login rejects operator object in email ($ne)", r.status === 400 && !r.json?.token, short(r));
    r = await call("POST", "/auth/login", {body: {email: `demo.guide${D}`}});
    check("login without password -> 400, no stack trace", r.status === 400 && !/at .*\.js/.test(r.text), short(r));
    const a = await call("POST", "/auth/login", {body: {email: `nobody.here${D}`, pass: "x"}});
    const b = await call("POST", "/auth/login", {body: {email: `demo.guide${D}`, pass: "wrong-password"}});
    check("login does not reveal whether an email exists", a.status === b.status && (a.json?.message || a.json?.msg) === (b.json?.message || b.json?.msg), `${short(a)} | ${short(b)}`);
    r = await call("POST", "/auth/login", {body: {email: `  DEMO.GUIDE${D} `, pass: PW}});
    check("login normalises email case/whitespace (legit users still get in)", !!r.json?.token, short(r));

    // forgot-password: array email must not reach the mailer / the $in cast
    r = await call("POST", "/auth/forgot-password", {body: {email: [VICTIM, "attacker@evil.example"]}});
    check("forgot-password rejects an array email (OTP hijack)", r.status === 400, short(r));
    r = await call("POST", "/auth/forgot-password", {body: {email: {$ne: null}}});
    check("forgot-password rejects an operator email", r.status === 400, short(r));
    const f1 = await call("POST", "/auth/forgot-password", {body: {email: `nobody.here${D}`}});
    const f2 = await call("POST", "/auth/forgot-password", {body: {email: VICTIM}});
    check("forgot-password does not reveal whether an email exists", f1.status === f2.status && f1.json?.message === f2.json?.message, `${short(f1)} | ${short(f2)}`);

    // OTP brute force: plant a known OTP, guess wrong 5 times, then the right one must be dead
    const plant = async (otp) => db.collection("users").updateOne({email: VICTIM}, {$set: {resetOtp: await bcrypt.hash(otp, 10), resetOtpExpire: new Date(Date.now() + 600000), otpVerifyAttempts: 0}});
    await plant("424242");
    for (let i = 0; i < 5; i++) await call("POST", "/auth/verify-otp", {body: {email: VICTIM, otp: String(100000 + i)}});
    r = await call("POST", "/auth/verify-otp", {body: {email: VICTIM, otp: "424242"}});
    check("OTP is voided after 5 wrong guesses", r.status === 400, short(r));
    r = await call("POST", "/auth/reset-password", {body: {email: VICTIM, otp: "424242", newPassword: "attacker-pw-123"}});
    check("voided OTP cannot reset the password", r.status === 400, short(r));
    r = await call("POST", "/auth/verify-otp", {body: {email: VICTIM, otp: {$ne: null}}});
    check("verify-otp rejects an operator OTP", r.status === 400, short(r));
    const stored = await db.collection("users").findOne({email: VICTIM});
    check("OTP is not stored in plain text", !stored.resetOtp || stored.resetOtp.startsWith("$2"), "");

    // legit reset still works, and old sessions die after it
    const victimOld = await login(VICTIM, "victim-initial-pw-1");
    await plant("515151");
    r = await call("POST", "/auth/reset-password", {body: {email: VICTIM, otp: "515151", newPassword: "short"}});
    check("reset-password enforces a minimum length", r.status === 400, short(r));
    r = await call("POST", "/auth/reset-password", {body: {email: VICTIM, otp: "515151", newPassword: "victim-new-pw-2"}});
    check("legit OTP reset works", r.status === 200, short(r));
    r = await call("POST", "/auth/verify-otp", {body: {email: VICTIM, otp: "515151"}});
    check("OTP cannot be reused after a reset", r.status === 400, short(r));
    r = await call("GET", "/auth/profile", {token: victimOld});
    check("tokens issued before a password reset stop working", r.status === 401 || r.status === 403, short(r));
    r = await call("POST", "/auth/login", {body: {email: VICTIM, pass: "victim-new-pw-2"}});
    check("login with the new password works", !!r.json?.token, short(r));

    // forged tokens
    const forged = jwt.sign({email: `demo.admin${D}`, role: "Admin"}, "not-the-real-secret");
    r = await call("GET", "/puser/feedback/semesters", {token: forged});
    check("token signed with a wrong secret is rejected", r.status === 401 || r.status === 403, short(r));
    const none = Buffer.from(JSON.stringify({alg: "none", typ: "JWT"})).toString("base64url") + "." + Buffer.from(JSON.stringify({email: `demo.admin${D}`, role: "Admin"})).toString("base64url") + ".";
    r = await call("GET", "/puser/feedback/semesters", {token: none});
    check("alg=none token is rejected", r.status === 401 || r.status === 403, short(r));
    // The grades feature lives on the course-grades branch; on a build without it, its checks are skipped.
    const HAS_GRADES = (await call("GET", "/faculty/grades/mycourses", {token: T("fdfed1")})).status !== 404;
    if (!HAS_GRADES) console.log("  (grades routes not in this build: grade checks skipped)");
    const [h, , s] = T("fd001").split(".");
    const tampered = `${h}.${Buffer.from(JSON.stringify({email: `demo.fd001${D}`, role: "AcademicOffice", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600})).toString("base64url")}.${s}`;
    r = await call("GET", HAS_GRADES ? "/academicoffice/gradings" : "/auth/profile", {token: tampered});
    check("student token with role edited to AcademicOffice is rejected", r.status === 401 || r.status === 403, short(r));

    // ============================================================ B. injection / ownership
    console.log("\nB. Operator injection and ownership");
    const guideFac = await db.collection("faculties").findOne({email: `demo.guide${D}`});
    const guideTopics = await db.collection("btptopics").findOne({faculty: guideFac._id});
    const fakeId = String(new mongoose.Types.ObjectId());
    r = await call("DELETE", "/faculty/btp/deletetopic", {token: T("evaluator"), body: {actualtid: String(guideTopics._id), topicid: fakeId}});
    check("faculty cannot delete another faculty's topic list", r.status === 403 || r.status === 404, short(r));
    r = await call("DELETE", "/faculty/btp/deletetopic", {token: T("evaluator"), body: {actualtid: String(guideTopics._id), topicid: {$ne: null}}});
    check("deletetopic rejects an operator topicid", r.status === 400, short(r));
    const after = await db.collection("btptopics").findOne({_id: guideTopics._id});
    check("guide's topics are intact after the attacks", after.topics.length === guideTopics.topics.length, `${guideTopics.topics.length} -> ${after.topics.length}`);
    r = await call("POST", "/programchange/faculty/decide", {token: T("evaluator"), body: {requestId: {$gte: "000000000000000000000000"}, decision: "reject", remark: "x"}});
    check("program-change decide rejects an operator requestId", r.status === 400, short(r));
    r = await call("POST", "/faculty/btp/assignevaluator", {token: T("guide"), body: {projid: {$gte: "000000000000000000000000"}, facultyEmail: `demo.evaluator${D}`}});
    check("assignevaluator rejects an operator projid", r.status === 400, short(r));
    r = await call("POST", "/faculty/btp/releaseevaluation", {token: T("guide"), body: {projid: {$in: [fakeId]}, evalId: fakeId, marks: []}});
    check("releaseevaluation rejects an operator projid", r.status === 400, short(r));
    r = await call("POST", "/student/meetings/request", {token: T("btpstudent"), body: {slotId: {$gte: "000000000000000000000000"}, purpose: "x"}});
    check("meeting request rejects an operator slotId", r.status === 400, short(r));
    r = await call("POST", "/auth/login", {raw: "email[$ne]=x&pass=y", body: undefined});
    // (sent as JSON content-type with a non-JSON body: must fail cleanly, no stack)
    check("malformed body fails cleanly without a stack trace", r.status >= 400 && r.status < 500 && !/at .*\.js:\d+/.test(r.text), short(r));
    const form = await fetch(API + "/auth/login", {method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}, body: "email[$regex]=^demo&pass=" + encodeURIComponent(PW)});
    check("urlencoded operator injection on login is rejected", form.status === 400, String(form.status));
    r = await call("GET", "/test");
    const hdr = await fetch(API + "/test");
    check("X-Powered-By header is not sent", !hdr.headers.get("x-powered-by"), hdr.headers.get("x-powered-by") || "");

    // role boundaries
    if (HAS_GRADES) {
    r = await call("GET", "/faculty/grades/mycourses", {token: T("fd001")});
    check("student cannot call faculty grade routes", r.status === 403, short(r));
    r = await call("GET", "/academicoffice/gradings", {token: T("fd001")});
    check("student cannot call Academic Office routes", r.status === 403, short(r));
    r = await call("GET", "/academicoffice/gradings", {token: T("fdfed1")});
    check("faculty cannot call Academic Office routes", r.status === 403, short(r));
    }
    r = await call("GET", "/puser/feedback/dashboard/students", {token: T("fdfed1")});
    check("faculty cannot call admin feedback routes", r.status === 403, short(r));

    // ============================================================ C. grades end-to-end
    console.log("\nC. Grades (full flow on the FDFED demo course)");
    const course = await db.collection("courses").findOne({code: /^FDFED-DEMO-/});
    if (HAS_GRADES) {
    const courseId = String(course._id);
    // reset any previous run
    const oldG = await db.collection("coursegradings").findOne({course: course._id});
    if (oldG) for (const c of ["gradeentries", "sectionsheets", "coursegradingversions", "gradecorrectionrequests"]) await db.collection(c).deleteMany({courseGrading: oldG._id});
    await db.collection("coursegradings").deleteMany({course: course._id});
    await db.collection("courseattempts").deleteMany({courseKey: "FDFED"});

    r = await call("GET", `/faculty/grades/course?courseId=${courseId}`, {token: T("guide")});
    check("faculty not teaching the course cannot open it", r.status === 403, short(r));
    r = await call("GET", `/faculty/grades/course?courseId=${courseId}`, {token: T("fdfed1")});
    check("course faculty can open it", r.status === 200, short(r));

    const bad = [
        [{key: "__proto__", name: "P", rawMax: 10, weight: 100}],
        [{key: "a.b", name: "Dot", rawMax: 10, weight: 100}],
        [{key: "$x", name: "Dollar", rawMax: 10, weight: 100}],
        [{key: "ok", name: "Inf", rawMax: "Infinity", weight: 100}],
    ];
    for (const comps of bad) {
        r = await call("POST", "/faculty/grades/setcomponents", {token: T("fdfed1"), body: {courseId, components: comps}});
        check(`setcomponents rejects ${JSON.stringify(comps[0].key)} / rawMax ${comps[0].rawMax}`, r.status === 400, short(r));
    }
    const COMPONENTS = [
        {key: "eval1", name: "Eval 1", rawMax: 25, weight: 25}, {key: "eval2", name: "Eval 2", rawMax: 25, weight: 25},
        {key: "eval3", name: "Eval 3", rawMax: 25, weight: 25}, {key: "lab", name: "Lab Exam", rawMax: 40, weight: 25},
    ];
    r = await call("POST", "/faculty/grades/setcomponents", {token: T("fdfed2"), body: {courseId, components: COMPONENTS}});
    check("non-coordinator cannot set components", r.status === 403, short(r));
    r = await call("POST", "/faculty/grades/setcomponents", {token: T("fdfed1"), body: {courseId, components: COMPONENTS}});
    check("coordinator sets components", r.status === 200, short(r));
    r = await call("POST", "/faculty/grades/agreecomponents", {token: T("fdfed2"), body: {courseId}});
    check("co-teacher agrees, components lock", r.json?.locked === true, short(r));

    const sheets = JSON.parse(fs.readFileSync("C:/IIITS/AP/demo-fdfed/marks.json", "utf8"));
    const toRows = (list) => list.map((x) => ({rollNumber: x["Roll No"], marks: Object.fromEntries(COMPONENTS.map((c) => [c.key, x[c.name]]))}));
    const rows1 = toRows(sheets[0].rows), rows2 = toRows(sheets[1].rows);
    // attacks on save
    const victimRow = rows2[0];
    r = await call("POST", "/faculty/grades/savemarks", {token: T("fdfed1"), body: {courseId, rows: [{rollNumber: rows1[2].rollNumber, marks: {...rows1[2].marks, eval1: 999}}]}});
    check("marks above the component maximum are rejected at save", r.json?.rejected?.length === 1 && r.json?.saved === 0, short(r));
    r = await call("POST", "/faculty/grades/savemarks", {token: T("fdfed1"), body: {courseId, rows: [{rollNumber: rows1[2].rollNumber, absent: true, marks: {}}]}});
    check("a regular enrolled student cannot be marked absent", r.json?.rejected?.length === 1 && r.json?.saved === 0, short(r));
    r = await call("POST", "/faculty/grades/savemarks", {token: T("fdfed1"), body: {courseId, rows: [{rollNumber: rows1[2].rollNumber, marks: {eval1: {$gt: 0}}}]}});
    check("savemarks rejects operator objects in marks", r.status === 400 || r.json?.saved === 0, short(r));
    r = await call("POST", "/faculty/grades/savemarks", {token: T("guide"), body: {courseId, rows: rows1.slice(0, 1)}});
    check("faculty not teaching the course cannot save marks", r.status === 403, short(r));

    r = await call("POST", "/faculty/grades/savemarks", {token: T("fdfed1"), body: {courseId, rows: rows1}});
    check(`faculty 1 saves own section (${rows1.length})`, r.json?.saved === rows1.length, short(r));
    r = await call("POST", "/faculty/grades/savemarks", {token: T("fdfed2"), body: {courseId, rows: rows2}});
    check(`faculty 2 saves own section (${rows2.length})`, r.json?.saved === rows2.length, short(r));
    // faculty 1 tries to overwrite a faculty-2 student's marks
    const v2before = await db.collection("gradeentries").findOne({student: (await db.collection("students").findOne({rollNumber: victimRow.rollNumber}))._id});
    r = await call("POST", "/faculty/grades/savemarks", {token: T("fdfed1"), body: {courseId, rows: [{rollNumber: victimRow.rollNumber, marks: {eval1: 0, eval2: 0, eval3: 0, lab: 0}}]}});
    const v2after = await db.collection("gradeentries").findOne({_id: v2before._id});
    check("a co-teacher cannot overwrite another section's marks", JSON.stringify(v2after.marks) === JSON.stringify(v2before.marks) && r.json?.saved === 0, short(r));
    await call("POST", "/faculty/grades/dropconflict", {token: T("fdfed1"), body: {courseId, studentId: String(v2before.student)}});

    for (const n of ["fdfed1", "fdfed2"]) {
        r = await call("POST", "/faculty/grades/markready", {token: T(n), body: {courseId}});
        check(`${n} marks section ready`, r.status === 200, short(r));
    }
    r = await call("POST", "/faculty/grades/submit", {token: T("fdfed2"), body: {courseId, confirmUnassigned: true}});
    check("non-coordinator cannot submit", r.status === 403, short(r));
    r = await call("POST", "/faculty/grades/submit", {token: T("fdfed1"), body: {courseId, confirmUnassigned: true}});
    check("coordinator submits", r.status === 200, short(r));
    r = await call("POST", "/faculty/grades/savemarks", {token: T("fdfed1"), body: {courseId, rows: rows1.slice(0, 1)}});
    check("marks are locked after submission", r.status === 409, short(r));
    for (const n of ["fdfed1", "fdfed2"]) await call("POST", "/faculty/grades/cc/approve", {token: T(n), body: {courseId}});
    const grading = await db.collection("coursegradings").findOne({course: course._id});
    check("both approvals move it to approved", grading.status === "approved", grading.status);
    r = await call("POST", "/academicoffice/release", {token: T("academicoffice"), body: {gradingId: {$ne: null}}});
    check("AO release rejects an operator gradingId", r.status === 400, short(r));
    r = await call("POST", "/academicoffice/release", {token: T("fdfed1"), body: {gradingId: String(grading._id)}});
    check("faculty cannot release", r.status === 403, short(r));
    r = await call("POST", "/academicoffice/release", {token: T("academicoffice"), body: {gradingId: String(grading._id)}});
    check("Academic Office releases", r.status === 200, short(r));
    const gradingId = String(grading._id);

    // student-side isolation
    const me = await db.collection("students").findOne({email: `demo.fd001${D}`});
    r = await call("GET", "/student/grades/mygrades", {token: T("fd001")});
    check("student sees their own released grade", r.json?.grades?.some((g) => String(g.gradingId) === gradingId), short(r));
    r = await call("GET", `/student/grades/coursedetail?gradingId=${gradingId}`, {token: T("fd001")});
    const otherRolls = [...rows1, ...rows2].map((x) => x.rollNumber).filter((x) => x !== me.rollNumber);
    const leaked = otherRolls.filter((roll) => r.text.includes(roll));
    const otherNames = (await db.collection("students").find({rollNumber: {$in: otherRolls}}).project({name: 1, email: 1}).toArray());
    const leakedNames = otherNames.filter((s) => r.text.includes(s.email) || r.text.includes(`"${s.name}"`));
    check("course detail contains no other student's roll, name or email", r.status === 200 && !leaked.length && !leakedNames.length, `${leaked.length} rolls, ${leakedNames.length} names leaked`);
    check("course detail has no per-student rows of others", !r.json?.rows && !r.json?.students, Object.keys(r.json || {}).join(","));
    r = await call("GET", `/student/grades/coursedetail?gradingId=${gradingId}`, {token: T("btpstudent")});
    check("student not in the course gets nothing for its gradingId", r.status === 404, short(r));
    r = await call("GET", `/student/grades/coursedetail?gradingId=${gradingId}&gradingId=${fakeId}`, {token: T("btpstudent")});
    check("array gradingId does not bypass the check", r.status === 404 || r.status === 400, short(r));
    r = await call("POST", "/student/grades/requestcorrection", {token: T("btpstudent"), body: {gradingId, message: "mine?"}});
    check("student cannot file a correction on a course they don't have", r.status === 404, short(r));
    r = await call("POST", "/student/grades/requestcorrection", {token: T("fd001"), body: {gradingId: {$ne: null}, message: "x"}});
    check("requestcorrection rejects an operator gradingId", r.status === 400 || r.status === 404, short(r));
    r = await call("GET", `/faculty/grades/versions?courseId=${courseId}`, {token: T("guide")});
    check("non-teaching faculty cannot read version history", r.status === 403, short(r));
    r = await call("GET", `/faculty/grades/compare?courseId=${courseId}&a=1&b=1`, {token: T("guide")});
    check("non-teaching faculty cannot compare versions", r.status === 403, short(r));

    // amendments
    r = await call("POST", "/faculty/grades/openamendment", {token: T("fdfed2"), body: {courseId, type: "correction", reason: "x", rollNumbers: [rows1[2].rollNumber]}});
    check("non-coordinator cannot reopen a released grading", r.status === 403, short(r));
    const gAfter = await db.collection("coursegradings").findOne({_id: grading._id});
    check("grading is still released after that attempt", gAfter.status === "released", gAfter.status);
    } else console.log("  skipped: grades routes not in this build");
    // ============================================================ D. feedback anonymity + admin scope
    console.log("\nD. Feedback anonymity and admin scope");
    await feedbackChecks(course);
} catch (e) {
    fail++; failures.push(`crashed: ${e.message}`);
    console.error("\nSuite crashed:", e);
} finally {
    await db.collection("users").deleteMany({email: `sectest.victim${D}`});
    await mongoose.disconnect();
}
async function feedbackChecks(course) {
    // Uses FDFED (fd001 is enrolled, fdfed1 teaches). Everything it touches is restored afterwards.
    const T = (n) => tokens[`demo.${n}${D}`];
    const sem = course.semester;
    const fd = await db.collection("students").findOne({email: `demo.fd001${D}`});
    const fac = await db.collection("faculties").findOne({email: `demo.fdfed1${D}`});
    const cfgBefore = await db.collection("feedbackconfigs").findOne({semester: sem});
    const anaBefore = await db.collection("analytics").findOne({faculty: fac._id});
    const ADMIN2 = `sectest.cseadmin${D}`;
    try {
        await db.collection("feedbackconfigs").updateOne({semester: sem}, {$set: {isOpen: true}}, {upsert: true});
        await db.collection("feedbacks").deleteMany({student: fd._id, semester: sem});

        let r = await call("GET", "/student/feedback", {token: T("fd001")});
        check("student opens the feedback page", r.status === 200, short(r));
        r = await call("POST", "/student/feedback/selectfaculty", {token: T("fd001"), body: {selections: [{courseId: String(course._id), facultyIds: [String(fac._id)]}]}});
        check("student picks the course faculty", r.status < 300, short(r));
        const qs = (await call("GET", "/questions", {token: T("fd001")})).json;
        const answers = qs.map((q) => ({question: q._id, response: q.type === "rating" ? 7 : "sectest anonymous comment"}));
        r = await call("POST", "/student/feedback/submitfeedback", {token: T("fd001"), body: {feedbacks: [{courseId: String(course._id), facultyId: String(fac._id), answers}]}});
        check("student submits feedback with a comment", r.status < 300, short(r));

        const ana = await db.collection("analytics").findOne({faculty: fac._id});
        const ce = ana?.courses?.find((c) => String(c.course) === String(course._id));
        const texts = (ce?.questions || []).flatMap((q) => q.textResponses || []);
        check("stored comment carries the writer's average rating", texts.length > 0 && texts.every((t) => typeof t.score === "number"), JSON.stringify(texts).slice(0, 120));

        r = await call("GET", `/faculty/feedback/course?courseId=${course._id}`, {token: T("fdfed1")});
        const items = [...(r.json?.feedback?.faculty || []), ...(r.json?.feedback?.course || [])];
        check("faculty sees results (any response count), comments with their score", r.status === 200 && typeof r.json?.avgscore === "number" && items.length > 0 && items.every((i) => typeof i.score === "number"), short(r));
        r = await call("GET", `/faculty/feedback/dashboard?semester=${sem}`, {token: T("fdfed1")});
        const row = r.json?.courses?.find((c) => String(c.courseId) === String(course._id));
        check("faculty dashboard shows that course's average", row && typeof row.avgscore === "number", JSON.stringify(row));
        r = await call("GET", `/faculty/feedback/course?courseId=${course._id}`, {token: T("guide")});
        check("another faculty cannot read these results", r.status === 404 || r.status === 403, short(r));

        // admin scope: a single-department admin can't act institute-wide
        await db.collection("users").deleteMany({email: ADMIN2});
        await db.collection("admins").deleteMany({email: ADMIN2});
        const ad = await db.collection("admins").insertOne({name: "Sectest CSE Admin", email: ADMIN2, departments: ["CSE"], isStaff: false, isDean: false});
        await db.collection("users").insertOne({name: "x", email: ADMIN2, password: await bcrypt.hash(PW, 10), role: "Admin", referenceId: ad.insertedId, lastlogin: new Date()});
        const cse = await login(ADMIN2);
        r = await call("POST", "/puser/feedback/toggleFeedback", {token: cse, body: {}});
        check("department admin cannot open/close feedback institute-wide", r.status === 403, short(r));
        r = await call("POST", "/puser/feedback/resetFeedback?semester=S25", {token: cse});
        check("department admin cannot wipe everyone's feedback", r.status === 403, short(r));
        r = await call("GET", "/puser/feedback/resetFeedbackPreview", {token: cse});
        check("department admin cannot preview a reset", r.status === 403, short(r));
        // the same admin made Dean: may reset, but only by repeating the semester code
        await db.collection("admins").updateOne({_id: ad.insertedId}, {$set: {isDean: true}});
        r = await call("POST", "/puser/feedback/resetFeedback", {token: cse, body: {}});
        check("Dean's reset without the semester code is refused", r.status === 400, short(r));
        r = await call("POST", "/puser/feedback/resetFeedback", {token: cse, body: {confirmSemester: {$ne: null}}});
        check("Dean's reset with an operator for the code is refused", r.status === 400, short(r));
        r = await call("POST", "/puser/feedback/resetFeedback", {token: cse, body: {confirmSemester: sem}});
        check("Dean's reset naming the running semester is refused", r.status === 400, short(r));
    } finally {
        await db.collection("feedbacks").deleteMany({student: fd._id, semester: sem});
        if (anaBefore) await db.collection("analytics").replaceOne({_id: anaBefore._id}, anaBefore);
        else await db.collection("analytics").deleteMany({faculty: fac._id});
        if (cfgBefore) await db.collection("feedbackconfigs").replaceOne({_id: cfgBefore._id}, cfgBefore);
        else await db.collection("feedbackconfigs").deleteMany({semester: sem});
        await db.collection("users").deleteMany({email: ADMIN2});
        await db.collection("admins").deleteMany({email: ADMIN2});
    }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) console.log("Failed:\n - " + failures.join("\n - "));
process.exitCode = fail ? 1 : 0;

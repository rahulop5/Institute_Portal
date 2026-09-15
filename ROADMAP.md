# IIIT Sri City Institute Portal — Status & Feature Roadmap

> Generated from a full read of the codebase on 2026-08-19.
> **Part A** is where the project actually stands today. **Part B** is the idea catalogue.

---

# Part A — Where the project stands

The portal is two products sharing one Express/Mongo backend:

- **Projects system** — BTP, Honors, Additional Project (AP). Student requests a topic (or proposes one, for AP) → faculty guide approves → project runs through evaluations by guide + panel → `completed`.
- **Course feedback system** — the only fully shipped end-to-end flow, live at `feedback.iiits.ac.in`.

Stack: Node ESM + Express 5 + Mongoose 8 (MongoDB `clgproject`), JWT auth with bcrypt, multer→local disk for CSV, nodemailer/Gmail for OTP only. Frontend is Vite + React 19 with react-router v7 data routers (loaders/actions, no state library), CSS Modules, chart.js, xlsx. No TypeScript, no tests, no AI/websockets/queues.

## ✅ Done and working

**Auth** (`backend/controllers/authController.js`, `frontend/src/components/Academics/FeedbackForm/login/`)
- Login issuing a 1-hour JWT; role stored in `localStorage`; auto-logout timer in `pages/Root.jsx`
- Change password, forgot-password OTP by email, OTP verification with auto-advance boxes, reset password
- Profile dropdown with inline name edit, roll number, department, batch, enrolled-course chips

**Course feedback — student** (fully shipped)
- Start page → per-course faculty selection modal → multi-page form (1–10 rating rows + free text), Save Progress partial persistence, validation that scrolls to the first unanswered item, final submit behind a confirm dialog
- Submit runs inside a Mongo transaction that also rolls responses into `Analytics`

**Course feedback — faculty**
- Overview: average score, impressions, courses taught, department
- Per-course statistics with doughnut (submitted vs pending) and line chart (avg per question), plus a comments table

**Course feedback — admin** (the most complete surface in the app)
- Faculty / Students / Courses tabs, department-scoped via `Admin.departments`
- Bulk CSV/XLSX import with mandatory preview for faculty, students, course rosters
- Course catalogue grouped by UG year, filtered by semester and level; course detail with inline edit and roster management; course delete; CSV export of students who haven't submitted
- Drill-down into any faculty's per-course analytics

**Infrastructure**
- GitHub Actions → SSH to VM → `pm2 restart backend` on push to `prod`; frontend on Vercel with SPA rewrite
- Semester derived from server clock (`backend/utils/semesterUtils.js`, `M25`/`S26` codes)

## 🔴 Broken — frontend and backend disagree

This is the most important section. **The April 2026 backend refactor rewrote the BTP model and the frontend was never migrated.**

| What | Detail |
|---|---|
| **BTP student UI is dead** | `frontend/src/pages/BTPStudentRouter.jsx:15` switches on `"NS"` / `"TF"` / `"FA"` / `"IP"`. `backend/controllers/ugstudentbtpController.js` returns `"TOPIC_SELECTION"` / `"IN_PROGRESS"` / `"COMPLETED"`. **Every case falls through to `<ErrorPage />`.** |
| **BTP faculty UI is dead** | `frontend/src/pages/BTPFacultyRouter.jsx:24` switches on `"NOT_STARTED"` / `"TEAM_FORMATION"` / `"FACULTY_ASSIGNMENT"` / `"IN_PROGRESS"`. `backend/controllers/facultybtpController.js:63` returns `"ACTIVE"`. **Also always `<ErrorPage />`.** |
| **BTP staff is 100% dead** | Every route in `backend/routes/staffbtpRoutes.js` is commented out. The controller depends on `BTPSystemState`, `BTPTeam`, `UGStudentBTP` — **models that no longer exist**. The frontend still calls these endpoints. |
| **Team formation is obsolete** | `approveTopicRequest` (`facultybtpController.js:154`) now creates a project with exactly **one** student. There are no bins, no teams, no team requests in the backend any more. The entire `components/Academics/BTP/staff/TeamFormation/` and `student/TF/` trees (~15 components) are built against a flow that was deleted. |

## ⚠️ Backend complete, frontend missing entirely

| Feature | Backend | Frontend |
|---|---|---|
| **Honors** | Full: `Honors.js`, `HonorsRegistration.js`, `HonorsTopic.js`, `HonorsEvaluation.js`, student + faculty controllers and routes mounted at `/student/honors`, `/faculty/honors` | **None.** No routes in `App.jsx`, no `components/Academics/Honors/` directory. Sidebar link commented out |
| **Additional Project (AP)** | Full: `AP.js`, `APRegistration.js`, `APEvaluation.js`, `APFacultyRequest.js` (student-written proposals), routes at `/student/ap`, `/faculty/ap` | **None.** The outstanding work is written up as a "Frontend TODO" at the end of `backend/AP_CHANGES.md` |
| **Feedback open/close window** | Done and newest (`FeedbackConfig.js`, `toggleFeedback`, `feedbackStatus` — commit `5f7a270`) | **None.** No admin toggle UI, no student-facing indicator. Student start page still shows a hardcoded "March 31, 2023" deadline |

## 🟡 Partial / rough edges

- **Dummy data still rendered in production paths** — `staff/inprogress/AddEvaluatorModal.jsx:5` renders a hardcoded `dummyFaculty` list and never calls the backend at all; `faculty/Buttons.jsx:10` (`dummyStudents`); large dummy blobs also in `TopicAddition.jsx`, `Teamlistpage.jsx`, `FacultyManagement.jsx`, `student/TF/Teamselection_bin23.jsx`
- **Hardcoded batches** — `"2022"` in three frontend loaders and two staff actions; `studentbatch: "2025"` hardcoded in `approveTopicRequest`
- **Navigation switched off** — `components/sidebar/Sidebar.jsx` has only Home + Logout live; BTP, Honors, Feedback, the whole People dropdown and Settings are commented out (icons still imported)
- **No landing page** — `pages/Homepage.jsx` is `<h1>HOMEPAGE</h1>`; `/` redirects straight to feedback. `/settings`, `/people/:x`, `/academics/:x` all render the `Lemp.jsx` stub
- **Header** — search input rendered with no handler or state; notification bell commented out (`Header.jsx:113`)
- **Leftovers** — `/temp` dev route renders admin `CourseDetails` outside the auth guard; `adminLoaders.jsx` redirects to a nonexistent `/login`; `facultyDashboard.jsx:32` calls `useLoaderData()` conditionally (hooks-rule violation); `Replacedialog.jsx` references undefined `team` / `onUpdateTeam`; `authRoutes.js:23` has `/me` disabled

## ❌ Not started

**Security / correctness**
- Bulk-created users get the hardcoded password `"yoyoyo"` (`feedbackadminController.js:1049`, `:1156`)
- `verifyOtp` never consumes the OTP; `resetPassword` never clears `otpAttemptCount`
- No rate limiting, no helmet, no request logging, no input-validation library
- No 404 handler and no global error handler (`//add the page not found thing` in `index.js`)
- Port 3000 and the CORS origin list are hardcoded; `.env` is present in the working tree
- `Analytics.textResponses` stores each comment next to the submitting student's own average score — a de-anonymisation vector if ever exposed

**Architecture**
- `Privilege` / `PrivilegedUser` / `Faculty.custompermissions` model a full RBAC system with inheritance that **nothing reads**. Authorization is role-gate only; there is no `hasPermission` helper
- `Faculty.role: "hod" | "faculty"` exists but no backend code branches on it
- `Faculty.achievements[]` is defined and never read
- **~12k lines of triplication** — BTP, Honors and AP are near-identical copies differing mainly in a max-evaluations constant (4 / 8 / 2) and AP's proposal-instead-of-topic flow. Every fix must be made three times
- All six auth middlewares live inside `authController.js`; `authHonorsStudentMiddleware` is a byte-for-byte duplicate of `authStudentMiddleware`

**Quality**
- No test infrastructure anywhere (`"test": "echo \"Error: no test specified\" && exit 1"`)
- No responsive/mobile layout (`index.css` hardcodes a 300px sidebar grid), no dark mode, no accessibility pass
- The deploy workflow's fallback starts `server.js`, but the entry file is `index.js`

## The team-formation question

The frontend is not simply "wrong" here — it is built against a backend that was **deliberately deleted** in commit `bdb5278` ("total refactoring of btp p1").

The deleted `backend/models/BTPSystemState.js` carried exactly the phases the frontend still switches on:

```js
enum: ["NOT_STARTED", "TEAM_FORMATION", "FACULTY_ASSIGNMENT", "IN_PROGRESS", "COMPLETED"]
```

And the deleted `backend/models/BTPTeam.js` modelled the bins policy directly — `bin1` (required, the leader) plus optional `bin2` and `bin3`, each with an `approved` flag, plus a 4-slot `preferences` array and a `currentPreference` round counter. That is a real institutional policy someone designed on purpose, presumably to balance teams across performance bins.

**This is a product decision, not a technical one:** does BTP at IIIT Sri City use 3-person binned teams, or individual projects?

What makes it easier than it looks — **the current schema already supports teams at the data level**:
- `BTP.students` is an array of student refs, not a single ref
- `BTPEvaluation.marksgiven` is already per-student
- every read path already populates and maps over the `students` array

Only two things are actually missing: the team *formation* flow and the phase state machine. And both are recoverable rather than rewritable:
- `backend/controllers/staffbtpController.js` still contains all 1270 lines, commented out but intact
- both deleted models are one command away — `git show bdb5278^:backend/models/BTPTeam.js`

**Recommendation:** confirm the policy with the department first. If BTP is a group project — which is the norm for B.Tech projects in India, and what the bins design implies — **restoring is the cheaper path**, because the code still exists in comments and in git, whereas deleting means discarding ~15 finished frontend components and rewriting both routers. Only go individual if the department has genuinely moved to solo BTPs.

*(User decision: repair is deferred — this section documents the problem and the recommendation; the fix is not scheduled in this round.)*

## Suggested order of repair (deferred, for later scheduling)

1. Settle the team-formation policy question above
2. Fix the BTP phase contract in both routers — Honors and AP will inherit whatever shape is settled on
3. Build the Honors + AP frontends per `AP_CHANGES.md`
4. Re-enable the sidebar and give `Homepage.jsx` real content
5. Wire the `FeedbackConfig` open/close UI
6. Then layer on new features from Part B

---

# Part B — Feature idea catalogue

## B1 · Day-to-day student utility

These are the ones a student would open *weekly*.

### 12. Past Papers & Study Material Archive ⭐
**Moment it serves:** the week before every mid-sem and end-sem.

Per course, per semester: previous years' question papers, quizzes, lab manuals, and reference material. Searchable by course code, browsable by department and UG year.

This is the most-traded commodity among Indian engineering students and it currently lives in dying Google Drive links and senior-year WhatsApp groups. The portal already models exactly the right index — `Course` carries `code`, `semester`, `department`, `ug`, and `Enrollment` already decides who may see what.

**Contribution model (decided): students contribute, faculty approve.** Any enrolled student can upload a paper against a course; it stays in a pending queue until the course faculty or a department admin approves it. This matches how papers actually circulate — students are the ones who have them — while keeping a human gate before anything is visible.

Implied by that decision:
- A `status: pending | approved | rejected` field and an approval queue surface for faculty, mirroring the Accept/Reject pattern already built for BTP topic requests
- An uploader reference for accountability, plus a report/takedown path for material that shouldn't be there
- A duplicate check, since many students will upload the same paper
- Faculty need a notification when items are waiting — which is idea 5, currently unbuilt

*Still open:* whether solutions and notes are in scope or question papers only (solutions raise an "is this cheating" question with faculty), and whether the institute treats past papers as controlled material.

*Blocker:* `config/multer.js` accepts CSV only and writes to `backend/uploads/` on the deploy VM, which pm2 redeploys — uploads there do not survive. A storage decision is required before this is buildable: a thin storage abstraction (local driver now, S3 later) is the recommended path.

### 13. Course Doubt Forum / Q&A ⭐
**Moment it serves:** 11pm before an assignment is due.

A private Stack Overflow scoped per course. Students post doubts, peers and faculty answer, answers get voted and marked resolved — and threads **persist into next year's offering of the same course**.

Doubts currently die in WhatsApp scrollback and get re-asked from scratch annually. Scoping is already solved by `Enrollment`, faculty attribution by `Course.faculty[]`. This compounds: after three semesters it is the most valuable academic asset in the portal.

### 14. Degree Audit & Credit Planner ⭐
**Moment it serves:** registration week, and the year-3 "will I graduate on time?" panic.

Not a GPA lookup — forward planning. Credits earned vs required **per category**, which courses fill each remaining bucket, and a plan across remaining semesters. Plus **Honors eligibility**: what extra coursework the Honors degree requires and whether the student is on track.

`Course.coursetype` already enumerates Institute Core / Program Core / Institute Elective / Program Elective — exactly the right buckets — and `credits`, `ug` and `Enrollment` supply the rest. The only missing input is a per-programme requirement table.

Closes a real gap: the app runs Honors *projects* today while telling students nothing about the Honors *coursework* requirement.

### 15. Research & Assistantship Opportunity Board ⭐
**Moment it serves:** any student who wants research exposure, a paper, or a credible LOR.

Faculty post open positions — RA slots, summer projects, paper collaborations, TA-ships — with required background and duration. Students apply in-portal; faculty triage.

Today this runs on cold email, so research exposure goes to students who already knew which professor to write to. A visible board is a genuine equity win. Reuses the request/approve pattern already implemented for AP proposals (`APFacultyRequest.js`), and pairs with idea 3.

### 16. Office Hours & Consultation Booking
Faculty publish weekly availability; students book a slot. Low complexity, high everyday relief — students currently hover outside cabins guessing. Extends the faculty profile from idea 3.

### 17. Prerequisite & Course Dependency Map
A visual graph of which courses unlock which, overlaid with what the student has completed. Makes idea 14's planning legible at a glance and surfaces the traps only seniors know. Needs a prerequisite field on `Course`.

### 18. Peer Study Groups
Opt-in matching within a course. Modest alone, but nearly free once idea 13's course-scoped rooms exist.

## B2 · Institutional knowledge

High-stakes, but opened a few times a year rather than weekly.

### 1. Elective & Course Insight Hub ⭐
**Moment it serves:** registration week.

Each course shows aggregated prior-semester ratings per instructor, a workload signal, what it actually covers, prerequisites, and moderated student comments.

**Students fill in detailed feedback every semester and get nothing back.** `models/feedback/Analytics.js` already stores per-faculty → per-course → per-question `average`/`min`/`max`/`responseCount` plus `textResponses`. This is a read surface over data students already produce and never see.

*Guardrails:* publish only above ~10 responses per course-instructor pair; strip `textResponses.score` from student-facing payloads (see the de-anonymisation note in Part A); give faculty/admin an opt-in publication toggle alongside `FeedbackConfig`.

### 2. Project Archive ⭐
Every `status: "completed"` project becomes a permanent searchable record — title, abstract, guide, year, team, tags, report, slides, repo link. Filter by department, year, guide, keyword.

Right now a finished project flips to `completed` and disappears. Juniors can't see what seniors built, faculty have no portfolio, and nobody can tell whether a proposal duplicates prior work. The records are already in Mongo.

### 3. Faculty Research & Guide Directory ⭐
A profile page per faculty — research areas, publications, courses taught, **current guiding load against capacity** ("2 of 5 slots open"), and past projects guided (linking into idea 2).

`Faculty.achievements[]` exists and is read by nothing. The People dropdown is already written and commented out in `Sidebar.jsx`. Guiding load is derivable by counting `BTP.guide` / `Honors.guide` / `AP.guide` references. Directly improves the topic-preference decision students currently make blind.

### 4. Mid-semester Pulse Feedback ⭐
A short (~5 question) anonymous mid-semester check, plus a "here's what I'm changing" reply the instructor posts back to the class.

End-of-semester feedback only helps next year's cohort — the students filling it in get nothing. This is the single change that makes feedback useful to the people producing it, and it reuses the whole existing engine: `Feedback`, `Question` filtered by a new tag, and a second `FeedbackConfig` window per semester.

### 5. Deadline Timeline + Notifications
One view: next evaluation date, feedback window, pending project update. Plus an in-app notification centre and email digest.

Fills the stub `Homepage.jsx`, revives the commented-out bell in `Header.jsx`, gives `FeedbackConfig.isOpen` its missing UI. `nodemailer` is already configured; evaluation dates already exist as `*Evaluation.time`.

### 6. Milestone Deliverable Submission
Per-evaluation upload of report, slides and code, with versions, deadlines and inline guide comments. `*Evaluation.resources[]` is a bare URL list today, so in practice students email PDFs. Shares the storage decision with idea 12.

## B3 · Faculty-facing

### 7. Rubric-based Evaluation
Replace the single `guidemarks: Number` with weighted criteria — novelty, implementation, report quality, presentation, individual contribution. Students currently receive a mark out of 50 with no explanation. Rubrics make feedback actionable, expose panel-vs-guide divergence, and make grading defensible.

### 8. Individual Contribution Visibility
Attribute each `updates[]` entry to the student who wrote it, and let every team member post. Currently updates are unattributed and only the bin-1 student can add one — neither guide nor panel can see who did the work. *(Note: depends on the team-formation decision in Part A.)*

### 9. Guide Load & Allocation Dashboard
For HOD/staff: request distribution across faculty, over- and under-subscribed guides, unallocated teams. `Faculty.role: "hod"` exists but nothing branches on it, and allocation is effectively first-come with the staff routes dead.

### 10. Longitudinal Teaching Analytics
"Am I improving?" — score trend per question across semesters against an anonymised department average. `getAvailableFacultySemesters` and `LineChartBox.jsx` already exist; only the cross-semester query and view are missing.

### 11. Per-course Question Sets
Let a department or course use a tailored question set. `Question` is one flat global collection today, with questions 14 and 15 hardcoded as optional in the submit logic. A lab course, a theory course and a design studio need different questions.

---

# Recommendation

**Repair first.** BTP is the flagship module and it currently renders an error page for both students and faculty. Nothing new should be layered on until the phase contract is fixed and the Honors/AP frontends exist.

**Then build, in this order:**

1. **Past Papers Archive** (12) — highest weekly usage, index already modelled
2. **Course Insight Hub** (1) — smallest build of the majors; finally gives students something back for the feedback they submit
3. **Degree Audit & Credit Planner** (14) — highest stakes; closes the Honors coursework gap
4. **Course Doubt Forum** (13) — largest new surface, but compounds every semester
5. **Research & Assistantship Board** (15) — reuses the AP request/approve pattern

---

---

# Plan of record

**This round's deliverable is this document itself.** No code changes.

**Action:** write this file to the repository as `ROADMAP.md` at the project root, so the status audit and idea catalogue live alongside the code and stay reviewable in git. It slots in next to the three existing docs in `backend/` (`PROJECTS_API.md`, `FEEDBACK_API.md`, `AP_CHANGES.md`), which are API references rather than status or planning documents — there is currently no root README or roadmap of any kind.

**Decisions captured:**
- BTP is broken; **documented, not fixed** in this round (user's call — "we will fix it later")
- Team formation: analysed above, with a recommendation to restore rather than delete, pending a policy confirmation from the department
- Past Papers Archive: **students contribute, faculty approve**
- Honors and AP frontends remain the agreed next build, per `backend/AP_CHANGES.md`

**Still open, to resolve before Past Papers implementation steps can be written:**
- Whether solutions and notes are in scope, or question papers only
- File storage approach — recommended: a thin storage abstraction with a local driver now and S3 later

## Verification

This deliverable is a document, so verification is review rather than test execution:

1. `git status` shows exactly one new untracked file, `ROADMAP.md` at the repo root — no source files touched
2. Spot-check the Part A claims that drive decisions, each of which is falsifiable:
   - `frontend/src/pages/BTPStudentRouter.jsx:15` switches on `NS`/`TF`/`FA`/`IP` while `backend/controllers/ugstudentbtpController.js` returns `TOPIC_SELECTION`/`IN_PROGRESS`/`COMPLETED`
   - `frontend/src/pages/BTPFacultyRouter.jsx:24` versus `facultybtpController.js:63` returning `"ACTIVE"`
   - every route in `backend/routes/staffbtpRoutes.js` is commented out
   - `git show bdb5278^:backend/models/BTPTeam.js` still returns the deleted team model
3. Confirm the "backend done, frontend missing" table by grepping `frontend/src/App.jsx` for `honors` and `ap` — neither appears
4. Optionally render the markdown to check tables and headings display correctly

---

# Round 2 — decisions and two-person work split (2026-09-14)

Verified against current `main` (last commit `5f7a270`, no code drift since the Part A audit — commit dates just lag the calendar, nothing changed underneath). Spot-checked again: `BTPStudentRouter.jsx` switches on `NS/TF/FA/IP`, `ugstudentbtpController.js` returns `TOPIC_SELECTION/IN_PROGRESS/COMPLETED`; `BTPFacultyRouter.jsx` switches on four phases, `facultybtpController.js` returns only `ACTIVE`, always — so the faculty router shouldn't switch on phase at all, it should render one dashboard with a topics/requests section and a projects-to-guide/evaluate section, both live at once. `staffbtpRoutes.js` is 36 commented lines of 43, 0 active. No `components/Academics/Honors/` or `.../AP/` directory exists; nothing in `App.jsx` references either.

**Decisions:**
- **BTP team policy: individual projects.** The current backend (`BTP.students` holding one entry per `approveTopicRequest` call, no bins/preference rounds) is the target shape. The ~15 team-formation components (`staff/TeamFormation/`, `student/TF/`, `FacultySelection`) are dead weight to delete, not a contract to restore.
- **Dean Academic = a new Admin-like role**, scoped to see feedback analytics across all three departments (bypassing `Admin.departments` filtering), without Faculty/Student/Course management access.
- **Order: BTP contract fix first**, since Honors/AP frontends are meant to copy whatever component pattern BTP settles on (same near-identical backend shape, per the ~12k-line-triplication note above).

## Two-person split

**Person A — BTP repair + Honors frontend + staff rebuild**
1. ✅ **Done (2026-09-14)** — `BTPStudentRouter.jsx` now switches on `TOPIC_SELECTION` / `IN_PROGRESS` / `COMPLETED`. Deleted `NotStarted.jsx` (was a one-line stub, not a real component) and both `Teamselection_bin*`/`FA/Facultyselection.jsx` (dead team-formation tree, confirmed zero references elsewhere via repo-wide grep before deleting) — replaced with a new `TopicSelection.jsx` that browses faculty-posted topics and requests/withdraws by preference, matching `requestTopic`/`withdrawRequest` in `ugstudentbtpController.js`. Added the previously-missing `Completed.jsx` view. Fixed two real bugs in `Inprogress.jsx`: it rendered `data.nextEvalDate`/`data.currentScore` fields the backend never sends (would crash), and gated the update form on `data.bin === 1`, a bins concept that no longer exists — replaced with real derived values (evaluations-completed count, latest guide marks pulled from `evaluations[].marksgiven`, latest remark) and removed the bin gate. Also removed ~8 unused component imports and an unused CSS import that were dead in `Inprogress.jsx` from a prior abandoned refactor.
   **Found and fixed a real backend bug while testing**: `ugstudentbtpController.js`'s `getBTPDashboard` populated `requests.topic` (`.populate({path: 'requests.topic', select: 'faculty'})`), which silently broke `requestStatus` matching — comparing a populated document's `.toString()` (`"[object Object]"`) against a topic id would never match, so every request looked unrequested (`requestStatus: null`) even once "Pending". The populated field was write-only (nothing read `.faculty` off it) — removed the populate.
   Verified the **full loop live in browser + curl**: dev student browses real topics → requests one → faculty (dev account) sees it in Requests tab → faculty approves → student's dashboard flips to `IN_PROGRESS` with correct project, guide, team, evaluation progress, and remarks, all from real Mongo data, zero fabricated fields. (Also fixed `BTPStaffRouter.jsx`'s now-broken `NotStarted` import so the frontend still builds — staff BTP itself remains out of scope for this round, per item 4 below.)
2. ✅ **Done (2026-09-14)** — `BTPFacultyRouter.jsx`: dropped the phase switch, now always renders `TopicAddition` + `EvaluationPage` together since the backend always returns `ACTIVE`. Fixed `TopicAddition.jsx`'s missing null-guard on `data.topics` (would've crashed for any faculty with zero posted topics). Rewrote `Requests.jsx` off the dead team/bin shape (`req.teamid.bin1.student...`) onto the real flat shape (`req.student`, `req.topic`, `req.topicDetails`) and dropped its "Accepted Requests" section — approved/rejected requests are deleted server-side, not flagged, so there's nothing to show there. Removed dead mock data (`data2`) from `TopicAddition.jsx` and `EvaluationPage.jsx` (`EvaluationList`/`Overview`/`EvaluationListHeader` needed no changes — already matched the real backend shape). Verified in a live browser session against a throwaway dev Faculty account (`backend/_createdevfaculty.mjs`): topics tab, requests tab (empty state), and guiding/evaluating/requests project tabs all render; `Add Topic` round-tripped to Mongo correctly. **Not yet tested**: the approve/reject request flow itself, since no test Student account exists yet to actually submit one.
3. Delete the team-formation tree and its `App.jsx` wiring; remove dummy data (`AddEvaluatorModal.jsx`, `Buttons.jsx`, `TopicAddition.jsx`, `Teamlistpage.jsx`, `FacultyManagement.jsx`).
4. Staff BTP: rebuild small, not restore. Team-formation/bins/preference-rounds are gone for good, so re-enable only what still makes sense from the commented `staffbtpController.js` (dashboard, view-project, assign-evaluator) — confirm the actual remaining staff need before writing it.
5. Fix hardcoded `studentbatch: "2025"` (`facultybtpController.js` `approveTopicRequest`) and the `"2022"` hardcodes in frontend loaders — derive from `semesterUtils.js`.
6. Once 1–2 are solid, port the same component pattern into **Honors** (`components/Academics/Honors/`, `/student/honors` + `/faculty/honors`) — near-identical to BTP, just an 8-evaluation cap instead of 4. Wire into `App.jsx`; re-enable the Honors sidebar link. Surface the BTP/Honors mutual-exclusion error (already enforced backend-side) cleanly in the UI.

**Person B — AP frontend (new build) + Dean Academic**
1. AP frontend (`components/Academics/AP/`, `/student/ap` + `/faculty/ap`) — differs from BTP/Honors in that students propose their own topic to a faculty (`APFacultyRequest`) instead of browsing faculty-posted topics, so the student side needs a propose-a-project form, not a topic list. The faculty side (approve/reject a proposal, guide/eval projects) can still follow Person A's BTP dashboard pattern once it lands — check in with Person A rather than inventing a second pattern.
2. Dean Academic: add an `Admin.scope` (or similar) flag; admin analytics controllers skip the `departments` filter when set; cut-down sidebar (analytics only, no management tabs) on the frontend when flag is set. Seed the account the way `backend/_createdevadmin.mjs` does.
3. Independent of the above, pick up the **Feedback open/close window UI** (`FeedbackConfig`/`toggleFeedback` already shipped backend-side, no frontend toggle) — zero dependency on BTP/Honors/AP, good to fill gaps while waiting on Person A's pattern to stabilize.

---

# Round 3 — `feedback_frontend` is the real frontend; Round 2's build plan is superseded (2026-09-15)

**Major discovery**: a sibling repo at `../feedback_frontend` (github.com/portalsupport-iiits/feedback_frontend) is the actual Vercel-deployed production frontend for this exact backend — not `Institute_Portal/frontend`. Evidence: `vercel.json` with the SPA rewrite; its Vercel URL (`feedback-frontend-uk6j.vercel.app`) is hardcoded in `backend/index.js`'s CORS allowlist alongside `feedback.iiits.ac.in`; same author (`Rahul <venkatrahulxyz@gmail.com>`) commits to both repos, plus two contributors (`Abhiram-19`, `portalsupport-iiits`) who never touch `Institute_Portal`; its two most recent commits (`stop feedback implemented`, `hide ap`, both 2026-05-24) are twins of `Institute_Portal`'s last commit (`5f7a270`, same message, same day).

**BTP, Honors, and AP are already fully built there** — student + faculty, phase-matched exactly against the current backend (`TOPIC_SELECTION`/`IN_PROGRESS`/`COMPLETED`/`ACTIVE`/`FACULTY_SELECTION`), including a `CONFLICT` phase for the BTP↔Honors mutual-exclusion 400 that neither Round 2 build handled. Honors reuses BTP's components entirely via `src/util/programConfig.js` (`programType: "btp"|"honors"|"ap"` → API base, eval count, routes) — a cleaner answer to the "~12k lines of triplication" problem than literally porting the pattern three times. AP has its own propose-a-project flow (`APFacultySelection.jsx`) matching `requestFaculty`/`withdrawRequest` in `ugstudentapController.js` exactly.

**All three are deliberately gated behind a "Coming Soon" page**, not incomplete: commits `d87e2ea "blocked btp and honors"` (2026-04-18) and `6fd9141 "hide ap"` (2026-05-24) redirect the index route of each to `BTPUnderConstruction.jsx` while leaving the actual routes/components intact underneath. **Why they're gated is unknown and needs a real answer from Rahul/the team** — possibly the same team-formation policy question this doc raised in Part A, possibly something else. Nothing below should ship until that's answered.

**Staff BTP is equally dead in both repos** — same abandoned team-formation component tree, same fully-commented-out `staffbtpRoutes.js`. This part of Round 2's plan (item 4, staff rebuild) is still needed regardless of which frontend is used going forward.

## Bugs found by comparing the two implementations, fixed in `feedback_frontend` (2026-09-15)

1. **Hardcoded fake student name** — `Inprogress.jsx` showed `"Sahal Ansar Reddy"` for every student regardless of who was logged in. Fixed to read `data.project.team[0].name` (safe for individual projects — exactly one team member).
2. **Fabricated "Next Evaluation" date** — showed today's actual date as if it were a scheduled evaluation; no such data exists in the schema (same root issue fixed earlier in `Institute_Portal/frontend`). Replaced with a real "Evaluations Completed X of Y" stat, reusing the same card styling.
3. **Dead `currentScore`/`latestRemark` variables** — computed from `evaluations[].marksgiven`/`.remark` but never rendered anywhere. Now surfaced as "Latest Marks" / "Remark" cards. Also fixed the `marksgiven` read itself — it's an array (`currEval.marksgiven.filter(...)` server-side), not a scalar, so the old code would have shown `[object Object]` had it ever been rendered.
4. **Dead "Accepted Requests" section** in faculty `Requests.jsx` — same bug independently found and fixed in `Institute_Portal/frontend`: `facultybtpController.js`'s `approveTopicRequest` *deletes* a request from `BTPTopic.requests` on approval rather than flagging it, so an "Accepted" filter over that array can never match anything. Removed the section entirely.
5. Removed 8 unused component imports (`ProjectCard`, `EvaluationCard`, `ProgressCard`, `NextEvalCard`, `TeamCard`, `RemarksCard`, `ScoreCard`, `EvaluationDetails`) and 3 unused asset/component imports left over from an abandoned card-based redesign in `Inprogress.jsx` — the file had moved to raw JSX everywhere else in the file already.

**Not fixed (flagged, not touched)**: a dummy-data fallback block that was removed from `Inprogress.jsx` as part of fix #2's edit (it would silently render a fake demo project — `"AI-based Code Generator (Dummy Data)"` — if the API response was ever malformed, masking real failures instead of surfacing them). Everything else in Round 2's original bug list for this file is now addressed.

All fixes verified live: `npx eslint` clean of new issues, `npx vite build` clean, and browser round-tripped against the real local backend (dev accounts below) — student requests a topic → faculty approves → student's dashboard shows the real name, real evaluation count, real (empty) marks/remark, and the Requests tab shows no dead "Accepted" section.

## Local dev setup for `feedback_frontend`

- `.env` (gitignored) needs `VITE_API_URL="http://localhost:3000"` pointing at the same local backend
- Dev server must run on port 5173 specifically — `backend/index.js`'s CORS allowlist only whitelists `http://localhost:5173` for local origins, not other ports
- Reuses the same dev accounts as `Institute_Portal/frontend` testing (same backend): `dev.student@iiits.in`, `dev.faculty@iiits.in` — passwords rotate when reset via `backend/_createdevstudent.mjs --reset` / `_createdevfaculty.mjs --reset`, check terminal output for the current one rather than assuming a memory is still valid

## What's actually left, reassessed

1. ~~Get the gating question answered~~ — **resolved**: it was gated because it wasn't ready; the fixes below are part of getting it ready.
2. **Staff BTP rebuild** — dead in both repos, unaffected by this discovery, still needed (Round 2 item 4)
3. **Testing still owed**: evaluate-as-panel-evaluator flow end-to-end (guide flow now tested, see below), Honors + AP faculty sides, the `COMPLETED` phase live (no project has reached max evaluations yet)
4. **Verify** whether `feedback_frontend` has the same hardcoded batch-year issues Round 2 flagged in `Institute_Portal/frontend`
5. Dean Academic role — unstarted, unaffected by this discovery
6. The Round 2 two-person split (Person A/B, above) is superseded for BTP/Honors/AP build work — that work already exists. What's left from it: staff rebuild (item 4) and Dean Academic + Feedback window UI (Person B items 2–3), which are unaffected by this discovery.

## More bugs found while testing the evaluate flow (2026-09-15) — all fixed, backend + `feedback_frontend`

Testing evaluate-as-guide surfaced two **backend** bugs — both in `facultybtpController.js`, and copy-pasted identically into `facultyhonorsController.js` and `facultyapController.js` (same triplication pattern as everywhere else in this codebase). Fixed in all three.

1. **Guide-entered marks were saved against the wrong reference, silently, every time.** `evaluateProjectasGuide` took `marks[].studentId` from the client and wrote it straight into `marksgiven.student`, but that field `ref`s `BTPRegistration` (not `Student`) — and the client only ever has the `Student._id` available (that's what `viewProject`'s flattened student list exposes). Confirmed empirically: submitted a real evaluation via the browser, then queried Mongo directly — `marksgiven[0].student` held the `Student._id`, not the `BTPRegistration._id` every reader compares against (including the student's own dashboard, which would therefore never match and would show "Not yet evaluated" forever no matter how many evaluations happened). Fixed by populating `students.student` on the project and resolving each `studentId` against the project's own team before saving — also means a mark can no longer be silently mis-attributed to a student not on the project. Verified: submitted a second evaluation after the fix, confirmed `marksgiven[0].student` now correctly matches the `BTPRegistration._id`, and the faculty-side "Evaluations Completed" counter correctly shows 2/4.
2. **Panel-evaluator marks were collected in the UI and then discarded.** `evaluateProjectasEval` destructured `panelmarks` from the request body and never used it anywhere — `panelEvaluations[i].panelmarks` (a real schema field) was never written. Only `submitted` and `remark` were saved. Fixed to actually save `panelmarks` (mapped to `{student, marks}`) and `submittedAt`; added the same request validation `evaluateProjectasGuide` already had (`Array.isArray`, required fields).

In `feedback_frontend`: fixed the same fabricated "Next Evaluation" date bug (found in the student's own view last round) in the **faculty's** project view (`StudentInProgress.jsx`) — its loader had an explicit `/* Compute next evaluation date (30 days from now as placeholder) */` comment, generating a fake date exactly like the student-side one did. Replaced with the same real "Evaluations Completed X of Y" stat. Verified live.

## Round 4 — marks release/pooling feature, built end-to-end (2026-09-15)

The "marks can never reach a student" gap from Round 3 (`canstudentsee` hardcoded `false`, nothing ever sets it `true`) is now resolved, per this policy decided with the user:

- **No panel evaluators on the project** → the guide's marks are the final marks; released to the student automatically the moment the guide submits.
- **Panel evaluators assigned** → nothing releases until every assigned evaluator has submitted. Once they have, the guide gets a "pool marks and send" step: sees their own marks plus each evaluator's marks side by side, enters a final mark, and explicitly sends it.

Built and verified live end-to-end for BTP (same code mirrored into Honors/AP controllers — untested live for those two, see below):

- **Backend** (`facultybtpController.js`, mirrored into `facultyhonorsController.js`/`facultyapController.js`): `evaluateProjectasGuide` now auto-sets `canstudentsee: true` + `totalgrade` when the project has no evaluators. New `releaseEvaluation` endpoint (`POST /faculty/{btp,honors,ap}/releaseevaluation`) — guide-only, refuses if already released or if any assigned evaluator hasn't submitted yet, writes each student's final mark into `marksgiven[].totalgrade` and flips `canstudentsee`.
- **Found and fixed two more real bugs while building this**:
  - `evaluateProjectasEval` found "the" evaluation via `BTPEvaluation.findOne({projectRef})` with no way to pick a specific round — for any project with more than one evaluation, panel marks would always land on the same (first) round, never the current one. Now requires an explicit `evalId` from the client, threaded through `EvaluatorModal.jsx` → `Buttons.jsx` → `Updatelist.jsx` → `ViewProjEvaluator.jsx` (which computes it as "the earliest evaluation not yet released to the student").
  - The panel evaluator's project view (`ViewProjEvaluator.jsx`) was **completely broken** — crashed on load (`data.nextEvalDate.month` on an object the backend never sends, `data.project.team.map(...)` when the backend sends `.students` not `.team`) and its loader hardcoded `updates: []` even though real update data existed server-side. This blocked the evaluator flow from ever being tested or used. Rewritten to use real data throughout; also removed a dead `dummyStudents` array in `Buttons.jsx` matching the exact issue this doc's Part A already flagged.
- **Student-facing**: `Inprogress.jsx`'s "Latest Marks" now prefers `totalgrade` (the released, possibly-pooled final mark) over raw `guidemarks`.
- **New**: `ReleaseEvaluationPanel.jsx` — the guide's pooling UI. Shows a read-only "waiting on N evaluators" state until everyone's submitted, then the pool/send form. Assumes exactly one student per project (matches the current individual-project model; will need revisiting if group projects ever return).

**Verified live, full round-trip**: created a second dev Faculty (`_createdevevaluator.mjs`) and manually assigned it as an evaluator on the test BTP project (no staff UI exists to do this normally — see the staff-rebuild item below). Guide submitted marks (44) → did **not** auto-release, evaluator's UI correctly showed "Evaluate now" enabled with real project data → evaluator submitted panel marks (38) with correct `BTPRegistration` id resolution → guide's view showed the pooling panel with both marks and real evaluator name → guide entered a pooled final mark (41, deliberately different from both inputs) and sent it → DB confirmed `canstudentsee: true`, `totalgrade: "41"` → student's dashboard correctly showed **41**, not 44 or 38. This was also the project's 4th and final evaluation, so it auto-completed — confirming the `COMPLETED` phase live for the first time (previously untested). One polish gap noticed: the `COMPLETED` view doesn't display the final mark at all — not fixed, flagged only.

**Not yet done:**
- Honors/AP: backend changes mirrored but not live-tested (no test data set up for those two)

## Round 5 — evaluator assignment, guide-side (2026-09-15)

**Decided with the user**: the guide themselves assigns panel evaluators (not staff/admin) — simplest, immediately usable, no dependency on the dead staff module.

Built and verified live for BTP (mirrored into Honors/AP controllers, not live-tested there yet, same as Round 4):

- **Backend**: new `assignEvaluator` endpoint (`POST /faculty/{btp,honors,ap}/assignevaluator`), guide-only, body `{projid, facultyEmail}`. Guards: project must not be completed, target faculty must exist, guide can't assign themselves, can't double-assign the same evaluator. Also retroactively adds the new evaluator to any evaluation round still awaiting release (`canstudentsee: false`) — otherwise assigning an evaluator mid-round would silently have no effect until the next round was created.
- **Frontend**: new `AssignEvaluatorPanel.jsx` in the guide's project view — lists current evaluators (real name + email), a text input to add one by email, inline error display for the guard cases above.

**Verified live**: created a fresh test BTP project (the original one was already `completed` by Round 4's testing) and confirmed via the real UI: adding a valid evaluator ("Dev Evaluator") shows up immediately in the list with correct name/email; re-submitting the guide's own email correctly shows *"The guide cannot also be an evaluator"* inline; a negative test against the completed project from Round 4 correctly returned *"Cannot assign evaluators to a completed project"*.

Also hit and diagnosed two false alarms while testing, worth recording so they're not mistaken for real bugs later: (1) a stray `ECONNRESET` from a one-off MongoDB Atlas connection hiccup, unrelated to any code change — retried clean; (2) `feedback_frontend`'s `checkAuthLoader` treats a session as expired unless `localStorage['expiration']` is set alongside `role`/`token` — real logins always set this, but manual token injection for testing (as used throughout Rounds 3–5) must set it too, or every navigation silently bounces to `/auth`.

**Either person, whenever there's downtime:** `Homepage.jsx` stub, `/temp` dev route, `adminLoaders.jsx`'s dead `/login` redirect, `facultyDashboard.jsx`'s conditional hook call, `Replacedialog.jsx`'s undefined refs, the hardcoded `"yoyoyo"` bulk-import password, `verifyOtp` not consuming the OTP, `Completed.jsx` not showing the final mark.

## Round 6 — Honors live-tested end-to-end; a real cross-program navigation bug found and fixed (2026-09-15)

**Honors marks-release/pooling/evaluator-assignment now verified live**, matching BTP's Round 4/5 validation exactly. Created a dedicated `dev.honorsstudent@iiits.in` account (`_createdevhonorsstudent.mjs` — BTP/Honors are mutually exclusive, so the existing `dev.student` couldn't be reused). Full round-trip: student requested "Honors Test Topic" → guide accepted → guide submitted Semester 1 marks with zero evaluators assigned → confirmed **auto-release** (`canstudentsee: true`, `totalgrade: "45"`) → assigned `dev.evaluator@iiits.in` as panel evaluator → guide submitted Semester 2 marks → correctly held (`canstudentsee: false`, "waiting on 1 evaluator") → evaluator submitted panel marks (40) → guide's pooling UI correctly showed both marks (guide 42, evaluator 40) → guide entered pooled final mark 41 and sent → DB confirmed `totalgrade: "41"`, `canstudentsee: true`. Honors' `totalEvals: 8` config also confirmed correct throughout ("Evaluations Completed 2 of 8").

**Found and fixed a real bug, not specific to AP as previously assumed**: this round's Pending Tasks note said *"AP's post-approve-proposal action redirects to `/academics/btp/coming-soon`"* — testing Honors' request-accept flow surfaced that this actually affects **all three programs**, not just AP. `Requests.jsx`'s shared `action()` (used by BTP/Honors/AP accept-topic-request and reject-topic-request) and `Topicslist.jsx`'s `action`/`action2` (add-topic and delete-topic) all did `return redirect(config.baseRoute)` — e.g. `/academics/honors` — but each program's `baseRoute` index route in `App.jsx` unconditionally redirects to a `BTPUnderConstruction` "coming soon" placeholder (leftover route from when these modules were gated, see Round 3). So the faculty could accept a request, add a topic, delete a topic, or reject a request, and would be dumped on a dead-end "Under Construction" page instead of staying on their dashboard — for all three programs. Fixed by redirecting to `config.facultyRoute` instead (the real, working faculty dashboard — e.g. `/academics/honors/faculty` — confirmed correct because that's what the working "Guiding"/"Requests"/"Your Topics" tabs actually live at) in all three action functions (`Requests.jsx:228`, `Topicslist.jsx:199` and `:235`). Verified live: accept-request now lands back on the Team Management dashboard showing the new project under "Guiding", not the placeholder page.

**Also hit two tool-level false alarms while testing, not code bugs**: (1) the login form's submit sometimes silently no-ops on the first click (no network request fires at all) — resolved by re-clicking; a role/token check after every login is now the standard way to confirm it actually took, since a same-role re-login (e.g. Faculty→Faculty) can look successful on a shallow check while actually still holding the previous user's token. (2) A `404 "Project not found or you are not an evaluator"` when loading the evaluator's project view was traced to exactly that — the browser still held the guide's token from an earlier no-op login click, not a backend bug.

**Not yet done:** AP live-testing of the same marks-release/pooling/evaluator-assignment flow (Honors is now done; AP's `programType` threading bug from earlier this session is fixed and AP's basic evaluate-as-evaluator flow was confirmed working then, but the full auto-release vs. pooling policy split, like this round did for Honors, hasn't been re-verified against AP specifically).

## Round 7 — Dean Academic role, built and verified live (2026-09-15)

Investigated the user's belief that "a super admin user is already built" that could be tweaked into Dean Academic. **No code named "super admin" exists anywhere in either repo.** What does exist and is the actual closest match: `backend/_createdevadmin.mjs` already seeds a dev `Admin` with `departments: ["CSE","ECE","MDS"]` (all three) specifically "so the dashboard isn't dept-scoped" — an `Admin` account with every department already gets cross-department analytics for free, no code change needed for that part. The `Privilege`/`PrivilegedUser` RBAC models (already flagged as dead code in this doc's Architecture section) are not a good fit — building real permission-check logic on top of unused scaffolding is a much bigger lift than the alternative below for no benefit.

**The actual gap**: `authAdminMiddleware` gates every Admin route on nothing but `role === "Admin"` — there was no way to grant "sees everything, but read-only." All ten management routes in `feedbackadminRoutes.js` (add/delete course, CSV imports for faculty/students, course-student updates, reset-course, reset/toggle feedback) sat behind the exact same gate as the read-only dashboards.

**Built**, reusing ~90% of the existing `Admin`/`authAdminMiddleware` machinery rather than a new role from scratch (this also sidesteps a real gotcha: `User.referenceId` uses `refPath: "role"`, which requires a Mongoose model literally named after the role string — introducing a new `role: "Dean"` value would need a whole second dummy model just to satisfy population; staying on `role: "Admin"` avoids that entirely):

- `models/Admin.js`: new `isDean: Boolean` field, alongside the existing `isStaff` (a good precedent for exactly this kind of admin-variant flag).
- `authController.js`: new `blockDeanWriteMiddleware` — looks up the `Admin` doc for the requesting user, 403s with *"Dean Academic accounts have read-only access"* if `isDean`, otherwise passes through. Mounted after `authAdminMiddleware` on all ten write routes in `feedbackadminRoutes.js`; left off every read-only route (`dashboard/*`, `viewCourse`, `viewFaculty`, `viewFacultyCourseStatistics`, `semesters`, `feedbackStatus`).
- `feedbackadminController.js`'s `adminDashboardFaculty`: now also returns `isDean: adminFn.isDean` in the response (same pattern as the existing `isStaff` field it already returns).
- `feedback_frontend`: `AdminDashboard.jsx` fetches `/auth/profile` on mount (which already spreads the full `Admin` doc into the response — `isDean` needed zero backend changes there) and hides the Students/Courses tab links and the Start/Stop Feedback + Reset Feedback buttons when `isDean`. `FacultyTab.jsx` → `FacultyHeader.jsx` thread `isDean` from the faculty-dashboard response (mirroring how `isStaff` is already threaded there) to hide the **"Add Faculty"** button too — a write action reachable from the one tab Dean keeps, that the top-level tab-bar fix alone wouldn't have caught. Found this gap by testing live, not by reading the code — the button only became visible once the Faculty tab was actually rendered as a Dean.
- `backend/_createdevdean.mjs` (new, follows the same throwaway-script pattern as the other `_createdevX.mjs` files): seeds `dev.dean@iiits.in`, an `Admin` with all three departments and `isDean: true`.

**Verified live end-to-end**: logged in as `dev.dean@iiits.in` — dashboard greets "Hello, Dev Dean", shows exactly one tab (Faculty), no Reset/Stop/Start Feedback controls, no Add Faculty button, and the faculty list itself has **59 entries** (every faculty across CSE/ECE/MDS, not one department's worth) confirming cross-department visibility works. Backend-side, confirmed via curl with the Dean's real JWT: `GET /dashboard/faculty` → 200 with real data; `POST /resetcourse`, `POST /toggleFeedback`, `DELETE /deletecourse` → all correctly 403 *"Dean Academic accounts have read-only access"*.

**Non-obvious bug hit twice while building this, worth remembering**: `backend`'s dev server is plain `node index.js` (confirmed via `package.json`'s `"dev"` script and the actual running process's command line) — **there is no nodemon, no file-watch, no auto-restart**. Every backend code edit requires manually killing the process on port 3000 and restarting it, or the change is silently invisible no matter how correct the source is. This cost real time twice in this round: first, `blockDeanWriteMiddleware` appeared not to work at all (writes went through un-blocked) purely because the server was still running pre-edit code; second, after restarting once, a *later* edit (adding `isDean` to `adminDashboardFaculty`'s JSON response) still didn't show up in the browser because that edit came after the one-and-only restart. The fix both times was the same: find the PID listening on 3000 (`netstat -ano | grep :3000`), `taskkill /F` it, relaunch `node index.js`. Frontend (`feedback_frontend`, Vite) does hot-reload correctly and was never the issue.

**Known minor side effect from mid-debugging**: while diagnosing the stale-server issue, an un-gated `toggleFeedback` call landed for real against the dev database before the restart fixed the gating — feedback for semester M26 is now `isOpen: true` in the dev DB. Harmless (this is the shared dev/test backend, not production), flagged here only so it isn't mistaken for a mystery state change later.

**Not yet done**: direct-URL access to `/academics/feedback/admin/students` or `/courses` is not blocked for a Dean (only the nav links are hidden) — the read-only GET routes for those tabs were deliberately left open (roster *viewing* isn't "management"), and every actual write action within those tabs still hits `blockDeanWriteMiddleware` and 403s regardless of how the tab was reached, so this is a UX gap, not a security one.

## Round 8 — the sidebar "BTP"/"Honors"/"Additional Project" links landed on Under Construction; fixed (2026-09-15)

User reported clicking BTP/Honors/AP from the sidebar showed "Under Construction" despite all the live-testing done in Rounds 4–7. Cause: `Sidebar.jsx` links to the bare `/academics/btp`, `/academics/honors`, `/academics/ap` paths — and those index routes in `App.jsx` were still hardcoded to `redirect("/academics/{btp,honors}/coming-soon")` (AP's was worse: copy-pasted to redirect to `/academics/btp/coming-soon`, a program it isn't). This was the exact leftover-gating landmine flagged in Round 3 and partly addressed in Round 6 (Round 6 fixed the *action*-triggered redirects like accept-request/add-topic that also pointed here; this round fixes the *index-route* gate itself, which is what a plain sidebar click or bookmark hits).

The fix was already sitting in the codebase, just commented out: `BTPRouter.jsx`/`HonorsRouter.jsx`/`APRouter.jsx` each export a working `loader` that checks `localStorage.role` and redirects Students to `.../student` and Faculty to `.../faculty` (already imported into `App.jsx` as `btpRouterLoader`/`honorsRouterLoader`/`apRouterLoader`, just never wired to the `index: true` route). Un-commented and wired all three in `App.jsx`, deleting the hardcoded coming-soon redirects and their dead commented-out blocks. The `coming-soon` child route/`BTPUnderConstruction` element for BTP and Honors are left in place (unreachable now, harmless) rather than deleted, since removing them wasn't necessary to fix the bug.

**Verified live** for all three programs, both roles: `/academics/btp` → Faculty lands on `/academics/btp/faculty` (real dashboard with topics), Student lands on `/academics/btp/student` (real project view, "Second Test Project" showing 0/4 evaluations); `/academics/honors` → Faculty lands on the real Honors dashboard; `/academics/ap` → Faculty lands on "Additional Project Management" with Proposals/Guiding tabs, no pending proposals (correct, nothing proposed yet). No more Under Construction page anywhere in the normal navigation path.

## Round 9 — "View past evaluations" was a dead button; wired up (2026-09-15)

User reported the button did nothing. `StudentInProgress.jsx` (the guide's project view, shared across BTP/Honors/AP) had `<button className={styles.viewPastBtn}>View past evaluations</button>` — no `onClick` at all, a pure UI stub from an earlier pass that was never finished.

Built `PastEvaluationsPanel.jsx` (new): a toggle button that expands into a list of every evaluation round on the project — guide marks, each panel evaluator's marks (with a "(not submitted)" tag if still pending), the released final mark (or "—" if not yet released), and the round's remark. Reuses `ReleaseEvaluationPanel.module.css`'s existing classes rather than adding new CSS, so it visually matches the pooling panel already on the same page. Replaces the dead button in `StudentInProgress.jsx`.

**Verified live** against the Honors test project (2 released rounds): correctly showed Round 1 (Guide 45, Final 45) and Round 2 (Guide 42, Dev Evaluator 40, Final 41) with both remarks — matches the exact data written during Round 6/7's live testing, confirming the panel reads real evaluation history correctly, not placeholder data.

Separately, user reported the `dev.evaluator` login "isn't working." Investigated: the credentials are correct (confirmed via curl and by eventually logging in through the real UI too) — this was the same known "Log In click occasionally doesn't fire at all" flakiness already documented, not a real bug. Also found the user had pasted the shared credentials table into `feedback_frontend/.env`, corrupting it past the `VITE_API_URL` line — cleaned that up (`.env` is gitignored, no exposure, just a parsing risk for Vite).

## Round 10 — "Remove Evaluator" for the guide, BTP/Honors/AP (2026-09-15)

User asked for a remove-evaluator button (guide-side), confirmed to apply to Honors too — since `AssignEvaluatorPanel.jsx` is shared across all three programs via `programType`, one implementation covers BTP/Honors/AP together, matching the existing `assignEvaluator` pattern exactly (mirrored per-controller, no shared backend module).

- New `removeEvaluator` controller in all three faculty controllers (`facultybtpController.js`/`facultyhonorsController.js`/`facultyapController.js`): guide-only, blocked on completed projects, 400s if the target isn't actually an evaluator on the project. Pulls the faculty from `project.evaluators`, then `$pull`s their **not-yet-submitted** `panelEvaluations` entry from any evaluation round still awaiting release (`canstudentsee: false`) — mirrors `assignEvaluator`'s existing mid-round `$push` in reverse, so removing someone actually unblocks a round they were the last holdout on, rather than leaving it stuck waiting on someone who can no longer submit. Marks they already submitted are left untouched (historical data, not deleted). New `POST /faculty/{btp,honors,ap}/removeevaluator` route in each.
- `AssignEvaluatorPanel.jsx`: each evaluator row now has a "Remove" button (new `.removeButton` style in `ReleaseEvaluationPanel.module.css`, matching the existing panel's visual language rather than new CSS).
- **Found and fixed a real bug this change would otherwise have introduced**: `StudentInProgress.jsx`'s `pendingEval` (which decides whether the "pool marks and send" panel shows at all) was gated on `hasEvaluators` — i.e. the project's *current* evaluator list, not the round's own data. Removing every evaluator from a project with an evaluation round already open and awaiting release would make that gate false forever, permanently orphaning the round (not auto-released, and now invisible to the one panel that can release it). Fixed by computing `pendingEval` directly from the evaluations list instead of gating on `hasEvaluators` — `ReleaseEvaluationPanel` already handles an evaluator-less round correctly (just the guide's marks, immediately ready to release, since `panelEvaluations.filter(e => !e.submitted).length === 0` is trivially true for an empty array).

**Verified live end-to-end** on the BTP test project (which had 1 evaluation already submitted, evaluator still pending): removed Dev Evaluator → evaluators list emptied → the "waiting on 1 evaluator" panel correctly disappeared (would have incorrectly stayed hidden even after re-adding, without the `pendingEval` fix above) → re-added Dev Evaluator via **Add Evaluator** → the "waiting on 1 evaluator" panel correctly reappeared, confirming both the removal and the round-blocking cleanup work together correctly, not just in isolation. State restored to what it was before testing.

## Round 11 — evaluator couldn't find their assigned project anywhere in the UI; real routing bug, fixed (2026-09-15)

User logged in as `dev.evaluator`, went to BTP, and didn't see the project they were assigned to evaluate. Root cause was worse than a missing button: `BTPFacultyRouter.jsx`/`HonorsFacultyRouter.jsx` switch on `data.phase` to decide whether to render `TopicAddition.jsx` (Your Topics/Requests/Guiding) or `EvaluationPage.jsx` (Projects guiding/**Projects evaluating**/Evaluation requests) — but the backend (`getFacultyBTPDashboard` etc.) hardcodes `phase: "ACTIVE"` always, so the switch can only ever hit the `TopicAddition` branch. `EvaluationPage.jsx` — despite being fully built, correctly wired to real `evalproj`/`evalreq` data, and imported into all three `*FacultyRouter.jsx` files — was **completely unreachable dead code**. This is the exact same "backend returns one hardcoded phase, frontend still switches on phases that no longer exist" bug this doc's Part A originally flagged for a *different* frontend (`Institute_Portal/frontend`) — turns out `feedback_frontend`, the real production frontend, has its own independent copy of the identical bug, never caught because nobody had tested logging in as a pure evaluator (not also a guide) before.

The backend was never the problem — `getFacultyBTPDashboard`/`getFacultyHonorsDashboard`/`getFacultyAPDashboard` already compute and return `evalproj` (projects the faculty evaluates) correctly; it just had nowhere to render.

**Fix**: rather than try to resurrect the parallel `EvaluationPage.jsx` UI (a second, mostly-redundant dashboard shell that would need its own re-verification), added an **"Evaluating"** tab directly to the dashboard that's actually used: `TabsHeader.jsx` (shared by BTP and Honors via `TopicAddition.jsx`) gained a 4th tab button, and `TopicAddition.jsx` now renders `<EvaluationList data={data.evalproj} tab="evaluating" />` for it — reusing the same `EvaluationList` component `EvaluationPage.jsx` already used, so its existing "click through to `/{program}/faculty/evaluator/:projid`" navigation just worked with no changes needed there. Mirrored the same tab into `APDashboard.jsx` (AP never had an evaluating view even in the dead `EvaluationPage.jsx` path — its router only ever branches on `case "ACTIVE"`), since AP's controller returns the identical `evalproj`/`evalreq` shape and would have hit the same gap the moment anyone tested it as a pure AP evaluator.

**Verified live**: logged in as `dev.evaluator`, BTP dashboard now shows a 4th "Evaluating" tab; clicking it lists both BTP projects Dev Evaluator is assigned to ("Test Topic - BTP Repair Verification" and "Second Test Project - Evaluator Assignment") with real project IDs and team names — previously reachable only by manually typing the `/evaluator/:projid` URL, which is exactly how all of this session's evaluator-flow testing had to be done up to this point.
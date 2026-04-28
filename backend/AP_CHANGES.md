# Additional Project (AP) — Frontend Integration Guide

> **Date:** 2026-04-28  
> **Summary:** New project type "Additional Project (AP)" added alongside BTP and Honors.

---

## What is AP?

Additional Project is a **1-semester** project where the **student proposes their own topic** to a faculty member. Unlike BTP/Honors, there are no predefined topics — the student writes a proposal title and description and sends it to a faculty of their choice.

### Key Differences from BTP/Honors

| | BTP | Honors | **AP** |
|---|---|---|---|
| Max evaluations | 4 (2 semesters × 2) | 8 (4 semesters × 2) | **2 (1 semester × 2)** |
| Topic source | Faculty defines topics | Faculty defines topics | **Student proposes** |
| Mutual exclusion | Blocks Honors | Blocks BTP | **Independent** (can coexist with BTP/Honors) |
| Topic/Faculty selection | Student browses topics | Student browses topics | **Student browses faculty list** |
| One per student | Yes | Yes | **Yes (one at a time)** |

---

## API Endpoints

### Student Endpoints

**Base path:** `/student/ap`  
**Auth:** `authStudentMiddleware` (same as BTP/Honors — "Student" role)

---

#### `GET /student/ap/`
Returns the AP dashboard. Three phases possible:

**Phase: FACULTY_SELECTION** (no project yet)
```json
{
  "email": "student@example.com",
  "phase": "FACULTY_SELECTION",
  "message": "Select a faculty and propose your project",
  "faculty": [
    {
      "_id": "facultyObjectId",
      "name": "Dr. Smith",
      "email": "smith@iiits.ac.in",
      "dept": "CSE",
      "requestStatus": null,
      "proposalTitle": null
    },
    {
      "_id": "facultyObjectId2",
      "name": "Dr. Jones",
      "email": "jones@iiits.ac.in",
      "dept": "ECE",
      "requestStatus": "Pending",
      "proposalTitle": "ML-based anomaly detection"
    }
  ],
  "myRequests": [
    {
      "faculty": { "_id": "...", "name": "Dr. Jones", "email": "...", "dept": "ECE" },
      "proposalTitle": "ML-based anomaly detection",
      "proposalText": "I want to work on...",
      "status": "Pending"
    }
  ]
}
```

> **Frontend note:** `requestStatus` on each faculty tells you if the student already sent a request to them. Use this to disable the "Request" button. `myRequests` has full details of all pending/rejected requests.

**Phase: IN_PROGRESS** (project assigned)
```json
{
  "email": "student@example.com",
  "phase": "IN_PROGRESS",
  "project": {
    "_id": "projectId",
    "name": "ML-based anomaly detection",
    "about": "I want to work on...",
    "studentbatch": "2025",
    "guide": { "name": "Dr. Jones", "email": "jones@iiits.ac.in" },
    "evaluators": [{ "name": "Dr. X", "email": "x@iiits.ac.in" }],
    "team": [
      { "name": "Student Name", "email": "student@iiits.ac.in", "rollno": "S20210010001" }
    ],
    "evaluations": [
      {
        "_id": "evalId",
        "time": "2026-04-15T10:00:00Z",
        "remark": "Good progress",
        "resources": [],
        "updates": [],
        "canstudentsee": true,
        "marksgiven": [{ "student": "regId", "guidemarks": 45 }]
      }
    ],
    "latestUpdates": [
      { "update": "Completed data collection", "time": "2026-04-10T10:00:00Z" }
    ]
  }
}
```

> **Note:** This is the same shape as BTP/Honors IN_PROGRESS. You can reuse the same project dashboard component.

**Phase: COMPLETED**
```json
{
  "email": "student@example.com",
  "phase": "COMPLETED",
  "message": "Additional Project completed after 2 evaluations.",
  "project": {
    "_id": "projectId",
    "name": "ML-based anomaly detection",
    "about": "I want to work on...",
    "status": "completed"
  }
}
```

---

#### `POST /student/ap/requestfaculty`
Send a project request to a faculty member.

**Body:**
```json
{
  "facultyId": "facultyObjectId",
  "proposalTitle": "ML-based anomaly detection",
  "proposalText": "I want to build a system that uses machine learning to detect anomalies in network traffic..."
}
```

**Response:** `{ "message": "Request sent to faculty successfully" }`

**Errors:**
- 400: `"Faculty ID, proposal title, and proposal text are required"`
- 400: `"You are already in an Additional Project"`
- 400: `"Already sent a request to this faculty"`
- 404: `"Faculty not found"`

> **Frontend note:** Unlike BTP/Honors where you send `topicDocId` + `topicId`, here you send `facultyId` + your proposal text. You need a text input/textarea for the proposal.

---

#### `POST /student/ap/withdrawrequest`
Withdraw a pending request.

**Body:**
```json
{
  "facultyId": "facultyObjectId"
}
```

**Response:** `{ "message": "Request withdrawn successfully" }`

---

#### `POST /student/ap/addupdate`
Add a progress update to the project (same as BTP/Honors).

**Body:**
```json
{
  "update": "Completed model training with 95% accuracy"
}
```

**Response:** `{ "message": "Update added successfully" }`

---

### Faculty Endpoints

**Base path:** `/faculty/ap`  
**Auth:** `authFacultyMiddleware`

---

#### `GET /faculty/ap/`
Faculty AP dashboard.

**Response:**
```json
{
  "email": "faculty@iiits.ac.in",
  "phase": "ACTIVE",
  "requests": [
    {
      "studentRegId": "apRegistrationId",
      "student": { "name": "Student Name", "email": "student@iiits.ac.in", "rollNumber": "S20210010001" },
      "proposalTitle": "ML-based anomaly detection",
      "proposalText": "I want to build a system...",
      "isapproved": false
    }
  ],
  "guideproj": [
    { "_id": "projId", "topic": "ML-based anomaly detection", "projid": "projId", "status": "active", "team": ["Student Name"] }
  ],
  "evalproj": [],
  "evalreq": []
}
```

> **Key difference from BTP/Honors dashboard:** No `topics` field. Instead there's a `requests` array with student proposals directly. No addTopic/deleteTopic functionality needed.

---

#### `POST /faculty/ap/approverequest`
Approve a student's AP request and create the project.

**Body:**
```json
{
  "studentId": "studentObjectId (the Student _id, NOT APRegistration _id)"
}
```

**Response:** `{ "message": "AP request approved and project created" }`

> **Note:** When approved, the project is created using the student's `proposalTitle` as the project name and `proposalText` as the about. All other pending requests from this student (to other faculty) are automatically cleaned up.

---

#### `DELETE /faculty/ap/rejectrequest`
Reject a student's AP request.

**Body:**
```json
{
  "studentId": "studentObjectId"
}
```

**Response:** `{ "message": "AP request rejected successfully" }`

---

#### `POST /faculty/ap/evaluateguide`
Submit evaluation as guide (same shape as BTP/Honors).

**Body:**
```json
{
  "projid": "projectId",
  "remark": "Good progress shown",
  "marks": [
    { "studentId": "apRegistrationId", "guidemarks": 45 }
  ]
}
```

---

#### `POST /faculty/ap/evaluateevaluator`
Submit evaluation as panel evaluator (same shape as BTP/Honors).

**Body:**
```json
{
  "projid": "projectId",
  "panelmarks": [],
  "remark": "Satisfactory work"
}
```

---

#### `GET /faculty/ap/viewproject?projid=...`
View project details as guide (same response shape as BTP/Honors).

---

#### `GET /faculty/ap/viewprojectevaluator?projid=...`
View project details as evaluator (same response shape as BTP/Honors, no updates).

---

## Frontend TODO

### Student Side
1. **Add an "Additional Project" tab/section** alongside BTP and Honors
2. **FACULTY_SELECTION phase:** Show a list of faculty (name, dept, email) with a "Request" button
   - On click, show a form with:
     - `proposalTitle` (text input)
     - `proposalText` (textarea)
   - Show request status for already-requested faculty (disable button, show "Pending"/"Rejected")
3. **IN_PROGRESS phase:** Reuse the same project dashboard component as BTP/Honors
4. **COMPLETED phase:** Reuse the same completed view as BTP/Honors
5. **No mutual exclusion needed** — AP section should always be accessible regardless of BTP/Honors status

### Faculty Side
1. **Add an "Additional Project" section** alongside BTP/Honors
2. **Requests view:** Show incoming proposals (student name, proposal title, proposal text) with Accept/Reject buttons
   - No topics management (no addTopic/deleteTopic UI needed)
3. **Projects view:** Same as BTP/Honors — guided projects and evaluated projects
4. **Evaluation view:** Same components as BTP/Honors

### Key Differences in Frontend Logic
- **No topic browsing** — students see faculty list, not topics
- **Student writes proposal** — need text inputs instead of topic selection dropdowns
- **No faculty topic management** — faculty dashboard only shows incoming requests, no topic CRUD
- **Independent of BTP/Honors** — always show AP tab, never block it

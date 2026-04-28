# Projects System — API Reference (BTP, Honors & Additional Project)

> **Last updated:** 2026-04-28  
> **Base URL prefix:** `/student/*` and `/faculty/*`  
> **Authentication:** All endpoints require JWT auth via role-specific middleware

---

## Overview

The system supports three project types:

| Project Type | Route Prefix | Max Evaluations | Topic Source | Mutual Exclusion |
|---|---|---|---|---|
| **BTP** | `/student/btp`, `/faculty/btp` | 4 (2 semesters × 2) | Faculty defines topics | Blocks Honors |
| **Honors** | `/student/honors`, `/faculty/honors` | 8 (4 semesters × 2) | Faculty defines topics | Blocks BTP |
| **Additional Project (AP)** | `/student/ap`, `/faculty/ap` | 2 (1 semester × 2) | Student proposes | Independent |

### Roles
- **Student** — all student endpoints use `authStudentMiddleware` (role: `"Student"`)
- **Faculty** — all faculty endpoints use `authFacultyMiddleware` (role: `"Faculty"`)

### Lifecycle
1. **Topic/Faculty Selection** — Student browses topics (BTP/Honors) or faculty list (AP) and sends requests
2. **Faculty Review** — Faculty sees requests; can approve or reject
3. **In Progress** — Project created on approval; students add updates, faculty runs evaluations
4. **Completed** — Auto-completes after max evaluations reached

---

## Data Models

### Project (BTP / Honors / AP)
```js
{
  name: String,           // Project/topic name
  about: String,          // Description
  studentbatch: String,   // e.g. "2025"
  students: [{ student: ObjectId }],  // refs Registration model
  guide: ObjectId,        // ref Faculty
  evaluators: [{ evaluator: ObjectId }],  // ref Faculty
  updates: [{ update: String, remark: String, time: Date }],
  status: "active" | "completed"
}
```

### Registration (BTPRegistration / HonorsRegistration / APRegistration)
```js
// BTP/Honors Registration
{
  student: ObjectId,      // ref Student (unique)
  project: ObjectId,      // ref Project (null until approved)
  requests: [{
    topic: ObjectId,      // ref Topic doc
    subTopicId: ObjectId, // specific topic within doc
    status: "Pending" | "Rejected",
    preference: Number
  }]
}

// AP Registration (different — no topics)
{
  student: ObjectId,      // ref Student (unique)
  project: ObjectId,      // ref AP (null until approved)
  requests: [{
    faculty: ObjectId,    // ref Faculty
    proposalTitle: String,
    proposalText: String,
    status: "Pending" | "Rejected"
  }]
}
```

### Topic (BTPTopic / HonorsTopic — NOT used by AP)
```js
{
  faculty: ObjectId,      // ref Faculty (unique per faculty)
  topics: [{
    _id: ObjectId,
    topic: String,
    about: String,
    dept: "CSE" | "ECE" | "MDS"
  }],
  requests: [{
    student: ObjectId,    // ref Registration
    topic: ObjectId,      // ref specific topic
    isapproved: Boolean,
    preference: Number
  }]
}
```

### APFacultyRequest (AP only — replaces Topic model)
```js
{
  faculty: ObjectId,      // ref Faculty (unique per faculty)
  requests: [{
    student: ObjectId,    // ref APRegistration
    proposalTitle: String,
    proposalText: String,
    isapproved: Boolean
  }]
}
```

### Evaluation (BTPEvaluation / HonorsEvaluation / APEvaluation)
```js
{
  projectRef: ObjectId,   // ref Project
  time: Date,
  canstudentsee: Boolean,
  remark: String,
  resources: [{ resourceURL: String }],
  marksgiven: [{
    student: ObjectId,    // ref Registration
    guidemarks: Number,
    totalgrade: String    // optional, set by dean
  }],
  panelEvaluations: [{
    evaluator: ObjectId,  // ref Faculty
    submitted: Boolean,
    submittedAt: Date,
    panelmarks: [{
      student: ObjectId,
      marks: Number
    }],
    remark: String
  }]
}
```

---

## Student Endpoints

### BTP: `GET /student/btp/`
### Honors: `GET /student/honors/`
### AP: `GET /student/ap/`

Returns the project dashboard for the logged-in student.

**Response varies by phase:**

#### Phase: TOPIC_SELECTION (BTP/Honors only)
```json
{
  "email": "student@example.com",
  "phase": "TOPIC_SELECTION",
  "message": "Select a topic",
  "topics": [
    {
      "_id": "topicDocId",
      "faculty": { "_id": "...", "name": "Dr. Smith", "email": "...", "dept": "CSE" },
      "topics": [
        {
          "_id": "subTopicId",
          "topic": "Machine Learning in Healthcare",
          "about": "Research on ML applications...",
          "dept": "CSE",
          "requestStatus": null
        },
        {
          "_id": "subTopicId2",
          "topic": "NLP for Indian Languages",
          "about": "...",
          "dept": "CSE",
          "requestStatus": "Pending"
        }
      ]
    }
  ],
  "myRequests": [...]
}
```

#### Phase: FACULTY_SELECTION (AP only)
```json
{
  "email": "student@example.com",
  "phase": "FACULTY_SELECTION",
  "message": "Select a faculty and propose your project",
  "faculty": [
    {
      "_id": "facultyId",
      "name": "Dr. Smith",
      "email": "smith@iiits.ac.in",
      "dept": "CSE",
      "requestStatus": null,
      "proposalTitle": null
    },
    {
      "_id": "facultyId2",
      "name": "Dr. Jones",
      "email": "jones@iiits.ac.in",
      "dept": "ECE",
      "requestStatus": "Pending",
      "proposalTitle": "My project idea..."
    }
  ],
  "myRequests": [
    {
      "faculty": { "_id": "...", "name": "...", "email": "...", "dept": "..." },
      "proposalTitle": "...",
      "proposalText": "...",
      "status": "Pending"
    }
  ]
}
```

#### Phase: IN_PROGRESS (all three)
```json
{
  "email": "student@example.com",
  "phase": "IN_PROGRESS",
  "project": {
    "_id": "projectId",
    "name": "Project Name",
    "about": "Project description",
    "studentbatch": "2025",
    "guide": { "name": "...", "email": "..." },
    "evaluators": [{ "name": "...", "email": "..." }],
    "team": [
      { "name": "...", "email": "...", "rollno": "..." }
    ],
    "evaluations": [
      {
        "_id": "evalId",
        "time": "2026-04-15T10:00:00Z",
        "remark": "Review comments",
        "resources": [{ "resourceURL": "..." }],
        "updates": [{ "update": "...", "time": "..." }],
        "canstudentsee": true,
        "marksgiven": [{ "student": "regId", "guidemarks": 45 }]
      }
    ],
    "latestUpdates": [{ "update": "...", "time": "..." }]
  }
}
```

> **Note:** `marksgiven` is `null` if `canstudentsee` is `false`. Only the logged-in student's marks are included.

#### Phase: COMPLETED (all three)
```json
{
  "email": "student@example.com",
  "phase": "COMPLETED",
  "message": "BTP completed after 4 evaluations.",
  "project": {
    "_id": "projectId",
    "name": "Project Name",
    "about": "...",
    "status": "completed"
  }
}
```

---

### BTP: `POST /student/btp/requesttopic`
### Honors: `POST /student/honors/requesttopic`

Request a specific topic from a faculty.

**Body:**
```json
{
  "topicDocId": "topicDocumentId",
  "topicId": "specificSubTopicId",
  "preference": 1
}
```

**Response:** `{ "message": "Topic requested successfully" }`

**Errors:**
| Code | Message |
|------|---------|
| 400 | `"Topic details required"` |
| 400 | `"You are already in a project"` |
| 400 | `"Already requested this topic"` |
| 400 | Mutual exclusion error |
| 404 | `"Student not found"` / `"Topic document not found"` / `"Specific topic not found"` |

---

### AP: `POST /student/ap/requestfaculty`

Send a project proposal to a faculty.

**Body:**
```json
{
  "facultyId": "facultyObjectId",
  "proposalTitle": "My Project Idea",
  "proposalText": "Detailed description of what I want to work on..."
}
```

**Response:** `{ "message": "Request sent to faculty successfully" }`

**Errors:**
| Code | Message |
|------|---------|
| 400 | `"Faculty ID, proposal title, and proposal text are required"` |
| 400 | `"You are already in an Additional Project"` |
| 400 | `"Already sent a request to this faculty"` |
| 404 | `"Student not found"` / `"Faculty not found"` |

---

### BTP: `POST /student/btp/withdrawrequest`
### Honors: `POST /student/honors/withdrawrequest`

**Body:**
```json
{
  "topicDocId": "topicDocumentId",
  "topicId": "specificSubTopicId"
}
```

**Response:** `{ "message": "Request withdrawn successfully" }`

---

### AP: `POST /student/ap/withdrawrequest`

**Body:**
```json
{
  "facultyId": "facultyObjectId"
}
```

**Response:** `{ "message": "Request withdrawn successfully" }`

---

### BTP: `POST /student/btp/addupdate`
### Honors: `POST /student/honors/addupdate`
### AP: `POST /student/ap/addupdate`

Add a progress update to the project (identical across all three).

**Body:**
```json
{
  "update": "Completed data collection phase"
}
```

**Response:** `{ "message": "Update added successfully" }`

**Errors:** 400 if project is completed, 400 if no project assigned.

---

## Faculty Endpoints

### BTP: `GET /faculty/btp/`
### Honors: `GET /faculty/honors/`

Faculty dashboard for BTP/Honors.

**Response:**
```json
{
  "email": "faculty@example.com",
  "phase": "ACTIVE",
  "topics": {
    "_id": "topicDocId",
    "faculty": "facultyId",
    "topics": [
      { "_id": "subTopicId", "topic": "ML in Healthcare", "about": "...", "dept": "CSE" }
    ],
    "requests": [
      {
        "student": { "name": "...", "email": "...", "rollNumber": "..." },
        "topicDetails": { "topic": "...", "about": "...", "dept": "..." },
        "topic": "subTopicId",
        "isapproved": false,
        "preference": 1
      }
    ]
  },
  "guideproj": [
    { "_id": "projId", "topic": "Project Name", "projid": "projId", "status": "active", "team": ["Student Name"] }
  ],
  "evalproj": [...],
  "evalreq": [...]
}
```

> `topics` is `null` if the faculty has not added any topics yet.

---

### AP: `GET /faculty/ap/`

Faculty dashboard for Additional Projects.

**Response:**
```json
{
  "email": "faculty@example.com",
  "phase": "ACTIVE",
  "requests": [
    {
      "studentRegId": "apRegistrationId",
      "student": { "name": "...", "email": "...", "rollNumber": "..." },
      "proposalTitle": "My Project Idea",
      "proposalText": "Detailed description...",
      "isapproved": false
    }
  ],
  "guideproj": [...],
  "evalproj": [...],
  "evalreq": [...]
}
```

> **Key difference:** `requests` contains proposals directly (no `topics` field). No topic management needed.

---

### BTP: `POST /faculty/btp/addtopic`
### Honors: `POST /faculty/honors/addtopic`

Add a topic for students to request. **NOT available for AP.**

**Body:**
```json
{
  "topic": "Machine Learning in Healthcare",
  "about": "Research on applying ML algorithms to medical data..."
}
```

> `dept` is automatically set from the faculty's department.

**Response:** `{ "message": "Topics uploaded successfully" }`

---

### BTP: `DELETE /faculty/btp/deletetopic`
### Honors: `DELETE /faculty/honors/deletetopic`

Delete a topic and all associated requests. **NOT available for AP.**

**Body:**
```json
{
  "topicid": "specificSubTopicId",
  "actualtid": "topicDocumentId"
}
```

---

### BTP: `POST /faculty/btp/approvetopicrequest`
### Honors: `POST /faculty/honors/approvetopicrequest`

Approve a student's topic request and create a project.

**Body:**
```json
{
  "studentId": "studentObjectId (Student model _id)",
  "topicId": "specificSubTopicId"
}
```

**Response:** `{ "message": "Request approved and project created" }`

**What happens:**
1. Project created with topic name/about, student assigned, faculty as guide
2. Student's registration updated with project reference
3. All student's other requests cleared
4. Request removed from topic doc

---

### AP: `POST /faculty/ap/approverequest`

Approve a student's AP proposal.

**Body:**
```json
{
  "studentId": "studentObjectId (Student model _id)"
}
```

**Response:** `{ "message": "AP request approved and project created" }`

**What happens:**
1. Project created with student's `proposalTitle`/`proposalText` as name/about
2. Student's registration updated with project reference
3. All student's other AP requests (to ALL faculty) automatically cleaned up

---

### BTP: `DELETE /faculty/btp/rejecttopicreq`
### Honors: `DELETE /faculty/honors/rejecttopicreq`

**Body:**
```json
{
  "studentId": "studentObjectId",
  "topicId": "specificSubTopicId",
  "docid": "topicDocumentId"
}
```

**Response:** `{ "message": "Request rejected successfully" }`

---

### AP: `DELETE /faculty/ap/rejectrequest`

**Body:**
```json
{
  "studentId": "studentObjectId"
}
```

**Response:** `{ "message": "AP request rejected successfully" }`

---

### BTP: `POST /faculty/btp/evaluateguide`
### Honors: `POST /faculty/honors/evaluateguide`
### AP: `POST /faculty/ap/evaluateguide`

Submit an evaluation as the project guide (identical across all three).

**Body:**
```json
{
  "projid": "projectId",
  "remark": "Good progress on the implementation",
  "marks": [
    { "studentId": "registrationId", "guidemarks": 45 }
  ]
}
```

**Response:** `{ "message": "Evaluation submitted" }`

> If this was the final evaluation (BTP: 4th, Honors: 8th, AP: 2nd), the project is auto-completed:
> `{ "message": "Evaluation submitted. BTP completed after 4 evaluations." }`

**Errors:**
- 400: `"This BTP project has already been completed. No more evaluations allowed."`
- 400: `"BTP has reached the maximum number of evaluations (4). Project is now completed."`
- 403: `"Unauthorized"` (not the guide)

---

### BTP: `POST /faculty/btp/evaluateevaluator`
### Honors: `POST /faculty/honors/evaluateevaluator`
### AP: `POST /faculty/ap/evaluateevaluator`

Submit evaluation as a panel evaluator (identical across all three).

**Body:**
```json
{
  "projid": "projectId",
  "panelmarks": [],
  "remark": "Satisfactory presentation"
}
```

**Response:** `{ "message": "Evaluation submitted" }`

**Errors:** 403 if not an assigned evaluator.

---

### BTP: `GET /faculty/btp/viewproject?projid=...`
### Honors: `GET /faculty/honors/viewproject?projid=...`
### AP: `GET /faculty/ap/viewproject?projid=...`

View full project details as guide (identical across all three).

**Response:**
```json
{
  "project": {
    "_id": "projectId",
    "name": "Project Name",
    "about": "...",
    "guide": { "name": "...", "email": "..." },
    "status": "active",
    "students": [
      { "name": "...", "email": "...", "rollNumber": "..." }
    ],
    "evaluators": [{ "name": "...", "email": "..." }],
    "evaluations": [...],
    "updates": [...]
  }
}
```

---

### BTP: `GET /faculty/btp/viewprojectevaluator?projid=...`
### Honors: `GET /faculty/honors/viewprojectevaluator?projid=...`
### AP: `GET /faculty/ap/viewprojectevaluator?projid=...`

View project as evaluator. Same as viewproject but `updates` is always `[]`.

---

## Mutual Exclusion Rules

| Scenario | Result |
|---|---|
| Student in BTP → hits `/student/honors/*` | 400: "You are already enrolled in a BTP project" |
| Student in Honors → hits `/student/btp/*` | 400: "You are already enrolled in an Honors project" |
| Student in BTP → hits `/student/ap/*` | ✅ Allowed (AP is independent) |
| Student in Honors → hits `/student/ap/*` | ✅ Allowed (AP is independent) |
| Student in AP → hits `/student/btp/*` or `/student/honors/*` | ✅ Allowed (AP is independent) |
| Faculty approves BTP for student already in Honors | 400: "Student is already enrolled in an Honors project" |
| Faculty approves Honors for student already in BTP | 400: "Student is already enrolled in a BTP project" |

---

## Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created (project created, evaluation submitted) |
| `400` | Validation error (already in project, mutual exclusion, completed, etc.) |
| `403` | Unauthorized (wrong role, not guide/evaluator) |
| `404` | Resource not found (student, project, topic, faculty) |
| `500` | Server error |

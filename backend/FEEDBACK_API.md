# Feedback System — API Reference

> **Last updated:** 2026-02-20
> **Base URL:** `/api/feedback`
> **Authentication:** All endpoints require JWT auth via middleware

---

## Semester Codes

All semester values now use year-aware codes:

| Code | Meaning | Months |
|------|---------|--------|
| `M25` | Monsoon 2025 | Jul–Dec 2025 |
| `S26` | Spring 2026 | Jan–Jun 2026 |
| `M26` | Monsoon 2026 | Jul–Dec 2026 |

Format: `[M|S][YY]` where `M` = Monsoon, `S` = Spring, `YY` = 2-digit year.

---

## Admin Endpoints

**Base path:** `/api/feedback/admin`
**Auth:** `authAdminMiddleware`

---

### Dashboard

#### `GET /dashboard/students`
Returns all students in the admin's department(s).

**Response:**
```json
{
  "students": [
    { "name": "...", "email": "...", "rollNumber": "...", "batch": "..." }
  ]
}
```

---

#### `GET /dashboard/faculty`
Returns all faculty in the admin's department(s) with their analytics, filtered by semester.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `semester` | `string` | No | Current semester (e.g. `S26`) | Semester code to filter analytics by |

**Response:**
```json
{
  "isStaff": false,
  "currentSemester": "S26",
  "availableSemesters": ["S26", "M25", "S25"],
  "totalFaculties": 12,
  "departmentAverage": 7.45,
  "topFaculty": { "id": "...", "name": "...", "avgscore": 9.2 },
  "bottomFaculty": { "id": "...", "name": "...", "avgscore": 5.1 },
  "faculties": [
    {
      "id": "...",
      "name": "...",
      "email": "...",
      "department": "CSE",
      "avgscore": 7.5,
      "impress": 45,
      "coursestaught": 3
    }
  ]
}
```

> **Note:** If `isStaff` is true, `avgscore`, `impress`, `coursestaught` are returned as `"N/A"`.

---

#### `GET /dashboard/courses`
Returns courses in the admin's department(s), filtered by semester.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `semester` | `string` | No | Current semester (e.g. `S26`) | Semester code to filter courses by |

**Response:**
```json
{
  "totalCourses": 15,
  "currentSemester": "S26",
  "availableSemesters": ["S26", "M25", "S25"],
  "ugWiseCourses": {
    "1": [
      {
        "id": "...", "name": "...", "code": "CS101",
        "coursetype": "Theory", "facultycount": 2,
        "strength": 120, "isreset": false,
        "ug": 1, "semester": "S26"
      }
    ],
    "2": [...]
  },
  "activeCourses": [...],
  "resetCourses": [...],
  "availableFaculty": [
    { "id": "...", "email": "...", "name": "..." }
  ],
  "adminDepartments": ["CSE"]
}
```

> **Frontend usage:** Use `availableSemesters` to populate dropdown, `currentSemester` for default selection. On dropdown change, re-call with `?semester=M25`.

---

#### `GET /dashboard/course`
Returns details of a single course with enrolled students and faculty.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | `string` | Yes | MongoDB ObjectId of the course |

**Response:**
```json
{
  "message": "Course details fetched successfully",
  "course": {
    "name": "...", "code": "CS101", "department": "CSE",
    "ug": 1, "semester": "S26",
    "faculty": [{ "name": "...", "email": "...", "dept": "..." }],
    "studentCount": 120, "facultyCount": 2
  },
  "students": [
    { "name": "...", "email": "...", "rollNumber": "..." }
  ],
  "allAvailableFaculty": [
    { "name": "...", "email": "...", "dept": "..." }
  ]
}
```

---

### Data Ingestion

#### `POST /addcourse`
Creates a new course with faculty and student assignments. Atomic (uses transactions).

**Content-Type:** `multipart/form-data`

**Body Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Course name |
| `code` | `string` | Yes | Unique course code |
| `facultyEmails` | `string` (comma-separated) | Yes | Faculty email addresses |
| `abbreviation` | `string` | Yes | Short name |
| `credits` | `number` | Yes | Credit hours |
| `coursetype` | `string` | Yes | e.g. "Theory", "Lab" |
| `ug` | `number` | Yes | UG level (1, 2, 3, 4) |
| `semester` | `string` | Yes | Semester code (e.g. `S26`) |
| `department` | `string` | Yes | Department name |
| `file` | `CSV file` | Yes | Student data CSV |

---

#### `POST /addFacultyCSV`
Bulk-add faculty from a CSV file.

**Content-Type:** `multipart/form-data`

**Body Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `CSV file` | Yes | Faculty data CSV |

---

#### `POST /addStudentsCSV`
Bulk-add students from a CSV file.

**Content-Type:** `multipart/form-data`

**Body Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `CSV file` | Yes | Student data CSV |

---

### Course Actions

#### `GET /viewCourse`
Alias for `GET /dashboard/course`. Same behavior.

---

#### `GET /resetcourse`
Clears students and faculty from a course (sets `isreset: true`).

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | `string` | Yes | Course ObjectId |

---

#### `DELETE /deletecourse`
Permanently deletes a course and all related enrollments/analytics.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | `string` | Yes | Course ObjectId |

---

#### `POST /addFacultyStudentstoCourse`
Re-populates a reset course with faculty and students from CSV.

**Content-Type:** `multipart/form-data`

**Body Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | `string` | Yes | Course ObjectId |
| `facultyEmails` | `string` | Yes | Comma-separated faculty emails |
| `file` | `CSV file` | Yes | Student data CSV |

---

#### `POST /updateCourseDetails`
Updates course metadata (name, code, faculty, etc.).

**Body (JSON):**
```json
{
  "courseId": "...",
  "name": "Updated Name",
  "code": "CS101",
  "coursetype": "Theory",
  "ug": 2,
  "semester": "S26",
  "facultyEmails": ["prof@example.com"]
}
```

---

#### `POST /updateCourseStudents`
Adds students to a course from a CSV file.

**Content-Type:** `multipart/form-data`

**Body Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | `string` | Yes | Course ObjectId |
| `file` | `CSV file` | Yes | Student data CSV |

---

### Faculty Viewing (Admin)

#### `GET /viewFaculty`
Returns detailed information about a specific faculty member.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `facultyId` | `string` | Yes | Faculty ObjectId |

---

#### `GET /viewFacultyCourseStatistics`
Returns detailed analytics for a specific faculty-course combination (from admin's perspective).

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `facultyId` | `string` | Yes | Faculty ObjectId |
| `courseId` | `string` | Yes | Course ObjectId |

---

### Feedback & Semester Management

#### `POST /resetFeedback`
Deletes all feedback documents for a specific semester. **Does NOT reset analytics.**

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `semester` | `string` | No | Previous semester (auto-detected) | Semester code to reset |

**Response:**
```json
{
  "message": "Feedback reset successfully for semester M25.",
  "semester": "M25",
  "deletedCount": 342
}
```

> **Default behavior:** If no `?semester` param is given, deletes the **previous** semester's feedback. E.g. if current is `S26`, deletes `M25`.

---

#### `GET /semesters`
Returns all distinct semester codes from the Course collection, sorted newest-first.

**Response:**
```json
{
  "currentSemester": "S26",
  "semesters": ["S26", "M25", "S25", "M24"]
}
```

---

## Faculty Endpoints

**Base path:** `/api/feedback/faculty`
**Auth:** `authFacultyMiddleware`

---

#### `GET /dashboard`
Returns the faculty's analytics dashboard filtered by semester, with available semesters for the dropdown.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `semester` | `string` | No | Current semester (e.g. `S26`) | Semester code to filter by |

**Response:**
```json
{
  "name": "Dr. Smith",
  "department": "CSE",
  "currentSemester": "S26",
  "availableSemesters": ["S26", "M25", "S25"],
  "avgscore": 8.12,
  "impress": 156,
  "coursestaught": 3,
  "courses": [
    {
      "courseId": "...",
      "name": "Data Structures",
      "coursecode": "CS201",
      "avgscore": 8.5
    }
  ]
}
```

> **Frontend usage:** Use `availableSemesters` to populate a dropdown. Default selection = `currentSemester`. On change, re-call `GET /dashboard?semester=M25`.

---

#### `GET /course`
Returns detailed course statistics for the logged-in faculty.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | `string` | Yes | Course ObjectId |

**Response:**
```json
{
  "name": "Data Structures",
  "coursecode": "CS201",
  "avgscore": 8.5,
  "responses": { "submitted": 95, "yettosubmit": 25 },
  "questions": [
    { "qno": 1, "avgscore": 8.7 },
    { "qno": 2, "avgscore": 7.9 }
  ],
  "min": { "score": 6.2, "question": 5 },
  "max": { "score": 9.1, "question": 1 },
  "feedback": {
    "faculty": [
      { "text": "Great teacher", "score": 8.5, "date": "2026-02-15" }
    ],
    "course": [
      { "text": "Well structured", "score": 7.8, "date": "2026-02-15" }
    ]
  }
}
```

---

#### `GET /semesters`
Returns semesters the faculty has courses in, sorted newest-first.

**Response:**
```json
{
  "currentSemester": "S26",
  "semesters": ["S26", "M25"]
}
```

---

## Student Endpoints

**Base path:** `/api/feedback/student`
**Auth:** `authStudentMiddleware`

---

#### `GET /`
Student feedback dashboard. Returns current feedback state for the **current semester** (auto-detected).

**Response variants:**

*Already submitted:*
```json
{
  "email": "student@example.com",
  "started": true,
  "submitted": true,
  "message": "Your feedback has been recorded"
}
```

*In progress (started but not submitted):*
```json
{
  "email": "student@example.com",
  "started": true,
  "feedback": {
    "_id": "...",
    "semester": "S26",
    "feedbacks": [
      {
        "course": { "_id": "...", "name": "...", "code": "..." },
        "faculty": { "_id": "...", "name": "...", "email": "..." },
        "answers": [
          { "question": { "text": "...", "type": "rating", "order": 1 }, "response": 8 }
        ],
        "completed": false
      }
    ],
    "currentPage": 0,
    "submitted": false
  }
}
```

*Not started:*
```json
{
  "email": "student@example.com",
  "started": false,
  "courses": [
    {
      "courseId": "...",
      "courseName": "Data Structures",
      "courseCode": "CS201",
      "faculty": [
        { "facultyId": "...", "name": "Dr. Smith", "email": "...", "dept": "CSE" }
      ]
    }
  ]
}
```

---

#### `POST /selectfaculty`
Initializes a feedback session. Student selects which faculty to evaluate per course.

**Body (JSON):**
```json
{
  "selections": [
    {
      "courseId": "68db5b79...",
      "facultyIds": ["68db66d7...", "68db66d8..."]
    },
    {
      "courseId": "68db5b80...",
      "facultyIds": ["68db66e1..."]
    }
  ]
}
```

**Response:**
```json
{
  "message": "Feedback initialized successfully",
  "feedbackId": "...",
  "totalFaculty": 4
}
```

> **Validation:** Checks enrollment, verifies each faculty belongs to the course, requires ≥1 faculty per course.

---

#### `POST /updatefeedback`
Saves in-progress feedback answers (auto-save / page navigation).

**Body (JSON):**
```json
{
  "feedbacks": [
    {
      "courseId": "...",
      "facultyId": "...",
      "answers": [
        { "question": "questionId", "response": 8 },
        { "question": "questionId", "response": "Great teaching" }
      ]
    }
  ],
  "currentPage": 2
}
```

**Response:**
```json
{
  "message": "Feedback progress updated successfully",
  "currentPage": 2,
  "feedback": { ... }
}
```

> **Validation:** Rating 1–10, questions 14/15 are optional ratings, questions 16/17 are optional text.

---

#### `POST /submitfeedback`
Final submission. Updates analytics for each faculty-course pair. **Atomic (transaction).**

**Body (JSON):** Same format as `/updatefeedback`.

**Response:**
```json
{
  "message": "Feedback successfully submitted and analytics updated!"
}
```

> **Validation:** All mandatory questions (1–13) must be answered. Optional: 14/15 (rating), 16/17 (text). Cannot submit twice.

---

## Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created (new feedback initialized) |
| `400` | Validation error (bad input, already submitted, etc.) |
| `403` | Access denied (wrong department) |
| `404` | Resource not found |
| `500` | Server error |

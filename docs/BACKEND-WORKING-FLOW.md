# School ERP — Backend Working Flow

**Repo:** `school-erp-backend`
**Stack:** Node.js + Express.js + MongoDB (Mongoose)
**Source:** synthesized from all 22 backend spec docs (`00-project-overview.md` → `29-todo.md`) in
`Core School ERP. Backend. Business. Database/`

This document explains **how the backend actually works end-to-end** — the request lifecycle,
the data model relationships, and the workflow of every module — so any future chat/phase can
pick this up without re-reading all 22 source documents.

---

## 1. Request Lifecycle (every API call)

```
Client Request
   ↓
Express App (helmet, cors, hpp, rate limiter)
   ↓
Body/Cookie Parsing
   ↓
Route Match (/api/v1/...)
   ↓
authenticate()  — verifies JWT access token from HttpOnly cookie
   ↓
authorize()     — loads user → roles → permissions, checks resource:action
   ↓
Validation      — Zod schema validates request body/params/query
   ↓
Controller      — thin, calls service
   ↓
Service         — business logic, calls repository/model
   ↓
Model/Mongoose  — database read/write (with transaction if required)
   ↓
Response Handler — ApiResponse({success, message, data})
   ↓
Client
```

On any failure at any layer, control passes to the **global error middleware**, which normalizes
the error into `{ success:false, statusCode, errorCode, message, errors[], timestamp, path }`
(see §8).

---

## 2. Layered Architecture

```
Controller → Service → Repository/Model → Database
```

- **Controllers** stay thin — no DB queries, no validation logic.
- **Services** hold business rules (e.g. "a teacher cannot teach two classes in the same period").
- **Models** are Mongoose schemas with the common audit fields (see §3).
- Folder structure (already scaffolded in Phase 0) mirrors this: `src/{config,routes,modules,
  middlewares,services,utils,helpers,constants,validators,database,jobs,sockets,storage,emails,
  templates,types,shared}`.

---

## 3. Database Design — Core Rules

- Engine: **MongoDB** via **Mongoose**. DB name: `school_erp`.
- Every collection has: `_id, createdAt, updatedAt, createdBy, updatedBy, isDeleted, deletedAt,
  deletedBy, status`.
- **Soft delete by default** — hard delete is Super Admin-only. Queries ignore `isDeleted: true`
  unless explicitly requested.
- **Reference over embedding** for reusable entities (users, students, teachers, subjects, rooms,
  invoices, etc.) — never duplicate these. Embedding is only for small immutable objects
  (address, emergency contact, guardian snapshot).
- All dates stored in **UTC**, ISO 8601. Convert to local timezone only in the frontend.
- Naming: collections/fields `camelCase`, API routes `kebab-case`, env vars `UPPER_CASE`.

### 3.1 Collection Groups

| Group | Collections |
|---|---|
| Identity | users, roles, permissions, sessions, refreshTokens, otpRequests, activityLogs, auditLogs |
| Organization | campuses, buildings, floors, rooms (`academies`) |
| Academic | academicYears, classes, sections, groups, subjects, classSubjects, teacherAssignments, studentEnrollments |
| People | students, teachers, staff, guardians |
| Routine | classRoutines, teacherRoutines, roomRoutines, routineTemplates, routineConflicts |
| Attendance | studentAttendances, teacherAttendances, staffAttendances, attendanceLocks |
| Examination | examTypes, exams, examSchedules, marks, grades, results, transcripts |
| Finance | feeStructures, studentInvoices/studentFees, payments, discounts, scholarships, expenses, salaryPayments |
| Library | bookCategories, books, authors, publishers, bookCopies, bookIssues, libraryCards, libraryFines |
| Transport | vehicles, drivers, transportRoutes, transportStops, transportAssignments, transportFees |
| Hostel | hostels, hostelRooms, hostelBeds, hostelAllocations, hostelFees, hostelVisitors, wardens |
| Communication | notifications, notificationTemplates, notificationLogs, announcementBoards |
| Settings | systemSettings, academicSettings, attendanceSettings, routineSettings, examSettings, financeSettings, notificationSettings, librarySettings, transportSettings, hostelSettings |
| Automation | scheduledJobs, jobLogs |

### 3.2 Master Relationship Chain

```
Campus → Building → Floor → Room
Academic Year → Class → Section → Group → Student Enrollment → Student
Teacher → Teacher Assignment → Subject → Section
Subject → Class Subject → Teacher Assignment → Routine → Exam → Marks
Student → Invoice → Payment → Receipt
```

### 3.3 Indexing

- **Unique**: email, studentId, teacherId, roomNumber (per building), academicYearCode
- **Compound**: student+academicYear, teacher+subject, room+period, class+section, exam+subject
- **Text**: studentName, teacherName, bookTitle, noticeTitle

### 3.4 Transactions Required For

Student Admission · Promotion · Fee Payment · Exam Publish · Salary Payment · Book Issue/Return

---

## 4. Identity & Access Flow

### 4.1 User Model — the "One User, One Profile" Rule

```
User (auth only: email, password hash, roleIds, profileType, profileId, accountStatus)
   ↓
Student Profile   OR   Teacher Profile   OR   Staff Profile   OR   Guardian Profile
```

A single User **cannot** simultaneously be both a Teacher and a Student — one profile type only.
Authentication never depends on profile type; every account type (Super Admin → Guardian) logs
in through the same `users` collection.

### 4.2 Registration → Verification → Profile Flow

```
Register Request → Validate → Check Existing Email → Create User → Hash Password (bcrypt, 12 rounds)
   → Generate Verification OTP (10 min expiry) → Send Email → Account = PENDING_VERIFICATION
```

Then, separately, **User Creation Flow** (admin-driven, for staff/students/etc.):
```
Create User → Hash Password → Assign Role → Create Profile → Update User.profileId
   → Send Verification Email → Completed
```

### 4.3 Login Flow

```
Login → Validate Email → Validate Password → Check Account Status (must be ACTIVE)
   → Generate Access Token (15 min, HttpOnly cookie) → Generate Refresh Token (7 days, HttpOnly cookie)
   → Save Refresh Token → Send Cookies → Login Success
```

Login requires: email exists, password correct, account ACTIVE, email verified. Any failure →
`AUTH_001 Invalid Credentials` (401).

### 4.4 Token Contents

- **Access Token**: userId, roleIds, tokenVersion — short-lived, authenticates every API call.
- **Refresh Token**: userId, sessionId — long-lived, used only to mint new access tokens; should
  rotate on use and be revocable.

### 4.5 Forgot / Reset / Change Password

```
Forgot Password: Request Email → Generate OTP → Send Email → Verify OTP → Reset Password
Change Password: Must be logged in → Provide Current + New Password → Current must match → Update
```

Password policy: min 8 chars (12+ recommended), upper+lower+number+special char, bcrypt hash only
(never stored/logged in plaintext, never decrypted).

### 4.6 Authorization (RBAC) Flow

```
Request → authenticate() → Load User → Load Roles → Load Permissions
   → Permission Check (resource:action, e.g. student:create) → Controller
```

- A user may hold **multiple roles**; permissions from all roles are combined.
- Permissions are **never** assigned directly to a user — only through roles.
- Unauthenticated → `401`. Authenticated but lacking permission → `403`.
- 10 default roles: SUPER_ADMIN, ADMIN, PRINCIPAL, VICE_PRINCIPAL, TEACHER, STUDENT, GUARDIAN,
  ACCOUNTANT, STAFF, LIBRARIAN (+ Receptionist / Sport Officer as specialized RBAC roles, not
  separate architecture).
- Permission format is always `resource:action`, lowercase, singular resource
  (`student:update` ✅, `students:update` ❌).

---

## 5. Academic Structure Flow

This is the backbone every other module depends on.

```
Academic Year (only one ACTIVE at a time)
   ↓
Class (Class 0 – Class 10, SSC)
   ↓
Section (A/B, or A/B/C for Class 9–SSC)
   ↓
Group (Science/Commerce/Humanities — Class 9–SSC only)
   ↓
Subject (per-class subject list, e.g. Class 6 has 11 subjects)
   ↓
Teacher Assignment (teacher ↔ subject ↔ class ↔ section ↔ group)
   ↓
Student Enrollment (student ↔ academic year ↔ class ↔ section ↔ group ↔ roll number)
   ↓
Class Routine (day ↔ period ↔ subject ↔ teacher ↔ room)
   ↓
Attendance / Examination (depend on Enrollment + Routine + Assignment existing first)
```

### 5.1 Student Admission → Enrollment Flow

```
Student Registration → Student Profile → Enrollment → Roll Number → Subjects → Routine
   → Attendance → Completed
```

- Roll number is unique within `academicYear + class + section`.
- **Promotion creates a brand-new Enrollment record**; the previous one is never modified or
  deleted (full history preserved). Example: Class 6 (2026, Completed) → Class 7 (2027, New).
- A student cannot have two `ACTIVE` enrollments in the same academic year.
- Enrollment must exist **before** Routine, Attendance, Examination, Result, or Fees can
  reference the student.

### 5.2 Teacher Assignment Rules

- One assignment = one teacher + one subject + one class + one section (+ group if Class 9–SSC).
- Duplicate assignments (same teacher+class+section+subject) are rejected.
- Each section has exactly one **Class Teacher**; a teacher can be both Class Teacher and Subject
  Teacher simultaneously.
- A teacher cannot be assigned to two classes in the same routine period.

### 5.3 Campus / Building / Room Flow

```
Campus → Building (ACA-RED, ACA-GREEN) → Floor → Room (RM01–RM70)
```

Every room has one `roomType` (CLASSROOM, LAB, LIBRARY, ...) and one `status` (AVAILABLE,
OCCUPIED, RESERVED, MAINTENANCE, CLOSED). Room numbers unique per building. Capacity must be
checked before enrollment/routine assignment.

---

## 6. Class Routine Engine Flow

```
Create Exam-free working-day grid (Sat–Thu, configurable)
   ↓
Define Periods (period number, start/end time, break indicator)
   ↓
Assign Subject + Teacher + Room per (class, section, group, day, period)
   ↓
Conflict Detection: Teacher Conflict? Room Conflict? Duplicate Subject/Class Period? Invalid Assignment?
   ↓
Resolve all conflicts
   ↓
Publish (status: DRAFT → ACTIVE → LOCKED)
```

- Modes supported: Manual, Automatic, Mixed.
- Once **LOCKED**, no edits without explicit unlock by an authorized user.
- Routine changes must never retroactively alter historical attendance records.

---

## 7. Attendance Flow

```
Open Attendance → Select Class → Select Section → Select Date → Load Enrolled Students
   → Mark Attendance (PRESENT/ABSENT/LATE/LEAVE/HOLIDAY/HALF_DAY) → Save
   → Generate Daily Summary
```

- One record per person per day (student/teacher/staff each tracked separately).
- Requires an active enrollment for students.
- Status flow: `Draft → Submitted → Verified → Locked`. Once locked, immutable.
- Approved leave auto-marks attendance as `LEAVE`.
- Daily/Monthly/Yearly summaries and percentage stats are generated from history, never by
  mutating historical rows.

---

## 8. Examination Flow

```
Create Exam (belongs to one Academic Year + Exam Type)
   ↓
Create Exam Schedule (per class/section/group/subject: date, time, room, fullMarks, passMarks)
   ↓
Assign Room → Assign Invigilator (teacher, cannot double-book)
   ↓
Conduct Exam
   ↓
Enter Marks (0 ≤ obtainedMarks ≤ fullMarks)
   ↓
Generate Result (totalMarks, obtainedMarks, percentage, grade, GPA, position)
   ↓
Publish Result → becomes READ-ONLY
```

- One subject → one exam schedule per exam. One room can't host two simultaneous exams.
- Published results are immutable; corrections require a new revision log entry, never an
  in-place edit.
- Exam status flow: `DRAFT → SCHEDULED → ONGOING → COMPLETED → PUBLISHED → ARCHIVED`.

---

## 9. Finance Flow

```
Fee Structure (per academic year + class + group) defined
   ↓
Student Fee generated per enrolled student (amount, discount, fine → dueAmount)
   ↓
Payment recorded (method: cash/bank/mobile banking/card/online/cheque)
   ↓
Every successful payment atomically creates: Payment record + Transaction record + Receipt
   ↓
Invoice status: DRAFT → SENT → PAID / CANCELLED
Fee status:    PENDING → PARTIAL → PAID (or OVERDUE / CANCELLED)
```

- Payment amount can never exceed the due amount.
- Receipt/Invoice numbers must be unique.
- Financial records are **never deleted** — corrections go through adjustment entries only.
- Salary payments follow a parallel flow: `salaryStructures → salaryPayments` (PENDING → PAID).
- Late fees, scholarships, and discounts are all recorded, never silently applied.

---

## 10. Library Flow

```
Book (with categories/author/publisher) → Book Copies (barcoded, individually tracked)
   ↓
Book Issue (one copy → one user at a time, must be AVAILABLE)
   ↓
Due Date tracking → Return → Fine Calculation (if overdue, per-day or fixed, configurable)
```

- Borrow limits configurable per role (student/teacher/staff) via `librarySettings`.
- Deleting a book/user must never remove issue history — borrowing history is permanent.

---

## 11. Transport Flow

```
Vehicle (seat capacity) + Driver → Transport Route → Transport Stops (ordered)
   ↓
Transport Assignment (student ↔ vehicle ↔ route ↔ stop) — one ACTIVE assignment per student
   ↓
Transport Fee generated from the assigned route
```

- A vehicle can never exceed its seat capacity; a driver can't be double-booked.

---

## 12. Hostel Flow

```
Hostel → Hostel Rooms → Hostel Beds
   ↓
Warden assigned to Hostel
   ↓
Student Allocation (one ACTIVE allocation per student; a bed can't be double-allocated)
   ↓
Hostel Fee generated (follows the Finance module rules)
   ↓
Visitor log tracked separately (permanent record)
```

---

## 13. Notification Flow

```
Create Notification (title, message, type, priority, channel)
   ↓
Select Template (optional) → Select Audience (students/teachers/staff/guardians/admins/custom)
   ↓
Send via Channel(s): IN_APP / EMAIL / SMS / PUSH
   ↓
Delivery Log created per receiver → Read Status tracked
```

Automatic triggers: Admission, Fee Due, Fee Payment, Exam Schedule, Exam Result, Attendance
Alert, Book Due Reminder, Transport Update, Hostel Allocation, Password Reset, Account
Verification.

---

## 14. Reports Flow

```
Select Report Template → Apply Filters (date range, class, status, etc.) → Generate
   → Preview → Export (PDF / Excel / CSV / Print) → Download (may have an expiry)
```

- Reports always read from historical data and never mutate source records.
- Sensitive reports respect the same RBAC permissions as their underlying module.

---

## 15. Settings Flow

Centralized, versioned configuration collections (`systemSettings`, `academicSettings`,
`attendanceSettings`, `routineSettings`, `examSettings`, `financeSettings`,
`notificationSettings`, `librarySettings`, `transportSettings`, `hostelSettings`). Only
`SUPER_ADMIN` may modify settings; every change is logged for audit.

---

## 16. Cron / Background Job Flow

| Category | Job | Schedule |
|---|---|---|
| Attendance | Daily/Monthly Attendance Summary | Daily / 1st of month |
| Finance | Fee Due Processing, Late Fee Calculation, Salary Reminder | Daily / Nightly / Monthly |
| Library | Overdue Detection, Fine Calculation | Nightly |
| Notification | Scheduled Delivery, Reminders (exam/fee/book/transport) | Every minute / Daily |
| Academic | Promotion Prep, Result Publication Reminder | Year-end / Configurable |
| Security | Expired Token Cleanup, Inactive Session Cleanup | Hourly |
| Maintenance | Temp File Cleanup, Old Log Cleanup, Cache Refresh | Daily / Weekly / Configurable |
| Backup | DB Backup, Media Backup, Config Backup | Daily / Daily / Weekly |
| Health | DB, Storage, Application Health Checks | Every 5 min / Hourly |

Jobs should be idempotent, retry-capable, and log every execution (`jobLogs`).

---

## 17. Validation Flow (every request)

```
Request Validation (required fields, types, formats)
   ↓
Business Validation (e.g. "student must have ACTIVE enrollment")
   ↓
Database Validation (uniqueness, referential integrity)
```

Standard library: **Zod** (already wired into backend Phase 0 dependencies) — one validation
strategy used consistently across the whole project. Errors return field-level messages:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [{ "field": "email", "message": "Email already exists." }]
}
```

---

## 18. Error Handling Flow

Every error, regardless of source, is normalized by `errorMiddleware` into:

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_001",
  "message": "Validation failed.",
  "errors": [...],
  "timestamp": "2026-08-17T12:00:00Z",
  "path": "/api/v1/users"
}
```

Error code families already scaffolded for: `VALIDATION_xxx`, `AUTH_xxx`, `RBAC_xxx`,
`STUDENT_xxx`, `TEACHER_xxx`, `ROUTINE_xxx`, `EXAM_xxx`, `ATTENDANCE_xxx`, `FINANCE_xxx`,
`LIBRARY_xxx`, `TRANSPORT_xxx`, `HOSTEL_xxx`, `SYSTEM_xxx`. All 5xx errors and auth/permission
failures are logged (winston); internal stack traces are never exposed to the client in
production.

---

## 19. Security Flow (applies to every layer above)

```
Authentication → Authorization → Validation → Encryption → Audit Logging → Monitoring
```

- Helmet (CSP, XSS protection, frame protection), CORS (trusted origins only, never wildcard in
  prod), rate limiting (100 req/min default, stricter for auth/upload endpoints).
- File uploads: validate MIME type + extension + size, rename on upload, never execute uploaded
  files, store outside app source.
- Sensitive data (passwords, refresh tokens, secrets, stack traces) never appears in any
  response.
- Every critical action (login, logout, password change, role change, permission change, fee
  payment, result publication) is audit-logged.

---

## 20. API Conventions (applies to every endpoint)

- Base: `/api/v1`. Breaking changes → new version (`/api/v2`), never break `/v1` in place.
- Auth header: `Authorization: Bearer <ACCESS_TOKEN>` (in addition to the HttpOnly cookie flow).
- Success: `200`/`201` with `{success, message, data}`. Errors: see §18.
- Pagination: `?page=1&limit=20` → response includes `pagination: {page, limit, total, pages}`.
- Filtering: `?status=ACTIVE&class=7&section=A` (combinable). Sorting: `?sort=-createdAt`.
  Search: `?search=Rahim`. Field selection: `?fields=name,email,phone`.
- Routes: plural collection nouns, kebab-case (`/student-enrollments`, `/teacher-assignments`).

---

## 21. Deployment Flow

```
Install Dependencies → Run Tests → Build → Generate Docs (Swagger) → Deploy
   → Run Health Checks → Completed
```

Recommended stack for prod: MongoDB Atlas, Redis (cache), Docker, Nginx (reverse proxy),
GitHub Actions (CI/CD). Environments: Development → Testing → Staging → Production. Daily DB +
media backups, weekly config backup, 30-day retention. Rollback = restore previous release +
restore DB backup if needed, then re-verify health checks.

---

## 22. Build Order (Roadmap → maps directly to `29-todo.md`)

```
Phase 0  Foundation (Express, MongoDB, logger, error handler, security)      ✅ DONE
Phase 1  Authentication + RBAC + Permissions
Phase 2  User Management (User/Student/Teacher/Staff/Guardian)
Phase 3  Campus (Buildings/Floors/Rooms)
Phase 4  Academic (Year/Class/Section/Group/Subject/Assignment/Enrollment)
Phase 5  Routine (Slots/Periods/Generator/Conflict Detection/Publish)
Phase 6  Examination (Exam/Routine/Marks/Result/GPA/Transcript)
Phase 7  Attendance (Student/Teacher/Staff + Reports)
Phase 8  Finance (Fee Structure/Invoice/Payment/Scholarship/Salary/Expense)
Phase 9  Library (Books/Categories/Issue/Return/Fine)
Phase 10 Transport (Vehicles/Drivers/Routes/Stops/Assignment/Fees)
Phase 11 Hostel (Hostel/Room/Bed/Allocation/Visitors/Fee)
Phase 12 Communication (Notification/Announcement/Email/SMS/Push)
Phase 13 Reports (per-module reports + Dashboard aggregation)
Phase 14 Settings (all setting categories)
Phase 15 Security hardening (JWT/RBAC/Helmet/CORS/Rate limit/Audit)
Phase 16 Automation (Cron jobs/Backup/Cleanup/Health checks)
Phase 17 API polish (pagination/filtering/sorting/search/Swagger)
Phase 18 Testing (unit/integration/API/load/security)
Phase 19 Deployment (Docker/Atlas/Redis/Storage/Monitoring/Release)
```

Each phase's collections/APIs/rules are fully specified in the correspondingly-numbered source
doc (`04-authentication.md` … `27-deployment.md`) — this file is the cross-module summary; consult
the specific doc when implementing a phase in detail.

---

*Generated from the full uploaded spec (`school-ERP-files.zip`) on 2026-08-17. Keep this file
updated alongside `docs/PROGRESS-LOG.md` as phases complete.*

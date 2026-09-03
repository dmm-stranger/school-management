# School ERP — Progress Log

Keep this file updated after every phase. Upload the latest version to the
Claude Project's knowledge so future chats pick up exactly where this left off.

---

## Project Setup

- **Stack decided:** Next.js (frontend) + Express.js + MongoDB (backend) — two separate repos
- **Repos:**
  - `school-erp-backend` — Node.js + Express + MongoDB + Mongoose
  - `school-erp-frontend` — Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Package manager:** Yarn (both repos ship with `yarn.lock`, use `yarn install` / `yarn dev`)
- **Source of truth docs:** uploaded `school-ERP-files.zip`
  - `CLAUDE-MASTER-PROMPT.md`
  - `Color_pallte.md`
  - `school_erp_roles_and_dashboards.md` (9 roles)
  - `Core School ERP. Backend. Business. Database/00-29` (full module specs, roadmap, folder structure)
  - `UI. UX. Frontend. Interaction/` (UI instructions + demo images)

---

## Phase 0 — Project Foundation ✅ COMPLETE

**Date:** 2026-08-17

### Backend (`school-erp-backend`)
- Folder structure created exactly per `03-folder-structure.md`
  (config, routes, modules, middlewares, services, utils, helpers,
  constants, validators, database, jobs, sockets, storage, emails,
  templates, types, shared)
- `src/config/`: server.js, database.js, jwt.js, cookie.js, cors.js, security.js, logger.js (winston)
- `src/database/connection.js`: Mongoose connection with error/disconnect handling + graceful shutdown
- `src/shared/`: ApiError.js, ApiResponse.js, asyncHandler.js
- `src/middlewares/`: error.middleware.js, notFound.middleware.js, rateLimit.middleware.js
- `src/routes/v1/index.js`: API versioning entry point (`/api/v1/health`)
- `src/app.js`: Express app — helmet, cors, hpp, rate limiting, morgan logging, body/cookie parsing
- `src/server.js`: entry point with graceful shutdown (SIGTERM/SIGINT) + unhandled rejection handling
- `package.json` with dependencies: express, mongoose, jsonwebtoken, bcryptjs, cookie-parser,
  cors, helmet, hpp, express-rate-limit, morgan, winston, zod, dotenv
- `.env.example`, `.gitignore`, `README.md`
- **Verified:** dependencies install cleanly, `app.js` loads with no syntax/import errors

### Frontend (`school-erp-frontend`)
- Scaffolded with `create-next-app`: TypeScript, Tailwind CSS 4, App Router, `src/` dir, ESLint
- Full design system wired into `src/app/globals.css` from `Color_pallte.md`:
  primary/accent/neutral/typography/chart/status colors, dark mode palette,
  border radius tokens (12px card / 8px control / pill)
- Fonts: Poppins (headings) + Inter (body) via `next/font/google`
- Folder structure: `components/ui`, `components/layout`, `features`, `lib`, `hooks`, `store`, `types`, `config`
- `src/lib/api-client.ts`: typed fetch wrapper matching backend's `ApiResponse` shape
- `.env.local.example` with `NEXT_PUBLIC_API_URL`
- Homepage (`src/app/page.tsx`) demonstrating the wired-in design tokens
- **Verified:** `tsc --noEmit` clean, `eslint` clean, production build succeeds

### Not yet done (deliberately out of scope for Phase 0)
- No auth, no database models, no real UI screens yet — that's Phase 1+
- Demo images / UI instruction docs not yet reviewed screen-by-screen — do this before Phase 1 UI work starts

---

## Phase 1 — Authentication & RBAC ✅ COMPLETE

**Date:** 2026-08-19

### Backend (`school-erp-backend`)
- **Models:** `User` (bcrypt hashing, tokenVersion, accountStatus), `Role`, `Permission`
  (`resource:action` key), `Session` (hashed refresh tokens, device/IP tracking), `OtpRequest`
  (email verification + password reset, 10-min expiry), `ActivityLog` (all auth actions logged)
- **Utils:** `token.util.js` (JWT access/refresh generation+verification, token hashing),
  `otp.util.js` (6-digit OTP generation/hashing/expiry), `cookie.util.js` (HttpOnly/Secure/
  SameSite cookie helpers)
- **Middleware:** `authenticate.middleware.js` (cookie/Bearer token → load user → tokenVersion
  check), `authorize.middleware.js` (`resource:action` permission check, SUPER_ADMIN bypass),
  `validate.middleware.js` (generic Zod validator)
- **Auth module** (`src/modules/auth/`): service covers all 10 flows from `04-authentication.md`
  — register, login, logout, refresh-token, forgot-password, reset-password, change-password,
  verify-email, resend-otp, me. Controller stays thin, routes match spec exactly.
- **Seeds:** `role-permission.seed.js` (21 resources × 10 actions, 12 roles incl. Receptionist/
  Sport Officer), `super-admin.seed.js` (bootstrap first login) — run via `yarn seed`
- **Verified:** 20 DB-independent unit tests passing (token round-trip, OTP hashing/expiry,
  Zod password-strength validation, bcrypt hash/compare, ApiError/ApiResponse shapes). Full
  live-MongoDB integration test was attempted but blocked by sandbox network restrictions
  (fastdl.mongodb.org unreachable) — **run `yarn seed && yarn dev` locally to verify the live
  DB flow end-to-end before Phase 2.**

### Frontend (`school-erp-frontend`)
- **`features/auth/`**: `auth.types.ts` (mirrors backend contract exactly), `auth.api.ts`
  (typed API functions), `AuthContext.tsx` (session state, login/logout, role→dashboard
  routing map), `RequireAuth.tsx` (route guard — UX convenience only, not a security boundary)
- **`components/ui/`**: `Button.tsx`, `Input.tsx` — first reusable primitives, token-driven
  styling, accessible (labels, aria-invalid, aria-describedby)
- **Pages:** `/login`, `/forgot-password`, `/reset-password` (OTP flow), `/403`, `/dashboard`
  (placeholder, demonstrates `RequireAuth`), `/` (redirects by auth status)
- **Verified:** `tsc --noEmit` clean, `eslint` clean (0 warnings), full production build
  succeeds — all 7 routes compile.

### Not yet done (deliberately out of scope for Phase 1)
- No role-specific dashboard shells yet (Admin/Teacher/Student/... ) — Phase 2
- No Student/Teacher/Staff/Guardian profile CRUD yet — Phase 2 (User Management)
- Email sending is currently a **logger stub** (`sendOtpEmail` in `auth.service.js` just logs
  the OTP) — real SMTP/nodemailer wiring is part of the Communication module (Phase 12/13)
- Live end-to-end DB test not run in this sandbox (network-restricted) — verify locally

---

## Phase 2 — User Management ✅ COMPLETE

**Date:** 2026-08-30

### Backend (`school-erp-backend`)
- **Models:** `Student`, `Teacher`, `Staff`, `Guardian` — with shared `personalInfo`/
  `contactInfo` sub-schemas (`shared/profileSubSchemas.js`) reused across all three staff-like
  profiles, per `06-user-management.md`. Guardian's `userId` is optional (record-only guardians
  supported without portal access). Student's academic info is history-only — current class/
  section is deliberately NOT stored here, it belongs to `StudentEnrollment` (Phase 5).
- **`utils/idGenerator.util.js`**: atomic counter-based sequential ID generation
  (`STU-2026-00001`, `EMP-T-2026-00001`, `EMP-S-2026-00001`) — race-condition safe via
  `findByIdAndUpdate` + `$inc`.
- **`modules/user/user.service.js`**: the reusable transactional core of the User Creation Flow
  (`Create User → Hash Password → Assign Role → Create Profile → Update User.profileId → Send
  Verification Email`), used identically by Student/Teacher/Staff/Guardian creation — implemented
  with real MongoDB transactions (`withTransaction` helper) per `02-database-design.md` §3.4.
- **Full CRUD** for all 4 profile modules + generic `/users` endpoints (list/get/update/delete +
  self `/users/profile`), permission-gated via `resource:action` keys matching the Phase 1 RBAC
  seed (`student:create`, `teacher:list`, `guardian:update`, etc.)
- **`auth.service.js` `sanitizeUser`**: now returns a flattened `permissions: string[]` array
  (`["*"]` for SUPER_ADMIN) so the frontend can resolve nav/UI visibility without guessing —
  population depth fixed everywhere (`roleIds` → nested `permissions`) to support this.
- **Verified:** full backend loads cleanly with all Phase 2 modules wired into `/api/v1`; all
  routes confirmed registered correctly (`/students`, `/teachers`, `/staff`, `/guardians`,
  `/users` — matching spec exactly, including Guardian having no DELETE route per spec).

### Frontend (`school-erp-frontend`)
- **`config/navigation.ts`**: single source of truth nav tree (per `24-navigation-system.md`
  §66 — no per-role duplication), grouped by People/Academic/Operations/System, each item gated
  by a `permission` or `roles` field.
- **`hooks/useNavigation.ts`**: resolves visible nav items from the logged-in user's flattened
  `permissions` — UX-visibility layer only, backend remains the real authority (per
  `FRONTEND-WORKING-FLOW.md` §13).
- **`components/layout/`**: `Sidebar` (collapsible, active-state aware), `Header` (search,
  notifications, user menu), `MobileDrawer` (mobile nav per §25-27 of the nav spec),
  `Breadcrumbs` (auto-derived from route segments), `AppShell` (ties them all together).
- **`app/(dashboard)/layout.tsx`**: route-group layout — wraps every authenticated page in
  `RequireAuth` + `AppShell` automatically, so individual pages don't repeat that boilerplate.
- **10 role dashboards** (`/dashboard/admin`, `/principal`, `/teacher`, `/student`, `/guardian`,
  `/accountant`, `/librarian`, `/staff`, `/receptionist`, `/sport-officer`) — all built on one
  shared `RoleDashboard` component (per `FRONTEND-WORKING-FLOW.md` §6.3), each just passing its
  own title/description/KPI set. `/dashboard` is a generic fallback that redirects to the
  correct role-specific one.
- **`/people/students`**: first real module list page — full list pattern from
  `FRONTEND-WORKING-FLOW.md` §6.1 (debounced search, status filter chips with "Clear all",
  skeleton loading, distinct empty vs error states with retry, pagination, avatar-initials,
  `StatusBadge` using the design system's status color tokens).
- **Verified:** `tsc --noEmit` clean, `eslint` clean (0 warnings), full production build
  succeeds — all 20 routes compile.

### Notable fixes made along the way
- Role dashboard pages needed explicit `"use client"` — passing Lucide icon *components* as
  props from a Server Component into a Client Component isn't allowed in Next.js App Router.
- `KpiCard`'s icon type needed `style?: CSSProperties` added since dashboard cards color icons
  dynamically from the chart-color tokens.
- Two components triggered the `react-hooks/set-state-in-effect` lint rule (calling setState
  synchronously as the first statement of a function invoked directly in a `useEffect` body) —
  fixed in `AuthContext` via an in-effect async IIFE with a `cancelled` guard, and in the
  Students page via deferring the initial fetch with `queueMicrotask`.

### Not yet done (deliberately out of scope for Phase 2)
- Student/Teacher/Staff/Guardian **create/edit forms** — only List + the service/API layer are
  built; the "Add Student" button links to `/people/students/new`, which doesn't exist yet
  (build this alongside Phase 3+ as the form patterns from `FRONTEND-WORKING-FLOW.md` §6.2 get
  established, likely revisited once Campus/Academic exist since forms need class/section pickers)
- Teacher/Staff/Guardian list pages — only Students list is built as the reference
  implementation; the same pattern needs replicating for the other three
  (`/people/teachers`, `/people/staff`, `/people/guardians`)
- Dashboard KPI cards still show placeholder `"—"` values — real data wiring happens once the
  relevant modules (attendance, finance, etc.) exist in later phases
- Live end-to-end DB test still not run in this sandbox (network-restricted) — verify locally

---

## Bugfix — "Schema hasn't been registered for model 'Permission'" (2026-09-02)

**Symptom:** Login / `/auth/me` (and anything else populating `Role.permissions`) threw
`Schema hasn't been registered for model "Permission". Use mongoose.model(name, schema)`.

**Root cause:** Mongoose only registers a schema when the file that calls `mongoose.model(name,
schema)` is actually imported by the running process. `Permission`'s model file was only ever
imported directly by the role/permission seed script — never by anything the live server
actually loads — so when `Role.permissions` (a `ref: "Permission"`) got populated at runtime,
there was no registered schema to resolve against. Any model reachable only via another
schema's `ref` (not imported directly by a route/service) is at risk of this.

**Fix:**
- Added `src/database/models.registry.js` — imports every model file once, with a comment
  explaining why this file exists and the instruction to add new models here going forward.
- Imported the registry from **`src/database/connection.js`**, not just `server.js` — this is
  the true chokepoint every entry point (server, seed scripts, future scripts/tests) already
  passes through via `connectDatabase()`, so registration is guaranteed regardless of which
  script initiates it. (`server.js` also imports it directly as a defense-in-depth belt-and-
  suspenders measure, but `connection.js` is what actually closes the gap.)
- Seed scripts also import the registry directly for clarity, though they're covered either way.

**Verified:** reproduced the exact error in isolation (only importing `Role`, not `Permission`
directly), confirmed the registry fixes it, and confirmed importing *only* `connection.js` (as
any entry point would) is now sufficient to register all 11 models. Full app boot and frontend
build re-verified clean after the fix.

---

## Phase 3 — Campus Management ✅ COMPLETE

**Date:** 2026-09-03

### Spec correction worth noting
`07-campus-building-room.md` models this more flatly than "Campus → Building → Floor → Room"
as four separate collections — there's a **single `academies` collection where each document
IS one room** (fields: `buildingName`, `roomNumber`, `floor`, `roomType`, `status`, `capacity`,
`description`, `facilities`, `relatedUsers`). Campus itself isn't a separate collection yet
(spec: "Current Version: Single Campus... Future: Support Multiple Campuses"). Built exactly to
this — no separate Campus/Building/Floor models invented.

### Backend (`school-erp-backend`)
- **`Academy` model** (`modules/academy/`) — all fields/enums exactly per spec: 2 buildings
  (ACA-RED, ACA-GREEN), 4 floors, 16 room types, 5 statuses, 10 facilities. Room number format
  enforced via regex (`RM01`–`RM70`). Unique index on `(buildingName, roomNumber)` per the
  spec's uniqueness rule.
- **Full CRUD** + the 3 spec-required aggregate endpoints: `GET /academies/buildings` (room
  count + total capacity + floors per building), `GET /academies/floors` (room count per floor,
  optionally scoped to a building), `GET /academies/rooms` (explicit alias of the main list).
  **Route ordering verified**: static routes (`/buildings`, `/floors`, `/rooms`) registered
  before `/:id` so they aren't swallowed as an `:id` param — confirmed via runtime route-stack
  inspection, not just by inspection of the code.
- **`room.seed.js`** — seeds all 70 rooms × 2 buildings from the spec's exact Classroom
  Allocation / Principal Office / Teacher Rooms / Auditorium / Labs / Store Rooms / Finance
  Rooms / Cafeteria / Mosque / Washrooms / Bathrooms tables, with sensible per-type capacity
  defaults. Added as `yarn seed:rooms` (also runs as part of `yarn seed`).
- **Bugfix along the way:** Student/Teacher/Staff models had a stale `ref: "Campus"` on their
  `academy` field left over from Phase 2 (a model that was never actually built) — corrected to
  `ref: "Academy"` to point at the model that actually exists now.
- **Verified:** full backend boots cleanly with Academy wired into `/api/v1/academies`; route
  ordering confirmed correct at runtime; seed script syntax-checked and its room-type values
  cross-verified against the model's enum (13 types used, all valid).

### Frontend (`school-erp-frontend`)
- **`features/academy/`**: types mirroring every backend enum exactly (as `as const` tuples for
  full autocomplete), typed API functions.
- **New `components/ui/Select.tsx`** — first form `<select>` primitive, matching `Input`'s
  label/error/hint/accessibility pattern (this will be reused by every future form).
- **`/academic/rooms`**: list page — building/type/status filter dropdowns + debounced search,
  same skeleton/empty/error states as the Students list.
- **`/academic/rooms/new`**: the project's **first real create form** — validates on submit
  (required fields, room-number regex, capacity > 0), maps backend field-level errors onto the
  right inputs, facility multi-select as toggleable pills, redirects to the detail page on
  success.
- **`/academic/rooms/[id]`**: detail + inline edit — building/room number shown read-only
  (immutable after creation), everything else editable, delete with an inline (not modal)
  confirm-then-confirm pattern per the "destructive actions never one-click" UX rule.
- **Nav**: added "Rooms & Buildings" under the Academic group, gated on `room:list`.
- **Bugfix along the way:** `ApiClientError.errors` was typed as `string[]` but the backend
  actually always returns `{field, message}[]` (per `validate.middleware.js`) — fixed the type
  in `lib/api-client.ts` itself, which benefits every form built from here on, not just this one.
- **Verified:** `tsc --noEmit` clean, `eslint` clean (0 warnings), full production build
  succeeds — all 22 routes compile (20 static + 1 new dynamic `/academic/rooms/[id]`).

### Not yet done (deliberately out of scope for Phase 3)
- `relatedUsers` (assigning teachers/students to a room) has no UI yet — the field exists on the
  model and is populated in API responses, but assignment happens once Teacher Assignment /
  Student Enrollment (Phase 4/5) exist and there's a natural place to trigger it from
- No capacity-vs-assignment enforcement yet ("routine generation must check room capacity" —
  spec's rule, relevant once the Routine engine (Phase 5) exists)
- Live end-to-end DB test still not run in this sandbox (network-restricted) — verify locally,
  including running `yarn seed:rooms` and confirming rooms actually appear in the UI

---

## Next Up — Phase 4: Academic Structure

Per `08-academic.md` + `09-subject.md` + `28-roadmap.md`: Academic Year → Class → Section →
Group → Subject hierarchy — the backbone every other module (Attendance, Examination, Finance)
depends on. This is the biggest remaining backend phase in terms of business-rule density
(promotion flow, one-active-enrollment-per-year rule, etc.) — re-read `08-academic.md` and
`11-student-enrollment.md` closely before starting rather than relying on the earlier summary in
`BACKEND-WORKING-FLOW.md`.

Relevant spec docs to re-read before starting: `08-academic.md`, `09-subject.md`,
`10-teacher-assignment.md`, `11-student-enrollment.md`.

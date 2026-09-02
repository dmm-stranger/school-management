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

## Next Up — Phase 3: Campus Management

Per `07-campus-building-room.md` + `28-roadmap.md`: Campus → Building → Floor → Room hierarchy,
room capacity/status tracking, and the frontend's Campus management UI (list + create/edit forms
for each level). This also unblocks properly wiring the `academy` reference field already present
on Student/Teacher/Staff (currently `null`-only placeholders).

Relevant spec docs to re-read before starting: `07-campus-building-room.md`,
`21-design-system.md` (form patterns), `30-forms-validation-ux.md`.

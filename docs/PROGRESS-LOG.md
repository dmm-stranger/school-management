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

## Next Up — Phase 2: User Management

Per `06-user-management.md` + `28-roadmap.md`: User CRUD, Student/Teacher/Staff/Guardian
profile creation flow (`Create User → Hash Password → Assign Role → Create Profile → Update
User.profileId → Send Verification Email`), profile-type enforcement (one user, one profile),
plus the frontend's role-based App Shell (Sidebar + Header + 10 dashboard shells) from
`FRONTEND-WORKING-FLOW.md` §2.

Relevant spec docs to re-read before starting: `06-user-management.md`,
`school_erp_roles_and_dashboards.md`, `21-design-system.md`, `24-navigation-system.md`.

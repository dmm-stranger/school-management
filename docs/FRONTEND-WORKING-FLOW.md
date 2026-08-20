# School ERP — Frontend Working Flow

**Repo:** `school-erp-frontend`
**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
**Source:** synthesized from all 17 frontend spec docs (`20-ux-instructions.md` → `36-performance-
and-production-ux.md`) in `UI. UX. Frontend. Interaction/`, plus `Color_pallte.md` and
`school_erp_roles_and_dashboards.md`.

This document explains **how the frontend actually works end-to-end** — routing, auth flow,
design system consumption, state handling, and the UX rules every screen must follow — so any
future chat/phase can pick this up without re-reading all 17 source documents.

---

## 1. Core UX Principle

Every screen is built the same way, regardless of role or module:

```
Page Header → Primary Action → Filters/Search → Data Display → Feedback (loading/empty/error)
```

Consistency across all 10 dashboard experiences matters more than customizing each one — the
same table, form, and dashboard patterns are reused everywhere; only the data and permissions
change per role.

---

## 2. Role-Based Application Shell

There are **10 dashboard experiences** built on **one shared shell**, not 10 separate apps:

```
Super Admin · Admin · Principal/Management · Teacher · Student · Guardian
Accountant · Librarian · Receptionist · Sport Officer (specialized, via RBAC)
```

```
AppShell
 ├─ Sidebar (role-based navigation — only permitted modules render)
 ├─ Header (search, notifications, profile menu)
 └─ Main Content (route-driven)
     ├─ Dashboard (role-specific KPIs/widgets)
     ├─ Module pages (List → Detail → Create/Edit → Actions)
     └─ Settings (role-permitted sections only)
```

A module is **never duplicated per role** — e.g. there is one Student Management module; a
Teacher sees a restricted read-only slice of it, Admin sees the full CRUD version. This mirrors
the backend RBAC rule (`resource:action` permission checks control what renders).

---

## 3. Authentication Flow (UI)

```
/login → Enter Email + Password → Submit (button shows loading state)
   → Success: cookies set by backend → redirect to role-specific dashboard
   → Failure: inline error banner ("Invalid email or password"), field stays populated
```

- Password field: visibility toggle, no autocomplete leakage of the value in error states.
- **Forgot Password**: email → OTP sent → OTP entry screen → new password screen → success →
  redirect to login.
- **Session expiration**: a warning appears before expiry (not just after) when possible; on
  actual expiry, an "Your session has expired" modal appears with a re-login CTA — the user's
  in-progress form data is preserved where feasible, not silently discarded.
- **Unauthorized (401)**: redirect to `/login` with a return-URL so the user lands back where
  they were after re-authenticating.
- **Forbidden (403)**: dedicated "You don't have permission to view this page" screen — never a
  blank page or console-only error.
- Security-sensitive UI text must never leak whether an email exists in the system
  (`"Invalid email or password"`, never `"Email not found"`).

---

## 4. Navigation & Routing Flow

```
Sidebar built from the user's resolved permission set (not hardcoded per role)
   ↓
Route requested → Permission-Aware Route Guard
   ├─ Authenticated + Permitted   → render page
   ├─ Not Authenticated           → redirect to /login?redirect=<path>
   ├─ Authenticated, Not Permitted → /403 (Forbidden page)
   └─ Route Doesn't Exist          → /404 (Not Found page)
```

- Sidebar groups mirror backend modules: Dashboard, Academic, Attendance, Examination, Finance,
  Library, Transport, Hostel, Communication, Reports, Settings — each group only renders if the
  user has at least one permitted page inside it.
- Breadcrumbs reflect the actual route hierarchy (e.g. `Academic / Classes / Class 7 / Section A`).
- Deep links must work directly (refreshing `/students/64f.../profile` shouldn't lose state).
- Browser back button behaves predictably — never traps the user or resubmits a form.
- Navigating away with unsaved changes triggers a confirm dialog ("You have unsaved changes...").
- Mobile: sidebar collapses into a drawer; bottom/top nav pattern per `25-responsive-design.md` +
  `18-mobile-navigation` rules.

---

## 5. Design System Consumption

All visual values come from **tokens**, never hardcoded hex/px values in components — this maps
directly to the tokens already wired into `src/app/globals.css` in Phase 0.

| Token category | Source | Example |
|---|---|---|
| Color | `Color_pallte.md` → CSS vars | `bg-primary`, `text-heading`, `bg-status-active-bg` |
| Typography | Poppins (headings) / Inter (body) | `font-heading`, base font sizes/weights/line-height |
| Spacing | 4/8px scale | consistent component & page padding |
| Radius | 12px card / 8px control / pill | `rounded-[var(--radius-card)]` |
| Shadow/Elevation | elevation scale | card vs modal vs dropdown elevation |
| Motion | duration/easing tokens | respects `prefers-reduced-motion` |
| Breakpoints | responsive tokens | mobile / tablet / desktop grid behavior |

**Golden rule from `28-design-tokens.md`: never hard-code a visual value that already has a
token.** Component-level tokens (button height, input height, avatar size, table density) exist
so every instance of a component looks identical everywhere in the app.

---

## 6. Component & Page Pattern

### 6.1 List/Table Pages (the most common page type)

```
Page Header (title + description)
   ↓
Primary Action (e.g. "+ Add Student", permission-gated)
   ↓
Search (debounced) + Filters (visible/collapsible, show active filter chips, "Clear all")
   ↓
Table: sortable columns, primary identifier column pinned, consistent column naming
   ↓
States: Loading (skeleton) → Populated → Empty (first-use vs filtered-empty vs search-empty,
        each with distinct messaging) → Error (retry action, never a raw stack trace)
   ↓
Pagination (page/limit controls, matches backend's `?page&limit` convention)
   ↓
Row Actions (view/edit/delete — delete always confirms; destructive actions never one-click)
```

### 6.2 Forms (Create/Edit)

```
Grouped, logically ordered fields → clear required-field marking → inline validation
   (validate on blur, not on every keystroke) → submit (loading state, disabled while pending)
   → Success (toast + redirect or inline confirmation) → Server-side errors mapped back to fields
```

- Multi-step forms (e.g. Student Admission) show a progress indicator, validate per step, and
  include a final **Review** step before submission.
- Cascading/conditional fields (e.g. Section depends on selected Class) disable until their
  dependency is set, never silently ignore an invalid combination.
- Autosave/draft states are explicitly indicated ("Saving..." / "Saved" / "Autosave failed —
  retry"), never silent.
- Cancel always confirms if the form is dirty; Escape key closes modals/drawers consistently.

### 6.3 Dashboards (role-specific home screen)

```
Header + Welcome → KPI Cards (role-permitted metrics only) → Charts (with empty/error states)
   → Alerts (priority-ordered) → Quick Actions → Recent Activity → Upcoming Events
```

- Every widget loads/fails **independently** — one broken widget must never blank the whole
  dashboard; each has its own retry.
- KPI cards only render metrics the viewer has permission to see (e.g. a Teacher never sees a
  revenue KPI card even if the layout technically has room for it).
- Chart colors come from the fixed chart-color tokens (`chart-students`, `chart-teachers`,
  `chart-attendance`, `chart-fees`, `chart-events`, `chart-library`) so the same data category
  always reads as the same color across the whole app.

---

## 7. State Management Flow

```
Idle → Loading → Success/Empty/Error
                     ↓
             Mutation: Idle → Submitting → Success/Error → (rollback if optimistic + failed)
```

- **Loading**: page-level uses skeletons matching final layout; button-level uses inline
  spinners and disables the trigger to prevent duplicate submission.
- **Optimistic updates** are used for low-risk actions (e.g. marking a notification read) with
  automatic rollback + toast if the server rejects it; **pessimistic (wait-for-server)** is used
  for high-risk actions (payments, result publishing, deletions).
- **Empty vs Error are visually and textually distinct** — "No students found" (empty, calm) is
  never styled like "Failed to load students" (error, actionable retry).
- **Stale-data protection**: after a mutation, dependent views are invalidated/refreshed rather
  than left showing outdated data (e.g. editing a student updates both the list and any open
  detail view).
- **Race conditions** (e.g. fast typing in search) are handled via debouncing + request
  cancellation — the UI must never flash an older response after a newer one has already
  resolved.
- **Bulk actions** (bulk delete, bulk notify) show a distinct in-progress state and a results
  summary (e.g. "18 succeeded, 2 failed — view details").

---

## 8. Forms → Backend Validation Bridge

Frontend validation is UX-first (immediate feedback) but **never the source of truth** — every
field also validates against what the backend's Zod schemas enforce, and server-returned
field-level errors (`{field, message}`) are mapped directly onto the matching form field, with an
error summary at the top of the form for accessibility.

---

## 9. Feedback & Notification UX

| Type | Where it appears | Behavior |
|---|---|---|
| Toast | Top/bottom corner | Auto-dismiss (success/info), persist until dismissed (error), never stack more than a few at once |
| Inline feedback | Next to the relevant field/section | Used for form errors, not global toasts |
| Banner | Top of page | System-wide messages (e.g. maintenance notice) |
| Dialog | Modal | Confirmations, destructive action verification |
| Notification Center | Bell icon → panel | Persistent history, unread/read state, categorized, click-through navigates to the relevant record |

Critical notifications (e.g. security alerts, payment failures) may also trigger email/SMS per
the backend's notification channel rules — the frontend just reflects delivery/read state, it
does not own delivery logic.

---

## 10. Accessibility Flow (applies to every component above)

- Semantic HTML + correct heading hierarchy on every page; every page has a unique, descriptive
  `<title>`.
- Full keyboard navigation: logical focus order, visible focus rings, no keyboard traps (modals/
  drawers trap focus intentionally while open, then return focus on close).
- Every form field has a real `<label>` (never placeholder-as-label); required fields are marked
  in a way that doesn't rely on color alone.
- Live regions announce async state changes (loading complete, errors, toasts) to screen readers.
- Color is never the only signal for status (status chips pair color with text/iconography).
- Respects `prefers-reduced-motion`; respects browser text-zoom/scaling without breaking layout.
- This is enforced project-wide, not just on "important" pages — it is part of every component's
  and every page's definition of done.

---

## 11. UX Writing Rules (applies to all copy in the app)

- Plain language, consistent terminology across the whole app (e.g. always "Guardian", never mix
  with "Parent" elsewhere).
- Buttons describe the action ("Save Changes", not just "Submit"); destructive actions are named
  explicitly ("Delete Student" not "OK") and always confirmed.
- Error messages never blame the user, avoid technical jargon, and tell them what to do next
  ("We couldn't save your changes. Check your connection and try again.").
- Role-aware tone: Student/Guardian portals use simpler, warmer language; Super Admin/Accountant
  screens can be more technical/precise.
- Numbers, currency, and dates follow one consistent format app-wide (localization-ready).

---

## 12. Performance & Production UX

- Route-level code splitting; heavy modules (charts, rich text, big tables) lazy-load.
- Images/avatars are optimized and served at appropriate sizes (Next.js `<Image>`).
- Long-running operations (bulk import, report generation) show background-job UX — a
  non-blocking progress indicator plus a completion notification — never a frozen spinner.
- API requests are cached where sensible, invalidated precisely on mutation, and cancelled when
  no longer relevant (e.g. user navigated away mid-request).
- No technical error (stack traces, raw backend error codes) is ever shown to the end user in
  production — always mapped to the UX-writing-approved message from §11.
- A global error boundary prevents any single component crash from blanking the whole app.

---

## 13. Security-Aware UI Behavior

- The frontend **never** makes authorization decisions on its own — every permission check
  mirrored in the UI (hiding a button, disabling an action) is a convenience layer only; the
  backend's `authorize()` check is the actual source of truth. Hiding a button is not security.
- Sensitive data (full card numbers, tokens, internal IDs where unnecessary) is masked in the UI.
- Session/active-device management screens let a user view and revoke active sessions.
- Audit-relevant actions (role changes, permission changes, deletions) show a clear confirmation
  step before executing.

---

## 14. Frontend ↔ Backend Contract

```
src/lib/api-client.ts  →  fetch wrapper, credentials included, base URL from NEXT_PUBLIC_API_URL
   ↓
Every response expected as: { success, message, data }  (matches backend ApiResponse)
Every error expected as:    { success:false, statusCode, message, errors[] } (matches backend ApiError)
   ↓
Pagination:  ?page&limit  →  { data, pagination: {page, limit, total, pages} }
Filtering:   ?status=&class=&section=   Sorting: ?sort=-createdAt   Search: ?search=
```

This is already scaffolded in `src/lib/api-client.ts` from Phase 0 — future feature work should
extend it (typed per-module API functions), not replace the pattern.

---

## 15. Folder Structure (already scaffolded, Phase 0)

```
src/
├── app/            # Next.js routes (App Router) — one folder per route segment
├── components/
│   ├── ui/         # Reusable primitives: Button, Input, Select, Table, Modal, Toast...
│   └── layout/     # AppShell, Sidebar, Header, role-specific dashboard shells
├── features/       # One folder per module: student/, teacher/, attendance/, finance/...
├── lib/            # api-client.ts, formatting helpers, etc.
├── hooks/          # useAuth, usePermission, useDebounce, useTable, etc.
├── store/          # Global state (auth/session, notifications) — added as needed
├── types/          # Shared TypeScript types (mirrors backend DTOs)
└── config/         # nav config, role-to-dashboard map, feature flags
```

---

## 16. Build Order (mirrors backend phases — frontend UI is built module-by-module alongside it)

```
Phase 0  Foundation — design tokens, fonts, folder structure, API client         ✅ DONE
Phase 1  Auth UI — Login, Forgot/Reset Password, Session handling, Route guards
Phase 2  App Shell — Sidebar (permission-driven), Header, role dashboards (10 shells)
Phase 3  User Management UI — Student/Teacher/Staff/Guardian list+profile+forms
Phase 4  Campus UI — Buildings/Floors/Rooms
Phase 5  Academic UI — Year/Class/Section/Group/Subject/Assignment/Enrollment
Phase 6  Routine UI — grid builder, conflict warnings, publish flow
Phase 7  Examination UI — schedule, marks entry, results, transcripts
Phase 8  Attendance UI — daily marking grid, reports, summaries
Phase 9  Finance UI — fee structures, invoices, payment capture, receipts
Phase 10 Library UI — catalog, issue/return, fines
Phase 11 Transport UI — vehicles, routes, stops, assignments
Phase 12 Hostel UI — rooms, beds, allocations, visitors
Phase 13 Communication UI — notification center, announcements, templates
Phase 14 Reports UI — filterable report builder + export
Phase 15 Settings UI — per-category settings screens (Super Admin only)
Phase 16 Accessibility & UX-writing pass across all built screens
Phase 17 Performance pass — code splitting, caching, image optimization
Phase 18 Production hardening — error boundaries, monitoring hooks, final QA
```

Each phase's exact page list, fields, and component behavior are detailed in the corresponding
source docs (`20-ux-instructions.md` … `36-performance-and-production-ux.md`) and the demo images
in `UI. UX. Frontend. Interaction/` — this file is the cross-cutting summary; consult the
specific doc + matching demo image when implementing a phase in detail.

---

*Generated from the full uploaded spec (`school-ERP-files.zip`) on 2026-08-17. Keep this file
updated alongside `docs/PROGRESS-LOG.md` and `BACKEND-WORKING-FLOW.md` as phases complete.*

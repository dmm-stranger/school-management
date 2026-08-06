# Step 1 — Project Setup (Case Study)

## Goal
Establish the foundation everything else builds on: framework config, folder structure, and a
design token system — before any real page or component exists.

## Context gathered before building
- **Domain:** School management app, not e-commerce (corrected mid-scoping — see chat history).
- **Scale:** One large school, classes 1–10.
- **Backend:** Real API exists; endpoints/auth scheme to be shared when we reach the relevant
  step (auth, then each feature's data layer).
- **Roles:** Not yet defined. Deferred — see "Open questions" below.
- **Priority screen:** Today's attendance overview. This directly informed the design direction
  (see `DESIGN.md`) and the fact that Attendance is being treated as a first-class citizen in
  the folder structure rather than a later add-on.

## Decisions made

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js, App Router | Explicitly requested — latest, Server Components by default |
| Language | TypeScript | Non-negotiable for a multi-module app with shared types across 8+ features |
| Styling | Tailwind CSS v4 (CSS-based `@theme`) | Ships with `create-next-app` latest; token system lives in plain CSS variables, easy to audit and extend (see `DESIGN.md`) |
| Structure | Feature-based (`src/features/<name>/`), not type-based (`components/`, `pages/` flat) | This app has 8+ distinct domains (attendance, students, teachers, classes, results, notices, auth, dashboard). Feature folders keep each domain's components, and later its API calls and types, colocated — mirrors how the backend is already organized by module (see `backend-architecture.md` §5 in your project docs), which will make it easier to reason about which frontend feature talks to which backend module |
| Import alias | `@/*` → `src/*` | Avoids relative-path chains, matches your backend's "no `../../../../`" rule in spirit |
| Fonts | `next/font/google` (Fraunces, IBM Plex Sans, IBM Plex Mono) | Self-hosted automatically by Next.js — no layout shift, no external font request |

## Folder structure produced

```
school-erp-frontend/
├── DESIGN.md                 ← design token rationale (read this before styling anything)
├── docs/
│   └── STEP-1-SETUP.md       ← this file
├── src/
│   ├── app/                  ← Next.js App Router routes (built out per step, starting Step 2)
│   │   ├── globals.css       ← design tokens + base styles
│   │   └── layout.tsx        ← root layout, font wiring
│   ├── features/             ← one folder per domain, built out as we reach that step
│   │   ├── auth/              (Step 3)
│   │   ├── dashboard/         (Step 10)
│   │   ├── classes/           (Step 4)
│   │   ├── students/          (Step 5)
│   │   ├── teachers/          (Step 6)
│   │   ├── attendance/        (Step 7 — but pulled forward for the home screen, see note below)
│   │   ├── results/           (Step 8)
│   │   └── notices/           (Step 9)
│   ├── components/
│   │   ├── ui/                ← generic, reusable primitives (button, input, table row, badge)
│   │   └── layout/             ← sidebar, topbar, shell (Step 2)
│   ├── lib/
│   │   ├── api/                ← fetch client + per-feature API functions (wired once backend URL is shared)
│   │   └── utils/
│   ├── types/                  ← shared TypeScript types (e.g. a `Student` type used by both `students` and `attendance` features)
│   └── config/                  ← app-wide constants (e.g. the Class 1–10 list)
```

## Plan adjustment flagged

The original 11-step plan puts Attendance at Step 7, after Classes/Students/Teachers/Enrollment
exist — which matches the backend's own dependency order (`backend-flows.md` §2–3: Attendance
needs an active enrollment first). But you said the **home screen** should show today's
attendance overview, and that's Step 2/10 territory.

Resolution: Step 2 (layout) will build the *shell* of the attendance-overview home screen using
placeholder/mock data, styled per `DESIGN.md`. It becomes real once Step 5 (Students), Step 6
(Teachers) and Step 7 (Attendance) are wired to your actual API. I'll flag this again when we
get there so it's not forgotten.

## Open questions carried forward
1. **Roles** — you deferred this. It affects routing (`app/(admin)/`, `app/(teacher)/`, etc.) and
   will need an answer before Step 3 (Auth UI).
2. **Backend API shape** — needed before any `lib/api/` function does more than return mock data.

## Verification
- `npx tsc --noEmit` — passes, zero type errors.
- `npx eslint src` — passes, zero warnings.
- `npm run build` — **cannot fully complete in the sandbox this was built in**, because
  `next/font/google` needs to fetch Fraunces / IBM Plex from `fonts.gstatic.com` at build time,
  and this sandbox's network is restricted to package registries only. This is an environment
  restriction, not a code defect — run `npm run build` yourself once you download the project
  and it will fetch the fonts normally. If you'd rather not depend on Google's font CDN at build
  time at all, say so and I'll switch to self-hosted font files instead.
- No feature pages exist yet — that's intentional, this step is foundation only.

# Step 2 — Layout, Navigation & Home Screen (Case Study)

## Goal
Give the app an actual visible shell — sidebar nav, topbar, and a real (if mock-data-backed)
home screen — since Step 1 was intentionally foundation-only and produced no visible UI.

## Decisions made

| Decision | Choice | Why |
|---|---|---|
| Nav sections | Dashboard, Attendance, Classes, Students, Teachers, Results, Notices, Settings | Default proposed from the mapped modules — not yet confirmed against real user roles. Easy to reorder/rename/filter later (single source of truth: `src/config/nav.ts`) |
| Shell architecture | `AppShell` client component wraps `{children}` in the root layout | Every route needs the same sidebar/topbar; simplest to put it once in `layout.tsx` rather than repeat it per route group. Revisit if a future step needs a route *without* the shell (e.g. a full-screen login page) |
| Mobile nav | Sidebar becomes a slide-in drawer below `md`, toggled from the topbar | Matches the accessibility floor promised in `DESIGN.md` ("responsive down to mobile") |
| Home screen content | Attendance overview: ledger table (all classes) + ink-stamp "% present" badge | Directly answers your priority screen answer from scoping |
| Data source | `src/features/attendance/mock-data.ts`, clearly marked temporary | Backend attendance endpoint isn't wired yet (Step 7) — shape mirrors the expected `/attendance-summary` response per `api-endpoints.md` §9 so the swap later is contained to one file |

## Files added
```
src/config/nav.ts                                    ← nav item list
src/components/layout/Sidebar.tsx                     ← chalkboard nav, active-state aware
src/components/layout/Topbar.tsx                      ← date, mobile menu toggle
src/components/layout/AppShell.tsx                    ← ties both together + mobile drawer state
src/types/attendance.ts                                ← shared ClassAttendanceRow type
src/features/attendance/mock-data.ts                   ← temporary mock, swap in Step 7
src/features/attendance/components/AttendanceOverview.tsx  ← the home screen itself
```
`src/app/layout.tsx` now wraps `children` in `<AppShell>`. `src/app/page.tsx` renders
`<AttendanceOverview />` instead of the default Next.js starter content.

## Verification
- `npx tsc --noEmit` — passes, zero errors.
- `npx eslint src` — passes, zero warnings.
- `npm run dev` smoke-tested: `GET /` returns 200 and the response body contains the expected
  content ("Today's attendance", the stamp badge, all 10 class rows).
- Same sandbox font-fetch limitation as Step 1 applies to `npm run build` here — will resolve
  automatically once you run it with normal internet access.

## Open items carried forward
1. **Nav sections** — confirm or edit the default list in `src/config/nav.ts`.
2. **Roles** — still needed before Step 3 (Auth), and will likely mean nav items get
   filtered per role rather than shown to everyone.
3. **Backend API** — `src/lib/api/client.ts` is ready; `attendance` (and every other feature)
   still needs its own `api.ts` once endpoints are confirmed.

# Step 5 — Deduplication & Data Consolidation (Case Study)

## What you flagged
You asked me to check for duplicate components across the project and consolidate them, and
to merge all sample data + images/icons/SVGs into one file. Audited with `grep`, not by eye —
found three real duplications and fixed all of them, plus did the data merge.

## Duplication found and fixed

| Duplication | Where | Fix |
|---|---|---|
| Tone→color class map | `StatsBar.tsx`, `FeatureHighlights.tsx`, `StatCards.tsx`, `RecentActivities.tsx` — 4 separate copies of the same `{primary: "bg-primary/10 text-primary", ...}` object | `src/lib/utils/tone.ts` — one `TONE_BG_TEXT` / `TONE_TEXT` / `TONE_HEX` map, imported everywhere |
| Stat card markup | Dashboard's `StatCards.tsx` and the attendance ledger's inline `SummaryStat` — near-identical label/value/tone card | `src/components/ui/StatCard.tsx` — one component, both places now just call it |
| Donut chart setup | `FeeCollectionDonut.tsx` and `StudentProfile.tsx`'s attendance chart — each built its own `<PieChart>` + center label + legend from scratch | `src/components/ui/DonutChart.tsx` — one component, takes `data`/`centerValue`/`centerLabel`/`size` |

## Data consolidation
Per your instruction, merged everything that was previously spread across
`config/media.ts`, `config/classes.ts`, `features/attendance/mock-data.ts`,
`features/dashboard/mock-data.ts`, and `features/students/mock-data.ts` into:

**`src/config/demo-data.ts`** — the one file for every sample value AND every image/avatar/SVG
reference in the project, organized into five clearly commented sections (Media, Class Levels,
Attendance, Dashboard, Student Profile). All five old files were deleted; every import across
the codebase now points here.

## A real bug this caught
While re-verifying after the refactor, `/dashboard` started returning a 500. Root cause:
`FeeCollectionDonut.tsx` (a Server Component) was passing a *function* (`valueFormatter`) as a
prop into `DonutChart.tsx` (a Client Component) — Next.js can't serialize functions across that
boundary, so it threw. Fixed by replacing the function prop with a plain `format: "number" |
"currency"` flag, which is serializable. Caught by actually re-running the route smoke test
after refactoring, not just by re-reading the code.

## Verification
- `npx tsc --noEmit` — passes, zero errors.
- `npx eslint src` — passes, zero warnings.
- `yarn dev` — all 5 routes (`/`, `/dashboard`, `/dashboard/attendance`, `/dashboard/students`,
  `/dashboard/students/1`) return 200.
- Re-screenshotted `/dashboard` and the student profile after the fix to confirm both the
  earlier chart-animation bug and this new Server/Client bug were actually resolved, not just
  assumed fixed.

## Note on the empty `features/{auth,classes,results,notices,teachers}` folders
These are intentional scaffolding from Step 1 for modules not built yet — not duplication,
just not filled in. Flagging so it's clear they weren't missed by this cleanup.

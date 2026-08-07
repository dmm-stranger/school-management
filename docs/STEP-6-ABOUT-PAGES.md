# Step 6 — About Us Section: 5 Sub-Pages (Case Study)

## What was built
A full "About Us" section matching your 5 reference images, all sharing a common sidebar nav:
`/about` (overview), `/about/principals-message`, `/about/mission-vision`, `/about/history`,
`/about/management-committee`.

## Shared structure extracted first (continuing Step 5's deduplication discipline)
Before writing any page, the common pieces across all 5 images were pulled out so nothing gets
copy-pasted 5 times:

| Component | Purpose | Used by |
|---|---|---|
| `components/ui/Breadcrumb.tsx` | Home > About Us > X trail | All 5 About pages **and** replaces the old inline breadcrumb in `StudentProfile.tsx` |
| `components/ui/IconFeatureItem.tsx` | icon circle + title + description | Core Values, Principal's 4 features |
| `components/ui/CheckList.tsx` | icon + single-line checklist | Mission/Vision bullets, sidebar promo, achievements, responsibilities |
| `components/ui/IconStat.tsx` | icon + big number + label | Overview stats row, History's growth stats — **and refactored `StatsBar.tsx` (homepage) to use it too**, removing its own inline copy |
| `components/about/AboutSidebar.tsx` | the dark-navy "About Us" nav card | All 5 pages |
| `components/about/AboutPromoCard.tsx` | image/icon + heading + text + CTA button | 4 of 5 pages (the overview page uses a checklist instead, per the reference) |
| `components/about/AboutPageShell.tsx` | sidebar + breadcrumb + content grid | All 5 pages |
| `components/marketing/MarketingLayout.tsx` | header + footer wrapper | Homepage **and** all About pages, via a new `(marketing)` route group |

## Routing change
Added an `(marketing)` route group (`src/app/(marketing)/`) so the homepage and every About page
share one layout (`TopUtilityBar` + `MainNav` + `Footer`) automatically, instead of each page
importing them separately. URLs are unaffected — `/` and `/about/*` work exactly as before.

## Data
All new content — nav items, page copy, promo card content, committee member list, stat
numbers — was added to the existing **`src/config/demo-data.ts`**, not a new file, per your
standing instruction to keep all sample data and media in one place. New sections: "ABOUT US
SECTION" (nav + page copy) and the About-specific images/avatars added to the "MEDIA" section.

## Known content quirk (carried over faithfully from your reference)
Your images show slightly different stat numbers on different pages for the same metrics —
e.g. "1,500+ Happy Students" on the overview page vs "2,500+ Students Enrolled" on the homepage
and "2,500+ Students Educated" on the History page; similarly 120+ vs 150+ teachers. This
inconsistency exists in the reference designs themselves, and I reproduced it faithfully rather
than silently "fixing" numbers you may have intended to differentiate (e.g. "students enrolled
now" vs "students educated all-time"). Flagging in case these should actually be reconciled —
happy to make them consistent if you tell me which numbers are correct.

## A tooling note (not a code bug)
Running raw `tsc` in this sandbox trips a Next.js route-type generator that produced a
corrupted `.next/dev/types/validator.ts` — an auto-generated file, not part of the project
source. Verified real source separately with a scratch tsconfig excluding `.next`, which came
back clean. This shouldn't surface in your normal `yarn dev` / `yarn build` workflow; flagging
so it isn't mistaken for a real issue if you see it while developing.

## Verification
- Type-check (excluding the generated-file quirk above) — zero errors.
- `npx eslint src` — zero warnings.
- All 10 routes smoke-tested at HTTP 200: `/`, `/about`, `/about/principals-message`,
  `/about/mission-vision`, `/about/history`, `/about/management-committee`, `/dashboard`,
  `/dashboard/attendance`, `/dashboard/students`, `/dashboard/students/1`.
- All 5 About pages screenshotted and visually compared against your reference images —
  structure, section order, and content all match.

## package.json note
Per your instruction, `dev` and `build` scripts now explicitly pass `--webpack`
(`next dev --webpack`, `next build --webpack`) so Next.js uses webpack rather than its newer
default bundler. Keep this in mind for any future script changes.

## Open items carried forward
1. Stat-number inconsistency above — confirm which numbers are canonical.
2. Roles — still undefined, still blocking real Auth.
3. Backend API — unchanged from Step 1/2 status.
4. Nav dropdown links for Academics/Admissions/Campus Life/News all currently point to pages
   that don't exist yet (expected — only About Us was requested this step).

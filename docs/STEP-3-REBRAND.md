# Step 3 — Rebrand to EduVision Palette + Marketing Site (Case Study)

## What changed and why
You provided two reference screenshots (a dashboard/profile mockup, then a detailed public
landing page for "EduVision School") and asked to match that look instead of the original
"Digital Register" chalkboard theme from Steps 1–2. Checking the images against
`z_School_ERP_UI_Color_Palette.md` in your project docs confirmed they're the same design
system (Primary `#2563EB`, Secondary Navy `#1E3A8A`, Warning Amber `#F59E0B`, Poppins/Inter,
12px card radius) — so this step rebuilds strictly from that doc rather than improvising.

**The chalkboard theme is now fully replaced.** `DESIGN.md` from Step 1 describes a design
that no longer exists in the codebase; treat this file as its replacement.

## Routing restructure (important)
The reference images show two different products sharing one brand: a **public marketing
site** (navbar, hero, admissions CTAs) and a **logged-in admin app** (sidebar, dashboard,
student profiles). Next.js can't serve two different pages at the same URL, so:

- `/` → public marketing homepage (new, this step)
- `/dashboard` → the admin app shell (moved from `/`, restyled)
- `/dashboard/attendance`, `/dashboard/students`, etc. → will be built as their own steps;
  sidebar links already point here

Every "Login Portal" / "Parents Portal" / "Student Portal" / "Staff Portal" link on the
marketing site currently points straight to `/dashboard`, since there's no real auth yet
(Step 3 of the original plan). Once login exists, these should redirect through it instead.

## Design tokens (from the official palette doc)
`src/app/globals.css` now defines every color, radius, and font from
`z_School_ERP_UI_Color_Palette.md` as CSS variables + Tailwind `@theme` tokens — nothing
hardcoded, nothing invented. Fonts switched to **Poppins** (display/headings) and **Inter**
(body), per the doc's "Design Style" section. Card radius is `12px` (`rounded-card`), control
radius `8px` (`rounded-control`), pill `9999px` (`rounded-pill`).

## Files added
```
src/components/marketing/TopUtilityBar.tsx    ← contact info + portal links + social icons
src/components/marketing/MainNav.tsx           ← logo, dropdown nav, Login Portal CTA, mobile menu
src/components/marketing/Hero.tsx              ← headline, CTAs, rating, building placeholder
src/components/marketing/FeatureHighlights.tsx ← 5-icon feature row
src/components/marketing/StatsBar.tsx          ← 6-stat row
src/components/marketing/CampusLife.tsx        ← "Shaping the Leaders" + photo placeholder grid
src/components/marketing/Footer.tsx            ← site footer
src/app/page.tsx                                ← now the marketing homepage (was the dashboard)
src/app/dashboard/layout.tsx                    ← applies AppShell only under /dashboard
src/app/dashboard/page.tsx                      ← the attendance overview, moved here
```

## Files restyled (chalkboard tokens → official palette)
- `src/components/layout/Sidebar.tsx` — chalkboard green → `bg-secondary` (navy)
- `src/components/layout/Topbar.tsx` — rebuilt to match the dashboard mockup's search bar,
  notification/message icons, and avatar-initials profile chip
- `src/features/attendance/components/AttendanceOverview.tsx` — moss/brick/mustard →
  success/danger/warning tokens

## Known placeholder content (flagged in code, not hidden)
- **Photography**: the hero building image and campus-life gallery are gradient + icon
  placeholders with an explicit on-screen note, not hotlinked stock photos — safest choice for
  a project you'll download and deploy yourself. Swap in real photos whenever you have them;
  the layout won't need to change.
- **Social icons**: this version of `lucide-react` doesn't ship brand marks (Facebook/Twitter/
  Instagram/YouTube icons don't exist in it), so generic icons stand in as placeholders. If
  you want the real brand marks, `react-icons` (`react-icons/fa`) has them — say the word and
  I'll swap the dependency.
- **Dropdown nav links** (About Us, Academics, etc.) point to routes that don't exist yet
  (`/about`, `/academics`, ...) — expected, since only the homepage was requested this step.

## Verification
- `npx tsc --noEmit` — passes, zero errors.
- `npx eslint src` — passes, zero warnings.
- `yarn dev` smoke-tested: both `GET /` and `GET /dashboard` return 200 with the expected
  content present in each.

## Open items carried forward
1. Real campus photography, when available.
2. Roles — still needed before real Auth (previously Step 3, now effectively Step 4).
3. Backend API — unchanged from Step 1/2 status.
4. Should brand social icons (`react-icons`) replace the generic placeholders?

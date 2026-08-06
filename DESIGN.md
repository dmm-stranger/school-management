# Design System — EduVision Palette

> Superseded the original "Digital Register" chalkboard theme in Step 3. This file describes
> what's actually in the codebase now. See `docs/STEP-3-REBRAND.md` for why the change happened.

## Source of truth

Every token below is taken directly from `z_School_ERP_UI_Color_Palette.md` in the project
docs — nothing here is invented. If that doc changes, update `src/app/globals.css` and this
file together.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `primary` | `#2563EB` | Primary buttons, links, active nav state |
| `primary-hover` | `#1D4ED8` | Hover state for primary elements |
| `primary-light` | `#DBEAFE` | Light backgrounds behind primary-colored icons/badges |
| `secondary` | `#1E3A8A` | Dashboard sidebar, dark navy surfaces |
| `success` | `#10B981` | Present/positive states, success icon backgrounds |
| `warning` | `#F59E0B` | Amber accents, star ratings, warning states |
| `danger` | `#EF4444` | Absent/destructive states |
| `info` | `#0EA5E9` | Informational accents |
| `purple` | `#8B5CF6` | Secondary accent for icon variety |
| `background` | `#F8FAFC` | Page background |
| `surface` | `#FFFFFF` | Cards, nav bar |
| `section` | `#F1F5F9` | Section bands (stats bar, table headers) |
| `border` | `#E2E8F0` | Borders |
| `divider` | `#CBD5E1` | Dividers |
| `heading` | `#0F172A` | Headings, dark surfaces (footer, top utility bar) |
| `text` | `#334155` | Body text |
| `muted` | `#64748B` | Secondary text |
| `muted-text` | `#94A3B8` | Tertiary/caption text |
| `disabled` | `#CBD5E1` | Disabled state |

Status badge pairs (background/text): `status-active`, `status-pending`, `status-inactive`,
`status-draft` — see `globals.css` for exact values, taken verbatim from the palette doc.

Soft/pastel tints (used for feature icon circles) are derived with Tailwind opacity modifiers
on existing tokens (e.g. `bg-success/10 text-success`) rather than new hardcoded hex values.

## Typography

- **Display / headings:** Poppins (500/600/700)
- **Body:** Inter (400/500/600)

Loaded via `next/font/google` in `src/app/layout.tsx` as `--font-poppins` / `--font-inter`.

## Radii, shadows, spacing

- Cards: `12px` → Tailwind `rounded-card`
- Buttons/inputs: `8px` → Tailwind `rounded-control`
- Pills/badges: `9999px` → Tailwind `rounded-pill`
- Shadows: soft/subtle only (`shadow-sm`, `shadow-md`) — no heavy drop shadows
- Spacing: 8px system (8, 16, 24, 32, 48, 64)

## Layout patterns in use

- **Marketing site** (`/`): top utility bar (dark, contact info + portals) → main nav (white,
  dropdowns, Login Portal CTA) → hero → feature row → stats band → content sections → footer
- **Admin app** (`/dashboard/*`): fixed navy sidebar + topbar (search, notifications, avatar)
  wrapping all dashboard routes via `src/app/dashboard/layout.tsx`

## What's deferred

- Dark mode palette exists in the source doc but isn't implemented — out of scope until asked.
- Real photography — current hero/gallery images are labeled placeholders (see
  `docs/STEP-3-REBRAND.md`).

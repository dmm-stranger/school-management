# Design System — "The Digital Register"

## Why this direction

The app's defining screen (per project scoping) is **today's attendance overview** — this is
an operational tool built around a daily ritual (roll call), not a marketing product. A generic
SaaS dashboard aesthetic (blue sidebar, gradient stat cards) would work for any app; it says
nothing about *this* one.

Instead, the visual language borrows from the school's own artifacts: the attendance register,
the chalkboard, the ruled ledger page. These are things a teacher or admin already recognizes,
so the UI reads as familiar rather than imposed.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--chalkboard` | `#1E3A2F` | Sidebar / header surface (dark) |
| `--chalkboard-soft` | `#2A4D3D` | Hover/active state on dark surfaces |
| `--chalk` | `#F3F1E7` | Main content background |
| `--chalk-dim` | `#EAE6D8` | Secondary surface, card backgrounds |
| `--ink` | `#24303A` | Primary text |
| `--ink-soft` | `#5B6670` | Secondary text, captions |
| `--accent-mustard` | `#D9A441` | Active states, focus rings, highlights |
| `--accent-mustard-soft` | `#F0DCB0` | Highlight backgrounds |
| `--accent-moss` | `#4F7A5B` | Present / success / positive states |
| `--accent-moss-soft` | `#DCE8DF` | Success background |
| `--accent-brick` | `#B0503C` | Absent / alerts / destructive actions |
| `--accent-brick-soft` | `#F0D9D2` | Alert background |
| `--line` | `#C9C2AC` | Ledger rule lines, dividers |

All tokens live in `src/app/globals.css` under `@theme inline`. **Never hardcode a hex value in
a component** — extend this table if a new need arises, and update this doc in the same change.

## Typography

| Role | Typeface | Rationale |
|---|---|---|
| Display (headings) | **Fraunces** | A serif with schoolbook/textbook character — warm, not corporate |
| Body (UI text) | **IBM Plex Sans** | Clean, institutional without being cold — built for interfaces |
| Mono (utility) | **IBM Plex Mono** | Roll numbers, student IDs, dates — gives data a "ledger digit" feel |

Loaded via `next/font/google` in `src/app/layout.tsx`, exposed as CSS variables
(`--font-display`, `--font-sans`, `--font-mono`).

## Layout concept

- Persistent **chalkboard-green sidebar** for primary navigation (role-aware, built in Step 2)
- **Chalk-white** main content area
- Tables/lists use `.ledger-row` (a single hairline `--line` bottom-border) instead of card
  grids wherever the content is inherently row-based (attendance, student lists, marks entry) —
  this is the literal "register" metaphor
- Numbers that identify a person or record (roll no., student ID, invoice no.) are always set in
  the mono face

## Signature element

The attendance overview's centerpiece is a **stamp badge**: a circular mark showing today's
attendance percentage, styled like a rubber ink stamp on a register page. It is the one
deliberately decorative element in the system — everything else stays quiet and functional
by design (see "spend your boldness in one place").

## Accessibility floor (non-negotiable, applies to every step)

- Visible focus rings on all interactive elements (`:focus-visible`, mustard outline)
- `prefers-reduced-motion` respected globally
- Color is never the only signal (e.g. present/absent uses icon + color, not color alone)
- Responsive down to mobile — sidebar collapses to a bottom/drawer nav below `md`

## What's deferred

- Dark mode: not requested yet. Tokens are structured so a dark variant could be added later
  without a rewrite, but it is out of scope until asked for.
- Component-level design (buttons, inputs, tables) is specified per-step as we build each
  feature, not all up front — this doc covers the system, not every component.

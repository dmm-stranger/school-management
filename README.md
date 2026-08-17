# School ERP — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS 4 frontend for the School ERP system.
Consumes the separate `school-erp-backend` Express/MongoDB API.

## Phase Status

- [x] Phase 0 — Project Foundation (design tokens, folder structure, API client)
- [ ] Phase 1 — Authentication UI
- [ ] Phase 2+ — see `docs/PROGRESS-LOG.md` in the backend repo

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Design tokens from `Color_pallte.md` (wired into `src/app/globals.css`)
- Poppins (headings) + Inter (body) via `next/font/google`

## Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
3. Run the dev server (make sure the backend is running on port 5000):
   ```bash
   yarn dev
   ```

## Folder Structure

```
src/
├── app/            # Next.js routes (App Router)
├── components/
│   ├── ui/         # Reusable primitives (buttons, inputs, cards...)
│   └── layout/     # Shells: sidebar, header, dashboard layout per role
├── features/       # Feature/module folders (student, teacher, attendance...)
├── lib/            # api-client.ts and other shared libs
├── hooks/          # Shared React hooks
├── store/          # State management (added when needed)
├── types/          # Shared TypeScript types
└── config/         # App-level config
```

## Design Tokens

All colors, fonts, and radii from `Color_pallte.md` are defined as CSS
variables in `src/app/globals.css` and exposed as Tailwind utilities
(e.g. `bg-primary`, `text-heading`, `rounded-[var(--radius-card)]`).
Dark mode palette is included under the `.dark` class.

## API Connection

`src/lib/api-client.ts` wraps `fetch` with credentials, base URL
(`NEXT_PUBLIC_API_URL`), and typed responses matching the backend's
`ApiResponse` shape (`{ success, message, data }`).

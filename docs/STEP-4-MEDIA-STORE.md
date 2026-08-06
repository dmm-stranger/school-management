# Step 4 — Centralized Media/Asset Data Store (Case Study)

## Goal
Every image URL and SVG reference had been hardcoded inside individual components
(`Hero.tsx`, `CampusLife.tsx`, etc.). You asked for a single place to store image/file/icon
references so swapping in real assets later is a one-file edit, not a hunt through components.

## What was added
- **`src/config/media.ts`** — the single source of truth. Exports typed constants:
  `LOGO_SVG_PATH`, `HERO_IMAGE`, `CAMPUS_GALLERY`, `TRUST_AVATARS`,
  `CURRENT_ADMIN_AVATAR`, `SAMPLE_STUDENT_AVATAR`.
- **`public/brand/logo.svg`** — an actual SVG file (shield + book mark, brand colors), not a
  data URL or icon-font substitute. Edit this file directly to change the logo graphic.
- **`next.config.ts`** — added `images.remotePatterns` for the two placeholder image
  providers used (`picsum.photos`, `ui-avatars.com`), which `next/image` requires for any
  external domain.

## Why these placeholder providers specifically
- **picsum.photos** (Lorem Picsum) — a free placeholder-image service built for exactly this
  use case (demo layouts before real photography exists), not hotlinked stock photography.
- **ui-avatars.com** — generates initials-based avatar images on the fly. Used instead of
  fake "photos" of people who don't exist, which would be a worse placeholder for a real
  school's parent/staff-facing site.

Both are swap-out points, not permanent choices — see "How to swap in real assets" below.

## Components updated to read from the store
```
src/components/marketing/MainNav.tsx     → logo (was an inline icon, now public/brand/logo.svg)
src/components/marketing/Hero.tsx        → hero photo + parent avatar stack
src/components/marketing/CampusLife.tsx  → 3-photo gallery
src/components/layout/Topbar.tsx         → admin avatar in the dashboard topbar
```

## How to swap in real assets (do this whenever you're ready)
1. **Real photos**: drop files into `public/` (e.g. `public/campus/hero.jpg`), then in
   `src/config/media.ts` change `HERO_IMAGE.url` to `"/campus/hero.jpg"` and update
   `width`/`height` to the real file's dimensions. Same pattern for `CAMPUS_GALLERY`.
2. **Real people's photos**: same idea — replace the `ui-avatars.com` URLs in
   `TRUST_AVATARS` / `CURRENT_ADMIN_AVATAR` with real image paths once you have them (and
   have consent to use them).
3. **A different logo**: either edit `public/brand/logo.svg` directly, or replace the file
   and keep `LOGO_SVG_PATH` pointing at `/brand/logo.svg`.
4. **A real CDN**: if your assets end up on a CDN instead of `public/`, add that domain to
   `remotePatterns` in `next.config.ts`, same as was done for the two placeholder providers.

No component code needs to change for any of this — that's the point of centralizing it here.

## Verification
- `npx tsc --noEmit` — passes, zero errors.
- `npx eslint src` — passes, zero warnings.
- `yarn dev` smoke-tested: `/` and `/dashboard` both return 200 with expected content present.
- Sandbox can't reach `picsum.photos`/`ui-avatars.com` at build/runtime (network is
  registry-only here), so images won't actually render inside this sandbox — this resolves
  automatically the moment you run the project with normal internet access.

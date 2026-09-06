# TarsOnlineCafe Redesign Mockup

React + Framer Motion + Three.js preview of a richer portfolio redesign, inspired by interactive WebGL portfolio patterns (e.g. [ThreeUI](https://threeui.com)-style particle fields and motion-led heroes).

## What’s in this mockup

- **WebGL ember field** — mouse-reactive particle constellation behind the hero (`EmberField.jsx` via React Three Fiber)
- **Motion** — Framer Motion page load + scroll reveals, magnetic CTAs, pointer glow
- **Brand-forward hero** — rotating `TARS ONLINE CAFE · EST 2020` orb with logo mark
- **Preserved site content** — about, services, featured work, process, testimonials, contact

## Run locally

```bash
cd mockup
npm install
npm run dev
```

Open the URL Vite prints (defaults to `http://localhost:5173/redesign/`).

## Build static preview

```bash
cd mockup
npm run build
```

Outputs to `/redesign` at the repo root for static hosting. Production site at `/` is unchanged.

## Notes

- Contact form is mock-only in this preview.
- WebGL pauses conceptually via `prefers-reduced-motion` (static fallback).
- Three.js is code-split into its own chunk for faster first paint.

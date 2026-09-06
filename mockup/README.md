# TarsOnlineCafe — Redesign Mockup (leveled)

A React + Framer Motion + Three.js portfolio redesign that blends multiple inspiration sources into one cohesive coffee-atelier aesthetic — without losing live-site content.

## Inspiration stack (woven, not copied)

| Source | What we borrowed |
|---|---|
| **Apple HIG** | Clarity, 44px targets, bottom sheet nav, reduced-motion respect, hierarchy |
| **shaders.com / Active Theory** | Atmospheric GPU field as mood layer, pointer-reactive |
| **Spline / Morflax / ProVisual** | Cinematic proof object (device frame + hotspots) |
| **Typeface Animator / StringTune** | Kinetic brand letters on hero only |
| **Design Spells / Lottieflow** | Micro-interactions: magnetic CTAs, scroll cue, sheet spring |
| **Iconsax** | Single stroke icon family for proof cards |
| **Rotato / LS.graphics** | Product-in-situ presentation language |
| **UI Guideline / ContentCore** | Editorial spacing rhythm, one job per section |
| **Iteration X** | Hotspot annotations on featured work |

`apple-skills.md` was not found in the repo; Apple HIG principles were applied directly.

## Features

- WebGL ember constellation (paused offscreen, lighter on mobile)
- Kinetic brand type + scroll progress + pointer glow (desktop)
- Mobile bottom-sheet navigation + sticky project dock
- Cinematic work showcase with tappable hotspots
- Snap-scroll process/testimonial rails on small screens
- `prefers-reduced-motion` fallbacks throughout

## Run

```bash
cd mockup
npm install
npm run dev
```

Open `/redesign/`.

## Build

```bash
npm run build
```

Static output → `/redesign` (production `/` untouched).

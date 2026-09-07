# TarsOnlineCafe — Redesign Variant Lab

Multi-direction React mockups sharing **locked live-site content** from `src/content.js`. Production `/` is untouched. Built output lives in `/redesign/`.

## Open the lab

```bash
cd mockup
npm install
npm run dev
# → http://localhost:5173/redesign/
```

Or build + preview:

```bash
npm run build && npm run preview
```

## Variants

| Route | Name | Thesis | Inspiration |
|---|---|---|---|
| `/redesign/` | Hub | Comparison board | — |
| `/redesign/ember.html` | Ember | Dark coffee atelier + directed brew/build WebGL | shaders · Active Theory · Design Spells |
| `/redesign/frost.html` | Frost | Light Apple editorial clarity | Apple HIG · UI Guideline · ContentCore |
| `/redesign/signal.html` | Signal | Kinetic type as product | Typeface Animator · StringTune |
| `/redesign/stage.html` | Stage | Device cinema / product stage | Rotato · LS.graphics · ProVisual · Spline |
| `/redesign/lattice.html` | Lattice | Annotated systems blueprint | Iteration X · Iconsax · UI Guideline |
| `/redesign/hybrid.html` | Hybrid | Recommended combination | Best-of merge |

## Rules

- Do not rewrite hero/about/services/work/process/testimonials/contact wording — import `content.js`.
- Mobile-first (≈390px), 44px targets, sheet nav, reduced-motion.
- `apple-skills.md` was not in-repo; Apple HIG applied where relevant (Frost/Hybrid).

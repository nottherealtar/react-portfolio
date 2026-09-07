# 3D Cafe mockup — TarsOnlineCafe

Spatial coffee-shop portfolio for Joshua Coetzer. Live homepage stays untouched; this preview lives at `/3d-cafe/`.

## 3D implementation

High-grade shop rendering, in the spirit of threeui.com heroes:

- Procedural PBR maps (walnut, oak, floor grain, plaster, brushed metal, ceramic) with generated normals
- Custom GLSL: additive steam points, swirling crema, window god-rays
- MeshPhysical materials (clearcoat ceramic, metal espresso group, wood)
- Studio lighting: Lightformers, dusk window `RectAreaLight`, soft PCF shadows, ACES tonemapping
- Post: SMAA + bloom on practicals + vignette
- Modeled props: lathe cups, portafilter group heads, hopper beans, pendant lamps, chalkboard, laptop


- **World:** a walkable espresso bar (Three.js / React Three Fiber) — the shop *is* the site.
- **HUD:** Apple Liquid Glass overlay — system SF stack, glass only on nav/dock/hero panel, unified lists, 44px targets, reduced-motion fallback.
- **Copy:** locked to the live site. Wording does not change.

## Stations

Shop → About → Menu → Work → Pour → Guests → Order

Scroll, arrow keys, the dock, or the glowing floor rings move the camera.

## Local

```bash
cd cafe
npm install
npm run dev
```

Production build writes static files to `/3d-cafe/` at the repo root (Vercel serves them as-is).

```bash
cd cafe && npm run build
```

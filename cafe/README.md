# 3D Cafe mockup — TarsOnlineCafe

Spatial coffee-shop portfolio for Joshua Coetzer. Live homepage stays untouched; this preview lives at `/3d-cafe/`.

The quality bar for this scene is the cinematic WebGL skill at `.cursor/skills/cinematic-webgl/SKILL.md`. Agents working on the shop should follow it: PBR maps, modeled props, studio lighting, custom shaders — not untextured boxes.

## 3D implementation

High-grade shop rendering, in the spirit of threeui.com heroes:

- Procedural PBR maps (walnut, oak plank floor, plaster, brushed metal, ceramic, subway tile, leather) with generated normals and roughness
- Custom GLSL: additive steam points, swirling crema, multi-shaft window god-rays
- MeshPhysical materials (clearcoat ceramic, transmission glass, metal espresso group, wood)
- Studio lighting: Lightformers, dusk window `RectAreaLight`, soft PCF shadows, baked contact shadows, ACES tonemapping
- Post: N8AO + bloom on practicals + vignette + SMAA
- Architecture: baseboards, ceiling beams, tile backsplash, window mullions with glazed panes
- Modeled props: lathe cups and saucers, portafilter group heads, glass hopper, tamper, leather stools, instanced leaves, chalkboard, laptop


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

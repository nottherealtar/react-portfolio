# 3D Cafe mockup — TarsOnlineCafe

Spatial coffee-shop portfolio for Joshua Coetzer. Live homepage stays untouched; this preview lives at `/3d-cafe/`.

## Direction

- **World:** a walkable espresso bar (Three.js / React Three Fiber), in the spirit of [threeui.com](https://threeui.com) heroes — the shop *is* the site.
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

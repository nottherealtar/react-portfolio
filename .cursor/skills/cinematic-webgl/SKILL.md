---
name: cinematic-webgl
description: Build high-grade cinematic WebGL / Three.js / React Three Fiber scenes with PBR, studio lighting, custom shaders, and modeled props. Use whenever the user asks for 3D, WebGL, Three.js, R3F, a cafe/shop scene, threeui-style heroes, PBR, or to raise 3D quality. Never satisfy a 3D request with untextured primitive boxes.
---

# Cinematic WebGL

Ship hero-quality realtime 3D, in the spirit of threeui.com — not a product-viz dump of cubes.

This repo's cafe preview lives at `/3d-cafe/` (`cafe/` source). Copy is locked to the live site. Do not replace production `index.html`.

## Quality bar

A scene is not high-grade if a still frame reads as "developer primitives." Before calling 3D done, a Shop-station screenshot must show:

- Readable materials (wood grain, metal brushing, ceramic clearcoat, plaster variation)
- Modeled silhouettes (lathe, extrude, instancing, composed parts — not one box per prop)
- Cinematic light (IBL + area/spot practicals + contact on the floor)
- At least one custom shader beat (steam, crema, god-rays, or equivalent)

If those fail, keep going. Do not hide a weak scene behind HUD glass.

## Materials (PBR)

Use `MeshPhysicalMaterial` for hero surfaces (wood, metal, ceramic, glass). `MeshStandardMaterial` is fine for plaster and matte walls.

Every repeating surface needs at least:

- albedo `map` (sRGB)
- `normalMap` (linear)
- `roughnessMap` (linear), multiplied with a scalar `roughness`

Generate maps procedurally in this project (`cafe/src/scene/textures.js`) so the preview stays network-free. Derive normals from a height field. Repeat + anisotropy on large floors.

Glass: `transmission`, `thickness`, `ior` on `MeshPhysicalMaterial` — not a transparent color plane. Keep dusk/sky as a textured plane *behind* the glazing.

Emissive practicals (pendants, laptop UI, neon sign) should be bright enough to bloom, then tone-mapped with ACES.

`aoMap` needs a `uv2` attribute. Prefer roughness/normal over a broken AO map.

## Modeling

Forbidden as the *only* representation of a prop: a single `boxGeometry` / `sphereGeometry` with a flat color.

Compose:

- Cups, pots, shades: `latheGeometry`
- Machine, stools, frames: grouped cylinders + rounded boxes + torus details
- Repeating small parts (beans, leaves, floorboards): `instancedMesh`
- Signage and UI: canvas textures on thin planes, never HTML inside the WebGL scene

Add architectural millwork the camera will actually see: baseboards, counter nosing, window mullions, ceiling beams, backsplash. Empty plaster boxes read as unfinished.

## Lighting and camera

- `Environment` + `Lightformer` cards for studio IBL (warm key, cool fill)
- One large `rectAreaLight` in the window (init `RectAreaLightUniformsLib`)
- One shadow-casting spot or directional with `PCFSoftShadowMap` + `SoftShadows`
- `ContactShadows` on the floor (`frames={1}` for a static shop)
- Hemisphere + tiny ambient only as bounce, not the key
- ACES filmic + `SRGBColorSpace`; fog that matches the background

Camera: low cinematic FOV (~34), damped station rigs, subtle pointer parallax. Honor `prefers-reduced-motion` (cut parallax, skip particles, offer a 2D fallback).

## Shaders and post

Custom `ShaderMaterial` for effects that materials cannot do. Additive steam/god-rays: `toneMapped={false}`, `depthWrite={false}`. Lit surfaces that use shader color (crema) must run `#include <tonemapping_fragment>` and `#include <colorspace_fragment>`.

Desktop post stack (skip on mobile width and reduced motion):

1. SSAO (`N8AO`, half-res, performance quality)
2. Bloom on practicals (high luminance threshold)
3. Vignette
4. SMAA last

Do not gate quality on `hardwareConcurrency` — cloud VMs look low-end and would skip the hero look. Gate on viewport width (`max-width: 720px`) and reduced motion only.

## Performance

- Cap DPR (~1.75 desktop, 1 mobile)
- `AdaptiveDpr`
- Instanced meshes over hundreds of objects
- One shared texture atlas/factory (`getCafeMaps()`), not per-mesh canvases in render
- Transmission only on a handful of glass pieces
- No GLTF downloads unless the user asks for authored assets

## Implementation map (this repo)

- `cafe/src/scene/textures.js` — procedural PBR factory
- `cafe/src/scene/shaders.js` — steam, crema, god-rays
- `cafe/src/scene/props.jsx` — modeled shop props + materials
- `cafe/src/scene/CafeWorld.jsx` — room, lights, composition
- `cafe/src/scene/CafeCanvas.jsx` — canvas, camera, environment, post
- Build writes static files to `/3d-cafe/`

When raising quality, change the world and the maps — not the locked copy in `content.js`.

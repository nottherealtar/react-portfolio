# edh.dev-Inspired Direction — TarsOnlineCafe
**Date:** 2026-08-10  
**Reference:** [edh.dev](https://edh.dev/) (open source: [retro-computer-website](https://github.com/edhinrichsen/retro-computer-website))

---

## What makes edh.dev work

| Principle | On edh.dev | Why it lands |
|-----------|------------|--------------|
| **Site = showcase** | The folio *is* a Three.js app with a working shell, filesystem, markdown renderer | Visitors experience skill before reading about it |
| **Ritual entry** | Boot loader with progress + status lines | First 3 seconds feel engineered, not templated |
| **3D centerpiece** | Full-viewport WebGL retro computer you orbit and use | Memorable, shareable, impossible to fake with a theme |
| **Editorial scroll** | Simple HTML below the fold: big headings, `<hr>`, tag lists, long copy | Content breathes; projects read like stories |
| **Restrained chrome** | Tiny nav, social icons, “Scroll ↓” — no card grid soup | The craft is the hero, not the layout framework |
| **Personality in details** | Computer based on Commodore PET; shell easter eggs | Specific > generic |

---

## Tars translation (not a clone)

**Do not** rebuild a Commodore PET or lean on 80s beige nostalgia. **Do** build the thing your name already says: **PCs and coffee** — a modern desk at the café counter, monitor glowing, cup steaming, shell ready.

### Centerpiece: “The Café Desk”

| Element | Role |
|---------|------|
| **Monitor + shell** | edh’s interactivity — a terminal you can type in (`help`, `work`, `contact`). Modern flat panel, not retro plastic. |
| **Coffee mug + steam** | Tars warmth — human pace, café identity. CSS/Canvas steam, optional 3D mug later. |
| **Wood desk surface** | Grounds the scene. Warm `#2d221b` tones, soft top-light like a window seat. |
| **Keyboard** | Subtle silhouette — you’re at work, not in a museum. |

The **globe** can stay elsewhere (integrations map, about section) but the **hero** is the desk: PC meets coffee.

### Entry ritual: PC boot × coffee brew

```
POST… OK
Grinding beans…
Mounting ~/integrations…
Heating the group head…
Starting cafe-shell…
Ready.
```

Skippable. Respects `prefers-reduced-motion`.

### Typography & layout shift
- **Hero:** Giant name over the **café desk** (monitor + mug) — edh scale, coffee palette
- **Below fold:** Strip glassmorphism card grids in favour of **editorial sections** (edh-style `h1` / `h2` / `hr` / tag `<ul>`)
- **Work:** Case studies as long-form project entries (year, stack tags, story) — WeSolveYourProblem first
- **Services:** Short, confident blocks — not four identical cards

### What stays
- Business positioning (automation & integration for hire)
- Coffee colour system (espresso, crema, foam)
- DM Serif + Inter
- Blog, SEO, contact form, POPIA mentions
- Accessibility & reduced-motion fallbacks

### What goes or shrinks
- Generic SaaS landing patterns (metric cards, fake dashboards, orchestrator HUDs)
- Section-per-card sameness (everything same visual weight)
- Tailwind CDN dependency long-term → compiled CSS for production
- Passive decorations that don’t respond (static terminal text blocks)

---

## Architecture options

| Approach | Pros | Cons |
|----------|------|------|
| **A. Evolve static HTML** (current repo) | No framework migration; Vercel deploy unchanged | Harder to share state between 3D + terminal + content |
| **B. Vite + vanilla TS** (edh pattern) | Clean module graph for WebGL + boot + shell | One-time build pipeline setup |
| **C. Next.js** (PDF analysis assumed) | SSR, `next/font`, component reuse | Overkill if site stays mostly static |

**Recommendation:** **B** for the interactive layer (boot, globe, terminal), still emit static `dist/` for Vercel. Migrate incrementally: north-star prototype → hero replacement → work section → rest.

---

## Phased roadmap

### Phase 0 — North star (this branch)
- `dev/north-star.html` — PC×coffee desk hero, boot ritual, monitor shell, editorial sample

### Phase 1 — Hero & entry
- Port café desk + boot to production `index.html`
- Expand monitor into a **working cafe-shell** (ui-lab terminal → real commands)

### Phase 2 — Editorial work section
- Rebuild `#work` as edh-style project list (Solve My Problem hero entry)
- Remove redundant card chrome

### Phase 3 — Interactive shell
- Command set: `help`, `about`, `work`, `contact`, `open <url>`, `menu`
- Mobile: desk scales down; shell collapses to typed intro

### Phase 4 — 3D depth (optional)
- Low-poly desk scene in Three.js (monitor, mug, keyboard) — orbit slightly on scroll
- Globe moves to **Work** or **About** as “integrations map”, not hero

### Phase 5 — Polish & perf
- Lighthouse 90+; boot skip; CI visual regression optional
- Blog pages inherit typography tokens only (don’t force 3D on every page)

---

## Success criteria

1. A first-time visitor says “this person builds software” within 5 seconds — not “nice template”
2. The site demonstrates **integration/automation** behaviour (terminal, scroll, 3D) without fake AI dashboards
3. Business clients still find services, case study, and contact in one scroll
4. You’d be proud to send the link to Wetility colleagues and Cape Town clients alike

---

## Preview

```bash
python3 -m http.server 8000
# North star: http://localhost:8000/dev/north-star.html
# UI lab:      http://localhost:8000/dev/ui-lab.html
```

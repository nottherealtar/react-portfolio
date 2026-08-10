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

**Do not** rebuild a retro computer. Your brand is coffee + automation + Johannesburg. The equivalent of Ed’s PET is something only you would build.

### Proposed centerpiece: “The Cafe Terminal”
- Keep/evolve the **Three.js globe** (Johannesburg pin, connection lines) as ambient WebGL — already on-brand for “integrations across systems”
- Overlay a **working mini-terminal** (Phase 2 lab prototype, expanded): visitors run `ls`, `cat about.txt`, `open work/solvemyproblem` — content loads from real site data, not fake logs
- Optional later: low-poly **espresso machine** or **desk scene** instead of globe — only if it serves the story

### Entry ritual: “Brewing…” not “Booting…”
```
Grinding beans…
Heating the group head…
Pulling the first shot…
Ready.
```
Skippable. Respects `prefers-reduced-motion`.

### Typography & layout shift
- **Hero:** Giant name (`Josh` or `Tars`) over WebGL — edh scale, coffee palette
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
- `dev/north-star.html` — boot, giant hero, globe, editorial sample, scroll hint
- Align stakeholders on look/feel before touching `index.html`

### Phase 1 — Hero & entry
- Port boot + giant typography to production `index.html`
- Merge terminal boot (ui-lab Phase 2) into hero; static fallback for SEO/crawlers

### Phase 2 — Editorial work section
- Rebuild `#work` as edh-style project list (Solve My Problem hero entry)
- Remove redundant card chrome

### Phase 3 — Interactive terminal
- Command set: `help`, `about`, `work`, `contact`, `open <url>`
- Mobile: terminal collapses to typed intro animation only

### Phase 4 — 3D depth
- Globe reacts to scroll section (subtle camera drift)
- Or replace with cafe desk scene if globe feels weak

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

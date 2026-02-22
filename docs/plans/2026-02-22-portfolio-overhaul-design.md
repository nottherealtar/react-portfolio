# Portfolio Overhaul Design — TarsOnlineCafe
**Date:** 2026-02-22
**Approach:** B — Full narrative overhaul
**Goal:** Convert tarsonlinecafe.work from a developer showcase into a business lead-generation site for bespoke automation & integration services.

---

## 1. Strategic Repositioning

### Before
- Framed as: "Full Stack Developer & 3D Enthusiast"
- Led with: React, Three.js, personal projects
- Audience: unfocused — recruiters, hobbyists, developers

### After
- Framed as: Automation & Integration Specialist (Python, Azure, Freshworks)
- Led with: business outcomes — what problems Josh solves and for whom
- Audience: companies and individuals needing bespoke process automation, CRM/FSM integrations, Azure Logic Apps, and API connectivity

### Services Offered (explicitly, on the page)
1. **Process Automation** — Python-based tooling to eliminate manual workflows
2. **Azure Logic Apps** — cloud-native, no-code/low-code workflow orchestration
3. **Freshworks Integrations** — Freshdesk, Freshservice, Freshsales bespoke config and API integration
4. **API & Custom Forms** — webhook systems, data routing, custom business forms with system-level integration

### What is NOT offered (not advertised)
- Web design
- General web development
- Three.js / 3D work for hire (stays as personality/showcase only)

---

## 2. Page Architecture

### Section Order
```
[Sticky Nav]
[Hero]           — Value proposition + ambient 3D globe
[Services]       — 4 core offerings, glassmorphism cards
[Case Studies]   — Outcomes-first, journal aesthetic
[How I Work]     — 3-step process timeline
[Testimonials]   — LinkedIn recommendation(s)
[Contact]        — Web3Forms, professional fields
[Footer]         — Social, blog link, copyright
```

### Removed / Relocated
- Standalone globe section → merged into Hero as ambient background
- Skills section with progress bars → replaced by Services cards (skills are implicit)
- GitHub streak iframe → removed (unreliable third-party; GitHub link in footer is sufficient)
- Discord contact backend → replaced by Web3Forms

---

## 3. Visual Identity

### Brand
Coffee-shop aesthetic is kept and amplified. TarsOnlineCafe is a differentiator — warm, human, memorable against sterile dev-shop competitors.

### Color Palette
```
Deep Espresso   #1a1108   — darkest backgrounds, depth layers
Dark Roast      #2d221b   — primary background
Latte Brown     #a1866f   — secondary, card backgrounds, muted text
Gold Crema      #c9a96e   — primary CTA, hover states, highlights
Foam Cream      #f7efe2   — primary text, light surfaces
Steamed Milk    #ede0cc   — secondary text, subtle contrast
```

### Typography
- **Serif headline:** DM Serif Display (Google Fonts, display-swap) — hero headline and case study outcome titles
- **Body / UI:** Inter (already loaded)
- **Terminal / code:** Courier New (already used)
- Hierarchy: large serif for impact → inter for readability → monospace for tech credibility

### Coffee Visual Motifs
- **Steam animations:** Pure CSS keyframe wisps (3 lines, staggered timing, opacity fade) — used in hero and on hover states
- **Coffee-stain rings:** SVG decorative circles (blurred, semi-transparent #a1866f stroke) behind icons in service cards
- **Coffee-pour line:** SVG path with `stroke-dashoffset` animation on the "How I Work" timeline — the connector line draws itself downward as the section enters the viewport
- **Grain/crema texture:** `::after` pseudo-element with `background-image: url("data:image/svg+xml...")` noise filter at ~3% opacity — adds depth to hero without extra HTTP requests
- **Section transitions:** Subtle wave/pour SVG dividers between major sections (espresso flowing into latte color shift)

### Glassmorphism Treatment
```css
background: rgba(45, 34, 27, 0.55);
backdrop-filter: blur(16px);
border: 1px solid rgba(247, 239, 226, 0.12);
border-radius: 16px;
```

---

## 4. Section Specifications

### 4.1 Sticky Navigation
- **Transparent** on load
- **Frosted glass** (backdrop-blur + dark coffee background) after scrolling 80px
- Logo: `☕ TarsOnlineCafe` (SVG coffee cup icon + wordmark)
- Links: `Services` | `Work` | `Process` | `Contact`
- CTA: `Let's Talk →` — pill button in Gold Crema `#c9a96e`, dark text
- **Mobile:** Hamburger → full-screen dark overlay, large centered links, slide-in from right
- **Active state:** Latte underline that slides under the current section link (IntersectionObserver-driven)

### 4.2 Hero
**Layout:** Full viewport height, 3D globe rotating slowly in background behind frosted glass foreground card.

**Copy:**
```
[headline — DM Serif Display, 56–72px]
I automate what slows
your business down.

[subhead — monospace, latte color]
▸ Python  ▸ Azure Logic Apps  ▸ Freshworks
▸ API Integration  ▸ Custom Business Forms

[body — Inter, 18px]
Bespoke automation and integration solutions
for businesses that are ready to stop doing
things manually.

[ See My Work ]    [ Start a Project → ]
```

**Motion:**
- Globe: auto-rotating, `OrbitControls.autoRotate = true`, disabled user interaction
- Headline: fades up on load (CSS animation, 0.6s)
- Tech stack chips: stagger in left-to-right after headline (0.1s delay each)
- Steam wisps: always-on subtle animation behind the glass card

### 4.3 Services
**Header:** `"What I build for you"`

**4 Cards (2×2 grid, responsive to 1 column mobile):**

| # | Title | Icon | Description | Tags |
|---|---|---|---|---|
| 1 | Process Automation | `fa-cogs` | Eliminate repetitive manual work with Python-powered tools tailored to your exact workflow | Python, Flask, FastAPI |
| 2 | Azure Logic Apps | `fa-cloud` | Cloud-native workflow orchestration that connects your entire stack automatically — no custom server required | Azure, Logic Apps, REST |
| 3 | Freshworks Integrations | `fa-headset` | Freshdesk, Freshservice, and Freshsales built to your exact process — custom automations, ticket logic, CRM flows | Freshworks, API, Webhooks |
| 4 | API & Custom Forms | `fa-plug` | Bespoke data capture, conditional routing logic, and system-level integration between any tools you use | Webhooks, REST, Forms |

**Card hover state:**
1. `translateY(-6px)` lift
2. Gold crema glow: `box-shadow: 0 20px 40px rgba(201, 169, 110, 0.15)`
3. Coffee-stain ring darkens behind icon
4. Single steam wisp animation appears above icon

### 4.4 Case Studies
**Header:** `"My Work"`

**Primary cards (real/anonymized client work):**
- Category tag chip (e.g., `FRESHWORKS INTEGRATION`)
- Outcome headline in DM Serif Display — always a specific result
- 3–4 sentence description (anonymized client, real problem and solution)
- Tech stack chips
- No "Learn More" link needed unless a full writeup exists

**Secondary row — "Also Built":**
- Smaller cards for Discord Bot Cogs, Tar-Copy, Interactive 3D Globe
- Less visual weight, clearly differentiated as side projects
- Tar-Copy gets a Live Demo link; Discord Bot gets GitHub link; Globe gets "See it above"

**Content to populate (placeholder structure for Josh to fill in):**
Josh has partial real work — at minimum 2 anonymized case study cards should be written before launch. If only 1 is ready, the section can launch with 1 card + the "Also Built" row and expand over time.

### 4.5 How I Work
**Header:** `"How it works"`

**3-step vertical timeline:**

```
☕  Step 1: Discovery
    "We have a conversation about your problem —
     what it costs you today, what the ideal state
     looks like, and whether I'm the right fit.
     No commitment required."

⚙️  Step 2: Build
    "I design, build, and test the solution with
     your feedback at each stage. Clean code,
     documented, and built to last beyond day one."

🚀  Step 3: Deliver
    "Handed over with full documentation and a
     walkthrough session. Ongoing support and
     iterations available as your needs evolve."
```

**Timeline connector:** SVG vertical line with `stroke-dashoffset` scroll animation — the line "pours" downward as the section scrolls into view. Steps stagger in (opacity + translateX alternating left/right) as the line reaches each node.

### 4.6 Testimonials
- Existing Jason Simonis card — kept and restyled
- Large decorative `"` marks in latte color
- Author avatar, name, title, company, LinkedIn connect button
- Verification badge: `✓ Verified LinkedIn Recommendation`
- Carousel ready for additional recommendations (up to 3 slots)

### 4.7 Contact
**Header:** `"Let's work together"`

**Subhead:** `"Tell me what you're trying to solve. I'll come back to you within 24 hours."`

**Backend:** Web3Forms
**Form URL:** `https://api.web3forms.com/submit`
**Domain registered:** `www.tarsonlinecafe.work`
**Access Key:** *(to be inserted from Web3Forms dashboard after account creation)*

**Fields:**
| Field | Type | Required |
|---|---|---|
| `access_key` | hidden | yes — Web3Forms API key |
| `redirect` | hidden | `""` (prevent redirect, handle in JS) |
| Name | text | yes |
| Company | text | no |
| Email | email | yes |
| Project type | select | yes — `Automation / Azure Logic Apps / Freshworks / API Integration / Other` |
| Tell me about it | textarea (5 rows) | yes |

**Submit button:** `Send it ☕`

**UI Feedback States (animated — all CSS + JS, no library):**

| State | Visual | Duration |
|---|---|---|
| Default | Gold crema button, full opacity | — |
| Loading | Button text → `"Brewing…"`, subtle pulse animation, disabled | During fetch |
| Success | Button → `"Sent! ☕"` (green-tinted), form fades out, success card fades in with steam animation | 0.5s transition |
| Error | Button → `"Try again"` (warm red tint), inline error message below field with shake animation | 0.3s shake |

**Success card:**
```
☕
"Got it — I'll be back within 24 hours."
[Send another message]
```
Steam wisps animate above the coffee cup icon.

**Buy Me a Coffee:** Stays in the contact section below the form, styled as a secondary soft link.

---

## 5. Animation Budget

All animations are CSS-first. GSAP is available but used only where CSS cannot achieve the effect cleanly.

| Animation | Method | Trigger |
|---|---|---|
| Steam wisps (hero) | CSS keyframes | Always on |
| Nav background | CSS transition | JS scroll event |
| Nav active state underline | CSS transition | IntersectionObserver |
| Section fade-in | CSS + IntersectionObserver | Scroll into view |
| Service card hover | CSS transition | `mouseenter` |
| Service card steam wisp | CSS keyframes | `mouseenter` |
| Timeline line draw | SVG stroke-dashoffset + CSS | IntersectionObserver |
| Timeline steps stagger | CSS animation + JS delays | IntersectionObserver |
| Form button states | CSS class swap + transition | JS fetch lifecycle |
| Form success card | CSS opacity + transform | JS on fetch success |
| Form error shake | CSS keyframe | JS on fetch error |
| Falling leaves | Existing `falling-leaves.js` | Always on (keep) |

`prefers-reduced-motion` media query wraps all non-essential animations.

---

## 6. Contact Backend Setup

### Web3Forms Steps
1. Go to [web3forms.com](https://web3forms.com) and create account
2. Create form named `My-Portfolio`, domain `www.tarsonlinecafe.work`
3. Copy the Access Key (UUID format)
4. In `index.html`, set `<input type="hidden" name="access_key" value="YOUR_KEY_HERE">`
5. Form `action` attribute is not used — submission is handled via `fetch()` in JS
6. No serverless function needed — the existing `/api/contact.js` can be deprecated

### Form Fetch Handler (JS)
```js
// Pseudo-code — full implementation in writing-plans phase
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setButtonState('loading');
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: new FormData(form)
  });
  if (res.ok) setButtonState('success');
  else setButtonState('error');
});
```

---

## 7. Files Changed / Created

| File | Action | Notes |
|---|---|---|
| `index.html` | Major rewrite | New section structure, copy, nav |
| `styles/themes.css` | Update | New color tokens, DM Serif import |
| `styles/skills-enhancement.css` | Deprecate | Skills section removed |
| `styles/nav.css` | Create | Sticky nav styles |
| `styles/services.css` | Create | Service card styles + hover |
| `styles/case-studies.css` | Create | Case study card + journal aesthetic |
| `styles/how-i-work.css` | Create | Timeline + SVG animation |
| `styles/contact.css` | Update | New form fields, feedback states |
| `scripts/nav.js` | Create | Scroll behaviour, active state |
| `scripts/contact-animations.js` | Update | Web3Forms fetch handler, new states |
| `scripts/skills-enhancement.js` | Deprecate | No longer needed |
| `scripts/component-integration.js` | Update | Remove skills init, add new inits |
| `/api/contact.js` | Deprecate | Replaced by Web3Forms |

---

## 8. Out of Scope (this overhaul)

- Blog content refresh (new posts) — separate task after launch
- Resume/CV PDF — Josh to provide, add as download link in nav CTA or hero
- Dark/light theme toggle — keep existing, no changes
- Tailwind build pipeline migration — deferred; CDN stays for now
- React migration — not planned

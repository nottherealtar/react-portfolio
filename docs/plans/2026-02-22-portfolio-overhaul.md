# Portfolio Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild tarsonlinecafe.work from a developer showcase into a business lead-generation site for bespoke automation & integration services, with an amplified coffee aesthetic.

**Architecture:** Single `index.html` page restructured into new section order (Nav → Hero → Services → Case Studies → How I Work → Testimonials → Contact → Footer). New CSS files per section. Vanilla JS scripts handle nav scroll behaviour, SVG animations, and Web3Forms contact submission. No framework, no build step.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties, keyframes, SVG animation), Vanilla JS ES6 classes, Tailwind CDN (existing), Three.js (existing, repurposed), GSAP (existing), Web3Forms API, Vercel hosting.

**Design Reference:** `docs/plans/2026-02-22-portfolio-overhaul-design.md`

---

## Task 1: Foundation — Color tokens, font, new CSS file stubs

**Files:**
- Modify: `styles/themes.css`
- Create: `styles/nav.css`
- Create: `styles/services.css`
- Create: `styles/case-studies.css`
- Create: `styles/how-i-work.css`

**Step 1: Add new color tokens to `styles/themes.css`**

Append to the `:root` block (after the existing variables):

```css
/* Extended palette for overhaul */
--espresso:      #1a1108;
--dark-roast:    #2d221b;
--latte:         #a1866f;
--crema:         #c9a96e;
--foam:          #f7efe2;
--steamed-milk:  #ede0cc;
--glass-bg:      rgba(45, 34, 27, 0.55);
--glass-border:  rgba(247, 239, 226, 0.12);
```

**Step 2: Add DM Serif Display font to `index.html` `<head>` (after the existing preconnect line)**

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
```

**Step 3: Create empty CSS stub files**

Create `styles/nav.css` with just a comment:
```css
/* Sticky navigation styles */
```

Create `styles/services.css`:
```css
/* Services section styles */
```

Create `styles/case-studies.css`:
```css
/* Case studies section styles */
```

Create `styles/how-i-work.css`:
```css
/* How I Work timeline styles */
```

**Step 4: Add the new CSS files to `index.html` `<head>` (after the existing stylesheet links)**

```html
<link rel="stylesheet" href="/styles/nav.css">
<link rel="stylesheet" href="/styles/services.css">
<link rel="stylesheet" href="/styles/case-studies.css">
<link rel="stylesheet" href="/styles/how-i-work.css">
```

**Step 5: Verify**

Open `index.html` in a browser. Page should look identical to before (stubs add nothing). Check DevTools Console — no 404 errors on the new CSS files.

**Step 6: Commit**

```bash
git add styles/themes.css styles/nav.css styles/services.css styles/case-studies.css styles/how-i-work.css index.html
git commit -m "feat: add color tokens, DM Serif font, and new CSS file stubs"
```

---

## Task 2: Sticky Navigation

**Files:**
- Create: `scripts/nav.js`
- Modify: `styles/nav.css`
- Modify: `index.html`

**Step 1: Write `styles/nav.css` in full**

```css
/* Sticky navigation styles */

.site-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
}

.site-nav.scrolled {
  background: rgba(26, 17, 8, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 1px 0 rgba(247, 239, 226, 0.08);
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none !important;
  color: var(--foam) !important;
  font-family: 'DM Serif Display', serif;
  font-size: 1.1rem;
  letter-spacing: 0.01em;
  flex-shrink: 0;
}

.nav-logo-icon {
  font-size: 1.3rem;
}

/* Desktop links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: rgba(247, 239, 226, 0.75) !important;
  text-decoration: none !important;
  font-size: 0.875rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 500;
  position: relative;
  transition: color 0.2s ease;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--crema, #c9a96e);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--foam) !important;
}

.nav-links a.active::after,
.nav-links a:hover::after {
  width: 100%;
}

/* CTA button */
.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.25rem;
  background: var(--crema, #c9a96e);
  color: var(--espresso, #1a1108) !important;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.nav-cta:hover {
  background: var(--foam, #f7efe2);
  color: var(--espresso, #1a1108) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(201, 169, 110, 0.3);
}

/* Hamburger (mobile) */
.nav-hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 110;
}

.nav-hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--foam, #f7efe2);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.nav-hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-hamburger.open span:nth-child(2) {
  opacity: 0;
}

.nav-hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile overlay menu */
.nav-mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(26, 17, 8, 0.97);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  opacity: 0;
  transform: translateX(100%);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.nav-mobile-overlay.open {
  display: flex;
  opacity: 1;
  transform: translateX(0);
}

.nav-mobile-overlay a {
  color: var(--foam) !important;
  text-decoration: none !important;
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  letter-spacing: 0.02em;
  transition: color 0.2s ease;
}

.nav-mobile-overlay a:hover {
  color: var(--crema) !important;
}

.nav-mobile-cta {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: var(--crema);
  color: var(--espresso) !important;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif !important;
  font-weight: 600;
  font-size: 1rem !important;
}

/* Responsive breakpoint */
@media (max-width: 768px) {
  .nav-links,
  .nav-cta {
    display: none;
  }

  .nav-hamburger {
    display: flex;
  }
}

@media (max-width: 480px) {
  .site-nav {
    padding: 0 1rem;
  }
}
```

**Step 2: Write `scripts/nav.js` in full**

```js
// Sticky navigation: scroll behaviour + active section tracking
(function () {
  const nav = document.querySelector('.site-nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay = document.querySelector('.nav-mobile-overlay');
  const mobileLinks = overlay ? overlay.querySelectorAll('a') : [];
  const desktopLinks = document.querySelectorAll('.nav-links a[data-section]');

  if (!nav) return;

  // Scroll: add .scrolled class after 80px
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on init

  // Hamburger toggle
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      if (isOpen) {
        overlay.style.display = 'flex';
        requestAnimationFrame(() => overlay.classList.add('open'));
        document.body.style.overflow = 'hidden';
      } else {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        overlay.addEventListener('transitionend', () => {
          if (!overlay.classList.contains('open')) overlay.style.display = 'none';
        }, { once: true });
      }
    });

    // Close overlay on any link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        overlay.addEventListener('transitionend', () => {
          if (!overlay.classList.contains('open')) overlay.style.display = 'none';
        }, { once: true });
      });
    });
  }

  // Active link tracking via IntersectionObserver
  if ('IntersectionObserver' in window && desktopLinks.length) {
    const sections = {};
    desktopLinks.forEach(link => {
      const id = link.dataset.section;
      const el = document.getElementById(id);
      if (el) sections[id] = el;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        desktopLinks.forEach(link => {
          if (link.dataset.section === id) {
            link.classList.toggle('active', entry.isIntersecting);
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    Object.values(sections).forEach(el => observer.observe(el));
  }
})();
```

**Step 3: Add nav HTML to `index.html` — insert as the FIRST child of `<body>`, before `<div id="canvas-container">`**

```html
<!-- Sticky Navigation -->
<nav class="site-nav" role="navigation" aria-label="Main navigation">
  <a href="#" class="nav-logo" aria-label="TarsOnlineCafe home">
    <span class="nav-logo-icon">☕</span>
    <span>TarsOnlineCafe</span>
  </a>

  <ul class="nav-links">
    <li><a href="#services" data-section="services">Services</a></li>
    <li><a href="#work" data-section="work">Work</a></li>
    <li><a href="#process" data-section="process">Process</a></li>
    <li><a href="#contact" data-section="contact">Contact</a></li>
  </ul>

  <a href="#contact" class="nav-cta">Let's Talk →</a>

  <button class="nav-hamburger" aria-label="Toggle mobile menu" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>
</nav>

<!-- Mobile overlay menu -->
<div class="nav-mobile-overlay" role="dialog" aria-modal="true" aria-label="Mobile navigation">
  <a href="#services">Services</a>
  <a href="#work">Work</a>
  <a href="#process">Process</a>
  <a href="#contact">Contact</a>
  <a href="#contact" class="nav-mobile-cta">Let's Talk →</a>
</div>
```

**Step 4: Add `scripts/nav.js` to `index.html` — add just before `</body>`**

```html
<script src="/scripts/nav.js"></script>
```

**Step 5: Move the theme toggle button so it doesn't overlap the nav**

In `styles/themes.css`, change the `.theme-toggle` position from `top: 20px; right: 20px` to:

```css
.theme-toggle {
  top: 76px; /* below the 64px nav */
  right: 20px;
}
```

**Step 6: Verify in browser**

- Nav appears at top of page, transparent on load
- Scroll down 80px → nav gains dark frosted-glass background (smooth transition)
- Resize to mobile → hamburger appears, links hidden
- Tap hamburger → full-screen overlay slides in from right
- Tap a link in overlay → overlay closes, page scrolls to section
- Theme toggle no longer overlaps nav

**Step 7: Commit**

```bash
git add styles/nav.css scripts/nav.js index.html styles/themes.css
git commit -m "feat: add sticky nav with scroll behaviour and mobile overlay"
```

---

## Task 3: Hero Section Rewrite

**Files:**
- Modify: `index.html` (hero section HTML + inline styles)
- Modify: `styles/themes.css` (steam animation keyframes)

**Step 1: Replace the hero `<section>` in `index.html`**

Find the existing hero section (starts with `<!-- Hero Section -->`) and replace it entirely:

```html
<!-- Hero Section -->
<section id="hero" class="hero-section">
  <!-- Globe renders into canvas-container behind this -->
  <div class="hero-grain"></div>
  <div class="hero-steam" aria-hidden="true">
    <div class="steam-wisp steam-wisp--1"></div>
    <div class="steam-wisp steam-wisp--2"></div>
    <div class="steam-wisp steam-wisp--3"></div>
  </div>

  <div class="hero-card glass-card">
    <div class="hero-badge" aria-hidden="true">JC</div>

    <h1 class="hero-headline">
      I automate what slows<br>your business down.
    </h1>

    <div class="hero-stack" aria-label="Core technologies">
      <span class="hero-chip">▸ Python</span>
      <span class="hero-chip">▸ Azure Logic Apps</span>
      <span class="hero-chip">▸ Freshworks</span>
      <span class="hero-chip">▸ API Integration</span>
      <span class="hero-chip">▸ Custom Forms</span>
    </div>

    <p class="hero-body">
      Bespoke automation and integration solutions for businesses ready to stop doing things manually.
    </p>

    <div class="hero-ctas">
      <a href="#work" class="hero-btn-primary">See My Work</a>
      <a href="#contact" class="hero-btn-secondary">Start a Project →</a>
    </div>
  </div>
</section>
```

**Step 2: Add hero styles to `index.html` inline `<style>` block (append to existing styles)**

```css
/* ── Hero ─────────────────────────────────────────────── */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 1.5rem 3rem;
  overflow: hidden;
}

/* Noise/grain texture overlay */
.hero-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  opacity: 0.035;
  pointer-events: none;
  z-index: 0;
}

/* Steam wisps */
.hero-steam {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}

.steam-wisp {
  position: absolute;
  bottom: 0;
  width: 3px;
  border-radius: 50%;
  background: linear-gradient(to top, rgba(201,169,110,0.18), transparent);
  animation: heroSteam 5s ease-in-out infinite;
}

.steam-wisp--1 { left: 15%; height: 200px; animation-delay: 0s; }
.steam-wisp--2 { left: 50%; height: 260px; animation-delay: 1.8s; width: 2px; }
.steam-wisp--3 { right: 18%; height: 180px; animation-delay: 3.4s; }

@keyframes heroSteam {
  0%   { opacity: 0;   transform: translateY(0)   scaleX(1);   }
  20%  { opacity: 0.7; }
  80%  { opacity: 0.3; }
  100% { opacity: 0;   transform: translateY(-180px) scaleX(1.8); }
}

/* Frosted glass card */
.hero-card {
  position: relative;
  z-index: 1;
  max-width: 720px;
  width: 100%;
  padding: 3rem 3.5rem;
  border-radius: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: heroFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-badge {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--crema, #c9a96e);
  color: var(--espresso, #1a1108);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-headline {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  line-height: 1.15;
  color: var(--foam, #f7efe2);
  margin: 0;
}

.hero-stack {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.hero-chip {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  background: rgba(201, 169, 110, 0.15);
  color: var(--crema, #c9a96e);
  border: 1px solid rgba(201, 169, 110, 0.3);
  animation: chipFadeIn 0.5s ease both;
}

.hero-chip:nth-child(1) { animation-delay: 0.6s; }
.hero-chip:nth-child(2) { animation-delay: 0.75s; }
.hero-chip:nth-child(3) { animation-delay: 0.9s; }
.hero-chip:nth-child(4) { animation-delay: 1.05s; }
.hero-chip:nth-child(5) { animation-delay: 1.2s; }

@keyframes chipFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-body {
  font-size: 1.05rem;
  color: var(--steamed-milk, #ede0cc);
  max-width: 520px;
  line-height: 1.65;
  margin: 0;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.hero-btn-primary {
  padding: 0.75rem 1.75rem;
  background: var(--crema, #c9a96e);
  color: var(--espresso, #1a1108) !important;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none !important;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-btn-primary:hover {
  background: var(--foam, #f7efe2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 169, 110, 0.35);
}

.hero-btn-secondary {
  padding: 0.75rem 1.75rem;
  border: 1.5px solid rgba(247, 239, 226, 0.4);
  color: var(--foam, #f7efe2) !important;
  border-radius: 9999px;
  font-size: 0.95rem;
  text-decoration: none !important;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.hero-btn-secondary:hover {
  border-color: var(--crema, #c9a96e);
  background: rgba(201, 169, 110, 0.1);
  transform: translateY(-2px);
}

/* Remove old typewriter from hero */
.typewriter {
  animation: none;
  border-right: none;
  white-space: normal;
  overflow: visible;
}

@media (max-width: 640px) {
  .hero-card { padding: 2rem 1.5rem; gap: 1.25rem; }
  .hero-headline { font-size: 2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-grain, .steam-wisp,
  .hero-card, .hero-chip { animation: none; }
}
```

**Step 3: Verify**

- Hero fills viewport, grain texture barely visible (just depth)
- Three steam wisps rise from bottom and fade
- Headline uses serif font, large and confident
- Tech chips stagger in after page load
- Both CTA buttons readable and hover correctly
- Globe still auto-rotates in the canvas behind the card
- On mobile: card text is readable, chips wrap gracefully

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: rewrite hero with serif headline, steam wisps, and new CTA copy"
```

---

## Task 4: Services Section

**Files:**
- Modify: `index.html` (add services section HTML, replacing old Skills section)
- Modify: `styles/services.css`

**Step 1: Remove the old Skills section from `index.html`**

Find and delete the entire `<!-- Skills Section -->` block:
```html
<!-- Skills Section -->
<section class="py-20 px-6 bg-indigo-900 bg-opacity-50">
    ...
</section>
```

**Step 2: Insert the new Services section in its place**

```html
<!-- Services Section -->
<section id="services" class="services-section">
  <div class="section-inner">
    <h2 class="section-title">What I build for you</h2>
    <p class="section-subtitle">
      Bespoke solutions that connect your tools, eliminate manual work, and let your team focus on what actually matters.
    </p>

    <div class="services-grid">

      <!-- Card 1: Process Automation -->
      <div class="service-card" tabindex="0">
        <div class="service-stain" aria-hidden="true"></div>
        <div class="service-icon-wrap">
          <i class="fas fa-cogs service-icon" aria-hidden="true"></i>
          <div class="service-steam" aria-hidden="true">
            <span></span><span></span>
          </div>
        </div>
        <h3 class="service-title">Process Automation</h3>
        <p class="service-desc">
          Eliminate repetitive manual work with Python-powered tools built around your exact workflow — scripts, scheduled jobs, and internal tooling.
        </p>
        <div class="service-tags">
          <span>Python</span><span>Flask</span><span>FastAPI</span><span>Cron</span>
        </div>
      </div>

      <!-- Card 2: Azure Logic Apps -->
      <div class="service-card" tabindex="0">
        <div class="service-stain" aria-hidden="true"></div>
        <div class="service-icon-wrap">
          <i class="fas fa-cloud service-icon" aria-hidden="true"></i>
          <div class="service-steam" aria-hidden="true">
            <span></span><span></span>
          </div>
        </div>
        <h3 class="service-title">Azure Logic Apps</h3>
        <p class="service-desc">
          Cloud-native workflow orchestration that connects your entire stack automatically — no custom server required, built on Microsoft Azure.
        </p>
        <div class="service-tags">
          <span>Azure</span><span>Logic Apps</span><span>REST</span><span>Connectors</span>
        </div>
      </div>

      <!-- Card 3: Freshworks Integrations -->
      <div class="service-card" tabindex="0">
        <div class="service-stain" aria-hidden="true"></div>
        <div class="service-icon-wrap">
          <i class="fas fa-headset service-icon" aria-hidden="true"></i>
          <div class="service-steam" aria-hidden="true">
            <span></span><span></span>
          </div>
        </div>
        <h3 class="service-title">Freshworks Integrations</h3>
        <p class="service-desc">
          Freshdesk, Freshservice, and Freshsales configured to your exact process — custom automations, ticket routing logic, and CRM workflows.
        </p>
        <div class="service-tags">
          <span>Freshdesk</span><span>Freshservice</span><span>API</span><span>Webhooks</span>
        </div>
      </div>

      <!-- Card 4: API & Custom Forms -->
      <div class="service-card" tabindex="0">
        <div class="service-stain" aria-hidden="true"></div>
        <div class="service-icon-wrap">
          <i class="fas fa-plug service-icon" aria-hidden="true"></i>
          <div class="service-steam" aria-hidden="true">
            <span></span><span></span>
          </div>
        </div>
        <h3 class="service-title">API &amp; Custom Forms</h3>
        <p class="service-desc">
          Bespoke data capture, conditional routing logic, and system-level integration between any tools you use — built to your business rules.
        </p>
        <div class="service-tags">
          <span>REST APIs</span><span>Webhooks</span><span>Forms</span><span>Middleware</span>
        </div>
      </div>

    </div>
  </div>
</section>
```

**Step 3: Write `styles/services.css` in full**

```css
/* Services section styles */

.services-section {
  padding: 6rem 1.5rem;
  background: #221810;
  position: relative;
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.section-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  color: var(--foam, #f7efe2);
  text-align: center;
  margin: 0 0 0.75rem;
}

.section-subtitle {
  text-align: center;
  color: var(--steamed-milk, #ede0cc);
  font-size: 1.05rem;
  max-width: 560px;
  margin: 0 auto 3.5rem;
  line-height: 1.65;
  opacity: 0.85;
}

/* 2×2 grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .services-grid { grid-template-columns: 1fr; }
}

/* Individual card */
.service-card {
  position: relative;
  background: rgba(45, 34, 27, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(247, 239, 226, 0.1);
  border-radius: 20px;
  padding: 2rem 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: default;
}

.service-card:hover,
.service-card:focus-within {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(201, 169, 110, 0.12),
              0 0 0 1px rgba(201, 169, 110, 0.15);
  border-color: rgba(201, 169, 110, 0.25);
}

/* Decorative coffee-stain ring watermark */
.service-stain {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 18px solid rgba(161, 134, 111, 0.07);
  pointer-events: none;
  transition: border-color 0.3s ease;
}

.service-card:hover .service-stain {
  border-color: rgba(201, 169, 110, 0.13);
}

/* Icon + steam wrapper */
.service-icon-wrap {
  position: relative;
  display: inline-flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
}

.service-icon {
  font-size: 1.75rem;
  color: var(--crema, #c9a96e);
  position: relative;
  z-index: 1;
  transition: color 0.2s ease;
}

.service-card:hover .service-icon {
  color: var(--foam, #f7efe2);
}

/* Steam wisps on hover */
.service-steam {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.service-card:hover .service-steam,
.service-card:focus-within .service-steam {
  opacity: 1;
}

.service-steam span {
  display: block;
  width: 3px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(to top, rgba(201,169,110,0.5), transparent);
  animation: svcSteam 1.5s ease-in-out infinite;
}

.service-steam span:nth-child(2) {
  animation-delay: 0.6s;
  height: 14px;
}

@keyframes svcSteam {
  0%   { opacity: 0; transform: translateY(0) scaleX(1); }
  40%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-18px) scaleX(1.6); }
}

.service-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.25rem;
  color: var(--foam, #f7efe2);
  margin: 0;
}

.service-desc {
  font-size: 0.92rem;
  color: var(--steamed-milk, #ede0cc);
  line-height: 1.65;
  margin: 0;
  opacity: 0.88;
  flex-grow: 1;
}

/* Tech tags */
.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: auto;
}

.service-tags span {
  font-size: 0.72rem;
  font-family: 'Courier New', monospace;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  background: rgba(201, 169, 110, 0.12);
  color: var(--crema, #c9a96e);
  border: 1px solid rgba(201, 169, 110, 0.2);
  letter-spacing: 0.03em;
}

@media (prefers-reduced-motion: reduce) {
  .service-card { transition: none; }
  .service-steam span { animation: none; opacity: 1; }
}
```

**Step 4: Remove skills-enhancement.js and skills-enhancement.css references from `index.html`**

Delete these two lines from `<head>`:
```html
<link rel="stylesheet" href="/styles/skills-enhancement.css">
```
```html
<script src="/scripts/skills-enhancement.js"></script>
```

**Step 5: Verify**

- Services section appears between hero and where skills were
- 2×2 grid on desktop, 1 column on mobile
- Hover each card: lifts, crema glow, steam wisps appear above icon, stain ring darkens
- Tags visible in monospace at the bottom of each card

**Step 6: Commit**

```bash
git add index.html styles/services.css
git commit -m "feat: add services section, remove old skills section"
```

---

## Task 5: Case Studies Section

**Files:**
- Modify: `index.html` (replace Projects section)
- Modify: `styles/case-studies.css`

**Step 1: Remove old Projects section and globe section from `index.html`**

Delete the entire `<!-- Projects Section -->` block and the standalone `<!-- Space Globe Section -->` block (including the `<script src="/globe/index.js"></script>` tag and the "Interactive globe: drag to rotate" caption).

The globe will be re-added as an ambient background via `canvas-container` in Task 3 (already handled by the existing `#canvas-container` behind hero).

**Note:** `globe/index.js` renders into `document.querySelector('.canvas')`. Since we're removing the standalone `<canvas class="canvas">` element, the globe will stop rendering. That is intentional — the globe visual is now atmosphere behind the hero. If you want the globe to render behind the hero, the canvas element needs to be moved there. **Do not move the canvas yet** — globe repositioning is Task 10.

**Step 2: Insert Case Studies section in place of Projects**

```html
<!-- Case Studies Section -->
<section id="work" class="case-studies-section">
  <div class="section-inner">
    <h2 class="section-title">My Work</h2>
    <p class="section-subtitle">
      Real problems, real solutions. Details anonymized where necessary.
    </p>

    <!-- Primary case study cards -->
    <div class="case-grid">

      <!-- Case Study 1: Solar Company -->
      <article class="case-card">
        <div class="case-tag">Azure Infrastructure</div>
        <h3 class="case-outcome">Built a complete commercial ecosystem for a solar energy company — from nothing.</h3>
        <p class="case-desc">
          A growing solar company had no digital infrastructure for their commercial operations. Quotes, projects, contractor coordination, and reporting lived in scattered tools and people's heads. Designed and built a bespoke system integrated into Azure that covers the full commercial lifecycle — from lead to delivery — giving the business a single source of truth and the foundation to scale.
        </p>
        <div class="case-stack">
          <span>Azure</span><span>Logic Apps</span><span>Python</span><span>API Integration</span>
        </div>
      </article>

      <!-- Case Study 2: Insurance Company -->
      <article class="case-card">
        <div class="case-tag">Case Management Infrastructure</div>
        <h3 class="case-outcome">Replaced Excel, emails, and OneDrive with a real case management system for an insurance company.</h3>
        <p class="case-desc">
          An insurance company was running its entire operation through shared spreadsheets, email chains, and OneDrive folders. Cases were lost, processes were invisible, and growth was impossible. Designed and built a case management infrastructure that handles the full business workflow — intake, assignment, escalation, resolution, and reporting — in one place. The business now runs on the system.
        </p>
        <div class="case-stack">
          <span>Python</span><span>Custom Forms</span><span>Automation</span><span>API Integration</span>
        </div>
      </article>

    </div>

    <!-- "Also Built" secondary row -->
    <div class="also-built">
      <h4 class="also-built-label">Also built</h4>
      <div class="also-grid">

        <div class="also-card">
          <i class="fab fa-discord also-icon"></i>
          <div class="also-content">
            <div class="also-title">Discord Bot Cogs</div>
            <div class="also-desc">VPS-hosted RedBot with custom Python cogs — AI commands, API integrations, community automation.</div>
            <a href="https://github.com/nottherealtar/TarsOnlineCogs" target="_blank" rel="noopener noreferrer" class="also-link">GitHub →</a>
          </div>
        </div>

        <div class="also-card">
          <i class="fas fa-image also-icon"></i>
          <div class="also-content">
            <div class="also-title">Tar-Copy</div>
            <div class="also-desc">Turn code snippets into shareable, styled images — perfect for docs, social posts, and presentations.</div>
            <div class="also-links">
              <a href="https://tar-copy.vercel.app/" target="_blank" rel="noopener noreferrer" class="also-link">Live →</a>
              <a href="https://github.com/nottherealtar/tar.copy" target="_blank" rel="noopener noreferrer" class="also-link">GitHub →</a>
            </div>
          </div>
        </div>

        <div class="also-card">
          <i class="fas fa-globe-americas also-icon"></i>
          <div class="also-content">
            <div class="also-title">Interactive 3D Globe</div>
            <div class="also-desc">GitHub-globe-inspired Three.js visualization — a reflection on global human connectivity.</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
```

**Step 3: Write `styles/case-studies.css` in full**

```css
/* Case Studies section styles */

.case-studies-section {
  padding: 6rem 1.5rem;
  background: var(--dark-roast, #2d221b);
  position: relative;
}

/* Primary case study grid — full width stacked cards */
.case-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.case-card {
  background: rgba(45, 34, 27, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(247, 239, 226, 0.1);
  border-radius: 18px;
  padding: 2.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.case-card::before {
  /* Subtle left accent bar */
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--crema, #c9a96e), transparent);
  border-radius: 18px 0 0 18px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.case-card:hover {
  border-color: rgba(201, 169, 110, 0.2);
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
}

.case-card:hover::before {
  opacity: 1;
}

.case-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.65rem;
  background: rgba(201, 169, 110, 0.15);
  color: var(--crema, #c9a96e);
  border: 1px solid rgba(201, 169, 110, 0.25);
  border-radius: 9999px;
  align-self: flex-start;
}

.case-outcome {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  color: var(--foam, #f7efe2);
  line-height: 1.25;
  margin: 0;
}

.case-desc {
  font-size: 0.95rem;
  color: var(--steamed-milk, #ede0cc);
  line-height: 1.7;
  margin: 0;
  opacity: 0.88;
  max-width: 680px;
}

.case-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.case-stack span {
  font-size: 0.72rem;
  font-family: 'Courier New', monospace;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  background: rgba(247, 239, 226, 0.07);
  color: var(--steamed-milk, #ede0cc);
  border: 1px solid rgba(247, 239, 226, 0.12);
}

/* ── Also Built ──────────────────────────────────────── */
.also-built {
  border-top: 1px solid rgba(247, 239, 226, 0.08);
  padding-top: 2.5rem;
}

.also-built-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--latte, #a1866f);
  margin: 0 0 1.5rem;
  font-family: 'Courier New', monospace;
}

.also-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .also-grid { grid-template-columns: 1fr; }
  .case-card { padding: 1.75rem 1.5rem; }
}

.also-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
  background: rgba(45, 34, 27, 0.4);
  border: 1px solid rgba(247, 239, 226, 0.07);
  border-radius: 14px;
  transition: border-color 0.2s ease;
}

.also-card:hover {
  border-color: rgba(247, 239, 226, 0.15);
}

.also-icon {
  font-size: 1.3rem;
  color: var(--latte, #a1866f);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.also-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--foam, #f7efe2);
  margin-bottom: 0.4rem;
}

.also-desc {
  font-size: 0.82rem;
  color: var(--steamed-milk, #ede0cc);
  line-height: 1.55;
  opacity: 0.8;
  margin-bottom: 0.6rem;
}

.also-links {
  display: flex;
  gap: 0.75rem;
}

.also-link {
  font-size: 0.8rem;
  color: var(--crema, #c9a96e) !important;
  text-decoration: none !important;
  font-weight: 500;
  transition: color 0.2s ease;
}

.also-link:hover {
  color: var(--foam, #f7efe2) !important;
}

@media (prefers-reduced-motion: reduce) {
  .case-card, .also-card { transition: none; }
}
```

**Step 4: Verify**

- Two case study cards appear with left accent bars
- Tag chips display in monospace
- Serif outcome headline is prominent
- "Also Built" row shows 3 smaller cards in a row (1 column on mobile)
- Discord, Tar-Copy, Globe cards each have their correct icon

**Step 5: Commit**

```bash
git add index.html styles/case-studies.css
git commit -m "feat: add case studies section with also-built row, remove old projects"
```

---

## Task 6: How I Work Timeline

**Files:**
- Modify: `index.html` (add How I Work section after Case Studies)
- Modify: `styles/how-i-work.css`

**Step 1: Add How I Work HTML to `index.html` (after the Case Studies section)**

```html
<!-- How I Work Section -->
<section id="process" class="process-section">
  <div class="section-inner process-inner">
    <h2 class="section-title">How it works</h2>
    <p class="section-subtitle">
      A simple, transparent process — from first conversation to delivered solution.
    </p>

    <div class="process-timeline">
      <!-- SVG pour line -->
      <svg class="process-line" viewBox="0 0 4 340" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 2 0 L 2 340" class="process-line-path"/>
      </svg>

      <!-- Step 1 -->
      <div class="process-step" data-step="1">
        <div class="process-node">
          <span aria-hidden="true">☕</span>
        </div>
        <div class="process-content">
          <h3 class="process-step-title">Discovery</h3>
          <p class="process-step-desc">
            We have a conversation about your problem — what it costs you today, what the ideal state looks like, and whether I'm the right fit. No commitment required.
          </p>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="process-step" data-step="2">
        <div class="process-node">
          <span aria-hidden="true">⚙️</span>
        </div>
        <div class="process-content">
          <h3 class="process-step-title">Build</h3>
          <p class="process-step-desc">
            I design, build, and test the solution with your input at each stage. Clean code, documented, and built to last beyond day one.
          </p>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="process-step" data-step="3">
        <div class="process-node">
          <span aria-hidden="true">🚀</span>
        </div>
        <div class="process-content">
          <h3 class="process-step-title">Deliver</h3>
          <p class="process-step-desc">
            Handed over with full documentation and a walkthrough session. Ongoing support and iterations available as your needs evolve.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Step 2: Write `styles/how-i-work.css` in full**

```css
/* How I Work timeline styles */

.process-section {
  padding: 6rem 1.5rem;
  background: #221810;
}

.process-inner {
  max-width: 680px;
}

/* Timeline container */
.process-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 3rem;
}

/* SVG pour line */
.process-line {
  position: absolute;
  left: 27px;
  top: 28px;
  bottom: 28px;
  width: 4px;
  height: calc(100% - 56px);
  overflow: visible;
  pointer-events: none;
}

.process-line-path {
  fill: none;
  stroke: var(--crema, #c9a96e);
  stroke-width: 2.5;
  stroke-linecap: round;
  /* Pour animation: starts empty, fills down on scroll trigger */
  stroke-dasharray: 340;
  stroke-dashoffset: 340;
  transition: stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.6;
}

.process-line.animate .process-line-path {
  stroke-dashoffset: 0;
}

/* Each step */
.process-step {
  display: flex;
  align-items: flex-start;
  gap: 1.75rem;
  padding: 0 0 3rem 0;
  opacity: 0;
  transform: translateX(-16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.process-step.animate {
  opacity: 1;
  transform: translateX(0);
}

.process-step:nth-child(2) { transition-delay: 0.3s; }
.process-step:nth-child(3) { transition-delay: 0.6s; }
.process-step:nth-child(4) { transition-delay: 0.9s; }

/* Node circle */
.process-node {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(45, 34, 27, 0.8);
  border: 2px solid rgba(201, 169, 110, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  position: relative;
  z-index: 1;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.process-step.animate .process-node {
  border-color: rgba(201, 169, 110, 0.8);
  box-shadow: 0 0 16px rgba(201, 169, 110, 0.18);
}

.process-content {
  padding-top: 0.75rem;
}

.process-step-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.35rem;
  color: var(--foam, #f7efe2);
  margin: 0 0 0.6rem;
}

.process-step-desc {
  font-size: 0.95rem;
  color: var(--steamed-milk, #ede0cc);
  line-height: 1.7;
  margin: 0;
  opacity: 0.85;
}

@media (max-width: 480px) {
  .process-step { gap: 1.25rem; }
  .process-node { width: 46px; height: 46px; font-size: 1.1rem; }
  .process-line { left: 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .process-step,
  .process-line-path {
    transition: none;
    opacity: 1;
    transform: none;
  }
  .process-line-path { stroke-dashoffset: 0; }
}
```

**Step 3: Add the IntersectionObserver for the timeline to `index.html` inline `<script>` block (append to existing script)**

```js
// How I Work timeline animation
(function () {
  const line = document.querySelector('.process-line');
  const steps = document.querySelectorAll('.process-step');
  if (!line || !steps.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        line.classList.add('animate');
        steps.forEach(step => step.classList.add('animate'));
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  observer.observe(document.querySelector('.process-timeline'));
})();
```

**Step 4: Verify**

- Three steps laid out vertically with node circles on the left
- Scroll down to the section — the SVG line "pours" downward, then each step fades+slides in with staggered delay
- On mobile, layout is still readable with smaller node circles

**Step 5: Commit**

```bash
git add index.html styles/how-i-work.css
git commit -m "feat: add How I Work timeline with SVG pour animation"
```

---

## Task 7: Testimonials Restyle

**Files:**
- Modify: `index.html` (add testimonials section HTML between Process and Contact)
- The existing `skills-enhancement.js` testimonial code is deprecated — this is now static HTML

**Step 1: Add Testimonials section to `index.html` (between Process and Contact sections)**

```html
<!-- Testimonials Section -->
<section id="testimonials" class="testimonials-section">
  <div class="section-inner">
    <h2 class="section-title">What people say</h2>

    <div class="testimonial-cards">
      <blockquote class="testimonial-card">
        <div class="testimonial-quote-mark" aria-hidden="true">"</div>
        <p class="testimonial-text">
          Josh was a great asset to the team, knowledgeable and hardworking — always eager to assist teammates and customers with a smile. Great to have been able to work with you.
        </p>
        <footer class="testimonial-author">
          <img
            src="https://media.licdn.com/dms/image/v2/C4E03AQFotK_DnMXwtw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1648403043386?e=1758758400&v=beta&t=yzL4HDnBTdaVAe7kkCX00pvaUqVqC7AxmWIR3ymQ3LI"
            alt="Jason Simonis"
            class="testimonial-avatar"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="testimonial-avatar-fallback" style="display:none">JS</div>
          <div class="testimonial-author-info">
            <cite class="testimonial-name">Jason Simonis</cite>
            <span class="testimonial-role">Strategic Solutions Specialist · GoCanvas</span>
          </div>
          <a href="https://linkedin.com/in/jason-simonis"
             target="_blank"
             rel="noopener noreferrer"
             class="testimonial-linkedin"
             aria-label="View Jason Simonis on LinkedIn">
            <i class="fab fa-linkedin" aria-hidden="true"></i>
          </a>
        </footer>
        <div class="testimonial-verified">
          <i class="fas fa-check-circle" aria-hidden="true"></i>
          Verified LinkedIn Recommendation
        </div>
      </blockquote>
    </div>
  </div>
</section>
```

**Step 2: Add testimonial styles to `index.html` inline `<style>` block**

```css
/* ── Testimonials ─────────────────────────────────────── */
.testimonials-section {
  padding: 6rem 1.5rem;
  background: var(--dark-roast, #2d221b);
}

.testimonial-cards {
  max-width: 720px;
  margin: 0 auto;
}

.testimonial-card {
  position: relative;
  background: rgba(45, 34, 27, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(247, 239, 226, 0.1);
  border-radius: 20px;
  padding: 3rem 3rem 2rem;
  margin: 0;
}

.testimonial-quote-mark {
  font-family: 'DM Serif Display', serif;
  font-size: 6rem;
  line-height: 0.5;
  color: var(--latte, #a1866f);
  opacity: 0.35;
  position: absolute;
  top: 2rem;
  left: 2.5rem;
  user-select: none;
}

.testimonial-text {
  font-size: 1.05rem;
  color: var(--steamed-milk, #ede0cc);
  line-height: 1.75;
  margin: 1.5rem 0 2rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.testimonial-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(201, 169, 110, 0.3);
  flex-shrink: 0;
}

.testimonial-avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--latte, #a1866f);
  color: var(--espresso, #1a1108);
  font-weight: 700;
  font-size: 0.9rem;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.testimonial-author-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.testimonial-name {
  font-style: normal;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--foam, #f7efe2);
}

.testimonial-role {
  font-size: 0.8rem;
  color: var(--latte, #a1866f);
}

.testimonial-linkedin {
  color: var(--latte, #a1866f) !important;
  font-size: 1.3rem;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.testimonial-linkedin:hover {
  color: var(--crema, #c9a96e) !important;
}

.testimonial-verified {
  font-size: 0.75rem;
  color: var(--latte, #a1866f);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  opacity: 0.8;
}

.testimonial-verified .fa-check-circle {
  color: var(--crema, #c9a96e);
}

@media (max-width: 560px) {
  .testimonial-card { padding: 2.5rem 1.5rem 1.75rem; }
  .testimonial-quote-mark { left: 1.25rem; }
}
```

**Step 3: Remove the old `innovative-testimonials.css` stylesheet link from `index.html` `<head>`**

Delete:
```html
<link rel="stylesheet" href="/styles/innovative-testimonials.css">
```

**Step 4: Verify**

- Testimonial card appears between Process and Contact
- Large decorative quote mark in latte color, italicised text
- Avatar, name, role, LinkedIn icon all aligned horizontally
- "Verified LinkedIn Recommendation" badge at the bottom

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: restyle testimonials as static HTML, remove innovative-testimonials dependency"
```

---

## Task 8: Contact Form — Web3Forms + Animated Feedback

**Files:**
- Modify: `index.html` (replace contact form HTML)
- Modify: `scripts/contact-animations.js` (full rewrite for Web3Forms)
- Modify: `styles/contact-animations.css`

**Prerequisites:** Josh must complete Web3Forms setup and have an Access Key ready. Replace `YOUR_WEB3FORMS_KEY` below with the actual key.

**Step 1: Replace the Contact section HTML in `index.html`**

Find and replace the entire `<!-- Contact Section -->` block:

```html
<!-- Contact Section -->
<section id="contact" class="contact-section">
  <div class="section-inner contact-inner">
    <h2 class="section-title">Let's work together</h2>
    <p class="section-subtitle">
      Tell me what you're trying to solve. I'll come back to you within 24 hours.
    </p>

    <div class="contact-card glass-card">

      <!-- Form state -->
      <form id="contact-form" class="contact-form" novalidate>
        <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY">
        <input type="hidden" name="redirect" value="false">
        <input type="hidden" name="subject" value="New project inquiry from TarsOnlineCafe">

        <div class="contact-row">
          <div class="contact-field">
            <label for="cf-name">Name <span class="required" aria-hidden="true">*</span></label>
            <input type="text" id="cf-name" name="name" required autocomplete="name" placeholder="Your name">
            <span class="field-error" id="cf-name-error" role="alert"></span>
          </div>
          <div class="contact-field">
            <label for="cf-company">Company <span class="optional">(optional)</span></label>
            <input type="text" id="cf-company" name="company" autocomplete="organization" placeholder="Your company">
          </div>
        </div>

        <div class="contact-field">
          <label for="cf-email">Email <span class="required" aria-hidden="true">*</span></label>
          <input type="email" id="cf-email" name="email" required autocomplete="email" placeholder="you@company.com">
          <span class="field-error" id="cf-email-error" role="alert"></span>
        </div>

        <div class="contact-field">
          <label for="cf-type">Type of project <span class="required" aria-hidden="true">*</span></label>
          <select id="cf-type" name="project_type" required>
            <option value="" disabled selected>Select a category…</option>
            <option value="automation">Process Automation</option>
            <option value="azure">Azure Logic Apps</option>
            <option value="freshworks">Freshworks Integration</option>
            <option value="api">API / Systems Integration</option>
            <option value="other">Other</option>
          </select>
          <span class="field-error" id="cf-type-error" role="alert"></span>
        </div>

        <div class="contact-field">
          <label for="cf-message">Tell me about it <span class="required" aria-hidden="true">*</span></label>
          <textarea id="cf-message" name="message" rows="5" required placeholder="Describe the problem you're trying to solve…"></textarea>
          <span class="field-error" id="cf-message-error" role="alert"></span>
        </div>

        <button type="submit" id="cf-submit" class="contact-submit">
          Send it ☕
        </button>
      </form>

      <!-- Success state (hidden until submission succeeds) -->
      <div id="contact-success" class="contact-success" hidden aria-live="polite">
        <div class="success-cup" aria-hidden="true">
          <span class="success-cup-icon">☕</span>
          <div class="success-steam">
            <span></span><span></span><span></span>
          </div>
        </div>
        <h3 class="success-title">Got it!</h3>
        <p class="success-msg">I'll be back within 24 hours.</p>
        <button type="button" id="cf-reset" class="contact-reset">Send another message</button>
      </div>

    </div>

    <!-- Buy Me a Coffee -->
    <div class="coffee-support">
      <p class="coffee-support-text">Enjoyed my work? Support me with a coffee!</p>
      <a href="https://buymeacoffee.com/nottherealtar"
         class="coffee-button"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Support me by buying me a coffee">
        <svg class="coffee-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M18.5 7h-1V6c0-1.1-.9-2-2-2h-11c-1.1 0-2 .9-2 2v8c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-1h1c1.38 0 2.5-1.12 2.5-2.5S19.88 7 18.5 7zM16 14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V6h10v8zm2.5-2.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/>
        </svg>
        <span class="coffee-button-text">Buy me a coffee</span>
      </a>
    </div>
  </div>
</section>
```

**Step 2: Rewrite `scripts/contact-animations.js` in full**

```js
/**
 * Contact form — Web3Forms submission + animated feedback states
 */
(function () {
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('cf-submit');
  const successEl = document.getElementById('contact-success');
  const resetBtn  = document.getElementById('cf-reset');

  if (!form || !submitBtn || !successEl) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ── Validation ────────────────────────────────────────
  function validateField(id, errorId, test, msg) {
    const input = document.getElementById(id);
    const error = document.getElementById(errorId);
    if (!input || !error) return true;
    const ok = test(input.value);
    error.textContent = ok ? '' : msg;
    input.classList.toggle('field-invalid', !ok);
    return ok;
  }

  function validateAll() {
    const n = validateField('cf-name',    'cf-name-error',    v => v.trim().length > 0,         'Name is required.');
    const e = validateField('cf-email',   'cf-email-error',   v => EMAIL_RE.test(v.trim()),     'Enter a valid email address.');
    const t = validateField('cf-type',    'cf-type-error',    v => v !== '',                    'Please select a project type.');
    const m = validateField('cf-message', 'cf-message-error', v => v.trim().length > 10,        'Tell me a bit more (at least 10 characters).');
    return n && e && t && m;
  }

  // Clear per-field error on input
  ['cf-name','cf-email','cf-type','cf-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      const errEl = document.getElementById(id + '-error');
      if (errEl) errEl.textContent = '';
      el.classList.remove('field-invalid');
    });
  });

  // ── Button states ─────────────────────────────────────
  function setBtn(state) {
    const states = {
      default: { text: 'Send it ☕',   disabled: false, cls: '' },
      loading: { text: 'Brewing…',     disabled: true,  cls: 'btn-loading' },
      error:   { text: 'Try again',    disabled: false, cls: 'btn-error' },
    };
    const s = states[state] || states.default;
    submitBtn.textContent = s.text;
    submitBtn.disabled    = s.disabled;
    submitBtn.className   = 'contact-submit ' + s.cls;
  }

  // ── Show success state ────────────────────────────────
  function showSuccess() {
    form.style.opacity = '0';
    form.style.transform = 'translateY(-8px)';
    form.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    setTimeout(() => {
      form.hidden = true;
      form.style.opacity = '';
      form.style.transform = '';
      successEl.hidden = false;
      successEl.classList.add('success-visible');
    }, 350);
  }

  // ── Reset to form state ───────────────────────────────
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      successEl.hidden = true;
      successEl.classList.remove('success-visible');
      form.hidden = false;
      form.reset();
      setBtn('default');
    });
  }

  // ── Shake animation on error ──────────────────────────
  function shakeBtn() {
    submitBtn.classList.add('btn-shake');
    submitBtn.addEventListener('animationend', () => {
      submitBtn.classList.remove('btn-shake');
    }, { once: true });
  }

  // ── Submit ────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) { shakeBtn(); return; }

    setBtn('loading');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          showSuccess();
        } else {
          setBtn('error');
          shakeBtn();
        }
      } else {
        setBtn('error');
        shakeBtn();
      }
    } catch {
      setBtn('error');
      shakeBtn();
    }
  });
})();
```

**Step 3: Add contact form CSS to `styles/contact-animations.css`**

Append the following (keep any existing styles, add below):

```css
/* ── Contact section layout ───────────────────────────── */
.contact-section {
  padding: 6rem 1.5rem;
  background: #221810;
}

.contact-inner {
  max-width: 680px;
}

.contact-card {
  padding: 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
}

/* ── Form fields ──────────────────────────────────────── */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.contact-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 560px) {
  .contact-row { grid-template-columns: 1fr; }
  .contact-card { padding: 1.75rem; }
}

.contact-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.contact-field label {
  font-size: 0.85rem;
  color: var(--steamed-milk, #ede0cc);
  font-weight: 500;
}

.required { color: var(--crema, #c9a96e); margin-left: 2px; }
.optional  { color: var(--latte, #a1866f); font-size: 0.78rem; font-weight: 400; }

.contact-field input,
.contact-field select,
.contact-field textarea {
  width: 100%;
  background: rgba(26, 17, 8, 0.6) !important;
  color: var(--foam, #f7efe2) !important;
  border: 1px solid rgba(247, 239, 226, 0.15) !important;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-size: 0.92rem;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  resize: vertical;
  box-sizing: border-box;
}

.contact-field select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a1866f' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 1rem center !important;
  background-size: 12px !important;
  padding-right: 2.5rem;
  cursor: pointer;
}

.contact-field select option {
  background: #2d221b;
  color: var(--foam, #f7efe2);
}

.contact-field input:focus,
.contact-field select:focus,
.contact-field textarea:focus {
  outline: none !important;
  border-color: rgba(201, 169, 110, 0.6) !important;
  box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.12) !important;
}

.contact-field input::placeholder,
.contact-field textarea::placeholder {
  color: rgba(237, 224, 204, 0.35);
}

/* Field error state */
.field-invalid {
  border-color: rgba(220, 80, 80, 0.6) !important;
}

.field-error {
  font-size: 0.78rem;
  color: #e57373;
  min-height: 1em;
  transition: opacity 0.2s ease;
}

/* ── Submit button ────────────────────────────────────── */
.contact-submit {
  width: 100%;
  padding: 0.85rem;
  background: var(--crema, #c9a96e);
  color: var(--espresso, #1a1108) !important;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 0.25rem;
}

.contact-submit:hover:not(:disabled) {
  background: var(--foam, #f7efe2);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(201, 169, 110, 0.3);
}

.contact-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.contact-submit.btn-loading {
  background: var(--latte, #a1866f);
  animation: btnPulse 1.2s ease-in-out infinite;
}

@keyframes btnPulse {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1;   }
}

.contact-submit.btn-error {
  background: #8b3a3a;
  color: var(--foam, #f7efe2) !important;
}

.contact-submit.btn-shake {
  animation: btnShake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes btnShake {
  10%, 90%  { transform: translateX(-2px); }
  20%, 80%  { transform: translateX(4px);  }
  30%, 50%, 70% { transform: translateX(-5px); }
  40%, 60%  { transform: translateX(5px);  }
  100%      { transform: translateX(0);    }
}

/* ── Success state ────────────────────────────────────── */
.contact-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s;
}

.contact-success.success-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Coffee cup with steam */
.success-cup {
  position: relative;
  display: inline-block;
}

.success-cup-icon {
  font-size: 3.5rem;
  display: block;
}

.success-steam {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
}

.success-steam span {
  display: block;
  width: 3px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(to top, rgba(201,169,110,0.6), transparent);
  animation: successSteam 1.8s ease-in-out infinite;
}

.success-steam span:nth-child(1) { animation-delay: 0s;   height: 18px; }
.success-steam span:nth-child(2) { animation-delay: 0.5s; height: 24px; }
.success-steam span:nth-child(3) { animation-delay: 1s;   height: 16px; }

@keyframes successSteam {
  0%   { opacity: 0; transform: translateY(0); }
  30%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-20px) scaleX(2); }
}

.success-title {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  color: var(--foam, #f7efe2);
  margin: 0;
}

.success-msg {
  color: var(--steamed-milk, #ede0cc);
  margin: 0;
  font-size: 1rem;
}

.contact-reset {
  margin-top: 0.5rem;
  background: none;
  border: 1px solid rgba(247, 239, 226, 0.25);
  border-radius: 9999px;
  color: var(--latte, #a1866f) !important;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.contact-reset:hover {
  border-color: var(--crema, #c9a96e);
  color: var(--crema, #c9a96e) !important;
}

/* ── Buy Me a Coffee ─────────────────────────────────── */
.coffee-support {
  text-align: center;
  margin-top: 2rem;
}

.coffee-support-text {
  font-size: 0.85rem;
  color: var(--latte, #a1866f);
  margin-bottom: 0.75rem;
}

@media (prefers-reduced-motion: reduce) {
  .contact-submit.btn-loading { animation: none; }
  .success-steam span         { animation: none; opacity: 0.5; }
  .contact-success            { transition: none; }
}
```

**Step 4: Remove the old Zapier token hidden input and update script reference**

In `index.html`, the old contact form already replaced in Step 1 removes the token. Confirm the `<script src="/scripts/contact-animations.js">` line exists in `<head>` (it should already be there — no change needed).

**Step 5: Verify**

- Contact form renders with all 5 fields + dropdown
- Required marker (*) shows next to required fields
- Submit with empty fields: button shakes, field errors appear inline
- Submit with valid data (test with Web3Forms access key inserted): button shows "Brewing…" with pulse animation
- On success: form fades out, success card fades in with coffee cup + steam wisps and "Got it!" message
- "Send another message" button resets to form
- On network error: button turns dark red, shows "Try again"

**Step 6: Commit**

```bash
git add index.html scripts/contact-animations.js styles/contact-animations.css
git commit -m "feat: rebuild contact form with Web3Forms, full animated feedback states"
```

---

## Task 9: Footer + About section update + cleanup

**Files:**
- Modify: `index.html`

**Step 1: Update footer HTML**

Find the existing `<footer>` and replace:

```html
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-logo">☕ TarsOnlineCafe</div>
    <div class="footer-links">
      <a href="https://github.com/nottherealtar" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <i class="fab fa-github"></i>
      </a>
      <a href="https://www.linkedin.com/in/josh-coetzer-31a874239/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <i class="fab fa-linkedin"></i>
      </a>
      <a href="/blog/blog.html" aria-label="Blog">Blog</a>
    </div>
    <p class="footer-copy">© 2020–2025 TarsOnlineCafe. All rights reserved.</p>
  </div>
</footer>
```

Add footer styles to the inline `<style>` block:

```css
/* ── Footer ──────────────────────────────────────────── */
.site-footer {
  background: var(--espresso, #1a1108);
  padding: 2.5rem 1.5rem;
  text-align: center;
  border-top: 1px solid rgba(247, 239, 226, 0.06);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 1.1rem;
  color: var(--latte, #a1866f);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.footer-links a {
  color: var(--latte, #a1866f) !important;
  font-size: 1.2rem;
  text-decoration: none !important;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--crema, #c9a96e) !important;
}

.footer-links a[href*="blog.html"] {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.footer-copy {
  font-size: 0.78rem;
  color: rgba(161, 134, 111, 0.55);
  margin: 0;
}
```

**Step 2: Remove dead code from `index.html`**

Remove the large commented-out `// --- Space Globe (three-globe)` code block (lines ~569–647 of the original, the `//` commented JS block inside the last `<script>` tag).

Remove the `<script src="/scripts/verify-integration.js"></script>` tag if present.

**Step 3: Remove deprecated stylesheet and script references from `<head>`**

Remove these lines if still present:
```html
<link rel="stylesheet" href="/styles/skills-enhancement.css">
<link rel="stylesheet" href="/styles/innovative-testimonials.css">
```
```html
<script src="/scripts/skills-enhancement.js"></script>
```

**Step 4: Update the About section terminal copy to reflect new positioning**

Find the terminal `<pre>` block and update:

```html
<pre class="text-gray-300">
Name: Joshua Coetzer
Location: Johannesburg, South Africa
Experience: 5+ years
Focus:
- Process &amp; Workflow Automation
- Azure Logic Apps
- Freshworks Integrations
- API Integration
Currently: Building bespoke automation solutions
</pre>
```

**Step 5: Verify**

- Footer shows logo, GitHub/LinkedIn icons, Blog link, and copyright
- No 404 errors in DevTools for removed CSS/JS files
- No JavaScript console errors on page load
- About terminal shows updated focus areas

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: update footer, about terminal, and remove all deprecated dead code"
```

---

## Task 10: Globe Repositioning + Final Polish

**Files:**
- Modify: `globe/index.js` (minor — change canvas selector or auto-rotate setting)
- Modify: `index.html` (add canvas element inside hero for globe)

**Step 1: Add canvas element inside the hero section**

Inside the `.hero-section` div, add as the FIRST child (before `.hero-grain`):

```html
<canvas class="canvas hero-globe-canvas" aria-hidden="true"></canvas>
```

**Step 2: Add hero globe canvas styles to inline `<style>`**

```css
.hero-globe-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}
```

**Step 3: In `globe/index.js`, verify OrbitControls autoRotate is enabled and user interaction is disabled for the ambient effect**

Open `globe/index.js`. Find the OrbitControls initialization and ensure:

```js
controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false; // disable user drag — it's now ambient only
```

Also update the canvas selector if the file uses `document.querySelector('.canvas')` — this still works since the hero canvas has class `canvas`. No change needed if selector already works.

**Step 4: Move the globe script tag to after the hero section, inside `.content`**

If `<script src="/globe/index.js"></script>` was in the old projects section, confirm it now appears just after the `<!-- Hero Section -->` block closes, before the Services section.

**Step 5: Final cross-section verify**

Walk through the full page in a browser:
- [ ] Nav: transparent → frosted on scroll, hamburger works on mobile
- [ ] Hero: serif headline, tech chips stagger in, steam wisps animate, globe rotates faintly behind
- [ ] Services: 4 cards in 2×2, hover lifts + steam + glow, stain ring darkens
- [ ] Case Studies: 2 primary cards with accent bars, "Also Built" row of 3
- [ ] How I Work: SVG pour line animates on scroll, 3 steps stagger in
- [ ] Testimonials: quote card with avatar, verified badge
- [ ] Contact: 5 fields + dropdown, inline validation, button states, success screen
- [ ] Footer: logo, icons, blog link, copyright
- [ ] Mobile (375px): all sections single-column, hamburger nav works
- [ ] `prefers-reduced-motion`: all CSS animations off

**Step 6: Final commit**

```bash
git add index.html globe/index.js
git commit -m "feat: reposition globe as ambient hero background, complete overhaul polish"
```

---

## Summary of All Commits

| Task | Commit message |
|---|---|
| 1 | `feat: add color tokens, DM Serif font, and new CSS file stubs` |
| 2 | `feat: add sticky nav with scroll behaviour and mobile overlay` |
| 3 | `feat: rewrite hero with serif headline, steam wisps, and new CTA copy` |
| 4 | `feat: add services section, remove old skills section` |
| 5 | `feat: add case studies section with also-built row, remove old projects` |
| 6 | `feat: add How I Work timeline with SVG pour animation` |
| 7 | `feat: restyle testimonials as static HTML, remove innovative-testimonials dependency` |
| 8 | `feat: rebuild contact form with Web3Forms, full animated feedback states` |
| 9 | `feat: update footer, about terminal, and remove all deprecated dead code` |
| 10 | `feat: reposition globe as ambient hero background, complete overhaul polish` |

---

## Notes for Josh

- **Before Task 8:** Complete Web3Forms signup at web3forms.com, create the form for `www.tarsonlinecafe.work`, copy the Access Key, and replace `YOUR_WEB3FORMS_KEY` in the HTML.
- **Case Studies content (Task 5):** The two primary case study cards have placeholder copy — review and update with accurate (even if anonymized) details before deploying.
- **Testimonials (Task 7):** The Jason Simonis LinkedIn avatar URL has an expiry token (`e=1758758400`). If it stops loading, the fallback initials `JS` will display automatically.
- **`/api/contact.js`:** Can be deleted from the repo after verifying Web3Forms is working. It's no longer called by any code.

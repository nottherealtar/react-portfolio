# TarsOnlineCafe paper system

Merged design system for Joshua Coetzer's portfolio. It keeps the cafe in caramel and cream, and it borrows structure from three GradientDeck references:

- **Stereoscope Coffee** for paper fields, 1px rules, square panels, and flat packaging grounds.
- **Aesop** for Apothecary Cream, charcoal ink, oat bands, and Amber Glass used only as a small accent.
- **Emil Kowalski** for quiet Inter type, hierarchy from weight and colour, and warm near-black on bone paper.

The homepage is the first surface on this system. Blog chrome still uses the previous dark Ember palette. See Follow-up.

## Purpose

The page should read like a cafe ledger: warm paper, hairline rules, and one caramel accent. The Three.js hero scene is the object on the counter. It plays the role Stereoscope gives to packaging and Aesop gives to film. Type stays quiet. The interface does not compete with the scene.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| Apothecary Cream | `#fffef2` | Page canvas, reversed text on charcoal, field fill |
| Oat Section | `#f6f5e8` | Tinted full-width bands (proof, services, process, contact) |
| Packaging Ground | `#e7e1d4` | Hero frame behind the Three.js scene. Warm stand-in for Stereoscope Packaging Gray `#d9d9d9`, shifted caramel so it still reads cafe |
| Gallery Mist | `#f3f1e8` | Inner media and device fields |
| Graphite Ink | `#21201c` | Body, headings, hairline rules, primary text |
| Charcoal Label | `#333333` | Filled buttons, footer, announcement-weight surfaces |
| Footer Hover | `#252525` | Filled button hover |
| Ash | `#63635e` | Secondary copy, meta, descriptions |
| Hairline | `#d6d5cc` | Inner panel borders, field outlines (charcoal at low opacity on cream) |
| Amber Glass | `#945c26` | Small labels, link hover, eyebrows, the only hue |

Do not introduce pure white `#ffffff` as the canvas. Do not flood buttons, links, or sections with amber. Do not use status red or status green as a fill. A tiny circular status dot is the only round exception, and on this site that dot is amber, not `#fb2c36`.

## Type

One family: **Inter** (SIL Open Font License), with `ui-sans-serif, system-ui, sans-serif` as the fallback. Do not load Brunswick Grotesque, SuisseIntl, Zapf-Humanist, Syne, or Figtree for new work.

OpenType: `"cv01"`, `"ss03"`. Tracking stays at 0. Hierarchy comes from weight and colour, not from a huge display size.

| Role | Weight | Size | Line height | Colour |
| --- | --- | --- | --- | --- |
| Legal / badge | 500 | 11px | 1.2 | Amber Glass |
| Utility / nav | 500 | 14 to 16px | 1.5 | Ink, Ash for quiet links |
| Body | 400 | 16px | 1.5 to 1.65 | Ink or Ash |
| Section label | 500 | 16px | 1.5 | Ink |
| Display | 500 | 31px max | 1.33 | Ink |

Headings stay at weight 500, sentence case, never bold 700 to 800, and never larger than 31px. The same cap applies to the hero and to section titles. The brand name in the hero is a 16px label, not a billboard.

## Space and shape

- Base unit: 4px, with 8px as a comfortable step.
- Content width: 1200px.
- Section gap: 100px on large screens, about 64px on small screens.
- Panel padding: 30px where a block is a real cell. Compact rows can use 16px.
- Corners: 0px on buttons, cards, inputs, nav, tiles, and frames.
- Rules: 1px Graphite Ink between major bands. 1px Hairline inside a grid.
- Elevation: none. No card shadows, no glass blur, no gradient fills on buttons or panels. Depth is the Three.js scene and the flat change from cream to oat to packaging ground.

## Homepage mapping

The Ember homepage (`mockup/src/variants/ember/`, promoted to root `index.html`) keeps every existing section, link, form, and the Three.js field.

| Region | Treatment |
| --- | --- |
| Nav | Cream bar, 1px bottom rule once scrolled, square menu button. No backdrop blur. Lockup is the cream-ground mark (bean, graphite brackets, steam; no charcoal plate) plus an Inter wordmark: Tars at weight 600, OnlineCafe at 400. |
| Hero | Cream page. The Three.js brew field and brand mark sit inside a square hairline frame on Packaging Ground. Copy sits beside it (below it on small screens) at the quiet type scale. |
| Marquee | Hairline band, Ash labels, a small amber square as the separator. |
| Proof, services, process, contact | Oat Section bands. |
| About, work, testimonials | Apothecary Cream. |
| Cards and the contact form | Square cells, hairline borders, cream fill. Primary actions are Charcoal Label with cream type. Secondary actions are outlined. |
| Footer | Charcoal Label field with cream type, Aesop's closing dark band. |

The legacy `globe/index.js` sphere is not mounted on the current homepage. The live Three.js hero is `EmberField`: rising roast particles and directed integration rails, plus the circular brand mark. Keep that scene. Retint it so caramel and charcoal particles read on cream. Do not put it back on a dark neon or glass field.

## Do

- Use Apothecary Cream `#fffef2` as the canvas and as reversed text on charcoal.
- Use Graphite Ink `#21201c` for text and for 1px structural rules.
- Keep Amber Glass `#945c26` on eyebrows, small badges, and hover states.
- Keep corners at 0px and separation at 1px rules or a flat field change.
- Set display type at 31px or smaller, weight 500, Inter.
- Leave generous space between sections (about 100px).
- Frame the Three.js scene in a square packaging panel.
- Use the cream-ground lockup on the homepage (`mockup/public/brand/tars-mark-cream.png`): bean, graphite brackets, steam, transparent ground. Keep `tars-mark-charcoal.jpg` for dark surfaces such as Discord. Do not put that charcoal plate back on the cream canvas.
- Preserve homepage copy, links, the contact form, and keyboard focus. Focus rings are 1px amber, offset from the control.
- Respect `prefers-reduced-motion`: the scene falls back to the static packaging field, and decorative motion stops.

## Don't

- Do not use pure white as the page ground, or pure `#000` for text. Pure black is only acceptable if a hairline needs more bite than Graphite Ink, and even then prefer `#21201c`.
- Do not round cards, buttons, inputs, or frames.
- Do not add box shadows, glassmorphism, aurora washes, or decorative gradients.
- Do not grow headings past 31px or set them in heavy display weights.
- Do not fill a button or a section with amber, red, or green.
- Do not depend on commercial fonts.
- Do not replace the Three.js hero with a stock photo, a gradient mesh, or a new illustration.
- Do not restyle blog templates in the same pass as a homepage token tweak unless the shared file is actually loaded by the homepage. Blog CSS lives in `styles/ember-blog.css` and is independent.

## Follow-up

Blog pages, auto-post templates, and `styles/ember-blog.css` still use the dark Ember palette (Syne, Figtree, roast browns, 18px radii). A later pass should map those files onto the tokens in this document without changing post URLs, `posts.json`, or the auto-blog pipeline.

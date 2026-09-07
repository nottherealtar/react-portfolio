# QA review — Ember redesign (production candidate)

Production site (`https://www.tarsonlinecafe.work`) stays **unchanged** until you explicitly approve a promote.

## Architecture (locked)

- **Promote into the existing repo tree** — replace root `index.html` + add `/assets/*`.
- **Never** deploy `ember-qa/` as the site root (it would wipe blog continuity and ship `Disallow: /`).
- Keep `blog/`, `styles/`, `scripts/`, `api/`, root `robots.txt`, and the full `sitemap.xml` (Auto Blog Pipeline owns blog URLs).
- Homepage is **build-time prerendered** (`renderToString` → hydrate) so `/` has real HTML without JS.
- Safe promote: `cd mockup && npm run build:promote` then `node ../scripts/promote-ember-homepage.mjs --dry-run`.

## Public QA

- https://temporary-racing-mercury-tzx66rp.vercel.app/
- https://tarsonline-ember-qa.vercel.app/

QA still uses `noindex` + `robots.txt` Disallow until cutover.

## Promote checklist (only after approval)

1. `npm run build:promote` in `mockup/` (prerender must succeed)
2. `node scripts/promote-ember-homepage.mjs --dry-run` then real run
3. Confirm root `robots.txt` / `sitemap.xml` / `blog/**` untouched
4. Set `WEB3FORMS_ACCESS_KEY` (+ optional `CONTACT_ALLOWED_ORIGIN`) on production Vercel
5. Promote script strips noindex; keep allow-list robots on production
6. Smoke: `/`, `/blog/blog.html`, sample `/blog/auto/*`, contact submit
7. Dispatch Auto Blog Pipeline on `main` with `dry_run=true`, then live
8. Keep a tagged rollback commit of the previous `index.html`

Until then, leave production on the current homepage.

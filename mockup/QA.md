# QA review — Ember redesign (production candidate)

Production site (`https://www.tarsonlinecafe.work`) stays **unchanged** until you explicitly approve a promote.

## Architecture (locked)

- **Promote into the existing repo tree** — replace root `index.html` + add `/assets/*`.
- **Never** deploy `ember-qa/` as the site root (it would wipe blog continuity and ship `Disallow: /`).
- Keep `blog/`, `styles/`, `scripts/`, `api/`, root `robots.txt`, and the full `sitemap.xml` (Auto Blog Pipeline owns blog URLs).
- Homepage is **build-time prerendered** (`renderToString` → hydrate) so `/` has real HTML without JS.
- Safe promote: `cd mockup && npm run build:promote` then `node ../scripts/promote-ember-homepage.mjs --dry-run`.

## Public QA

- https://temporary-racing-mercury-tzx66rp.vercel.app/ (claimed mercury — may lag if Vercel daily deploy cap is hit)
- https://tarsonline-ember-qa.vercel.app/ (**canonical QA** — prerendered as of SHA `305f85d`)

QA still uses `noindex` + `robots.txt` Disallow until cutover.

### Redeploy recipe (self-contained)

1. Push a commit that updates `ember-qa/` (`cd mockup && npm run build:ember-qa`).
2. `bash scripts/prepare-ember-qa-vercel.sh <sha>` — builds `.tmp-ember-qa-vercel/` with:
   - static site under `public/`
   - **`api/submit-contact.js` at project root** (serverless; never nest under `public/` or POSTs 404)
3. Deploy that tree to both QA projects (`target=production`). Prefer MCP `deploy_to_vercel` with a `build.sh` that mirrors the prepare layout, or upload the prepared tree.
4. Verify: `data-prerendered="true"`, Blog nav, `/robots.txt` Disallow, `POST /api/submit-contact` returns **503** until `WEB3FORMS_ACCESS_KEY` is set (not 404).

### Contact env (QA + production)

Set on the Vercel project (not in git):

- `WEB3FORMS_ACCESS_KEY` (required)
- `CONTACT_ALLOWED_ORIGIN` (optional; e.g. `https://tarsonline-ember-qa.vercel.app` for QA, production origin for cutover)

## Promote checklist (only after approval)

1. `npm run build:promote` in `mockup/` (prerender must succeed)
2. `node scripts/promote-ember-homepage.mjs --dry-run` then real run
3. Confirm root `robots.txt` / `sitemap.xml` / `blog/**` untouched
4. Set `WEB3FORMS_ACCESS_KEY` (+ optional `CONTACT_ALLOWED_ORIGIN`) on production Vercel
5. Promote script strips noindex; keep allow-list robots on production
6. Smoke: `/`, `/blog/blog.html`, sample `/blog/auto/*`, contact submit
7. Dispatch Auto Blog Pipeline on `main` with `dry_run=true`, then live
8. Keep a tagged rollback commit of the previous `index.html`

### Root `vercel.json` on promote (do not replace wholesale)

`scripts/promote-ember-homepage.mjs` **never** overwrites root `vercel.json` (blog rewrites / security headers must stay). When promoting hashed Vite bundles to `/assets/*`, ensure root `vercel.json` includes this **additive** header entry only — keep existing `headers` for `/(.*)` and all `rewrites` intact:

```json
{
  "source": "/assets/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

QA already ships the same rule in `ember-qa/vercel.json`. Do **not** copy `ember-qa/vercel.json` over production (it lacks blog/redesign rewrites).

Until then, leave production on the current homepage.

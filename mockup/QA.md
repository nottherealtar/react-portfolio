# QA review — Ember redesign (production candidate)

Production site (`https://www.tarsonlinecafe.work`) stays **unchanged** until you explicitly approve a promote.

## Public QA (full production-parity build)

Stable self-hosted Ember build (full assets + contact API — not a temp redirect):

- https://temporary-racing-mercury-tzx66rp.vercel.app/
- https://tarsonline-ember-qa.vercel.app/

This QA build is meant to match the production homepage cutover:

- No lab chrome / mockup banner
- Production SEO meta + JSON-LD (Person / Organization / WebSite+SearchAction / BreadcrumbList)
- dns-prefetch for captcha/CDN hosts; Vercel Analytics + Speed Insights snippets
- `robots.txt` Disallow + HTML `noindex,nofollow` until cutover
- `404.html` + cutover-ready `sitemap.xml` (homepage/blog anchors)
- Mobile nav with swipe-down dismiss and sharp iOS menu panel
- Recruiters nav → `#hiring`
- Contact form posts to `/api/submit-contact` with hCaptcha, honeypot (`botcheck`), and production project-type slugs
- Security headers including `Permissions-Policy`

## Mobile check

Open the hamburger sheet, then **swipe / drag down** on the sheet (handle or panel) to dismiss it. Backdrop tap and Escape also close it.

## Branch preview (Vercel Authentication / SSO)

- `/qa` and `/redesign/ember.html` on the redesign PR preview

## Promote to production (only after you approve)

1. Remove `noindex` / allow `robots.txt`
2. Ensure `WEB3FORMS_ACCESS_KEY` (and optional `CONTACT_ALLOWED_ORIGIN`) on the production project
3. Replace the live homepage with the Ember build while keeping `/blog/**`, root `robots.txt`/`sitemap.xml`, and APIs
4. Or merge the redesign PR / promote the approved preview in Vercel

Until then, leave production on the current homepage.

# QA review — Ember redesign (production candidate)

Production site (`https://www.tarsonlinecafe.work`) stays **unchanged** until you explicitly approve a promote.

## Public QA (production-ready candidate)

Stable self-hosted build (full assets + contact API on the QA project — not a temp redirect):

- https://tarsonline-ember-qa.vercel.app/

This QA build is meant to match the production homepage cutover:

- No lab chrome / mockup banner
- Production SEO meta + JSON-LD (still `noindex,nofollow` until cutover)
- Mobile nav with swipe-down dismiss and sharp iOS menu panel
- Contact form posts to `/api/submit-contact` with hCaptcha (same path as production)

Optional claimed snapshot (if the alias is mid-redeploy): see the latest claim link in PR #7 / agent notes.

## Mobile check

Open the hamburger sheet, then **swipe / drag down** on the sheet (handle or panel) to dismiss it. Backdrop tap and Escape also close it.

## Branch preview (Vercel Authentication / SSO)

- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/qa
- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/redesign/ember.html

## Promote to production (only after you approve)

1. Tell the agent to promote Ember to the live homepage, **or**
2. Merge the redesign PR to `main` / promote the approved preview in Vercel.

Until then, leave production on the current homepage.

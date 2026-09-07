# QA review — Ember redesign

Production site (`https://www.tarsonlinecafe.work`) is **unchanged** until you explicitly approve a promote.

## Public QA (no Vercel login)

Use a real `text/html` host (jsDelivr HTML mirrors render as plaintext):

- See the latest claimable Vercel snapshot in PR #7 / agent notes
- https://tarsonline-ember-qa.vercel.app/ (redirects to the live snapshot when configured)

QA pages ship production-grade SEO meta + JSON-LD, but keep `noindex,nofollow` until homepage cutover.

## Mobile check

Open the hamburger sheet, then **swipe / drag down** on the sheet (handle or panel) to dismiss it. Backdrop tap and Escape also close it.

## Branch preview (Vercel Authentication / SSO)

- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/qa
- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/redesign/ember.html

## Promote to production (only after you approve)

1. Tell the agent to promote Ember to the live homepage, **or**
2. Merge the redesign PR to `main` / promote the approved preview in Vercel.

Until then, leave production on the current homepage.

# QA review — Ember redesign

Production site (`tarsonlinecafe.work`) is **unchanged** until you explicitly approve a promote.

## Primary public QA (no SSO)

`https://tarsonline-ember-qa.vercel.app/` is currently **broken** (returns a path string instead of Ember HTML).

Use this temporary public deploy until it is fixed or claimed (expires ~60 minutes; claim to keep):

- **Public Ember QA:** https://temporary-instant-sitar-ltgfd2c.vercel.app/
- **Claim URL:** https://vercel.com/claim-deployment?code=01d73a5b-ce04-40fa-ba44-e56e9500dcb7

(Older temp mirror, same build: https://temporary-rapid-piano-newuvh6.vercel.app/ — may also expire.)

## Branch preview (SSO / Vercel login)

Stable branch preview (may require Vercel authentication):

- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/qa
- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/redesign/ember.html

Variant lab (all styles):

- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/redesign/

## Promote to production (after you approve)

1. Merge PR `#7` (`cursor/react-redesign-mockup-f822` → `main`), **or**
2. In Vercel: promote the approved preview deployment to Production.

Until then, live production stays on the current homepage. Do not treat any of the QA URLs as production.

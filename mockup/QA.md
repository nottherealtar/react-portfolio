# QA review — Ember redesign

Production site (`https://tarsonlinecafe.work`) is **unchanged** until you explicitly approve a promote.

## Public QA (no Vercel login)

Primary (anonymous Vercel, claim to keep):

- https://temporary-instant-sitar-ltgfd2c.vercel.app/
- Claim (keeps it under your Vercel team): https://vercel.com/claim-deployment?code=01d73a5b-ce04-40fa-ba44-e56e9500dcb7

Stable alias (redirects to the public QA while the claimable deploy is live):

- https://tarsonline-ember-qa.vercel.app/

CDN mirror from this branch (public, no SSO):

- https://cdn.jsdelivr.net/gh/nottherealtar/react-portfolio@cursor/react-redesign-mockup-f822/ember-qa/

## Branch preview (Vercel Authentication / SSO)

- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/qa
- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/redesign/ember.html

## Promote to production (only after you approve)

1. Tell the agent to promote Ember to the live homepage, **or**
2. Merge PR `#7` (`cursor/react-redesign-mockup-f822` → `main`) / promote the approved preview in Vercel.

Until then, leave production on the current homepage.

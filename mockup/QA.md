# QA review — Ember redesign

Production site (`https://tarsonlinecafe.work`) is **unchanged** until you explicitly approve a promote.

## Public QA (no Vercel login)

**Use these** (served as real `text/html` — jsDelivr HTML mirrors render as plain text in browsers):

- https://temporary-racing-quasar-8fod55h.vercel.app/
- Claim to keep under your Vercel team: https://vercel.com/claim-deployment?code=cb64fd93-2ad2-4201-b2a2-58e207cb9f67
- https://tarsonline-ember-qa.vercel.app/ (redirects to the live public snapshot)

> Tip: open the claim link once so the snapshot does not expire (~60 minutes).

## Branch preview (Vercel Authentication / SSO)

- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/qa
- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/redesign/ember.html

## Promote to production (only after you approve)

1. Tell the agent to promote Ember to the live homepage, **or**
2. Merge PR `#7` (`cursor/react-redesign-mockup-f822` → `main`) / promote the approved preview in Vercel.

Until then, leave production on the current homepage.

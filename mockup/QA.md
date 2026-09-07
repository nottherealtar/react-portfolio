# QA review — Ember redesign

Production site (`https://tarsonlinecafe.work`) is **unchanged** until you explicitly approve a promote.

## Public QA (no Vercel login)

**Recommended — CDN mirror** (permanent while this commit is on the branch):

- https://cdn.jsdelivr.net/gh/nottherealtar/react-portfolio@96dd1379cbf6c8c13d52a498b4ca470a18138596/ember-qa/index.html

Vercel alias (redirects to the CDN mirror once updated):

- https://tarsonline-ember-qa.vercel.app/

Fresh claimable Vercel snapshot (expires ~60m unless claimed):

- https://temporary-brisk-lilac-io81q22.vercel.app/
- Claim: https://vercel.com/claim-deployment?code=03c92d3c-2dcd-4ddd-a2e6-9c8187b8f75f

## Branch preview (Vercel Authentication / SSO)

- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/qa
- https://tarsonlineportfolio-git-cursor-react-re-ef7e92-tar420s-projects.vercel.app/redesign/ember.html

## Promote to production (only after you approve)

1. Tell the agent to promote Ember to the live homepage, **or**
2. Merge PR `#7` (`cursor/react-redesign-mockup-f822` → `main`) / promote the approved preview in Vercel.

Until then, leave production on the current homepage.

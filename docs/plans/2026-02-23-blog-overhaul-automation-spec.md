# Blog Overhaul + Fully Automated Posting Spec

**Date:** 2026-02-23  
**Owner:** Joshua Coetzer / TarsOnlineCafe  
**Objective:** Deliver a reliable, zero-cost, low-maintenance blog system that automatically curates, transforms, and publishes high-impact posts using only GitHub + Vercel.

---

## 1) Non-Functional Requirements

### Reliability
- Deterministic pipeline (same input => same output).
- Idempotent publishing (no duplicate posts).
- Graceful failure when sources, translation, or network calls fail.
- Atomic output updates (`auto post`, `posts.json`, `sitemap.xml`, `run report`) in one commit.

### Cost
- GitHub Actions + Vercel Hobby only.
- No paid APIs required.
- No external database.

### Legal & Risk
- Publish transformed/original commentary only, not full source article copies.
- Always include source attribution and canonical link.
- Use allowlisted sources only.

### Operational Simplicity
- Single scheduled GitHub workflow.
- Config-driven sources/keywords.
- Optional manual trigger (`workflow_dispatch`) for testing and recovery.

---

## 2) Target Architecture

### Components
1. **Source Config**: `blog/automation/sources.json`
2. **Pipeline Script**: `scripts/auto_blog_pipeline.py`
3. **Build/Merge Script**: `scripts/build_blog_posts.py`
4. **Manual Post Registry**: `blog/posts.manual.json`
5. **Generated Registry**: `blog/automation/auto-posts.json`
6. **Published Feed**: `blog/posts.json`
7. **State**: `blog/automation/state.json`
8. **Run Report**: `blog/automation/last-run.json`
9. **Workflow**: `.github/workflows/auto-blog.yml`

### Data Flow
1. Fetch RSS/Atom entries from allowlisted sources.
2. Normalize + deduplicate + score entries.
3. Select best candidate(s) per run.
4. Extract concise content and translate when needed.
5. Generate new HTML post in `blog/auto/`.
6. Update generated metadata registry.
7. Merge manual + generated registries into `blog/posts.json`.
8. Rebuild blog URLs in `sitemap.xml`.
9. Commit changes if and only if files changed.

---

## 3) Content Policy

### Allowed
- Summaries and analysis derived from source metadata/description.
- Short quoted snippets when essential (kept minimal).
- Source name + URL attribution in every auto post.

### Forbidden
- Republishing full article body text.
- Pulling from unapproved domains.
- Publishing if quality threshold is not met.

### Publish Gate
- Minimum summary length.
- Valid source URL.
- Non-duplicate signature.
- Score above threshold.

---

## 4) Scoring Model (Deterministic)

`total_score = freshness + relevance + source_weight + quality`

- **freshness**: Age-based score with decay.
- **relevance**: Keyword hit scoring from business-relevant dictionary.
- **source_weight**: Configurable source trust/priority weight.
- **quality**: Length and structure checks.

Tie-breaker order:
1. Newer publication date
2. Higher source weight
3. Stable lexical order by title

---

## 5) Translation & Conversion Strategy

### Translation
- Default: auto-detect + translate to English via free endpoint.
- Fallback: if translation fails, use original language text and continue.
- Never fail entire run due to translation issues.

### Conversion
- Convert selected source into:
  - SEO-safe title
  - concise summary
  - “Why this matters” section
  - “Operational takeaways” bullets
  - source attribution block

---

## 6) Publishing Contract

Every entry in `blog/posts.json` must include:

```json
{
  "title": "string",
  "date": "YYYY-MM-DD",
  "category": "string",
  "summary": "string",
  "link": "relative/path/to/post.html",
  "source_url": "https://...",
  "source_name": "string",
  "automated": true,
  "language": "en"
}
```

Manual posts can omit automation-only fields.

---

## 7) Observability

`blog/automation/last-run.json` captures:
- run timestamp
- fetched candidates
- selected candidates
- generated posts
- skipped reasons
- source failures

GitHub Action logs remain the primary runtime audit trail.

---

## 8) Reliability Mechanisms

- Network timeout + retries with backoff.
- Per-source isolation (one bad feed does not fail the run).
- Idempotency via source-link hash in `state.json`.
- Max posts per run cap.
- No-op commit behavior when no files changed.

---

## 9) Blog UI Overhaul Requirements

- Keep coffee visual language consistent with main site.
- Improve list-card hierarchy for readability.
- Add metadata for automated insights:
  - “Automated Insight” pill
  - source attribution link
  - published date

---

## 10) Delivery Plan (Single Execution)

1. Add automation config + state files.
2. Add pipeline and build scripts.
3. Add scheduled GitHub workflow.
4. Upgrade blog listing UI to support new metadata.
5. Seed manual registry and generate merged posts file.
6. Validate with a local dry run.
7. Document operation + controls in README.

---

## 11) Acceptance Criteria

- Workflow runs on schedule and manual dispatch.
- At least one auto post can be generated and listed without manual edits.
- Duplicate source links are not republished.
- Existing manual posts remain visible.
- `sitemap.xml` includes all published blog posts.
- Pipeline degrades gracefully on network/translation errors.
- No paid dependencies required.

---

## 12) Long-Term Maintenance

- Add/remove feeds only through `sources.json`.
- Tune keyword relevance weights in script constants.
- Keep workflow schedule conservative (1–2 runs/day) to reduce noise.
- Rotate or replace translation endpoint via environment variable if needed.

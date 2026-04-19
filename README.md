# Joshua Coetzer's Portfolio

This is the source code for [Joshua Coetzer's portfolio website](https://www.tarsonlinecafe.work/).

## Analytics

These metrics are **repository-local**: they describe the merged blog index, automation artifacts, and the last recorded pipeline run. They contain **no secrets**, no API keys, and no per-visitor tracking. Values refresh when `python scripts/build_blog_posts.py` runs (for example after the scheduled auto-blog workflow).

**Badges** (each reads a small JSON file in [blog/automation/](blog/automation/) in the Shields [endpoint badge](https://shields.io/documentation/endpoint) format):

![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-total.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-automated.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-manual.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-feeds.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-auto-html.json)

![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-latest-post.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-sitemap.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-pipeline.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-extractive.json)
![](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnottherealtar%2Freact-portfolio%2Fmain%2Fblog%2Fautomation%2Freadme-analytics-reading-min.json)

**Structured snapshot** (same rebuild step; useful for humans or scripts that want one JSON document): [blog/automation/readme-analytics-public.json](blog/automation/readme-analytics-public.json). Pipeline section is **aggregated only** (for example `source_issue_count` without error text) so feed or parser details are not copied into this file.

| File | What it reflects |
|------|------------------|
| `readme-analytics-total.json` | Distinct posts in the merged `posts.json` list |
| `readme-analytics-manual.json` / `automated.json` | Split by `automated` flag |
| `readme-analytics-feeds.json` | Rows in `sources.json` → `sources` |
| `readme-analytics-auto-html.json` | `blog/auto/*.html` files on disk |
| `readme-analytics-latest-post.json` | Newest `date` among merged posts |
| `readme-analytics-sitemap.json` | Blog post `<loc>` entries in `sitemap.xml` (excluding the blog index URL) |
| `readme-analytics-pipeline.json` | Last line in `last-run.json`: date, status, fetch volume |
| `readme-analytics-extractive.json` | Summarized extractive/embedding flags from that run |
| `readme-analytics-reading-min.json` | Sum of estimated reading minutes from listing metadata (not full article word count) |

## Features

- **Interactive 3D globe:** The main portfolio page (`index.html`) loads Three.js via `/globe/index.js`. The blog index, 404 page, and generated auto posts do not; some manual posts include their own separate Three.js hero scenes.
- **Responsive Design:** Built with Tailwind CSS for mobile and desktop.
- **About, Skills, Projects:** Showcases background, technical skills, and featured projects.
- **Blog:** Tech blog with AI news, coding guides, and project deep-dives.
- **SEO Optimized:** Includes meta tags, Open Graph, Twitter cards, and sitemap.
- **Custom 404 Page:** Consistent branding and navigation for not found errors.
- **Accessible:** Keyboard navigation and good color contrast.
- **Easy Deployment:** Designed for static hosting (Vercel, Netlify, GitHub Pages, etc.).

## Structure

- `/index.html` — Main portfolio page
- `/blog/blog.html` — Blog homepage
- `/blog/*.html` — Individual blog posts
- `/404.html` — Custom 404 page
- `/sitemap.xml` — Sitemap for search engines
- `/robots.txt` — Robots file for SEO
- `/blog/posts.json` — Blog post metadata for dynamic blog list
- `/blog/posts.manual.json` — Manual (handwritten) blog post registry
- `/blog/automation/sources.json` — Source allowlist and keyword scoring config
- `/blog/automation/auto-posts.json` — Generated automated posts registry
- `/scripts/auto_blog_pipeline.py` — Automated source curation + post generation
- `/scripts/build_blog_posts.py` — Merges manual + auto posts and updates sitemap
- `/.github/workflows/auto-blog.yml` — Scheduled automation pipeline

## Technologies Used

- **HTML5 & CSS3**
- **Tailwind CSS**
- **Three.js** (for 3D animated backgrounds)
- **Font Awesome** (icons)
- **JavaScript** (for interactivity and animations)

## How to Use

1. Clone the repository.
2. Edit the HTML files to update content, projects, or blog posts.
3. Deploy to your preferred static hosting provider.

## Automated Blog Pipeline (GitHub + Vercel)

The blog supports fully automated insight publishing with zero paid services.

### How it works

1. GitHub Actions runs `.github/workflows/auto-blog.yml` on schedule.
2. `scripts/auto_blog_pipeline.py` fetches allowlisted feeds from `blog/automation/sources.json`.
3. Entries are scored (freshness + relevance + source weight), transformed, and published into `blog/auto/*.html`.
4. `scripts/build_blog_posts.py` merges `blog/posts.manual.json` + `blog/automation/auto-posts.json` into `blog/posts.json` and updates `sitemap.xml`.
5. Vercel deploys updates automatically from GitHub.

### Local commands

- Dry run generation:
	- `python scripts/auto_blog_pipeline.py --max-posts 1 --dry-run`
- Live generation:
	- `python scripts/auto_blog_pipeline.py --max-posts 1`
- Rebuild public feed + sitemap + README analytics payloads:
	- `python scripts/build_blog_posts.py`

### Operational files

- Runtime report: `blog/automation/last-run.json`
- Deduplication state: `blog/automation/state.json`
- Generated post index: `blog/automation/auto-posts.json`
- README analytics: `blog/automation/readme-analytics-*.json` and `blog/automation/readme-analytics-public.json`

### Safety policy

- Auto posts are transformed insights, not full-source reposts.
- Each generated post includes source attribution and canonical link.
- Sources are allowlisted and centrally managed in `blog/automation/sources.json`.

## License

MIT License

---

**Author:**  
[Joshua Coetzer](https://github.com/nottherealtar)
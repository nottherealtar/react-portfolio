# Joshua Coetzer's Portfolio

This is the source code for [Joshua Coetzer's portfolio website](https://www.tarsonlinecafe.work/).

## Features

- **Modern 3D Background:** Interactive Three.js 3D scene on every page.
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
- Rebuild public feed + sitemap:
	- `python scripts/build_blog_posts.py`

### Operational files

- Runtime report: `blog/automation/last-run.json`
- Deduplication state: `blog/automation/state.json`
- Generated post index: `blog/automation/auto-posts.json`

### Safety policy

- Auto posts are transformed insights, not full-source reposts.
- Each generated post includes source attribution and canonical link.
- Sources are allowlisted and centrally managed in `blog/automation/sources.json`.

## License

MIT License

---

**Author:**  
[Joshua Coetzer](https://github.com/nottherealtar)
import json
import re
from pathlib import Path
from typing import Any, Dict, List
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "blog"
AUTOMATION_DIR = BLOG_DIR / "automation"
SITE_MAP_PATH = ROOT / "sitemap.xml"
SITE_URL = "https://www.tarsonlinecafe.work"


def load_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: Any) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def _shields_endpoint(label: str, message: str, color: str = "informational") -> Dict[str, Any]:
    return {
        "schemaVersion": 1,
        "label": label,
        "message": str(message),
        "color": color,
    }


def _latest_post_date(posts: List[Dict[str, Any]]) -> str:
    dates = [normalize_date(p.get("date", "") or "") for p in posts if p.get("date")]
    return max(dates) if dates else "—"


def _count_sitemap_blog_post_urls() -> int:
    """Blog post <loc> entries in sitemap (excludes the blog index page)."""
    if not SITE_MAP_PATH.is_file():
        return 0
    try:
        tree = ET.parse(SITE_MAP_PATH)
    except ET.ParseError:
        return 0
    root = tree.getroot()
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    hub = f"{SITE_URL}/blog/blog.html"
    n = 0
    for url_el in root.findall(f"{ns}url"):
        loc_el = url_el.find(f"{ns}loc")
        if loc_el is None or not loc_el.text:
            continue
        loc = loc_el.text.strip()
        if loc.startswith(f"{SITE_URL}/blog/") and loc != hub:
            n += 1
    return n


def _safe_last_run_summary() -> Dict[str, Any]:
    """Aggregate pipeline stats only (no error bodies, no feed URLs)."""
    raw = load_json(AUTOMATION_DIR / "last-run.json", None)
    if not isinstance(raw, dict):
        return {}
    out: Dict[str, Any] = {
        "status": raw.get("status"),
        "timestamp_utc": raw.get("timestamp"),
        "candidates_fetched": raw.get("fetched_candidates"),
        "candidates_unseen": raw.get("unseen_candidates"),
        "candidates_selected": raw.get("selected_candidates"),
        "posts_generated": len(raw.get("generated_posts") or []),
        "source_issue_count": len(raw.get("source_failures") or []),
    }
    ee = raw.get("extractive_engine")
    if isinstance(ee, dict):
        out["extractive_engine"] = {
            "enabled": ee.get("enabled"),
            "embedding_model_configured": ee.get("embedding_model_configured"),
        }
    return {k: v for k, v in out.items() if v is not None}


def _extractive_badge_message(last_run: Dict[str, Any]) -> str:
    ee = last_run.get("extractive_engine")
    if not isinstance(ee, dict):
        return "n/a"
    if not ee.get("enabled"):
        return "off"
    if ee.get("embedding_model_configured"):
        return "on + embed"
    return "on"


def _pipeline_badge_message(last_run: Dict[str, Any]) -> str:
    if not last_run.get("timestamp_utc") and last_run.get("status") is None:
        return "no runs yet"
    ts = str(last_run.get("timestamp_utc") or "")[:10]
    st = last_run.get("status") or "?"
    fetched = last_run.get("candidates_fetched")
    if isinstance(fetched, int):
        return f"{ts} · {st} · {fetched} fetched"
    return f"{ts} · {st}"


def write_readme_analytics_shields(
    merged_posts: List[Dict[str, Any]],
    manual_posts: List[Dict[str, Any]],
    auto_posts: List[Dict[str, Any]],
) -> None:
    """Shields.io custom endpoint JSON (https://shields.io/documentation/endpoint) for README badges."""
    total = len(merged_posts)
    automated = sum(1 for p in merged_posts if p.get("automated") is True)
    manual = total - automated
    sources_cfg = load_json(AUTOMATION_DIR / "sources.json", {})
    feed_sources = len((sources_cfg.get("sources") or []))

    auto_dir = BLOG_DIR / "auto"
    auto_html = len(list(auto_dir.glob("*.html"))) if auto_dir.is_dir() else 0

    write_json(AUTOMATION_DIR / "readme-analytics-total.json", _shields_endpoint("blog merged", total, "blue"))
    write_json(AUTOMATION_DIR / "readme-analytics-automated.json", _shields_endpoint("blog automated", automated, "success"))
    write_json(AUTOMATION_DIR / "readme-analytics-manual.json", _shields_endpoint("blog manual", manual, "informational"))
    write_json(AUTOMATION_DIR / "readme-analytics-feeds.json", _shields_endpoint("RSS sources", feed_sources, "lightgrey"))
    write_json(
        AUTOMATION_DIR / "readme-analytics-auto-html.json",
        _shields_endpoint("blog/auto html", auto_html, "yellow"),
    )

    latest = _latest_post_date(merged_posts)
    write_json(
        AUTOMATION_DIR / "readme-analytics-latest-post.json",
        _shields_endpoint("latest post", latest, "blue"),
    )

    sitemap_blog = _count_sitemap_blog_post_urls()
    write_json(
        AUTOMATION_DIR / "readme-analytics-sitemap.json",
        _shields_endpoint("sitemap blog URLs", sitemap_blog, "informational"),
    )

    last_run = _safe_last_run_summary()
    write_json(
        AUTOMATION_DIR / "readme-analytics-pipeline.json",
        _shields_endpoint("last auto-blog", _pipeline_badge_message(last_run), "lightgrey"),
    )
    ee_msg = _extractive_badge_message(last_run)
    ee_color = "lightgrey" if ee_msg == "n/a" else "success"
    write_json(
        AUTOMATION_DIR / "readme-analytics-extractive.json",
        _shields_endpoint("extractive engine", ee_msg, ee_color),
    )

    total_read = sum(estimate_reading_minutes(p) for p in merged_posts)
    write_json(
        AUTOMATION_DIR / "readme-analytics-reading-min.json",
        _shields_endpoint("est. read min (listing)", total_read, "informational"),
    )

    write_readme_analytics_public(
        merged_posts=merged_posts,
        manual_count=manual,
        automated_count=automated,
        feed_sources=feed_sources,
        auto_html=auto_html,
        sitemap_blog_urls=sitemap_blog,
        latest_post_date=latest,
        last_run=last_run,
    )


def write_readme_analytics_public(
    merged_posts: List[Dict[str, Any]],
    manual_count: int,
    automated_count: int,
    feed_sources: int,
    auto_html: int,
    sitemap_blog_urls: int,
    latest_post_date: str,
    last_run: Dict[str, Any],
) -> None:
    """Single JSON snapshot for README deep-link; counts and dates only — no secrets or error strings."""
    payload: Dict[str, Any] = {
        "schema_version": 1,
        "about": "Written by scripts/build_blog_posts.py. Safe to publish: aggregate blog and pipeline metrics only.",
        "blog": {
            "merged_post_cards": len(merged_posts),
            "manual_posts": manual_count,
            "automated_posts": automated_count,
            "latest_post_date": latest_post_date,
            "estimated_total_reading_minutes_listing": sum(
                estimate_reading_minutes(p) for p in merged_posts
            ),
        },
        "sources": {"rss_feed_entries_configured": feed_sources},
        "artifacts": {"blog_auto_html_files_on_disk": auto_html},
        "sitemap": {"blog_post_loc_entries": sitemap_blog_urls},
        "last_pipeline": last_run if last_run else None,
    }
    write_json(AUTOMATION_DIR / "readme-analytics-public.json", payload)



def normalize_date(value: str) -> str:
    if not value:
        return "1970-01-01"
    return value[:10]


def estimate_reading_minutes(post: Dict[str, Any]) -> int:
    if post.get("reading_minutes") is not None:
        try:
            return max(2, min(45, int(post["reading_minutes"])))
        except (TypeError, ValueError):
            pass
    blob = f"{post.get('title', '')} {post.get('summary', '')}"
    words = len(re.findall(r"\w+", blob))
    # Listing cards only have title + summary; use a slightly faster pace and a sensible floor.
    return max(2, min(25, round(words / 130)))


def html_to_search_plain(path: Path, max_chars: int = 12000) -> str:
    """Strip HTML to plain text for client-side search (title/summary still indexed separately)."""
    if not path.is_file():
        return ""
    raw = path.read_text(encoding="utf-8", errors="ignore")
    raw = re.sub(r"<script[\s\S]*?</script>", " ", raw, flags=re.IGNORECASE)
    raw = re.sub(r"<style[\s\S]*?</style>", " ", raw, flags=re.IGNORECASE)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw[:max_chars] if raw else ""


def attach_search_plain(posts: List[Dict[str, Any]]) -> None:
    for post in posts:
        link = post.get("link") or ""
        if not link or link.startswith("http://") or link.startswith("https://"):
            continue
        rel = link.lstrip("/")
        blob = html_to_search_plain(BLOG_DIR / rel)
        if blob:
            post["search_plain"] = blob


def merge_posts(manual_posts: List[Dict[str, Any]], auto_posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    merged: Dict[str, Dict[str, Any]] = {}

    for post in manual_posts + auto_posts:
        link = post.get("link")
        if not link:
            continue
        current = merged.get(link)
        if current is None:
            merged[link] = post
            continue

        if normalize_date(post.get("date", "")) >= normalize_date(current.get("date", "")):
            merged[link] = post

    combined = list(merged.values())
    for post in combined:
        post["reading_minutes"] = estimate_reading_minutes(post)

    attach_search_plain(combined)

    combined.sort(
        key=lambda post: (
            normalize_date(post.get("date", "")),
            post.get("title", "").lower()
        ),
        reverse=True
    )
    return combined


def update_sitemap(posts: List[Dict[str, Any]]) -> None:
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    tree = ET.parse(SITE_MAP_PATH)
    root = tree.getroot()
    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

    existing_urls = root.findall(f"{namespace}url")
    for url_element in existing_urls:
        loc_element = url_element.find(f"{namespace}loc")
        if loc_element is None or not loc_element.text:
            continue
        loc_text = loc_element.text.strip()
        if loc_text.startswith(f"{SITE_URL}/blog/") and loc_text != f"{SITE_URL}/blog/blog.html":
            root.remove(url_element)

    for post in posts:
        link = post.get("link", "")
        if link.startswith("http://") or link.startswith("https://"):
            continue

        date = normalize_date(post.get("date", ""))
        url = ET.SubElement(root, f"{namespace}url")

        loc = ET.SubElement(url, f"{namespace}loc")
        loc.text = f"{SITE_URL}/blog/{link.lstrip('/')}"

        lastmod = ET.SubElement(url, f"{namespace}lastmod")
        lastmod.text = date

        changefreq = ET.SubElement(url, f"{namespace}changefreq")
        changefreq.text = "monthly"

        priority = ET.SubElement(url, f"{namespace}priority")
        priority.text = "0.7"

    try:
        ET.indent(tree, space="  ")
    except AttributeError:
        pass

    tree.write(SITE_MAP_PATH, encoding="utf-8", xml_declaration=True)


def main() -> int:
    manual_posts = load_json(BLOG_DIR / "posts.manual.json", [])
    auto_posts = load_json(AUTOMATION_DIR / "auto-posts.json", [])
    merged_posts = merge_posts(manual_posts, auto_posts)

    write_json(BLOG_DIR / "posts.json", merged_posts)
    update_sitemap(merged_posts)
    write_readme_analytics_shields(merged_posts, manual_posts, auto_posts)

    print(f"Merged {len(manual_posts)} manual + {len(auto_posts)} automated posts => {len(merged_posts)} published entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

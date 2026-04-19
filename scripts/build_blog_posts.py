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

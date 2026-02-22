import argparse
import hashlib
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, List
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "blog"
AUTOMATION_DIR = BLOG_DIR / "automation"
AUTO_DIR = BLOG_DIR / "auto"


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def normalize_domain(value: str | None) -> str:
    if not value:
        return ""
    return value.lower().strip().lstrip(".").removeprefix("www.")


def is_domain_allowed(url: str, allowed_domains: List[str]) -> bool:
    if not allowed_domains:
        return True
    host = normalize_domain(urllib.parse.urlparse(url).hostname)
    if not host:
        return False
    for allowed in allowed_domains:
        allowed_host = normalize_domain(allowed)
        if host == allowed_host or host.endswith(f".{allowed_host}"):
            return True
    return False


def keyword_hit_count(text_blob: str, keyword_weights: Dict[str, int]) -> int:
    return sum(1 for keyword in keyword_weights if keyword.lower() in text_blob)


def safe_request(url: str, timeout: int = 20, retries: int = 3) -> bytes:
    headers = {
        "User-Agent": "TarsOnlineCafeAutoBlog/1.0 (+https://www.tarsonlinecafe.work)",
        "Accept": "application/rss+xml, application/atom+xml, text/xml, application/xml, text/html"
    }
    error: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url=url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read()
        except Exception as exc:  # noqa: BLE001
            error = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Request failed for {url}: {error}")


def strip_html(raw_text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw_text or "")
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_date(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    value = value.strip()
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except Exception:  # noqa: BLE001
        pass

    iso_candidate = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(iso_candidate)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except Exception:  # noqa: BLE001
        return datetime.now(timezone.utc)


def parse_feed(xml_blob: bytes, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_blob)
    except ET.ParseError as exc:
        raise RuntimeError(f"Unable to parse XML for source {source['name']}: {exc}")

    # RSS
    items = root.findall("./channel/item")
    if items:
        for item in items:
            title = (item.findtext("title") or "Untitled").strip()
            link = (item.findtext("link") or "").strip()
            description = item.findtext("description") or item.findtext("content:encoded", default="")
            pub_date = item.findtext("pubDate") or item.findtext("dc:date")
            if not link:
                continue
            results.append(
                {
                    "title": title,
                    "link": link,
                    "description": strip_html(description or ""),
                    "published_at": parse_date(pub_date),
                    "source_name": source["name"],
                    "source_weight": int(source.get("weight", 1)),
                    "category": source.get("category"),
                    "language": source.get("default_language", "en")
                }
            )
        return results

    # Atom
    ns = {
        "atom": "http://www.w3.org/2005/Atom"
    }
    entries = root.findall("atom:entry", ns)
    for entry in entries:
        title = (entry.findtext("atom:title", default="Untitled", namespaces=ns) or "Untitled").strip()
        link_node = entry.find("atom:link", ns)
        link = ""
        if link_node is not None:
            link = (link_node.attrib.get("href") or "").strip()
        summary = entry.findtext("atom:summary", default="", namespaces=ns)
        content = entry.findtext("atom:content", default="", namespaces=ns)
        published = entry.findtext("atom:published", default="", namespaces=ns) or entry.findtext("atom:updated", default="", namespaces=ns)
        if not link:
            continue
        results.append(
            {
                "title": title,
                "link": link,
                "description": strip_html(summary or content or ""),
                "published_at": parse_date(published),
                "source_name": source["name"],
                "source_weight": int(source.get("weight", 1)),
                "category": source.get("category"),
                "language": source.get("default_language", "en")
            }
        )
    return results


def score_item(item: Dict[str, Any], keyword_weights: Dict[str, int], now: datetime) -> float:
    text_blob = f"{item['title']} {item['description']}".lower()

    age_hours = max(0.0, (now - item["published_at"]).total_seconds() / 3600)
    freshness = max(0.0, 45.0 - (age_hours / 4.0))

    relevance = 0.0
    for keyword, weight in keyword_weights.items():
        if keyword.lower() in text_blob:
            relevance += float(weight)

    quality = 0.0
    content_len = len(item["description"])
    if content_len >= 80:
        quality += 6.0
    if content_len >= 160:
        quality += 4.0

    source_weight = float(item.get("source_weight", 1)) * 6.0
    return round(freshness + relevance + quality + source_weight, 4)


def detect_language(text: str, fallback: str = "en") -> str:
    lowered = text.lower()
    if any(token in lowered for token in [" el ", " la ", " de ", " y ", " para "]) and any(token in lowered for token in [" que ", " una ", " con "]):
        return "es"
    if any(token in lowered for token in [" le ", " la ", " de ", " et ", " pour "]) and " une " in lowered:
        return "fr"
    return fallback


def translate_to_english(text: str, source_lang: str) -> str:
    if not text:
        return text
    if source_lang == "en":
        return text

    try:
        query = urllib.parse.urlencode(
            {
                "client": "gtx",
                "sl": source_lang,
                "tl": "en",
                "dt": "t",
                "q": text
            }
        )
        url = f"https://translate.googleapis.com/translate_a/single?{query}"
        raw = safe_request(url, timeout=15, retries=2)
        payload = json.loads(raw.decode("utf-8"))
        translated_chunks = []
        for part in payload[0]:
            translated_chunks.append(part[0])
        translated = "".join(translated_chunks).strip()
        if translated:
            return translated
    except Exception:  # noqa: BLE001
        return text
    return text


def make_slug(title: str, published_at: datetime, source_url: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    cleaned = re.sub(r"-+", "-", cleaned)
    cleaned = cleaned[:60].strip("-") or "insight"
    short_hash = hashlib.sha1(source_url.encode("utf-8")).hexdigest()[:8]
    return f"{published_at.strftime('%Y%m%d')}-{cleaned}-{short_hash}"


def sentence_split(text: str) -> List[str]:
    text = text.strip()
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [part.strip() for part in parts if part.strip()]


def make_summary(text: str, max_chars: int = 240) -> str:
    sentences = sentence_split(text)
    if not sentences:
        return "A new development with implications for automation, integration, and digital operations."
    summary = " ".join(sentences[:2]).strip()
    if len(summary) > max_chars:
        summary = summary[: max_chars - 1].rstrip() + "…"
    return summary


def make_takeaways(title: str, body: str) -> List[str]:
    text = f"{title} {body}".lower()
    takeaways: List[str] = []

    if "api" in text or "integration" in text:
        takeaways.append("Map this update to your integration contracts and monitor for schema or endpoint changes.")
    if "security" in text or "compliance" in text:
        takeaways.append("Review access policies and audit controls before rolling this pattern into production workflows.")
    if "agent" in text or "ai" in text:
        takeaways.append("Use this as a candidate for a narrow pilot that can prove measurable business impact quickly.")
    if "cloud" in text or "azure" in text:
        takeaways.append("Assess where this capability can replace manual operational runbooks in your current stack.")

    if not takeaways:
        takeaways = [
            "Evaluate relevance against your highest-friction manual process first.",
            "Translate findings into one practical workflow experiment with a clear KPI."
        ]

    return takeaways[:3]


def escape_html(text: str) -> str:
    return html.escape(text, quote=True)


def render_post_html(metadata: Dict[str, Any]) -> str:
    takeaways_html = "\n".join(f"          <li>{escape_html(item)}</li>" for item in metadata["takeaways"])
    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>{escape_html(metadata['title'])} | TarsOnlineCafe</title>
  <meta name=\"description\" content=\"{escape_html(metadata['summary'])}\">
  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">
  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>
  <link href=\"https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap\" rel=\"stylesheet\">
  <link rel=\"stylesheet\" href=\"/styles/themes.css\">
  <style>
    body {{
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: #2d221b;
      color: #f7efe2;
      line-height: 1.7;
    }}
    .wrap {{
      max-width: 860px;
      margin: 0 auto;
      padding: 3rem 1.25rem 4rem;
    }}
    .card {{
      background: rgba(45, 34, 27, 0.65);
      border: 1px solid rgba(247, 239, 226, 0.15);
      border-radius: 20px;
      padding: 2rem;
      backdrop-filter: blur(10px);
    }}
    .meta {{
      color: #c9a96e;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }}
    h1 {{
      font-family: 'DM Serif Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      margin: 0 0 1rem;
      line-height: 1.2;
    }}
    h2 {{
      margin-top: 2rem;
      color: #c9a96e;
      font-size: 1.2rem;
    }}
    p {{
      margin: 0 0 1rem;
      color: #ede0cc;
    }}
    a {{
      color: #c9a96e;
    }}
    li {{
      margin-bottom: 0.6rem;
      color: #ede0cc;
    }}
    .back {{
      display: inline-block;
      margin-top: 1.25rem;
      color: #f7efe2;
      text-decoration: none;
      border: 1px solid rgba(247, 239, 226, 0.25);
      border-radius: 999px;
      padding: 0.45rem 0.95rem;
    }}
    .back:hover {{
      border-color: #c9a96e;
      color: #c9a96e;
    }}
  </style>
</head>
<body>
  <main class=\"wrap\">
    <article class=\"card\">
      <div class=\"meta\">
        <span>Automated Insight</span>
        <span>{escape_html(metadata['date'])}</span>
        <span>{escape_html(metadata['source_name'])}</span>
      </div>
      <h1>{escape_html(metadata['title'])}</h1>
      <p>{escape_html(metadata['summary'])}</p>

      <h2>Why this matters</h2>
      <p>{escape_html(metadata['why_it_matters'])}</p>

      <h2>Operational takeaways</h2>
      <ul>
{takeaways_html}
      </ul>

      <h2>Source</h2>
      <p>
        Original article: <a href=\"{escape_html(metadata['source_url'])}\" target=\"_blank\" rel=\"noopener noreferrer\">{escape_html(metadata['source_name'])}</a>
      </p>

      <a class=\"back\" href=\"/blog/blog.html\">← Back to blog</a>
    </article>
  </main>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate automated blog posts from allowlisted RSS feeds")
    parser.add_argument("--max-posts", type=int, default=1)
    parser.add_argument("--min-score", type=float, default=34.0)
    parser.add_argument("--min-summary-length", type=int, default=120)
    parser.add_argument("--min-description-length", type=int, default=140)
    parser.add_argument("--min-keyword-hits", type=int, default=2)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    AUTO_DIR.mkdir(parents=True, exist_ok=True)

    sources_cfg_path = AUTOMATION_DIR / "sources.json"
    state_path = AUTOMATION_DIR / "state.json"
    auto_posts_path = AUTOMATION_DIR / "auto-posts.json"
    report_path = AUTOMATION_DIR / "last-run.json"

    config = load_json(sources_cfg_path, {})
    state = load_json(state_path, {"published_signatures": []})
    auto_posts = load_json(auto_posts_path, [])

    published_signatures = set(state.get("published_signatures", []))
    now = datetime.now(timezone.utc)
    keyword_weights = config.get("keywords", {})
    allowed_domains = [normalize_domain(domain) for domain in config.get("allowed_domains", []) if normalize_domain(domain)]

    quality_gate = config.get("quality_gate", {})
    min_score = float(quality_gate.get("min_score", args.min_score))
    min_summary_length = int(quality_gate.get("min_summary_length", args.min_summary_length))
    min_description_length = int(quality_gate.get("min_description_length", args.min_description_length))
    min_keyword_hits = int(quality_gate.get("min_keyword_hits", args.min_keyword_hits))

    fetched = 0
    candidates: List[Dict[str, Any]] = []
    source_failures: List[Dict[str, str]] = []

    for source in config.get("sources", []):
        try:
            if not is_domain_allowed(source["url"], allowed_domains):
                source_failures.append({"source": source.get("name", "unknown"), "error": "blocked-source-domain"})
                continue
            xml_blob = safe_request(source["url"])
            entries = parse_feed(xml_blob, source)
            fetched += len(entries)
            candidates.extend(entries)
        except Exception as exc:  # noqa: BLE001
            source_failures.append({"source": source.get("name", "unknown"), "error": str(exc)})

    unseen_candidates = []
    blocked_domain_count = 0
    for item in candidates:
        if not is_domain_allowed(item["link"], allowed_domains):
            blocked_domain_count += 1
            continue
        signature = hashlib.sha1(item["link"].encode("utf-8")).hexdigest()
        if signature in published_signatures:
            continue
        item["signature"] = signature
        item["score"] = score_item(item, keyword_weights, now)
        unseen_candidates.append(item)

    unseen_candidates.sort(
        key=lambda item: (
            item["score"],
            item["published_at"].timestamp(),
            item["source_weight"],
            item["title"].lower()
        ),
        reverse=True
    )

    selected = [item for item in unseen_candidates if item["score"] >= min_score][: args.max_posts]

    generated = []
    skipped = []

    for item in selected:
        raw_description = item["description"] or ""
        detected_language = detect_language(f"{item['title']} {raw_description}", fallback=item.get("language", "en"))
        translated_description = translate_to_english(raw_description, detected_language)
        scored_blob = f"{item['title']} {translated_description}".lower()

        summary = make_summary(translated_description)
        why_it_matters = (
            "This signal can inform practical automation decisions, especially where teams need tighter workflows, "
            "cleaner integrations, and less manual operational overhead."
        )

        slug = make_slug(item["title"], item["published_at"], item["link"])
        file_name = f"{slug}.html"
        file_path = AUTO_DIR / file_name

        post_title = f"{item['title']} — Practical Automation Insight"
        takeaways = make_takeaways(item["title"], translated_description)
        post_date = item["published_at"].strftime("%Y-%m-%d")

        metadata = {
            "title": post_title,
            "date": post_date,
            "category": item.get("category") or config.get("default_category", "Automation Insights"),
            "summary": summary,
            "link": f"auto/{file_name}",
            "source_url": item["link"],
            "source_name": item["source_name"],
            "automated": True,
            "language": "en",
            "score": item["score"],
            "signature": item["signature"],
            "why_it_matters": why_it_matters,
            "takeaways": takeaways
        }

        if len(summary) < min_summary_length:
            skipped.append({"title": item["title"], "reason": "summary-too-short"})
            continue

        if len(translated_description) < min_description_length:
            skipped.append({"title": item["title"], "reason": "description-too-short"})
            continue

        if keyword_hit_count(scored_blob, keyword_weights) < min_keyword_hits:
            skipped.append({"title": item["title"], "reason": "keyword-signal-too-low"})
            continue

        if not args.dry_run:
            file_path.write_text(render_post_html(metadata), encoding="utf-8")
            auto_posts.append(
                {
                    "title": metadata["title"],
                    "date": metadata["date"],
                    "category": metadata["category"],
                    "summary": metadata["summary"],
                    "link": metadata["link"],
                    "source_url": metadata["source_url"],
                    "source_name": metadata["source_name"],
                    "automated": True,
                    "language": "en"
                }
            )
            published_signatures.add(item["signature"])

        generated.append(
            {
                "title": metadata["title"],
                "link": metadata["link"],
                "score": metadata["score"],
                "source": metadata["source_name"]
            }
        )

    if not args.dry_run:
        # Dedupe by link and keep most recent by date
        dedup: Dict[str, Dict[str, Any]] = {}
        for post in auto_posts:
            existing = dedup.get(post["link"])
            if existing is None or post.get("date", "") > existing.get("date", ""):
                dedup[post["link"]] = post
        normalized_auto_posts = list(dedup.values())
        normalized_auto_posts.sort(key=lambda post: (post.get("date", ""), post.get("title", "")), reverse=True)

        write_json(auto_posts_path, normalized_auto_posts)
        write_json(state_path, {"published_signatures": sorted(published_signatures)})

    report = {
        "status": "ok",
        "timestamp": now.isoformat(),
        "fetched_candidates": fetched,
        "unseen_candidates": len(unseen_candidates),
        "blocked_domain_candidates": blocked_domain_count,
        "selected_candidates": len(selected),
        "generated_posts": generated,
        "skipped": skipped,
        "source_failures": source_failures,
        "dry_run": args.dry_run,
        "min_score": min_score,
        "min_summary_length": min_summary_length,
        "min_description_length": min_description_length,
        "min_keyword_hits": min_keyword_hits,
        "allowed_domains": allowed_domains,
        "max_posts": args.max_posts
    }

    write_json(report_path, report)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())

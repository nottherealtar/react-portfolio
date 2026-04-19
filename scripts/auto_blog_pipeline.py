import argparse
import hashlib
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple
from xml.etree.ElementTree import Element

import requests
from bs4 import BeautifulSoup, Tag

import blog_extractive_engine


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "blog"
AUTOMATION_DIR = BLOG_DIR / "automation"
AUTO_DIR = BLOG_DIR / "auto"

RSS_CONTENT_ENCODED = "{http://purl.org/rss/1.0/modules/content/}encoded"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "TarsOnlineCafeAutoBlog/2.0 (+https://www.tarsonlinecafe.work)",
        "Accept": "application/rss+xml, application/atom+xml, text/xml, application/xml, text/html;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
    }
)

BOILERPLATE_START = re.compile(
    r"^\s*(subscribe|sign up|newsletter|e-?mail updates|cookie|cookies|gdpr|advertisement|"
    r"sponsored|more stories|related articles|read more|follow us|share this|posted in|"
    r"filed under|tags:|image credit|photograph:|editor.?s note|disclaimer)\b",
    re.IGNORECASE,
)

BOILERPLATE_SUBSTRING = re.compile(
    r"(click here to|manage your preferences|terms of (use|service)|privacy policy|"
    r"all rights reserved\.?\s*$|^\s*advertisement\s*$)",
    re.IGNORECASE,
)


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
    lowered = text_blob.lower()
    return sum(1 for keyword in keyword_weights if keyword.lower() in lowered)


def safe_request(url: str, timeout: int = 20, retries: int = 3) -> bytes:
    headers = {
        "User-Agent": "TarsOnlineCafeAutoBlog/2.0 (+https://www.tarsonlinecafe.work)",
        "Accept": "application/rss+xml, application/atom+xml, text/xml, application/xml, text/html",
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


def article_page_host(page_url: str) -> str:
    host = urllib.parse.urlparse(page_url).hostname or ""
    return normalize_domain(host)


# Hosts commonly used for ads, trackers, or beacons — editorial CDNs are allowed by default.
_IMAGE_HOST_BLOCKLIST = frozenset(
    {
        "doubleclick.net",
        "googlesyndication.com",
        "googleadservices.com",
        "google-analytics.com",
        "googletagmanager.com",
        "adnxs.com",
        "amazon-adsystem.com",
        "taboola.com",
        "outbrain.com",
        "scorecardresearch.com",
        "pubmatic.com",
        "criteo.com",
        "rubiconproject.com",
        "adform.net",
        "casalemedia.com",
        "adsafeprotected.com",
        "moatads.com",
        "adsrvr.org",
        "sitescout.com",
        "zemanta.com",
        "seedtag.com",
        "mediago.io",
        "2mdn.net",
        "quantserve.com",
        "quantcast.com",
        "adsystem.com",
        "adsymptotic.com",
        "intentiq.com",
        "liveramp.com",
        "demdex.net",
        "omtrdc.net",
        "everesttech.net",
        "rlcdn.com",
        "liadm.com",
        "ads-twitter.com",
        "analytics.twitter.com",
    }
)


def is_image_host_blocklisted(host: str) -> bool:
    h = normalize_domain(host)
    if not h:
        return True
    if h == "localhost" or h.endswith(".local") or h.endswith(".localhost"):
        return True
    if re.fullmatch(r"(\d{1,3}\.){3}\d{1,3}", h):
        return True
    for blocked in _IMAGE_HOST_BLOCKLIST:
        if h == blocked or h.endswith(f".{blocked}"):
            return True
    return False


def is_image_host_allowed_autonomous(img_host: str, _article_host: str) -> bool:
    """
    Fully autonomous image policy: URLs are already limited to <img>/<picture> inside the
    de-noised article container. Allow any https host except known ad/tracker domains.
    """
    h = normalize_domain(img_host)
    if not h:
        return False
    return not is_image_host_blocklisted(h)


def _first_url_from_srcset(srcset: str) -> str:
    if not srcset or not srcset.strip():
        return ""
    first = srcset.split(",")[0].strip()
    return first.split()[0].strip() if first else ""


def safe_https_image_url(raw: str, base_url: str) -> str:
    """Resolve relative URLs and return a canonical https URL, or empty string if unsafe."""
    if not raw:
        return ""
    raw = raw.strip()
    if raw.lower().startswith("javascript:") or raw.lower().startswith("data:") or raw.lower().startswith("vbscript:"):
        return ""
    if "\n" in raw or "\r" in raw or "\0" in raw:
        return ""
    joined = urllib.parse.urljoin(base_url, raw)
    if joined.startswith("//"):
        joined = f"https:{joined}"
    parsed = urllib.parse.urlparse(joined)
    if parsed.scheme.lower() != "https":
        return ""
    if not parsed.netloc:
        return ""
    return urllib.parse.urlunparse(parsed)


def extract_https_images_from_soup(
    container: Tag,
    page_url: str,
    article_host: str,
    max_images: int,
) -> List[Dict[str, str]]:
    """Collect deduplicated https image URLs with alt text from article markup."""
    seen: set[str] = set()
    out: List[Dict[str, str]] = []

    def consider(raw_src: str, alt: str) -> None:
        if len(out) >= max_images:
            return
        url = safe_https_image_url(raw_src, page_url)
        if not url:
            return
        parsed = urllib.parse.urlparse(url)
        if not is_image_host_allowed_autonomous(parsed.hostname or "", article_host):
            return
        if url in seen:
            return
        low = url.lower()
        if any(x in low for x in ("/tracker", "pixel", "1x1", "spacer.gif", "blank.gif")):
            return
        seen.add(url)
        clean_alt = re.sub(r"\s+", " ", (alt or "").strip())[:220]
        out.append({"url": url, "alt": clean_alt or "Illustration from the linked source article"})

    for img in container.find_all("img", limit=80):
        if not isinstance(img, Tag):
            continue
        if img.find_parent(["aside", "nav", "footer", "header"]):
            continue
        w_attr = str(img.get("width") or "").strip()
        h_attr = str(img.get("height") or "").strip()
        if w_attr == "1" and h_attr == "1":
            continue
        src = str(img.get("src") or "").strip()
        srcset_first = _first_url_from_srcset(str(img.get("srcset") or ""))
        for candidate in (src, srcset_first):
            if candidate:
                consider(candidate, str(img.get("alt") or ""))
                if len(out) >= max_images:
                    break

    for pic in container.find_all("picture", limit=25):
        if pic.find_parent(["aside", "nav", "footer", "header"]):
            continue
        for src_el in pic.find_all("source", limit=6):
            if not isinstance(src_el, Tag):
                continue
            u = _first_url_from_srcset(str(src_el.get("srcset") or ""))
            if u:
                consider(u, "")
            if len(out) >= max_images:
                break

    return out


def extract_https_images_from_html(
    html_text: str,
    page_url: str,
    article_host: str,
    max_images: int,
) -> List[Dict[str, str]]:
    if not html_text or len(html_text) < 12:
        return []
    soup = BeautifulSoup(html_text, "html.parser")
    container = (
        soup.select_one("article")
        or soup.select_one("main")
        or soup.select_one('[role="main"]')
        or soup.select_one(".post__content, .post-content, .entry-content, .article-body, #content")
    )
    if container is None:
        container = soup.body or soup
    if not isinstance(container, Tag):
        return []
    _decompose_noise(container)
    return extract_https_images_from_soup(container, page_url, article_host, max_images)


def clean_body_text(text: str, max_chars: int = 12000) -> str:
    """Normalize whitespace and drop obvious boilerplate lines."""
    text = re.sub(r"\s+", " ", text or "").strip()
    if not text:
        return ""
    segments: List[str] = []
    for chunk in re.split(r"\s{2,}", text):
        chunk = chunk.strip()
        if len(chunk) < 28:
            continue
        if BOILERPLATE_START.search(chunk) or BOILERPLATE_SUBSTRING.search(chunk):
            continue
        segments.append(chunk)
    merged = " ".join(segments).strip()
    if len(merged) > max_chars:
        merged = merged[: max_chars - 1].rsplit(" ", 1)[0] + "…"
    return merged


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


def _decompose_noise(root: Tag) -> None:
    for sel in (
        "script",
        "style",
        "noscript",
        "svg",
        "form",
        "iframe",
        "nav",
        "footer",
        "header",
        "aside",
        "[role='navigation']",
        "[aria-modal='true']",
    ):
        for node in root.select(sel):
            node.decompose()


def extract_article_text_from_html(html_text: str) -> str:
    """Structured plain text from article HTML (RSS content:encoded or fetched page)."""
    if not html_text or len(html_text) < 12:
        return ""
    soup = BeautifulSoup(html_text, "html.parser")
    container = (
        soup.select_one("article")
        or soup.select_one("main")
        or soup.select_one('[role="main"]')
        or soup.select_one(".post__content, .post-content, .entry-content, .article-body, #content")
    )
    if container is None:
        container = soup.body or soup
    if not isinstance(container, Tag):
        return ""
    _decompose_noise(container)
    blocks: List[str] = []
    for el in container.find_all(["p", "h2", "h3", "blockquote", "li"], limit=120):
        if not isinstance(el, Tag):
            continue
        if el.find_parent(["aside", "nav", "footer", "header"]):
            continue
        text = el.get_text(" ", strip=True)
        if len(text) < 36:
            continue
        if BOILERPLATE_START.match(text) or BOILERPLATE_SUBSTRING.search(text):
            continue
        blocks.append(text)
    if not blocks:
        return clean_body_text(strip_html(html_text))
    return clean_body_text("\n\n".join(blocks))


def fetch_article_plain_and_images(
    url: str,
    article_host: str,
    max_images: int,
    timeout: Tuple[float, float] = (6.0, 14.0),
) -> Tuple[str, List[Dict[str, str]]]:
    """Single HTTP fetch: readable plain text plus allowlisted https images."""
    try:
        resp = SESSION.get(url, timeout=timeout)
        if resp.status_code != 200 or not resp.text:
            return "", []
        soup = BeautifulSoup(resp.text, "html.parser")
        container = (
            soup.select_one("article")
            or soup.select_one("main")
            or soup.select_one('[role="main"]')
            or soup.select_one(".post__content, .post-content, .entry-content, .article-body, #content, .post")
        )
        if container is None:
            divs = [d for d in soup.find_all("div") if isinstance(d, Tag)]
            if divs:
                container = max(divs, key=lambda d: len(d.get_text(" ", strip=True)), default=None)
        if container is None or not isinstance(container, Tag):
            container = soup.body or soup
        if not isinstance(container, Tag):
            return "", []
        _decompose_noise(container)
        imgs = extract_https_images_from_soup(container, url, article_host, max_images)
        parts: List[str] = []
        for el in container.find_all(["p", "h2", "h3", "blockquote", "li"], limit=100):
            if not isinstance(el, Tag):
                continue
            if el.find_parent(["aside", "nav", "footer", "header"]):
                continue
            text = el.get_text(" ", strip=True)
            if len(text) < 40:
                continue
            if BOILERPLATE_START.match(text) or BOILERPLATE_SUBSTRING.search(text):
                continue
            parts.append(text)
        plain = clean_body_text("\n\n".join(parts)) if parts else clean_body_text(container.get_text(" ", strip=True))
        return plain, imgs
    except Exception:  # noqa: BLE001
        return "", []


def _rss_item_raw_html(item: Element) -> str:
    enc = item.find(RSS_CONTENT_ENCODED)
    if enc is not None and (enc.text or "").strip():
        return (enc.text or "").strip()
    desc = item.findtext("description") or ""
    return desc.strip()


def _atom_entry_raw_html(entry: Element) -> str:
    content_el = entry.find("atom:content", ATOM_NS)
    if content_el is not None and (content_el.text or "").strip():
        return (content_el.text or "").strip()
    summary = entry.findtext("atom:summary", default="", namespaces=ATOM_NS) or ""
    return summary.strip()


def merge_image_lists(max_total: int, rss: List[Dict[str, str]], fetched: List[Dict[str, str]]) -> List[Dict[str, str]]:
    seen: set[str] = set()
    merged: List[Dict[str, str]] = []
    for lst in (rss, fetched):
        for item in lst:
            u = item.get("url") or ""
            if not u or u in seen:
                continue
            seen.add(u)
            merged.append({"url": u, "alt": item.get("alt") or "Illustration from the linked source article"})
            if len(merged) >= max_total:
                return merged
    return merged


def parse_feed(
    xml_blob: bytes,
    source: Dict[str, Any],
    fetch_full_article_when_below: int,
    max_article_images: int,
) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_blob)
    except ET.ParseError as exc:
        raise RuntimeError(f"Unable to parse XML for source {source['name']}: {exc}")

    items = root.findall("./channel/item")
    if items:
        for item in items:
            title = (item.findtext("title") or "Untitled").strip()
            link = (item.findtext("link") or "").strip()
            if not link:
                continue
            raw_html = _rss_item_raw_html(item)
            rss_plain = clean_body_text(extract_article_text_from_html(raw_html) or strip_html(raw_html))
            article_host = article_page_host(link)
            rss_images = extract_https_images_from_html(raw_html, link, article_host, max_article_images)
            description = rss_plain
            fetch_images: List[Dict[str, str]] = []
            if len(rss_plain) < fetch_full_article_when_below:
                fetched_text, fetch_images = fetch_article_plain_and_images(link, article_host, max_article_images)
                if fetched_text and len(fetched_text) > len(description):
                    description = fetched_text
            images = merge_image_lists(max_article_images, rss_images, fetch_images or [])
            pub_date = item.findtext("pubDate") or item.findtext("{http://purl.org/dc/elements/1.1/}date")
            results.append(
                {
                    "title": title,
                    "link": link,
                    "description": description,
                    "images": images,
                    "published_at": parse_date(pub_date),
                    "source_name": source["name"],
                    "source_weight": int(source.get("weight", 1)),
                    "category": source.get("category"),
                    "language": source.get("default_language", "en"),
                }
            )
        return results

    entries = root.findall("atom:entry", ATOM_NS)
    for entry in entries:
        title = (entry.findtext("atom:title", default="Untitled", namespaces=ATOM_NS) or "Untitled").strip()
        link_nodes = entry.findall("atom:link", ATOM_NS)
        link = ""
        for ln in link_nodes:
            rel = (ln.attrib.get("rel") or "alternate").strip()
            href = (ln.attrib.get("href") or "").strip()
            if href and rel in ("alternate", "http://www.iana.org/assignments/relation/alternate"):
                link = href
                break
        if not link:
            for ln in link_nodes:
                href = (ln.attrib.get("href") or "").strip()
                if href:
                    link = href
                    break
        if not link:
            continue
        raw_html = _atom_entry_raw_html(entry)
        rss_plain = clean_body_text(extract_article_text_from_html(raw_html) or strip_html(raw_html))
        article_host = article_page_host(link)
        rss_images = extract_https_images_from_html(raw_html, link, article_host, max_article_images)
        description = rss_plain
        fetch_images = []
        if len(rss_plain) < fetch_full_article_when_below:
            fetched_text, fetch_images = fetch_article_plain_and_images(link, article_host, max_article_images)
            if fetched_text and len(fetched_text) > len(description):
                description = fetched_text
        images = merge_image_lists(max_article_images, rss_images, fetch_images)
        published = entry.findtext("atom:published", default="", namespaces=ATOM_NS) or entry.findtext(
            "atom:updated", default="", namespaces=ATOM_NS
        )
        results.append(
            {
                "title": title,
                "link": link,
                "description": description,
                "images": images,
                "published_at": parse_date(published),
                "source_name": source["name"],
                "source_weight": int(source.get("weight", 1)),
                "category": source.get("category"),
                "language": source.get("default_language", "en"),
            }
        )
    return results


def score_item(item: Dict[str, Any], keyword_weights: Dict[str, int], now: datetime) -> float:
    text_blob = f"{item['title']} {item['description']}".lower()

    age_hours = max(0.0, (now - item["published_at"]).total_seconds() / 3600)
    freshness = max(0.0, 48.0 - (age_hours / 3.5))

    relevance = 0.0
    for keyword, weight in keyword_weights.items():
        if keyword.lower() in text_blob:
            relevance += float(weight)

    quality = 0.0
    content_len = len(item["description"])
    if content_len >= 120:
        quality += 7.0
    if content_len >= 320:
        quality += 5.0
    if content_len >= 900:
        quality += 4.0

    word_count = len(re.findall(r"\w+", item["description"]))
    if word_count >= 180:
        quality += 3.0

    source_weight = float(item.get("source_weight", 1)) * 6.0
    return round(freshness + relevance + quality + source_weight, 4)


def detect_language(text: str, fallback: str = "en") -> str:
    lowered = text.lower()
    if any(token in lowered for token in [" el ", " la ", " de ", " y ", " para "]) and any(
        token in lowered for token in [" que ", " una ", " con "]
    ):
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
                "q": text[:4800],
            }
        )
        url = f"https://translate.googleapis.com/translate_a/single?{query}"
        raw = safe_request(url, timeout=15, retries=2)
        payload = json.loads(raw.decode("utf-8"))
        translated_chunks: List[str] = []
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


def _leading_tokens_match(a: str, b: str, n_words: int = 12, min_equal: int = 6) -> bool:
    """True when opening tokens of a and b largely match (catches lede repeated under a new heading)."""
    aw = re.findall(r"\w+", (a or "").lower())[:n_words]
    bw = re.findall(r"\w+", (b or "").lower())[:n_words]
    if not aw or not bw:
        return False
    n = min(len(aw), len(bw), n_words)
    if n < 4:
        return False
    equal = sum(1 for i in range(n) if aw[i] == bw[i])
    return equal >= min_equal or equal >= max(5, int(0.62 * n))


def _high_word_overlap(sentence: str, reference: str, threshold: float = 0.56) -> bool:
    sw = set(re.findall(r"\w+", sentence.lower()))
    rw = set(re.findall(r"\w+", reference.lower()))
    if len(sw) < 8:
        return False
    return len(sw & rw) / len(sw) >= threshold


def _truncate_sentence(s: str, max_len: int = 175) -> str:
    s = (s or "").strip()
    if len(s) <= max_len:
        return s
    cut = s[: max_len - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def _clip_paragraph(text: str, max_chars: int = 620) -> str:
    text = text.strip()
    if len(text) <= max_chars:
        return text
    cut = text[: max_chars - 1].rsplit(" ", 1)[0]
    return cut + "…"


def _pick_supplementary_context(sentences: List[str], summary: str, max_chars: int = 380) -> str:
    """Pull one later sentence so 'Why this matters' does not repeat the lede/summary."""
    if not sentences:
        return ""
    picked: List[str] = []
    for idx, sent in enumerate(sentences):
        if idx == 0:
            continue
        s = sent.strip()
        if len(s) < 42:
            continue
        if _leading_tokens_match(s, summary):
            continue
        if _high_word_overlap(s, summary):
            continue
        picked.append(s)
        if len(picked) >= 1:
            break
    text = " ".join(picked).strip()
    if len(text) > max_chars:
        text = text[: max_chars - 1].rsplit(" ", 1)[0] + "…"
    return text


def _collect_why_angles(blob: str) -> List[str]:
    """Short interpretive sentences; blob must already be lowercased."""
    angles: List[str] = []
    if re.search(
        r"\b(security|breach|ransomware|ransom|hacked|hacking|hack|vulnerability|exploit|malware|cisa)\b",
        blob,
    ):
        angles.append(
            "It reframes risk for teams that automate sensitive workflows and rely on third-party data flows."
        )
    if re.search(
        r"\b(payment|payments|paytech|fintech|acquisition|acquires|acquired|merger|stripe|banking|wallet|processor)\b",
        blob,
    ):
        angles.append(
            "It shows how competitive moves and partnerships can reshuffle roadmaps for finance, fraud, and platform teams."
        )
    if re.search(
        r"\b(llm|chatgpt|openai|anthropic|gemini|copilot|machine learning|inference|foundational model)\b",
        blob,
    ):
        angles.append(
            "It is a useful datapoint for how AI-assisted engineering and operations are converging in production."
        )
    if re.search(
        r"\b(api|sdk|graphql|microservice|kubernetes|k8s|observability|workflow automation|integrations?)\b",
        blob,
    ):
        angles.append("It highlights where brittle integrations become operational debt as vendors iterate quickly.")
    if re.search(r"\b(regulation|regulator|lawsuit|antitrust|policy|congress|senate)\b", blob):
        angles.append(
            "It matters for compliance and go-to-market planning when the rules of the road for tech are still unsettled."
        )
    if not angles:
        angles.append("It helps prioritize where automation budgets and vendor reviews should focus next quarter.")
    return angles


def _extract_takeaway_sentences(body: str, summary: str, max_items: int = 3) -> List[str]:
    sentences = sentence_split(clean_body_text(body, max_chars=5500) or "")
    out: List[str] = []
    for s in sentences[1:18]:
        s = s.strip()
        if len(s) < 48:
            continue
        if _leading_tokens_match(s, summary, n_words=10, min_equal=5):
            continue
        if _high_word_overlap(s, summary, threshold=0.52):
            continue
        out.append(_truncate_sentence(s, 178))
        if len(out) >= max_items:
            break
    return out


def _heuristic_takeaways(lowered: str) -> List[str]:
    takeaways: List[str] = []
    if re.search(r"\b(api|sdk|graphql)\b", lowered) or re.search(r"\bintegrations?\b", lowered):
        takeaways.append("Inventory dependent integrations and add regression checks before you widen rollout.")
    if re.search(
        r"\b(security|compliance|breach|vulnerability|sso|oauth|zero trust)\b",
        lowered,
    ):
        takeaways.append("Pair technical changes with access reviews, logging, and an explicit rollback path.")
    if re.search(
        r"\b(llm|chatgpt|anthropic|openai|gemini|copilot|\bai agents?\b|agentic)\b",
        lowered,
    ):
        takeaways.append(
            "Pilot with a bounded workflow, human review, and metrics that prove latency and quality gains."
        )
    if re.search(r"\b(cloud|azure|aws|gcp|kubernetes|k8s)\b", lowered):
        takeaways.append("Map spend, quotas, and identity boundaries so new services do not sprawl unmanaged.")
    if re.search(r"\b(github|gitlab|devops|jenkins|terraform)\b", lowered) or re.search(
        r"\b(ci|cd)\s+(pipeline|system|workflow|runs?|jobs?)\b",
        lowered,
    ):
        takeaways.append(
            "Treat platform shifts as engineering-wide: update templates, docs, and onboarding paths together."
        )
    if re.search(
        r"\b(payment|payments|fraud|checkout|pricing|vendor|procurement|sla|contract)\b",
        lowered,
    ):
        takeaways.append(
            "Revisit commercial terms, SLAs, and failover paths when strategic rivals reshuffle partnerships."
        )
    return takeaways


def _bullets_similar(a: str, b: str) -> bool:
    aw = set(re.findall(r"\w+", a.lower()))
    bw = set(re.findall(r"\w+", b.lower()))
    if len(aw) < 6 or len(bw) < 6:
        return False
    return len(aw & bw) / min(len(aw), len(bw)) > 0.74


def make_summary(text: str, max_chars: int = 280) -> str:
    base = clean_body_text(text, max_chars=6000)
    sentences = sentence_split(base)
    if not sentences:
        return "A timely signal for teams tightening integrations, automation guardrails, and operational workflows."
    summary = " ".join(sentences[:3]).strip()
    if len(summary) > max_chars:
        summary = summary[: max_chars - 1].rstrip()
        if " " in summary:
            summary = summary.rsplit(" ", 1)[0]
        summary += "…"
    return summary


def make_takeaways(
    title: str,
    body: str,
    summary: str,
    why_for_dedupe: str = "",
    ml_bullets: List[str] | None = None,
) -> List[str]:
    """Blend extractive lines from the piece with a few tight, regex-gated heuristics."""
    lowered = f"{title} {body}".lower()
    why_l = (why_for_dedupe or "").lower()
    if ml_bullets is not None:
        extracted = [_truncate_sentence(b.strip(), 178) for b in ml_bullets if b and b.strip()]
    else:
        extracted = _extract_takeaway_sentences(body, summary)
    heuristics = _heuristic_takeaways(lowered)
    merged: List[str] = []
    for item in extracted + heuristics:
        item = item.strip()
        if not item:
            continue
        if why_l and (item.lower() in why_l or _high_word_overlap(item, why_for_dedupe, 0.48)):
            continue
        if any(_bullets_similar(item, existing) for existing in merged):
            continue
        merged.append(item)
        if len(merged) >= 3:
            break
    if len(merged) < 2:
        for filler in (
            "Start from the highest-friction manual process this story touches.",
            "Ship one measurable workflow experiment rather than a broad mandate.",
        ):
            if not any(_bullets_similar(filler, existing) for existing in merged):
                merged.append(filler)
            if len(merged) >= 2:
                break
    return merged[:3]


def make_why_it_matters(
    title: str,
    summary: str,
    body: str,
    context_sentence: str | None = None,
) -> str:
    blob = f"{title} {summary} {body}".lower()
    cleaned = clean_body_text(body, max_chars=4000) or summary
    sentences = sentence_split(cleaned)
    ctx = (context_sentence or "").strip()
    if ctx and (_leading_tokens_match(ctx, summary) or _high_word_overlap(ctx, summary)):
        ctx = ""
    supplementary = ctx or _pick_supplementary_context(sentences, summary)
    angles = _collect_why_angles(blob)
    primary = angles[0]
    secondary = angles[1] if len(angles) > 1 else ""

    if supplementary:
        parts = [supplementary, primary]
        if secondary and len(supplementary) + len(primary) < 300:
            parts.append(secondary)
        return _clip_paragraph(" ".join(parts).strip())

    if sentences:
        lead = sentences[0].strip()
        if not _leading_tokens_match(lead, summary) and not _high_word_overlap(lead, summary):
            parts = [_truncate_sentence(lead, 300), primary]
            if secondary:
                parts.append(secondary)
            return _clip_paragraph(" ".join(parts).strip())

    hook = (
        "It fills in incentives, timelines, and second-order effects that rarely survive the jump from headline to roadmap."
    )
    parts = [hook, primary]
    if secondary:
        parts.append(secondary)
    return _clip_paragraph(" ".join(parts).strip())


def estimate_reading_minutes(*text_parts: str) -> int:
    blob = " ".join(t for t in text_parts if t)
    words = len(re.findall(r"\w+", blob))
    return max(2, min(35, round(words / 220)))


def escape_html(text: str) -> str:
    return html.escape(text, quote=True)


def build_images_section(images: List[Dict[str, Any]]) -> str:
    if not images:
        return ""
    figures: List[str] = [
        '        <h2>Images from the source</h2>',
        '        <p class="img-disclaimer">HTTPS thumbnails linked for context; rights remain with the original publisher.</p>',
        '        <div class="figure-grid" role="group" aria-label="Images from the source article">',
    ]
    for im in images:
        url = escape_html(str(im.get("url") or ""))
        alt = escape_html(str(im.get("alt") or "Article illustration"))
        figures.append(
            f'          <figure class="src-fig">'
            f'<img src="{url}" alt="{alt}" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>'
        )
    figures.append("        </div>")
    return "\n".join(figures)


def render_post_html(metadata: Dict[str, Any]) -> str:
    takeaways_html = "\n".join(f"          <li>{escape_html(item)}</li>" for item in metadata["takeaways"])
    read_min = int(metadata.get("reading_minutes") or 1)
    category = escape_html(metadata.get("category") or "Automation Insights")
    images_html = build_images_section(list(metadata.get("images") or []))
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape_html(metadata['title'])} | TarsOnlineCafe</title>
  <meta name="description" content="{escape_html(metadata['summary'])}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles/themes.css">
  <link rel="stylesheet" href="/styles/nav.css">
  <style>
    body {{
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      background: var(--dark-roast, #2d221b);
      color: var(--foam, #f7efe2);
      line-height: 1.65;
      min-height: 100vh;
    }}
    .page-bg {{
      min-height: 100vh;
      background: radial-gradient(1200px 500px at 10% -10%, rgba(201, 169, 110, 0.18), transparent 55%),
                  radial-gradient(900px 400px at 90% 0%, rgba(161, 134, 111, 0.12), transparent 50%);
      padding: 5.5rem 1rem 4rem;
    }}
    .wrap {{
      max-width: 720px;
      margin: 0 auto;
    }}
    .article-shell {{
      background: rgba(45, 34, 27, 0.72);
      border: 1px solid rgba(247, 239, 226, 0.14);
      border-radius: 24px;
      padding: clamp(1.5rem, 4vw, 2.5rem);
      backdrop-filter: blur(14px);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
    }}
    .eyebrow {{
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--crema, #c9a96e);
      margin-bottom: 0.75rem;
    }}
    .meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem 1rem;
      align-items: center;
      font-size: 0.88rem;
      color: rgba(247, 239, 226, 0.78);
      margin-bottom: 1.25rem;
    }}
    .pill {{
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      border-radius: 999px;
      padding: 0.2rem 0.65rem;
      font-size: 0.72rem;
      font-weight: 500;
      border: 1px solid rgba(201, 169, 110, 0.45);
      color: var(--crema, #c9a96e);
      background: rgba(201, 169, 110, 0.1);
    }}
    h1 {{
      font-family: "DM Serif Display", Georgia, serif;
      font-size: clamp(1.75rem, 4.5vw, 2.45rem);
      line-height: 1.18;
      margin: 0 0 1rem;
      color: var(--foam, #f7efe2);
    }}
    .lede {{
      font-size: 1.05rem;
      color: var(--steamed-milk, #ede0cc);
      margin: 0 0 1.75rem;
    }}
    h2 {{
      font-size: 0.82rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--crema, #c9a96e);
      margin: 2rem 0 0.65rem;
      font-weight: 600;
    }}
    p {{
      margin: 0 0 1rem;
      color: rgba(237, 224, 204, 0.95);
    }}
    ul {{
      margin: 0 0 1rem;
      padding-left: 1.15rem;
    }}
    li {{
      margin-bottom: 0.55rem;
      color: rgba(237, 224, 204, 0.95);
    }}
    a {{
      color: var(--crema, #c9a96e);
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
    }}
    .source-row {{
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(247, 239, 226, 0.12);
      font-size: 0.92rem;
    }}
    .back {{
      display: inline-flex;
      margin-top: 1.5rem;
      align-items: center;
      gap: 0.35rem;
      color: var(--foam, #f7efe2);
      text-decoration: none;
      border: 1px solid rgba(247, 239, 226, 0.28);
      border-radius: 999px;
      padding: 0.5rem 1.1rem;
      font-size: 0.88rem;
      font-weight: 500;
      transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }}
    .back:hover {{
      border-color: var(--crema, #c9a96e);
      color: var(--crema, #c9a96e);
      transform: translateY(-1px);
    }}
    .img-disclaimer {{
      font-size: 0.82rem;
      color: rgba(247, 239, 226, 0.65);
      margin: -0.25rem 0 0.85rem;
    }}
    .figure-grid {{
      display: grid;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }}
    .src-fig {{
      margin: 0;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid rgba(247, 239, 226, 0.1);
      background: rgba(26, 17, 8, 0.45);
    }}
    .src-fig img {{
      display: block;
      width: 100%;
      height: auto;
      max-height: 420px;
      object-fit: contain;
      background: rgba(0, 0, 0, 0.2);
    }}
  </style>
</head>
<body>
  <nav class="site-nav scrolled" role="navigation" aria-label="Main navigation">
    <a href="/" class="nav-logo" aria-label="TarsOnlineCafe home">
      <span class="nav-logo-icon">☕</span>
      <span>TarsOnlineCafe</span>
    </a>
    <ul class="nav-links">
      <li><a href="/">Portfolio</a></li>
      <li><a href="/blog/blog.html" class="active">Blog</a></li>
    </ul>
    <a href="/#contact" class="nav-cta">Let's Talk →</a>
  </nav>

  <div class="page-bg">
    <main class="wrap">
      <article class="article-shell">
        <div class="eyebrow">Automation brief</div>
        <div class="meta">
          <span class="pill">{category}</span>
          <span class="pill">~{read_min} min read</span>
          <span>{escape_html(metadata['date'])}</span>
          <span>{escape_html(metadata['source_name'])}</span>
        </div>
        <h1>{escape_html(metadata['title'])}</h1>
        <p class="lede">{escape_html(metadata['summary'])}</p>

{images_html}

        <h2>Why this matters</h2>
        <p>{escape_html(metadata['why_it_matters'])}</p>

        <h2>Operational takeaways</h2>
        <ul>
{takeaways_html}
        </ul>

        <div class="source-row">
          <strong style="color: var(--crema, #c9a96e); font-weight: 600;">Primary source</strong><br />
          <a href="{escape_html(metadata['source_url'])}" target="_blank" rel="noopener noreferrer">{escape_html(metadata['source_name'])} — original article</a>
        </div>

        <a class="back" href="/blog/blog.html">← Back to journal</a>
      </article>
    </main>
  </div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate automated blog posts from allowlisted RSS feeds")
    parser.add_argument("--max-posts", type=int, default=1)
    parser.add_argument("--min-score", type=float, default=34.0)
    parser.add_argument("--min-summary-length", type=int, default=120)
    parser.add_argument("--min-description-length", type=int, default=200)
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
    allowed_domains = [normalize_domain(d) for d in config.get("allowed_domains", []) if normalize_domain(d)]

    quality_gate = config.get("quality_gate", {})
    min_score = float(quality_gate.get("min_score", args.min_score))
    min_summary_length = int(quality_gate.get("min_summary_length", args.min_summary_length))
    min_description_length = int(quality_gate.get("min_description_length", args.min_description_length))
    min_keyword_hits = int(quality_gate.get("min_keyword_hits", args.min_keyword_hits))
    fetch_full_when_below = int(quality_gate.get("fetch_full_article_when_rss_chars_below", 900))
    max_article_images = int(quality_gate.get("max_article_images", 6))
    extractive_cfg = config.get("extractive_engine") or {}
    extractive_on = bool(extractive_cfg.get("enabled"))

    fetched = 0
    candidates: List[Dict[str, Any]] = []
    source_failures: List[Dict[str, str]] = []

    for source in config.get("sources", []):
        try:
            if not is_domain_allowed(source["url"], allowed_domains):
                source_failures.append({"source": source.get("name", "unknown"), "error": "blocked-source-domain"})
                continue
            xml_blob = safe_request(source["url"])
            entries = parse_feed(xml_blob, source, fetch_full_when_below, max_article_images)
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
            item["title"].lower(),
        ),
        reverse=True,
    )

    selected = [item for item in unseen_candidates if item["score"] >= min_score][: args.max_posts]

    generated = []
    skipped = []

    for item in selected:
        ml_pack: Dict[str, Any] | None = None
        raw_description = item["description"] or ""
        detected_language = detect_language(f"{item['title']} {raw_description}", fallback=item.get("language", "en"))
        translated_description = translate_to_english(raw_description, detected_language)
        scored_blob = f"{item['title']} {translated_description}".lower()

        cleaned_body = clean_body_text(translated_description, max_chars=6000)
        if extractive_on:
            ml_pack = blog_extractive_engine.compose_post_fields(
                item["title"].strip(),
                cleaned_body,
                extractive_cfg,
            )
        if ml_pack and len(ml_pack.get("summary") or "") >= min_summary_length:
            summary = str(ml_pack["summary"])
            ml_ctx = (ml_pack.get("context_sentence") or "").strip() or None
            ml_take: List[str] | None = list(ml_pack.get("takeaway_sentences") or [])
        else:
            summary = make_summary(translated_description)
            ml_ctx = None
            ml_take = None

        why_it_matters = make_why_it_matters(
            item["title"], summary, translated_description, context_sentence=ml_ctx
        )
        slug = make_slug(item["title"], item["published_at"], item["link"])
        file_name = f"{slug}.html"
        file_path = AUTO_DIR / file_name

        post_title = item["title"].strip()
        takeaways = make_takeaways(
            item["title"],
            translated_description,
            summary,
            why_it_matters,
            ml_bullets=ml_take,
        )
        post_date = item["published_at"].strftime("%Y-%m-%d")
        reading_minutes = estimate_reading_minutes(post_title, summary, why_it_matters, " ".join(takeaways))
        images = list(item.get("images") or [])
        hero_image = images[0]["url"] if images else ""

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
            "takeaways": takeaways,
            "reading_minutes": reading_minutes,
            "images": images,
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
            entry: Dict[str, Any] = {
                "title": metadata["title"],
                "date": metadata["date"],
                "category": metadata["category"],
                "summary": metadata["summary"],
                "link": metadata["link"],
                "source_url": metadata["source_url"],
                "source_name": metadata["source_name"],
                "automated": True,
                "language": "en",
                "reading_minutes": reading_minutes,
            }
            if hero_image:
                entry["hero_image"] = hero_image
            auto_posts.append(entry)
            published_signatures.add(item["signature"])

        gen_entry: Dict[str, Any] = {
            "title": metadata["title"],
            "link": metadata["link"],
            "score": metadata["score"],
            "source": metadata["source_name"],
        }
        if ml_pack is not None:
            gen_entry["text_engine"] = ml_pack.get("engine")
        generated.append(gen_entry)

    if not args.dry_run:
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
        "extractive_engine": {
            "enabled": extractive_on,
            "embedding_model_configured": bool((extractive_cfg.get("embedding_model") or "").strip()),
        },
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
        "fetch_full_article_when_rss_chars_below": fetch_full_when_below,
        "allowed_domains": allowed_domains,
        "max_posts": args.max_posts,
    }

    write_json(report_path, report)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())

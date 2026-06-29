"""Patch existing auto blog HTML files to use shared site-atmosphere layer."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
AUTO_DIR = ROOT / "blog" / "auto"

ATMOSPHERE_BLOCK = """  <div class="site-atmosphere" aria-hidden="true">
    <div class="site-atmosphere__glow site-atmosphere__glow--1"></div>
    <div class="site-atmosphere__glow site-atmosphere__glow--2"></div>
    <div class="site-atmosphere__glow site-atmosphere__glow--3"></div>
    <div class="site-atmosphere__grain"></div>
  </div>
  <div id="canvas-container"></div>
"""

CSS_LINK = '  <link rel="stylesheet" href="/styles/site-atmosphere.css">\n'
SCRIPT_TAG = '  <script defer src="/scripts/site-atmosphere.js"></script>\n'

PAGE_BG_PATTERN = re.compile(
    r"(\.page-bg\s*\{\s*min-height:\s*100vh;\s*)"
    r"background:\s*radial-gradient\([^;]+\),\s*"
    r"radial-gradient\([^;]+\);\s*",
    re.DOTALL,
)

BODY_BG_PATTERN = re.compile(
    r"background:\s*var\(--dark-roast,\s*#2d221b\);",
)


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    if "/styles/site-atmosphere.css" not in text:
        text = text.replace(
            '  <link rel="stylesheet" href="/styles/nav.css">',
            CSS_LINK + '  <link rel="stylesheet" href="/styles/nav.css">',
            1,
        )

    if 'class="site-atmosphere"' not in text:
        text = text.replace("<body>\n", "<body>\n" + ATMOSPHERE_BLOCK, 1)

    text = PAGE_BG_PATTERN.sub(r"\1", text)
    text = BODY_BG_PATTERN.sub("background: var(--espresso, #1a1108);", text)

    if "/scripts/site-atmosphere.js" not in text:
        text = text.replace(
            '  <script defer src="/scripts/nav.js"></script>',
            SCRIPT_TAG + '  <script defer src="/scripts/nav.js"></script>',
            1,
        )

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    updated = sum(1 for p in AUTO_DIR.glob("*.html") if patch_file(p))
    print(f"Patched {updated} auto blog posts")


if __name__ == "__main__":
    main()

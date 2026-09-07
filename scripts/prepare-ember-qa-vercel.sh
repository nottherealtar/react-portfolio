#!/usr/bin/env bash
# Deploy self-contained Ember QA to Vercel via MCP/CLI-friendly file tree.
# Critical: api/ must sit at project ROOT (serverless), static site in public/.
# If Hobby api-deployments-free-per-day is exhausted, from the output dir run:
#   vercel deploy --temporary --yes
# then claim the printed URL into tarsonline-ember-qa (see mockup/QA.md).
set -euo pipefail

SHA="${1:-$(git -C "$(dirname "$0")/.." rev-parse HEAD)}"
REPO="${REPO:-nottherealtar/react-portfolio}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/.tmp-ember-qa-vercel"
RAW="https://raw.githubusercontent.com/${REPO}/${SHA}/ember-qa"
CDN="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/ember-qa"

rm -rf "$OUT"
mkdir -p "$OUT/public/assets" "$OUT/api"

fetch() {
  local rel="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  if curl -fsSL "$RAW/$rel" -o "$dest"; then
    echo "ok raw $rel -> $dest"
  elif curl -fsSL "$CDN/$rel" -o "$dest"; then
    echo "ok cdn $rel -> $dest"
  else
    echo "FAIL $rel" >&2
    exit 1
  fi
}

# Static site → public/
for f in index.html ember.html 404.html robots.txt sitemap.xml favicon.svg icons.svg logo.png package.json; do
  fetch "$f" "$OUT/public/$f"
done

# Resolve actual hashed asset names from index.html
python3 - <<PY
from pathlib import Path
import re, urllib.request, os, sys
out = Path("$OUT")
html = (out / "public" / "index.html").read_text(encoding="utf-8")
assets = sorted(set(re.findall(r"(?:\\./)?assets/([A-Za-z0-9._-]+)", html)))
print("assets from html:", assets)
raw = "$RAW"
cdn = "$CDN"
for name in assets:
    dest = out / "public" / "assets" / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    ok = False
    for base in (raw, cdn):
        try:
            data = urllib.request.urlopen(f"{base}/assets/{name}", timeout=60).read()
            dest.write_bytes(data)
            print("ok", name, len(data))
            ok = True
            break
        except Exception as e:
            last = e
    if not ok:
        print("FAIL asset", name, last, file=sys.stderr)
        sys.exit(1)
# Also pull EmberField chunk referenced by main bundle if present on GH listing — from import in js is hashed; fetch sibling files listed in ember-qa on GitHub via known names in repo.
PY

# Pull any remaining assets present on the SHA (EmberField chunk)
python3 - <<PY
from pathlib import Path
import urllib.request, re, json
# Use GitHub API contents? fallback: parse main js for EmberField-
js = next(Path("$OUT/public/assets").glob("ember-*.js"), None)
if js:
    text = js.read_text(encoding="utf-8", errors="ignore")
    # dynamic import("./EmberField-XXXX.js")
    m = re.findall(r"EmberField-[A-Za-z0-9_-]+\\.js", text)
    for name in sorted(set(m)):
        dest = Path("$OUT/public/assets") / name
        if dest.exists():
            continue
        for base in ("$RAW", "$CDN"):
            try:
                data = urllib.request.urlopen(f"{base}/assets/{name}", timeout=90).read()
                dest.write_bytes(data)
                print("ok chunk", name, len(data))
                break
            except Exception as e:
                print("skip", name, e)
PY

# Serverless API at project root (NOT under public/)
fetch "api/submit-contact.js" "$OUT/api/submit-contact.js"
# vercel.json at project root
fetch "vercel.json" "$OUT/vercel.json"

# Root package + build noop (files already assembled)
cat > "$OUT/package.json" <<'EOF'
{
  "name": "ember-qa-deploy",
  "private": true
}
EOF

# Sanity
grep -q 'data-prerendered="true"' "$OUT/public/index.html"
test -s "$OUT/api/submit-contact.js"
test -s "$OUT/public/logo.png"
echo "Prepared $OUT for SHA=$SHA"
find "$OUT" -type f | sort | sed "s|$OUT/||"

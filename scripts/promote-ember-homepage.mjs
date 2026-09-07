#!/usr/bin/env node
/**
 * Copies a whitelist from dist-promote/ into the repo root for homepage cutover.
 * NEVER touches: blog/, styles/, scripts/, api/, robots.txt, sitemap.xml, package.json, vercel.json, globe/
 *
 * Usage (after `npm run build:promote` in mockup/):
 *   node scripts/promote-ember-homepage.mjs [--dry-run]
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'dist-promote')
const dry = process.argv.includes('--dry-run')

if (!existsSync(join(src, 'ember.html')) && !existsSync(join(src, 'index.html'))) {
  console.error('dist-promote missing. Run: cd mockup && npm run build:promote')
  process.exit(1)
}

const htmlName = existsSync(join(src, 'index.html')) ? 'index.html' : 'ember.html'
let html = readFileSync(join(src, htmlName), 'utf8')

// Promote must be indexable
html = html.replace(/\s*<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/?>/i, '')
html = html.replace(/\s*<!--\s*QA \/ preview only[\s\S]*?-->/i, '')

if (!html.includes('data-prerendered="true"')) {
  console.error('Refuse to promote: HTML is not prerendered. Check prerender plugin.')
  process.exit(1)
}

const textLen = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim().length

if (textLen < 2000) {
  console.error(`Refuse to promote: static text too thin (${textLen} chars). Expected prerendered body copy.`)
  process.exit(1)
}

const steps = []
steps.push({ action: 'write', to: 'index.html', note: `from ${htmlName}, noindex stripped, ${textLen} text chars` })

const assetsDir = join(src, 'assets')
if (existsSync(assetsDir)) {
  steps.push({ action: 'cp', from: 'assets', to: 'assets', note: 'hashed vite bundles' })
}

for (const f of ['logo.png', 'favicon.svg', 'icons.svg']) {
  if (existsSync(join(src, f))) steps.push({ action: 'copy', from: f, to: f })
}

console.log(dry ? 'DRY RUN — would:' : 'Promoting:')
for (const s of steps) {
  console.log(`- ${s.action}: ${s.to}${s.note ? ` (${s.note})` : ''}`)
  if (dry) continue
  if (s.action === 'write') {
    writeFileSync(join(root, 'index.html'), html)
  } else if (s.action === 'cp') {
    mkdirSync(join(root, s.to), { recursive: true })
    cpSync(join(src, s.from), join(root, s.to), { recursive: true })
  } else if (s.action === 'copy') {
    copyFileSync(join(src, s.from), join(root, s.to))
  }
}

console.log(
  dry
    ? 'Dry run complete. Re-run without --dry-run after review.'
    : 'Done. Verify /blog/**, robots.txt, sitemap.xml untouched. Do NOT commit ember-qa robots/sitemap.',
)

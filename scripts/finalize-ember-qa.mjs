import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const qa = resolve(root, 'ember-qa')
const apiSrc = resolve(root, 'api/submit-contact.js')

mkdirSync(resolve(qa, 'api'), { recursive: true })
if (existsSync(apiSrc)) {
  copyFileSync(apiSrc, resolve(qa, 'api/submit-contact.js'))
}

copyFileSync(resolve(qa, 'ember.html'), resolve(qa, 'index.html'))

writeFileSync(
  resolve(qa, 'package.json'),
  `${JSON.stringify({ name: 'ember-qa', private: true, type: 'module' }, null, 2)}\n`,
)

writeFileSync(
  resolve(qa, 'vercel.json'),
  `${JSON.stringify(
    {
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            {
              key: 'Permissions-Policy',
              value:
                'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
            },
          ],
        },
        {
          source: '/assets/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ],
    },
    null,
    2,
  )}\n`,
)

if (!existsSync(resolve(qa, 'robots.txt'))) {
  writeFileSync(
    resolve(qa, 'robots.txt'),
    '# Ember QA preview — do not index until production cutover.\nUser-agent: *\nDisallow: /\n',
  )
}

writeFileSync(
  resolve(qa, 'sitemap.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tarsonlinecafe.work/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.tarsonlinecafe.work/#about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.tarsonlinecafe.work/#work</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.tarsonlinecafe.work/#contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.tarsonlinecafe.work/blog/blog.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
`,
)

const fourOhFour = resolve(qa, '404.html')
if (!existsSync(fourOhFour) || readFileSync(fourOhFour, 'utf8').length < 100) {
  writeFileSync(
    fourOhFour,
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>404 — Page not found | Joshua Coetzer</title>
    <meta name="description" content="That page does not exist. Head back to the portfolio or blog." />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="https://www.tarsonlinecafe.work/404.html" />
    <link rel="icon" href="./logo.png" type="image/png" />
    <meta name="theme-color" content="#050403" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
    <style>
      :root { --void:#050403; --foam:#f3ebe3; --copper:#d4895a; }
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 2rem;
        font-family: Figtree, system-ui, sans-serif; color: var(--foam);
        background:
          radial-gradient(900px 480px at 12% -10%, rgba(212,137,90,.16), transparent 55%),
          radial-gradient(700px 400px at 88% 8%, rgba(80,50,30,.35), transparent 50%),
          var(--void);
      }
      main { max-width: 28rem; text-align: center; }
      p.kicker { letter-spacing: .14em; text-transform: uppercase; font-size: .75rem; opacity: .7; margin: 0 0 .75rem; }
      h1 { font-family: Syne, Figtree, sans-serif; font-size: clamp(2.5rem, 8vw, 4rem); margin: 0 0 .75rem; line-height: 1.05; }
      p { margin: 0 0 1.5rem; line-height: 1.55; opacity: .88; }
      a {
        display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
        padding: .65rem 1.15rem; border-radius: 999px; background: var(--copper); color: #1a1108;
        font-weight: 600; text-decoration: none;
      }
      a.secondary { margin-left: .5rem; background: transparent; color: var(--foam); border: 1px solid rgba(243,235,227,.35); }
    </style>
  </head>
  <body>
    <main>
      <p class="kicker">404</p>
      <h1>Page not found</h1>
      <p>That URL doesn’t exist on this build. Head home or open the blog.</p>
      <p>
        <a href="./">Back home</a>
        <a class="secondary" href="/blog/blog.html">Blog</a>
      </p>
    </main>
  </body>
</html>
`,
  )
}

console.log('ember-qa finalized')

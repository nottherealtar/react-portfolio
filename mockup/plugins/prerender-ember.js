import { build as viteBuild } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Build-time prerender for Ember homepage only.
 * Injects renderToString(App) into built ember.html (#root).
 * Disable with EMBER_PRERENDER=0.
 */
export function prerenderEmber() {
  /** @type {import('vite').ResolvedConfig | null} */
  let resolved = null

  return {
    name: 'prerender-ember',
    apply: 'build',
    configResolved(config) {
      resolved = config
    },
    async closeBundle() {
      if (process.env.EMBER_PRERENDER === '0') {
        resolved?.logger.info('[prerender-ember] skipped (EMBER_PRERENDER=0)')
        return
      }
      if (!resolved) throw new Error('[prerender-ember] missing resolved config')

      const outDir = resolved.build.outDir
      const emberHtmlPath = join(outDir, 'ember.html')
      if (!existsSync(emberHtmlPath)) {
        resolved.logger.warn('[prerender-ember] ember.html not found in outDir — skip')
        return
      }

      const scratch = resolve(resolved.root, 'node_modules/.ember-prerender')
      rmSync(scratch, { recursive: true, force: true })
      mkdirSync(scratch, { recursive: true })

      const base = resolved.base || '/'

      await viteBuild({
        configFile: false,
        root: resolved.root,
        mode: 'production',
        plugins: [react()],
        define: {
          'import.meta.env.BASE_URL': JSON.stringify(base),
          'import.meta.env.MODE': JSON.stringify('production'),
          'import.meta.env.DEV': JSON.stringify(false),
          'import.meta.env.PROD': JSON.stringify(true),
          'import.meta.env.SSR': JSON.stringify(true),
        },
        build: {
          ssr: true,
          outDir: scratch,
          emptyOutDir: true,
          rollupOptions: {
            input: resolve(resolved.root, 'src/variants/ember/entry-server.jsx'),
            output: {
              entryFileNames: 'entry-server.mjs',
              format: 'esm',
            },
          },
        },
        logLevel: 'warn',
      })

      const entryPath = join(scratch, 'entry-server.mjs')
      const mod = await import(`${pathToFileURL(entryPath).href}?t=${Date.now()}`)
      if (typeof mod.render !== 'function') {
        throw new Error('[prerender-ember] entry-server must export render()')
      }

      let markup = mod.render()
      const headBits = []
      markup = markup.replace(/^(?:\s*<(?:link|meta|title)\b[^>]*>)+/i, (m) => {
        headBits.push(m.trim())
        return ''
      })

      let html = readFileSync(emberHtmlPath, 'utf8')
      if (html.includes('data-prerendered="true"')) {
        resolved.logger.info('[prerender-ember] already prerendered — skip')
        return
      }

      if (!html.includes('<div id="root"></div>')) {
        throw new Error('[prerender-ember] expected empty <div id="root"></div> in ember.html')
      }

      html = html.replace(
        '<div id="root"></div>',
        `<div id="root" data-prerendered="true">${markup}</div>`,
      )

      if (headBits.length) {
        html = html.replace('</head>', `${headBits.join('\n')}\n</head>`)
      }

      // No-JS / pre-hydration: force Reveal/hero initial opacity styles visible
      if (!html.includes('id="ember-prerender-noscript"')) {
        html = html.replace(
          '</head>',
          `<noscript id="ember-prerender-noscript"><style>#root [style*="opacity:0"],#root [style*="opacity: 0"]{opacity:1!important;transform:none!important;filter:none!important}</style></noscript>\n</head>`,
        )
      }

      writeFileSync(emberHtmlPath, html)
      const indexPath = join(outDir, 'index.html')
      // QA finalize copies ember→index later; for promote/outDir that already has index, sync now
      if (existsSync(indexPath) && !readFileSync(indexPath, 'utf8').includes('data-prerendered')) {
        // leave to finalize for ember-qa; for multi-page redesign leave ember.html only
      }

      resolved.logger.info(
        `[prerender-ember] injected ${markup.length} chars into ${emberHtmlPath.replace(resolved.root, '.')}`,
      )

      // Keep scratch for debugging unless CI
      if (process.env.CI) rmSync(scratch, { recursive: true, force: true })
    },
  }
}

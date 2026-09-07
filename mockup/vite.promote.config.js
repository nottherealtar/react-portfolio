import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prerenderEmber } from './plugins/prerender-ember.js'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * Production homepage promote build.
 * - base: '/' so assets resolve from site root
 * - emptyOutDir: false — NEVER wipe blog/, styles/, api/, etc.
 * - Writes only into dist-promote/; a separate script copies a whitelist to repo root
 */
export default defineConfig({
  plugins: [react(), prerenderEmber()],
  base: '/',
  build: {
    outDir: resolve(root, '../dist-promote'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, 'ember.html'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prerenderEmber } from './plugins/prerender-ember.js'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react(), prerenderEmber()],
  base: '/redesign/',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: '../redesign',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        ember: resolve(root, 'ember.html'),
        frost: resolve(root, 'frost.html'),
        signal: resolve(root, 'signal.html'),
        stage: resolve(root, 'stage.html'),
        lattice: resolve(root, 'lattice.html'),
        hybrid: resolve(root, 'hybrid.html'),
      },
    },
  },
})

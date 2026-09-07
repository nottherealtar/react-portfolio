import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: resolve(root, '../ember-qa'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        ember: resolve(root, 'ember.html'),
      },
    },
  },
})

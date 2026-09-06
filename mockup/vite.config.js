import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
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
        main: resolve(__dirname, 'index.html'),
        ember: resolve(__dirname, 'ember.html'),
        frost: resolve(__dirname, 'frost.html'),
        signal: resolve(__dirname, 'signal.html'),
        stage: resolve(__dirname, 'stage.html'),
        lattice: resolve(__dirname, 'lattice.html'),
        hybrid: resolve(__dirname, 'hybrid.html'),
      },
    },
  },
})

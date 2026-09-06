import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  },
})

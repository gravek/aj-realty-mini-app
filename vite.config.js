// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
  define: {
    global: 'globalThis',
    // Прямая поддержка VITE_ переменных
    'import.meta.env.VITE_YANDEX_MAPS_KEY': JSON.stringify(process.env.VITE_YANDEX_MAPS_KEY || ''),
  },
})
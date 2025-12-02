// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения для текущего режима
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
      // Используем глобальный объект для совместимости
      global: 'globalThis',
    },
    // Предзагружаем переменные для production
    ...(mode === 'production' && {
      envPrefix: 'VITE_',
    }),
  }
})
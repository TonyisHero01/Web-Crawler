import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // ✅ 关键点：让 Vite 监听所有 IP
    proxy: {
      '/api': {
        target: 'http://server:3000',
        changeOrigin: true,
      },
      '/graphql': {
        target: 'http://server:3000',
        changeOrigin: true,
      },
    },
  },
})
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
    proxy: {
      '/dev': {
        target: 'http://localhost:3000',  
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev/, ''),
      },
    }
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'



// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
   server: {
    proxy: {
      '/api/': {
        target: 'http://localhost:8080', // 你的后端服务器地址
        changeOrigin: true // 必须设置为true，才能代理到不同的域名
      }
    }
  },
})

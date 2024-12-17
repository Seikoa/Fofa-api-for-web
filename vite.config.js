import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    proxy: {
      '^/api/.*': {
        target: 'https://fofa.red',
        changeOrigin: true,
        secure: false,
        ws: true,
        xfwd: true,
        followRedirects: true,
        onProxyReq: (proxyReq, req) => {
          proxyReq.setHeader('Referer', 'https://fofa.red')
          proxyReq.setHeader('Origin', 'https://fofa.red')
          proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        },
        onProxyRes: (proxyRes, req, res) => {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*'
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        }
      }
    }
  }
}) 
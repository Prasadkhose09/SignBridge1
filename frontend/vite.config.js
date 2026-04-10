import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/sign-language': {
        target: 'http://localhost:8080',
        changeOrigin: true
        // Removed rewrite so the request goes to http://localhost:8080/api/sign-language
      },
      '/api/python': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/python/, '')
      }
    }
  }
})

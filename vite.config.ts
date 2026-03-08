import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Check if SSL certificates exist (only for local development)
const sslKeyPath = path.resolve(__dirname, '../wingtime-api/server.key')
const sslCertPath = path.resolve(__dirname, '../wingtime-api/server.crt')
const useHttps = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // Enable HTTPS if certificates are available
    https: useHttps
      ? {
          key: fs.readFileSync(sslKeyPath),
          cert: fs.readFileSync(sslCertPath)
        }
      : false,
    // Proxy /api requests to the backend to avoid mixed-content issues
    // when the dev server is running over HTTPS
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

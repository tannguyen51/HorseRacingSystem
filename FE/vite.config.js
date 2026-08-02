import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_API_BASE_URL || 'http://localhost:5226';
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

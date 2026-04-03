import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || '';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: apiBaseUrl
        ? { '/api': { target: apiBaseUrl, changeOrigin: true, secure: false } }
        : { '/api': 'http://localhost:4000' }
    }
  };
});


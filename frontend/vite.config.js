import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request the frontend makes to /api/* is forwarded to the
      // Node backend. The browser only ever talks to localhost:5173,
      // so this is same-origin from its point of view — no CORS
      // preflight is triggered at all.
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true
      }
    }
  }
});
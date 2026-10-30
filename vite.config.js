import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward API calls to the Roda backend (backend/) during development
    proxy: {
      '/api': process.env.API_PROXY ?? 'http://localhost:9393',
    },
  },
});

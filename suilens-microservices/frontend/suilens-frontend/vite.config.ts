import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/lenses': 'http://localhost:3001',
      '/api/orders': 'http://localhost:3002',
      '/api/inventory': 'http://localhost:3004',
    },
  },
});

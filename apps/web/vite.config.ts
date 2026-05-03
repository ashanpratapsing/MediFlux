import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@mediflux/types': path.resolve(__dirname, '../../packages/types'),
      '@mediflux/api': path.resolve(__dirname, '../../services/api/src'),
      '@mediflux/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@mediflux/auth': path.resolve(__dirname, '../../store/auth'),
      '@mediflux/firebase': path.resolve(__dirname, '../../services/firebase'),
      '@mediflux/websocket': path.resolve(__dirname, '../../services/websocket')
    }
  },
  server: {
    port: 3010,
    strictPort: true,
    fs: {
      allow: ['..', '../../packages', '../../services', '../../store', '../../node_modules']
    }
  }
});

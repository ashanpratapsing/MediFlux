import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'analytics_mf',
      filename: 'remoteEntry.js',
      exposes: {
        './AnalyticsDashboard': './src/AnalyticsDashboard.tsx',
      },
      shared: ['react', 'react-dom', '@tanstack/react-query', '@mediflux/api', '@mediflux/ui']
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '@mediflux/types': path.resolve(__dirname, '../../packages/types'),
      '@mediflux/api': path.resolve(__dirname, '../../services/api/src'),
      '@mediflux/ui': path.resolve(__dirname, '../../packages/ui/src')
    }

  },
  server: {
    port: 3001,
    strictPort: true,
    cors: true,
    fs: {
      allow: ['..', '../../packages', '../../services', '../../store', '../../node_modules']
    }
  },
  preview: {
    port: 3001,
    strictPort: true,
    cors: true
  }
});

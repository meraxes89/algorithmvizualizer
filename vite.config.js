import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { alias } from './vite.aliases.ts';

export default defineConfig(({ mode }) => ({
  base: process.env.GITHUB_PAGES === 'true' ? '/algorithmvizualizer/' : '/',
  plugins: [react()],
  resolve: {
    alias,
  },
  server: {
    host: true,
  },
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
  build: {
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@monaco-editor')) return 'monaco';
          if (id.includes('/three/')) return 'three';
          if (
            id.includes('framer-motion') ||
            id.includes('/motion-dom/') ||
            id.includes('/motion-utils/')
          ) {
            return 'framer-motion';
          }
          if (id.includes('lucide-react')) return 'lucide';
          return undefined;
        },
      },
    },
  },
}));

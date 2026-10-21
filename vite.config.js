import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const src = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ mode }) => ({
  base: process.env.GITHUB_PAGES === 'true' ? '/algorithmvizualizer/' : '/',
  plugins: [react()],
  resolve: {
    // Mirrors the `paths` block in tsconfig.json. The list form uses
    // @rollup/plugin-alias matching, so `@core` never swallows `@components`.
    alias: [
      { find: '@core', replacement: src('./src/core') },
      { find: '@registry', replacement: src('./src/registry') },
      { find: '@algorithms', replacement: src('./src/algorithms') },
      { find: '@components', replacement: src('./src/components') },
      { find: '@hooks', replacement: src('./src/hooks') },
      { find: '@data', replacement: src('./src/data') },
    ],
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

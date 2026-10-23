import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { alias } from './vite.aliases';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The same aliases the app build uses, so a test can import a module
    // by the same path the source does.
    alias,
  },
  test: {
    // jsdom everywhere: component tests need it, and unit tests are
    // unaffected by the extra environment.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],

    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],

    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',

      // The gate covers the typed surface: src/algorithms, src/core and
      // src/registry. Legacy `.js` modules are excluded until they are
      // ported to TypeScript — each port pulls its file into the gate,
      // so the threshold tightens as the migration proceeds.
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.d.ts', 'src/test/**', 'src/**/*.test.ts', 'src/**/*.test.tsx'],

      // Ratchet upward one point at a time as files are ported and tested.
      // Never lower a threshold to make a pull request green.
      thresholds: {
        statements: 87,
        branches: 87,
        functions: 87,
        lines: 87,
      },
    },
  },
});

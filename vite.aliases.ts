import { fileURLToPath } from 'node:url';

/**
 * The path aliases shared by the Vite build, the Vitest runner and the
 * TypeScript compiler.
 *
 * They have to live in one place: `vitest.config.ts` replaces
 * `vite.config.ts` rather than merging with it, so an alias that only
 * existed in the Vite config would resolve in the app and fail in the
 * tests.
 *
 * The list form uses @rollup/plugin-alias matching, so `@core` never
 * swallows `@components`.
 */
export const alias = [
  { find: '@core', replacement: fileURLToPath(new URL('./src/core', import.meta.url)) },
  { find: '@registry', replacement: fileURLToPath(new URL('./src/registry', import.meta.url)) },
  { find: '@algorithms', replacement: fileURLToPath(new URL('./src/algorithms', import.meta.url)) },
  { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
  { find: '@hooks', replacement: fileURLToPath(new URL('./src/hooks', import.meta.url)) },
  { find: '@data', replacement: fileURLToPath(new URL('./src/data', import.meta.url)) },
];

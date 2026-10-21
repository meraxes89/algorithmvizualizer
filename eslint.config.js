import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';
import localRules from './tools/eslint-rules/index.js';

/**
 * Flat ESLint config.
 *
 * Layer boundaries are enforced here, not documented in a wiki:
 *
 *   - `src/algorithms/**` may not import React or touch the DOM. Those
 *     modules are the pure core of the app (rule R1 in improvement_v2.md).
 *   - `import/no-cycle` keeps the module graph acyclic.
 *   - `local/no-legacy-js-file` blocks *new* plain `.js` / `.jsx` files
 *     under `src/`, so the TypeScript migration cannot silently stall.
 *     Pre-existing files are grandfathered in `.eslint-legacy-allowlist.json`.
 */
export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      local: localRules,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        // Reads the `paths` block from tsconfig.json, so the @core /
        // @registry / @algorithms aliases resolve the same way they do in
        // TypeScript and Vite.
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // JSX references count as uses — without this every component
      // imported into a .jsx file looks like an unused import.
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],

      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      'import/no-cycle': ['error', { maxDepth: 10 }],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'local/no-legacy-js-file': 'error',
    },
  },

  // ── Layer boundary: the algorithm layer stays framework-agnostic ──────────
  {
    files: ['src/algorithms/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'react/*',
                'framer-motion',
                'preact',
                'preact/*',
                'vue',
                'svelte',
              ],
              message:
                'src/algorithms must stay framework-agnostic. Move the UI concern into src/components and keep the algorithm pure (improvement_v2.md rule R1).',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'document', message: 'src/algorithms must not touch the DOM.' },
        { name: 'window', message: 'src/algorithms must not touch the DOM.' },
        { name: 'navigator', message: 'src/algorithms must not touch the DOM.' },
        { name: 'location', message: 'src/algorithms must not touch the DOM.' },
        { name: 'history', message: 'src/algorithms must not touch the DOM.' },
        { name: 'localStorage', message: 'src/algorithms must not touch browser state.' },
        { name: 'sessionStorage', message: 'src/algorithms must not touch browser state.' },
      ],
    },
  },

  // ── The pure layers may not depend on the untyped layers ───────────────
  {
    // `src/core` and `src/algorithms` are the layers that have to stay
    // framework-agnostic. They may only reach for other typed code, so
    // they cannot quietly take a dependency on a legacy .js module and
    // drag it into the typecheck.
    files: ['src/core/**/*.ts', 'src/algorithms/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/utils/*',
                '**/components/*',
                '**/data/*',
                '**/pages/*',
                '**/editor/*',
                '**/context/*',
                '**/lib/*',
                '**/hooks/*',
              ],
              message:
                'The core and algorithm layers may only import typed code. Move the shared piece into src/core, or keep the algorithm pure.',
            },
          ],
        },
      ],
    },
  },

  // ── Node-side tooling and configuration ─────────────────────────────────
  {
    files: [
      '*.config.{js,ts,mjs,cjs}',
      'tools/**/*.{js,mjs,cjs}',
      '.github/**/*.js',
      'eslint.config.js',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // CLI tooling reports to stdout on purpose.
      'no-console': 'off',
    },
  },

  // ── Tests ───────────────────────────────────────────────────────────────
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  }
);

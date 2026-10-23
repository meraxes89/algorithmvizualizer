import noLegacyJsFile from './no-legacy-js-file.js';

/**
 * Project-local ESLint rules.
 *
 * These encode rules that ESLint cannot express out of the box — most
 * importantly the "no new plain .js files in src/" rule that keeps the
 * TypeScript migration from silently stalling.
 */
export const localRules = {
  rules: {
    'no-legacy-js-file': noLegacyJsFile,
  },
};

export default localRules;

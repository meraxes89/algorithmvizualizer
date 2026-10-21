import fs from 'node:fs';
import path from 'node:path';

const ALLOWLIST_URL = new URL('../../.eslint-legacy-allowlist.json', import.meta.url);

/**
 * Reads the grandfathered-file list.
 *
 * The list is a checked-in artefact, not something generated on the fly:
 * adding a path to it is a deliberate, reviewable act, which is the whole
 * point of the rule.
 */
function readAllowlist() {
  try {
    const raw = fs.readFileSync(ALLOWLIST_URL, 'utf8');
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * `no-legacy-js-file`
 *
 * Plain `.js` / `.jsx` files are not allowed to be *added* under `src/`.
 * The codebase is being migrated to TypeScript incrementally, so every new
 * module has to be typed from day one. Files that already existed when the
 * rule was introduced are grandfathered through
 * `.eslint-legacy-allowlist.json` and are expected to disappear from that
 * list as they are converted.
 */
export const noLegacyJsFile = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow adding plain .js/.jsx files under src/ — new modules must be TypeScript.',
      recommended: true,
    },
    schema: [],
    messages: {
      legacy:
        'Plain JavaScript files are not allowed in src/. Write this module in TypeScript (.ts/.tsx). If this file predates the rule, add it to .eslint-legacy-allowlist.json.',
    },
  },

  create(context) {
    const filename = context.filename;

    if (!filename.endsWith('.js') && !filename.endsWith('.jsx')) {
      return {};
    }

    const relative = path.relative(process.cwd(), filename).split(path.sep).join('/');

    // The rule only governs src/. Tooling and config files live elsewhere.
    if (!relative.startsWith('src/')) {
      return {};
    }

    const allowlist = readAllowlist();
    if (allowlist.has(relative)) {
      return {};
    }

    return {
      Program(node) {
        context.report({ node, messageId: 'legacy' });
      },
    };
  },
};

export default noLegacyJsFile;

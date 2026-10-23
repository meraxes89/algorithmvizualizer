# ADR 0003 — Incremental TypeScript

- **Status:** Accepted
- **Date:** 2026-10-22
- **Phase:** improvement_v2, Phase 1 (safety net) and Phase 2 (typed core)
- **Supersedes:** nothing

## Context

The application began as JavaScript and JSX. The core algorithm code, the playback engine and the registry were the parts most in need of a contract, but converting the entire repository at once would have meant stopping feature work, rewriting visualizers that already rendered correctly, and reviewing a single enormous change.

The audit measured the size of the problem before choosing an approach. Running `checkJs` over the legacy JavaScript files produced **104 errors across nine files**. Including the JSX surface produced **1,511 errors**, dominated by the unported visualizers. Enabling full checking immediately would have made the gate fail on code the migration had not reached.

At the same time, the new core could not be written safely in untyped JavaScript. The step union, the playback configuration and the registry contracts are exactly the kind of code where a compiler is cheaper than a test.

## Decision

Adopt TypeScript incrementally, with a hard boundary around new code.

1. **Strict TypeScript for the typed surface.** `tsconfig.json` uses `strict`, `noEmit`, `isolatedModules`, `verbatimModuleSyntax` and the `@core`, `@registry`, `@algorithms`, `@components`, `@hooks` and `@data` path aliases. The core, algorithms, registry and their hooks are written in TypeScript.

2. **New files are `.ts` or `.tsx`.** The ESLint rule `local/no-legacy-js-file` blocks new plain `.js` and `.jsx` files under `src/`. Existing files are grandfathered in `.eslint-legacy-allowlist.json`; the allowlist shrinks as files are ported.

3. **Migrate by feature, not by directory.** When a family or visualizer is substantially changed, its logic is moved to typed modules and its tests are added at the same time. A port is not finished until the old implementation is gone and the new one is covered.

4. **Coverage follows the typed surface.** The coverage gate includes `src/**/*.ts` and `src/**/*.tsx`, excluding tests and type declarations. Legacy `.js` modules are outside the gate until they are ported. The threshold therefore applies to code that has actually been converted.

5. **Aliases move together.** The path aliases are declared in `vite.aliases.ts` for Vite and Vitest and mirrored in the `paths` block of `tsconfig.json` for TypeScript. A path that works in the app should work in a test, so the two declarations must change together.

`allowJs` and `checkJs` remain enabled so that JavaScript pulled into the typed program is checked. The `include` list deliberately starts with TypeScript files; the legacy UI surface enters the program only when it is imported by typed code or converted.

## Consequences

### Good

- The step contract, playback engine and registry are type-checked and act as living documentation.
- New code cannot silently regress to untyped JavaScript.
- Ports are reviewable in family-sized pieces, and the app stays shippable throughout.
- The coverage gate tightens naturally: every port adds typed files and tests instead of lowering the bar.

### Bad

- The repository has two code classes. A change to an untouched `.jsx` visualizer does not get the same compiler coverage as a change to the core.
- Contributors need to know why a file is not type-checked and when to port it. This guide and the architecture document are part of that explanation.
- The allowlist can accumulate stale entries if ports do not remove their old paths. It should be pruned when a file is migrated.

### Neutral

- TypeScript is a build-time tool here; Vite still emits the application bundle and there is no separate declaration build.
- The migration is deliberately incomplete. "TypeScript" in this repository means the typed surface, not every line of JSX.

## Alternatives considered

**Convert the whole repository in one pass.**
Rejected. The measured error count and the size of the visualizer surface would have created a long-lived branch with no useful review granularity, and it would have blocked the phases that depended on the core.

**Stay on JavaScript and add JSDoc types.**
Rejected. JSDoc can describe shapes, but it does not give the discriminated unions, exhaustive switches or refactor safety that the step contract needs. It also tends to drift from the implementation.

**Enable `checkJs` over every `.js` file immediately.**
Rejected. The gate would fail on 104 errors before the migration reached those files. The rule is to check a file when it enters the typed surface, not to make the whole repository red.

**Rewrite the visualizers before porting the algorithms.**
Rejected. The algorithm contract is the stable part. Porting algorithms first lets the visualizers become simpler consumers of a tested trace.

## References

- `tsconfig.json` — strict compiler configuration and aliases
- `vite.aliases.ts` — the shared alias source
- `eslint.config.js` — layer boundaries and `local/no-legacy-js-file`
- `.eslint-legacy-allowlist.json` — the shrinking migration list
- `vitest.config.ts` — coverage include/exclude and thresholds
- `execution_tracker.md` — the measured error counts and migration status

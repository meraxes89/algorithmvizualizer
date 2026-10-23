# Contributing

Thanks for taking the time to improve Algorithm Visualizer. This guide is for anyone changing the code, from a first documentation fix to a new algorithm family.

The project is deliberately structured so that most changes are small: add a pure algorithm, test it, register it, and let the existing visualizers render it. To add an algorithm to an existing family, you should not need to understand React, Three.js or the playback engine.

**Related documents:** [Architecture](ARCHITECTURE.md) · [Step Trace Contract](adr/0001-step-trace-contract.md) · [ADR index](adr/README.md) · [README](../README.md)

## Contents

- [Set up](#set-up)
- [The golden path: add an algorithm](#the-golden-path-add-an-algorithm)
- [Adding a new step family](#adding-a-new-step-family)
- [Rules the codebase enforces](#rules-the-codebase-enforces)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Performance and bundle size](#performance-and-bundle-size)
- [Pull request checklist](#pull-request-checklist)

## Set up

**Requirements:** Node.js 24 or newer, and pnpm 12 or newer. The toolchain decision and the one-lockfile policy live in [ADR 0004](adr/0004-pnpm.md).

```bash
git clone https://github.com/meraxes89/algorithmvizualizer.git
cd algorithmvizualizer
corepack enable
pnpm install
pnpm dev
```

Open <http://localhost:5173>. If Corepack is unavailable:

```bash
npm install --global pnpm@12
```

The most useful commands while developing are:

| Command | What it does |
| :--- | :--- |
| `pnpm dev` | Start Vite with hot reload |
| `pnpm test` | Run the full unit and component suite once |
| `pnpm test:watch` | Re-run tests as files change |
| `pnpm test <path>` | Run one test file |
| `pnpm lint` | Check boundaries, imports, tokens and new-file policy |
| `pnpm typecheck` | Type-check the strict TypeScript surface |
| `pnpm build` | Build the production bundle |
| `pnpm size` | Check the bundle budget (run after `pnpm build`) |
| `pnpm e2e` | Run Playwright and axe checks against `vite preview` |

Playwright needs a Chromium browser. Install it once with `pnpm exec playwright install chromium`; CI uses the Linux installer with system dependencies.

## The golden path: add an algorithm

The exact files depend on the family, but the sequence is the same. The sorting family is a good reference.

### 1. Add the generator

Put the implementation under the family's folder, following the existing naming and folder layout. For sorting, that is:

```text
src/algorithms/sorting/<algorithm-name>/<algorithm-name>.ts
```

A generator receives its input, yields typed steps, and returns nothing that the visualizer depends on. Here is the shape, not a complete algorithm:

```ts
import type { SortGenerator, SortView } from '@core/steps';

export function* exampleSort(input: readonly number[]): SortGenerator {
  const array = [...input];
  const view = (): SortView => ({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [],
  });

  yield { family: 'sorting', t: 'set-array', view: view() };

  // Yield compare, swap and mark steps while the algorithm works.
  // Every step carries the complete view after that event.

  yield {
    family: 'sorting',
    t: 'done',
    view: { ...view(), sorted: array.map((_, index) => index) },
  };
}
```

Three things to preserve:

- Use the step type for the family. The discriminated union tells you which fields each `t` requires.
- Return a complete `view` after every event, not a delta.
- Keep the generator pure and synchronous. No React, DOM, timers or storage.

If you need a new step shape, stop and read [Adding a new step family](#adding-a-new-step-family). Do not invent a local step type in a page or visualizer.

### 2. Add tests next to it

Every algorithm needs a deterministic test and an invariant or property test. For sorting, the fixed trace freezes the behaviour and the property test checks the contract across many arrays:

```ts
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { exampleSort } from './example-sort';
import { expectValidSortingTrace } from '../../../test/sortingInvariants';

const trace = (input: readonly number[]) => [...exampleSort(input)];

describe('exampleSort', () => {
  it('sorts a fixed input', () => {
    const steps = trace([5, 2, 8, 1]);
    expectValidSortingTrace([5, 2, 8, 1], steps);
    expect(steps.at(-1)?.view.array).toEqual([1, 2, 5, 8]);
  });

  it('sorts any input', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (input) => {
        expectValidSortingTrace(input, trace(input));
      })
    );
  });
});
```

Use the shared invariants in `src/test/` where they exist. If the family has no shared invariant yet, add one: it is usually more valuable than another example-based test.

A good test set covers:

- a normal input
- an empty input
- a single-element input
- an already ordered input
- duplicates, if the algorithm should handle them
- the property that defines correctness for that family

### 3. Register the implementation

Add the generator to the family registry, for example `src/algorithms/sorting/index.ts`. Since the metadata unification, every entry carries a required `meta` field, so the register step is also where the educational content is attached:

```ts
import { exampleSort } from './example-sort/example-sort';
import { sortingMeta } from './meta';

export const sortingAlgorithms = [
  // ...
  { id: 'exampleSort', name: 'Example Sort', generator: exampleSort, meta: sortingMeta.exampleSort },
];
```

The meta field is typed, so an entry without it does not compile — the registry and its metadata cannot drift apart the way the old `algorithmData.js` table did. `metadata.test.ts` fails if a name, description, pseudocode or any of the four code snippets goes missing.

The family registry is what the page (and, for the racing families, the arena) runs. If the algorithm is not here, it is not part of the product.

### 4. Register the display entry

Add the same id and display name to the app registry in [`src/registry/index.ts`](../src/registry/index.ts), under the matching family:

```ts
sorting('exampleSort', 'Example Sort'),
```

This is what makes it appear in the navigation, the category grid and the command palette. The page tab comes from the family registry; adding the display entry keeps the shell in sync. The registry test compares the display entry against the family registry, so `pnpm test` fails if the ids or names differ.

### 5. Write the educational metadata

The long-form descriptions, complexities, pseudocode and code samples live in the family's typed `meta` module, colocated with the registry that requires it:

| Surface | Metadata source |
| :--- | :--- |
| Sorting | `src/algorithms/sorting/meta.ts` |
| Searching | `src/algorithms/searching/meta.ts` |
| Pathfinding | `src/algorithms/pathfinding/meta.ts` |
| Trees (traversals) | `src/data/treeAlgorithms.js` |
| Recursion | `src/data/recursionAlgorithms.js` |
| Graph | Descriptions live with the graph registry entries |
| Dynamic programming | Descriptions currently live in `src/components/DPVisualizer.jsx` |

Because the field is required, a missing entry is caught at compile time rather than degrading to a name-only panel at runtime. Match the existing entries' shape: `name` (it must equal the registry entry's `name` — the test enforces it), `description`, the complexity fields, `pseudocode` and all four `codeSnippets` (C++, Java, Python, JavaScript).

### 6. Run the gates

At minimum:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm size
```

For a UI change, also build and run the browser checks:

```bash
pnpm build
pnpm e2e
```

For a contract, navigation or visual change, update the relevant docs and add an ADR if the decision is structural.

### 7. Open a focused pull request

Keep one algorithm, one family or one concern per pull request. Explain the input and the invariant in the description. If the visual result changed, include a screenshot or a short recording. The [pull request template](../.github/PULL_REQUEST_TEMPLATE.md) contains the short checklist.

## Adding a new step family

A new family is larger than a new algorithm because the contract, event bus, registry and visualizer all need to agree.

1. **Design the view.** Add the view type and the step union to [`src/core/steps.ts`](../src/core/steps.ts). Every step must carry the complete view.
2. **Add the family mapping.** Add the family to `StepByFamily` and `GeneratorByFamily`, and add its name to `FAMILY_NAMES` in [`src/core/events.ts`](../src/core/events.ts). The `satisfies Record<StepFamily, true>` check will fail until the bus knows about it.
3. **Write the generator.** Keep it pure and synchronous. Add it to the family registry.
4. **Write the visualizer.** It should be a function of the current step's view. Do not fold earlier steps.
5. **Register it.** Add the family or operation to `src/registry/index.ts` and to the route that hosts it.
6. **Test it.** Golden trace, invariant or property test, and a component or browser check for the new rendering path.
7. **Write an ADR.** A new family changes the shared contract. Explain the view shape and why the existing families were not enough.

A family that is only a new visual arrangement of an existing view does not need a new step family. Reuse the existing view and add a presentation layer.

## Rules the codebase enforces

These are not style preferences. Most are checked by ESLint or the test suite.

| Rule | Why | Enforced by |
| :--- | :--- | :--- |
| Algorithms are pure and synchronous | They must be testable and reusable across pages, comparison mode and the arena | `no-restricted-imports` and `no-restricted-globals` in `eslint.config.js` |
| Core and algorithms import only typed code | The pure layers must not depend on untyped UI or data modules | Layer import rules in `eslint.config.js` |
| One implementation per algorithm | Pages, arena and other consumers share the same generator | Family registries and code review |
| Playback owns time | Play, pause and scrubbing must behave the same everywhere | `usePlayback`; no new `setTimeout` chains |
| Visualizers render the current step | Scrubbing is only reliable when rendering is stateless | The Step Trace Contract |
| New source files are TypeScript | The migration cannot stall silently | `local/no-legacy-js-file` |
| No raw hex colours outside `src/theme/` and `src/index.css` | Light and dark themes and canvas/WebGL share one source of truth | `no-restricted-syntax` in `eslint.config.js` |
| Every route is axe-clean | Accessibility is a product requirement, not a follow-up | Playwright + axe in CI |
| Bundle budgets are respected | A new dependency should be a conscious decision | `pnpm size` |

### Working with legacy files

The repository still contains legacy `.jsx` visualizers. New files must be `.ts` or `.tsx`; do not add entries to the legacy allowlist. When you touch a legacy file, prefer converting it only when the change is already substantial enough to justify the migration. A drive-by rewrite makes review harder.

The typed surface is intentionally smaller than the whole repository. `pnpm typecheck` will not catch type errors in an untouched `.jsx` file; add a test around the behaviour you change instead.

### Tokens and colours

Use tokens for every colour:

- Chrome: `--paper-*`, `--ink-*`, `--accent`, `--line-*`
- Visualization: `viz.*` in components, `var(--viz-*)` in CSS/SVG
- Canvas: `useCanvasPalette()` or `readVizColors()` for resolved values
- WebGL: `useVizColors()` and rebuild the scene when the theme changes

If a visualization token does not exist, add it to `src/index.css`, expose it in `src/theme/vizTokens.ts`, and add it to the `/_dev` gallery so both themes can be checked. Chrome tokens belong in `src/index.css` and the Tailwind theme, not in the visualization resolver.

## Testing

### What to test

| Change | Test to add or update |
| :--- | :--- |
| Algorithm logic | Golden trace and an invariant or property test |
| New family | Contract test, golden trace, property test and a renderer check |
| Playback or hook behaviour | Unit test with `src/test/fakeEnv.ts`; no real timers |
| Visualizer rendering | Component test with a fixed view |
| Route, navigation or overlay | Playwright test, including keyboard and both themes |
| Token or theme change | `/_dev` check plus `pnpm e2e` |
| Registry change | `registry.test.ts` should catch drift; add a specific expectation if needed |

### Running a focused test

```bash
pnpm test src/algorithms/sorting/bubble-sort/bubble-sort.test.ts
pnpm test src/components/visualizers/sorting/SortingBars.test.tsx
```

### Coverage

`pnpm test:coverage` enforces 86% on statements, branches, functions and lines for the typed surface. The threshold is not a target to game; it is a floor that moves up as files are ported.

If your change adds a new typed file, add a test for its behaviour. If a branch is genuinely unreachable, explain why in the pull request rather than excluding the file.

### End-to-end and accessibility checks

The Playwright suite scans fourteen routes in light and dark mode, plus the open command palette and the open mobile navigation. It also exercises the palette focus trap, the Algorithms disclosure and the mobile menu state.

The suite requires a production build:

```bash
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

When adding a route, add it to the `ROUTES` list in [`e2e/a11y.spec.ts`](../e2e/a11y.spec.ts). When adding an overlay or a disclosure that can be open, add a scan for the open state if it is reachable.

## Accessibility

Accessibility is part of the definition of done for UI work:

- Every control has an accessible name. Prefer a visible `<label>`; use `aria-label` when the visual design has no room for one.
- Use real buttons and links for interactive elements, not clickable `<div>`s.
- Make focus visible and restore focus when a dialog closes.
- Keep focus order meaningful. If you trap focus, provide a keyboard way to leave.
- Use `aria-live` for status messages and `role="alert"` for errors.
- Check both themes. A colour that passes in light mode can fail in dark mode.
- Do not disable an axe rule or add an exception. Fix the interface.
- Respect `prefers-reduced-motion` when adding continuous animation.

The contrast and focus work is easiest to verify in the browser with the existing `/_dev` gallery and the Playwright scan. If you cannot run Playwright locally, say so in the pull request; CI will run it.

## Performance and bundle size

The application is performance-conscious, but the rule is "measure, then optimise", not "add a micro-optimisation everywhere".

- New pages should be lazy-loaded when they are not part of the initial route.
- Large visual state should be rendered on canvas or with a small number of DOM nodes, not thousands of React elements.
- The 3D scenes use instanced meshes; keep geometry and material creation out of the render loop.
- Do not introduce a dependency for a small utility. Check whether the platform or an existing dependency already solves it.
- Bundle budgets live in [`tools/bundle-budget.json`](../tools/bundle-budget.json). If a chunk legitimately grows, update the budget in the same pull request and explain why. Do not raise a budget to hide an accidental import.
- Run `pnpm build && pnpm size` before opening the pull request.

## Pull request checklist

- [ ] The change is focused and the description explains the problem and the approach.
- [ ] Tests cover the new behaviour, including edge cases.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, `pnpm build` and `pnpm size` pass.
- [ ] For UI changes, `pnpm e2e` passes and both themes were checked.
- [ ] New routes or overlays are included in the Playwright scan.
- [ ] No new plain `.js` or `.jsx` source file was added.
- [ ] No raw hex colour was added outside `src/theme/` and `src/index.css`.
- [ ] The Step Trace Contract and architecture docs are updated if a shared shape changed.
- [ ] An ADR was added for a structural decision.
- [ ] A screenshot or recording is included for a visible change.

Use a conventional prefix in the pull request title where it helps: `feat:`, `fix:`, `refactor:`, `test:`, `docs:` or `chore:`. The repository history uses this pattern, but the content of the change matters more than the prefix.

## Releases and maintenance

Dependency updates arrive through [Dependabot](../.github/dependabot.yml) on a weekly grouped schedule; security updates are opened immediately. Release tags and GitHub Releases follow the maintainer checklist in [RELEASING.md](RELEASING.md). The workflow is deliberately manual at this size: no Changesets, and no release from an unmerged branch.

## Getting unstuck

- Start with [Architecture](ARCHITECTURE.md) if you are unsure where a piece belongs.
- Read the family registry before adding a new list. A second source of truth is usually the bug.
- Run one focused test while iterating, then run the full suite before opening the pull request.
- If a gate is failing and the cause is not obvious, include the command and the first error in the pull request or issue. That is faster than guessing.
- If a change needs a new contract, family or token, write the small design note first. The [ADR template](adr/TEMPLATE.md) is a good structure even if the result is only a paragraph.

---

_Last reviewed: 2026-10-22._

# Architecture

This document explains how Algorithm Visualizer is put together, why the main boundaries exist, and where to make a change. It is written for someone who has never opened the repository before.

If you only read one section, read [The step trace contract](#the-step-trace-contract). It is the idea the rest of the application is built around.

**Related documents:** [Contributing](CONTRIBUTING.md) · [ADR index](adr/README.md) · [Project README](../README.md)

## Contents

- [The 60-second model](#the-60-second-model)
- [Layers and dependency direction](#layers-and-dependency-direction)
- [The step trace contract](#the-step-trace-contract)
- [Playback and events](#playback-and-events)
- [Registry and deep links](#registry-and-deep-links)
- [Rendering and theming](#rendering-and-theming)
- [Testing and quality gates](#testing-and-quality-gates)
- [Where to add things](#where-to-add-things)
- [Glossary](#glossary)
- [Known boundaries](#known-boundaries)

## The 60-second model

An algorithm is a generator. It receives an input, yields typed **steps**, and never knows what is drawing it.

```text
input ──► generator ──► step stream ──► trace[] ──► playback ──► current step.view
                                                           │
                                                           └──► step events
                                                                (sound engine)
```

A **step** says two things at once:

- `t` says what just happened: `compare`, `swap`, `visit`, `done`, and so on.
- `view` is the complete visual state after that event.

The step stream is collected into an array once. The playback engine then owns time: play, pause, next, previous, seek, reset and speed. A visualizer receives the current step and renders its `view`. It does not replay earlier steps or maintain its own algorithm state.

That design is what makes scrubbing possible and makes algorithms testable without a browser. The same steps drive the page, comparison mode and the development gallery; the arena advances the same generators on its shared race clock.

## Layers and dependency direction

The application is split into a small pure core and a React application around it.

| Layer | Location | Responsibility |
| :--- | :--- | :--- |
| Algorithms | `src/algorithms/` | Pure generators and each family's implementation registry |
| Core | `src/core/` | Step types, playback engine and typed event bus |
| Registry | `src/registry/` | Display-only routes, names, groups and algorithm listings |
| Hooks | `src/hooks/` | Thin React bindings for playback, URL state and resolved colours |
| Theme | `src/theme/` | Accent inputs and the visualization-token resolver |
| UI | `src/components/`, `src/pages/` | Visualizers, shared components and route composition |
| Tests | `src/test/`, `e2e/` | Shared invariants, test environment and browser checks |
| Tooling | `tools/` | ESLint rules and the bundle-size checker |

The dependency rule is simple: **the pure layers point inward, and the UI points at them.**

- `src/algorithms/` may not import React, a UI framework or the DOM. It may not own timers or browser storage.
- `src/core/` and `src/algorithms/` may only import other typed code. They may not reach into `utils`, `components`, `data`, `pages`, `editor`, `context`, `lib` or `hooks`.
- `src/registry/` is display-only. It deliberately does not import generators, so the shell does not pull every algorithm into the initial bundle.
- Hooks depend on core. Components and pages depend on everything above them. Nothing below the UI depends on the UI.

These rules are enforced by ESLint, not by review discipline. The relevant configuration is in [`eslint.config.js`](../eslint.config.js).

### The TypeScript boundary

The project is migrating from JavaScript to TypeScript incrementally. New source files are `.ts` or `.tsx`. The typed surface (`src/core`, `src/algorithms`, `src/registry` and the hooks around them) is strict TypeScript. Older visualizers remain `.jsx` until they are ported.

Two consequences matter when reading the code:

- `pnpm typecheck` covers the typed surface, not every legacy component.
- The coverage gate applies to typed files; a ported file joins the gate when it becomes TypeScript.

The reasoning and trade-offs are in [ADR 0003](adr/0003-incremental-typescript.md).

## The step trace contract

The contract lives in [`src/core/steps.ts`](../src/core/steps.ts). The full rationale is in [ADR 0001](adr/0001-step-trace-contract.md); this section is the practical reference.

### Shape of a step

```ts
{
  family: 'sorting',
  t: 'compare',
  view: {
    array: [5, 2, 8],
    comparing: [0, 1],
    swapping: [],
    sorted: []
  }
}
```

`family` is a discriminant of its own. Several families use the same event names (`done`, `visit`, `path`), so `family` is what makes the union narrow correctly.

`view` carries the whole state, not a delta. The cost is repeated state inside a trace. The benefit is that `seek(n)` is an array lookup and every visualizer can render any step in isolation. The states are small: an array, a list of cell references, a map of node states or a DP table.

### Families

The contract has eleven step families. The application has seven navigation families; two pages host more than one step family.

| Step family | View contains | Used by |
| :--- | :--- | :--- |
| `sorting` | Array, comparing, swapping and sorted indices | Sorting page, arena, gallery |
| `searching` | Array, current index, found index, active range | Searching page, arena |
| `pathfinding` | Visited cells, path, frontier | Pathfinding page, arena |
| `graph` | Vertex and edge states, path, queue/stack, optional distances and matrices | Graph page |
| `trees` | Flat node snapshots, node states, active node, order, rotation data, log | BST, AVL, traversals, segment tree |
| `trie` | Flat trie nodes, states, active node, found and deleting nodes, log | Trie |
| `heap` | Values, active index, comparing and swapping indices, log | Heap |
| `recursion` | Call nodes, call stack, active call, output | Tree-recursion visualizer |
| `board` | Board, call stack, active cell, optional maze, output | N-Queens, Sudoku, rat-in-a-maze, Knight's Tour |
| `puzzle` | Pegs and call stack | Tower of Hanoi |
| `dp` | DP table, active cell, items and weights | Dynamic programming page |

The navigation families are:

| Navigation family | Step families it displays |
| :--- | :--- |
| Trees | `trees`, `trie`, `heap` |
| Recursion and backtracking | `recursion`, `board`, `puzzle` |
| Everything else | One step family with the same name |

### From generator to trace

Algorithms return generators such as `Generator<SortStep, void, undefined>`. [`collectSteps`](../src/core/playback.ts) drains the generator into an array before playback starts.

Materialising the trace is deliberate:

- Seeking is constant time.
- A golden test can snapshot the entire run.
- The same trace can be inspected, compared or rendered later.

The cost is memory proportional to the number of steps. Current state sizes are small and the trace is short enough that this trade-off is comfortable. If a future algorithm produces an unusually large trace, measure it before changing the contract.

## Playback and events

[`src/core/playback.ts`](../src/core/playback.ts) is the only place that decides when a step becomes current.

### The engine

`Playback` is framework-agnostic. It stores the trace and an index, advances with `requestAnimationFrame`, and accumulates elapsed time so playback speed does not depend on the display refresh rate.

It supports:

- `play`, `pause` and `toggle`
- `next`, `previous`, `seek` and `reset`
- `setSpeed`, where the value is milliseconds between steps and `0` means one step per frame
- automatic pause when the tab becomes hidden
- a catch-up budget so a long frame does not fast-forward the whole trace
- an `onFinish` callback and an `onStep` callback

The browser dependencies are injectable through `PlaybackEnv`. Tests use the fake environment in [`src/test/fakeEnv.ts`](../src/test/fakeEnv.ts) and advance a hand-driven clock; they do not need fake timers or a real browser.

### The React binding

[`usePlayback`](../src/hooks/usePlayback.ts) is intentionally thin. It creates one engine for the component, mirrors the index and play state into React, reloads when the trace changes, and destroys the engine on unmount.

A visualizer typically does this:

```tsx
const steps = useMemo(() => collectSteps(algorithm(input)), [algorithm, input]);
const { index, isPlaying, play, pause, next, seek } = usePlayback(steps, { source: 'sorting' });
const view = steps[index]?.view;
```

Everything below that line is presentation. No component should own a playback timer.

### Events

[`src/core/events.ts`](../src/core/events.ts) provides a typed publish/subscribe bus. The playback engine publishes each step as it becomes current. Subscribers can listen to one family or all families.

This is how the sound engine reacts to a run without being passed into an algorithm. The bus is the extension point for future effects; the confetti burst and animated favicon are currently invoked directly by the sorting view. Events carry:

- the step and its family
- the position and total length of the trace
- a `source` identifier, so two visualizers in comparison mode can be distinguished
- free-form metadata such as the algorithm name

The separation is the reason `src/algorithms/` can stay free of React, audio and the DOM.

### Time exceptions

Two categories of time sit outside playback:

- The **Battle Arena** advances several racers together with its own interval. A shared race clock is the feature; it is not a replacement for the playback engine.
- The **animated favicon** and **confetti** are decorative animations outside playback time. They are currently invoked directly by the sorting view, not by the step bus.

If you are adding stepping behaviour to a visualizer, use `usePlayback`. Do not add another `setTimeout` chain.

## Registry and deep links

There are two registry layers, and they have different jobs.

### Family registries

The sorting, searching, pathfinding, graph and dynamic-programming families own a small registry next to their implementations, for example [`src/algorithms/sorting/index.ts`](../src/algorithms/sorting/index.ts) or [`src/algorithms/graph/index.ts`](../src/algorithms/graph/index.ts). Trees and recursion are assembled by their pages from the app registry and their content tables.

Where a family registry exists, it is the source of truth for:

- the algorithm id and display name
- the generator function
- family-specific requirements such as a source vertex, target vertex or directed graph

The pages, and the arena for the families it races, import these registries, so the algorithm that is listed is the algorithm that runs.

### The app registry

[`src/registry/index.ts`](../src/registry/index.ts) is the display registry used by the shell. It contains the seven algorithm families, their routes, their listings, groups and operations, plus the three tool pages (Arena, Playground and Quiz).

It deliberately does not import generators. The shell is in the initial bundle, and importing every family registry here would pull every algorithm into that bundle. The cost is a second list; [`registry.test.ts`](../src/registry/registry.test.ts) compares ids and names against the five family registries, and checks tree operations and recursion entries directly, so the display layer cannot drift silently.

For the five families with a family registry, adding an algorithm means two edits:

1. Add it to the family registry with its generator.
2. Add it to the app registry with its display name and group.

For those families, the registry test fails if the ids or names diverge. Tree and recursion additions also need the page-level operation or `kind` mapping updated; the contributing guide calls that out.

### Deep links

Algorithm selection lives in the URL, managed by [`useParamSelection`](../src/hooks/useParamSelection.ts):

- `/sorting?algo=heapSort`
- `/trees?algo=traversals&op=inOrder`
- `/recursion?algo=nQueens`

The selected entry is the one named in the URL, falling back to the first entry. Selecting a new entry uses `replace`, so the back button walks back through pages rather than through every tab the user tried.

### Where the registry appears

The app registry feeds:

- the Algorithms menu and the mobile navigation
- the category grid at `/algorithms`
- the command palette
- the tree and recursion operation lists
- direct links such as `/sorting?algo=quickSort`

The five families with an implementation registry build their page tabs from that registry directly. Both layers are registry-driven, but they serve different consumers: the app registry makes a destination discoverable in the shell, while the family registry is what the page runs.

The arena lineup and the home-page search suggestions still keep local lists. That is a known boundary, not an intentional second source of truth; see [Known boundaries](#known-boundaries).

## Rendering and theming

### Two token families

The design system has two related token sets, both defined in [`src/index.css`](../src/index.css).

| Token family | Purpose | Examples |
| :--- | :--- | :--- |
| Chrome tokens | Page surfaces, typography, borders and the route accent | `--paper-0`, `--ink-1`, `--accent`, `--line-subtle` |
| Visualization tokens | Algorithm state and rendering surfaces | `--viz-compare`, `--viz-swap`, `--viz-visited`, `--viz-canvas` |

Light values live in `:root`. Dark values live under `.dark`. Components use Tailwind utilities for chrome and either CSS references or resolved values for visualization colours.

### Three ways to read a colour

| Context | Use | Why |
| :--- | :--- | :--- |
| CSS classes, inline styles, SVG | `viz.*` or `var(--viz-*)` | The browser resolves the variable automatically; theme changes need no JavaScript re-render |
| Canvas 2D | `useCanvasPalette()` or `readVizColors()` | A canvas context cannot parse `var(...)`; it needs the resolved value |
| Three.js / WebGL | `useVizColors()` | The scene is rebuilt when the theme class changes |

The token name map and resolver live in [`src/theme/vizTokens.ts`](../src/theme/vizTokens.ts). `useVizColors` observes the class on `<html>`; `src/utils/useCanvasPalette.js` does the same for the 2D palette.

The only files allowed to contain raw hex values are `src/theme/**` and `src/index.css`. The ESLint rule catches hex literals in strings and template literals across the rest of `src/`.

### Theme switching

[`ThemeProvider`](../src/context/ThemeContext.jsx) owns the light/dark state:

- The initial class is set by an inline script in [`index.html`](../index.html), before React boots, so the first paint does not flash the wrong theme.
- The choice is stored under `av-theme` in `localStorage`.
- Toggling adds or removes `dark` on `<html>`.
- Where supported, the toggle uses the View Transitions API for a circular reveal. This is progressive enhancement; the theme still changes without it.

Route accents are written by [`AccentColorManager`](../src/components/AccentColorManager.jsx), which sets `--accent`, `--accent-strong`, `--accent-soft` and related values for the current path.

### Canvases, SVG and 3D

- Sorting and searching have typed, presentational bar renderers under `src/components/visualizers/`.
- Pathfinding's grid is drawn on a canvas through `src/components/pathfinding/GridCanvas.jsx`.
- Tree, graph, trie, heap, segment-tree, recursion and DP views are SVG or DOM renderers driven by the current step.
- The 3D sorting and pathfinding scenes use Three.js and rebuild their colours when the theme changes.

The development gallery at [`/_dev`](../src/pages/DevGallery.tsx) shows every state token, the node gradients, both bar renderers and links to every family. It is lazy-loaded and intentionally not linked from the app.

## Testing and quality gates

The project uses several levels of testing because different failures need different tools.

| Level | Location | What it protects |
| :--- | :--- | :--- |
| Unit and golden traces | `src/**/*.test.ts` | Exact algorithm behaviour on a fixed input |
| Property tests | `src/**/*.test.ts` using `fast-check` | Invariants across many inputs, such as "a sort returns a permutation" |
| Component tests | `src/**/*.test.tsx` | Renderer behaviour without a browser |
| Hook tests | `src/hooks/*.test.tsx` | Playback, URL selection and colour resolution |
| Browser checks | `e2e/*.spec.ts` | Route-level accessibility, keyboard flows and real-browser integration |

Shared invariants live in `src/test/`. For example, [`sortingInvariants.ts`](../src/test/sortingInvariants.ts) checks that a trace starts with the input, ends sorted, preserves the permutation and only changes the array on a swap step.

### The gates

`pnpm test:coverage` enforces an 85% threshold for statements, branches, functions and lines on the typed surface. Legacy JavaScript is excluded until it is ported; each port pulls its files into the gate instead of lowering the threshold.

`pnpm e2e` uses Playwright and axe. It scans all fourteen routes in both themes, plus the open command palette and the open mobile navigation, and runs three keyboard flows. The scan uses axe's default rules with no exception list.

The CI workflow has three jobs:

| Job | Commands | Blocks a PR when |
| :--- | :--- | :--- |
| `checks` | `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage` | A boundary, type, test or coverage check fails |
| `build` | `pnpm build` with the Pages base path, then `pnpm size` | The build fails or a chunk exceeds its budget |
| `a11y` | `pnpm build`, install Chromium, `pnpm e2e` | An axe scan or keyboard flow fails |

The deploy workflow runs after the checks workflow succeeds for the same commit and publishes to GitHub Pages. The site is built with `GITHUB_PAGES=true`, so the project-page base path is correct.

### Why some things are not covered yet

- Component-level smoke tests currently exist for the sorting and searching bar renderers. The other visualizers are covered at the algorithm layer and by route loading in the browser checks, not by dedicated component tests.
- The arena lineups and home-page suggestions are presentation lists that are not yet driven by the registry.
- Metadata is split across `src/data/algorithmData.js`, `treeAlgorithms.js`, `recursionAlgorithms.js`, family registry descriptions and some visualizer-local copy. Unifying it is a separate migration.

These are recorded in [Known boundaries](#known-boundaries) so they do not look like finished work.

## Where to add things

| You want to add... | Start here | Don't forget |
| :--- | :--- | :--- |
| A sorting, searching, pathfinding, graph or DP algorithm | The family folder under `src/algorithms/` and its `index.ts` | Generator tests, the app registry entry and any metadata the page reads |
| A tree, trie or heap operation | The relevant family under `src/algorithms/trees/` | The step contract, the visualizer, the app registry operation and the metadata table |
| A recursion, board or puzzle routine | `src/algorithms/recursion/` | The correct step family, registry entry, content table and visualizer `kind` |
| A new page or tool | `src/pages/` and a route in `src/App.jsx` | A `tools` entry if it should appear in the palette and category grid |
| A new visualization token | `src/index.css` and `src/theme/vizTokens.ts` | Add it to `/_dev` so both themes can be checked |
| A structural decision | `docs/adr/` | Use the [ADR template](adr/TEMPLATE.md) and update the ADR index |

The step-by-step recipe, including tests and the pull-request checklist, is in [CONTRIBUTING.md](CONTRIBUTING.md).

## Glossary

| Term | Meaning |
| :--- | :--- |
| **Algorithm family** | A group with a shared step shape, such as sorting or graph |
| **Generator** | A JavaScript function that yields steps and can be drained into an array |
| **Step** | One event in a run: `{ family, t, view }` |
| **Trace** | The complete array of steps for one input |
| **View** | The complete visual state carried by a step |
| **Playback** | The engine that owns time and decides which step is current |
| **Visualizer** | A component that renders the current step's view |
| **Registry** | The family or display list that makes an algorithm reachable |
| **Chrome token** | A design token for page surfaces, ink, borders or accent |
| **Visualization token** | A design token for algorithm state or a rendering surface |
| **Typed surface** | The TypeScript code covered by `tsc` and the coverage gate; legacy JavaScript is being migrated into it |

## Known boundaries

The project is deliberately mid-migration. These are the main boundaries to know about:

- **Two source lists for navigation.** Family registries own implementations; the app registry owns display. Tests keep them in sync, but adding an algorithm still requires both edits.
- **Metadata is not unified.** `src/data/algorithmData.js` covers sorting, searching, trees and pathfinding. Tree and recursion pages have their own content tables; graph descriptions live with the graph registry, and DP descriptions live inside `DPVisualizer`. A single metadata layer is future work.
- **Legacy visualizers remain.** Many `.jsx` components are still outside the strict TypeScript program. New code must be TypeScript; conversion happens family by family.
- **Arena and home surfaces have local lists.** The arena lineup and home-page suggestions do not yet read the app registry.
- **The Playground depends on remote engines.** JavaScript and Python can run in the browser; compiled languages use Wandbox, Codex or a configured Piston endpoint. Availability is outside this repository's control.
- **Native dialogs remain in the Playground.** File creation, deletion and reset still use browser `prompt`/`confirm` in that tool. The graph editor's `prompt`/`alert` flow has been retired.
- **Confetti and the favicon are not event subscribers yet.** The sound engine consumes the step bus; the two decorative effects are still called directly from `SortingVisualizer`. Moving them onto the bus is a follow-up.

When one of these boundaries is removed, update this section and the relevant ADR or tracker entry.

## Further reading

- [ADR 0001: The Step Trace Contract](adr/0001-step-trace-contract.md)
- [ADR 0002: Registry over hardcoded navigation](adr/0002-registry-over-hardcoding.md)
- [ADR 0003: Incremental TypeScript](adr/0003-incremental-typescript.md)
- [ADR 0004: pnpm as the package manager](adr/0004-pnpm.md)
- [ADR 0005: Class-based dark mode and design tokens](adr/0005-class-dark-mode.md)
- [ADR 0006: The playback engine owns time](adr/0006-playback-engine.md)
- [Contributing guide](CONTRIBUTING.md)

---

_Last reviewed: 2026-10-22._

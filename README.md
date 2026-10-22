# Algorithm Visualizer

[![Checks](https://github.com/meraxes89/algorithmvizualizer/actions/workflows/checks.yml/badge.svg)](https://github.com/meraxes89/algorithmvizualizer/actions/workflows/checks.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Interactive, step-by-step visualizations for the algorithms people learn in a data structures and algorithms course.

**[Open the live app](https://meraxes89.github.io/algorithmvizualizer/)** · [Architecture](docs/ARCHITECTURE.md) · [Contributing](docs/CONTRIBUTING.md) · [Decision records](docs/adr/README.md)

Algorithm Visualizer lets you watch sorting, searching, pathfinding, graph, tree, recursion, backtracking and dynamic-programming algorithms run one step at a time. Every algorithm visualizer drives its timeline through the same playback engine, so playback controls behave consistently wherever they are shown.

Under the hood, algorithms are pure generators that emit typed steps. The same step types power the page, comparison mode, the arena and the internal token gallery. That keeps the visual state, the explanation panels and the tests aligned instead of letting them drift apart.

> **Adding an algorithm?** [The contributor guide](docs/CONTRIBUTING.md) walks through the generator, tests, family registry and display entry in order.

## What you can explore

| Area | What is inside |
| :--- | :--- |
| **Sorting** | Bubble, Selection, Insertion, Merge, Quick and Heap Sort, with 2D bars and an optional Three.js view |
| **Searching** | Linear, Binary and Jump Search, including the active range and the element being examined |
| **Pathfinding** | BFS, DFS, Dijkstra and A* on editable weighted grids, with a 2D canvas and a 3D drone camera |
| **Graphs** | BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim, Kruskal and Topological Sort on graphs you build |
| **Trees** | Traversals, BST operations, AVL rotations, heaps, tries and segment trees |
| **Recursion and backtracking** | Factorial, Fibonacci, permutations, combination sum, parentheses, subsets, N-Queens, Sudoku, rat-in-a-maze, Knight's Tour and Tower of Hanoi |
| **Dynamic programming** | 0/1 Knapsack, Longest Common Subsequence and bottom-up Fibonacci |
| **Tools** | Battle Arena races, a multi-language Playground, and a scored algorithm quiz |

The interface includes light and dark themes, keyboard navigation, optional sound sonification and a command palette.

**Built with:** React 18 and Vite 5, strict TypeScript on the core, Tailwind CSS, Canvas 2D, Three.js, Vitest, fast-check, Playwright and axe.

## Quick start

**Requirements:** Node.js 24 or newer, and pnpm 12 or newer. The exact pnpm version is pinned in `package.json`; the toolchain and lockfile policy are recorded in [ADR 0004](docs/adr/0004-pnpm.md).

```bash
git clone https://github.com/meraxes89/algorithmvizualizer.git
cd algorithmvizualizer
corepack enable
pnpm install
pnpm dev
```

Open <http://localhost:5173>.

If Corepack is not available on your machine, install pnpm directly:

```bash
npm install --global pnpm@12
```

The visualizers do not need API keys. The Playground can run JavaScript and Python in the browser; compiled languages use a configurable remote execution engine, which you can choose in the Playground settings.

## Verify a change

Run the same gates the project uses locally:

```bash
pnpm lint          # layer boundaries, import cycles, new-file policy and token rules
pnpm typecheck     # strict TypeScript over the typed surface
pnpm test          # unit, golden-trace, property and component tests
pnpm test:coverage # the same suite with the coverage gate
pnpm build         # production bundle
pnpm size          # per-chunk bundle budget (run after build)
```

End-to-end checks use Playwright and axe. They need a production build and a Chromium download:

```bash
pnpm build
pnpm exec playwright install chromium
pnpm e2e
```

CI runs the route-level accessibility sweep in both themes. There is no exceptions list: if a route is not axe-clean, the job fails.

## How it fits together

```text
algorithm generator
        │  yields typed steps
        ▼
     step trace  ──────────────►  tests and golden fixtures
        │
        ▼
   playback engine  ── events ──►  sound engine
        │
        ▼
   current step view  ─────────►  page, comparison mode, token gallery
```

Four rules keep the system predictable:

1. **Algorithms are pure.** They are synchronous generators in `src/algorithms/`. They do not import React, touch the DOM, own timers or read browser storage.
2. **Every step carries the complete view.** Seeking to step 300 is a lookup, not a replay from step 0.
3. **One engine owns time.** `src/core/playback.ts` decides when a step happens; visualizers only render the step they are given. The Battle Arena advances the same generators on a shared race clock, which is the one deliberate exception.
4. **Visualizers are presentational.** They render `step.view` and never fold deltas or keep a second copy of the algorithm's state.

The full data flow, layer rules and extension points are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project layout

```text
src/
├── algorithms/    Pure generators and the family registries
├── core/          Step contract, playback engine and typed event bus
├── registry/      Display-only navigation, routes and algorithm metadata
├── hooks/         React bindings for playback, URL selection and colours
├── components/    Visualizers, renderers and shared interface components
├── pages/         Route-level composition
├── theme/         Accent inputs and the visualization-token resolver
├── data/          Long-form algorithm descriptions and example code
└── index.css      Canonical light and dark design tokens

e2e/               Playwright route scans and keyboard tests
tools/             ESLint rules and the bundle-size checker
docs/              Architecture, contribution guide, ADRs and archive
```

## Documentation

| Document | Read it when |
| :--- | :--- |
| [Architecture](docs/ARCHITECTURE.md) | You want to understand the layers, the Step Trace Contract, playback, the registry or the theme system |
| [Contributing](docs/CONTRIBUTING.md) | You are adding an algorithm, changing a visualizer, fixing accessibility or opening a pull request |
| [Releasing](docs/RELEASING.md) | You are cutting a version tag or publishing a GitHub Release |
| [ADR index](docs/adr/README.md) | You want the reasoning behind a structural decision |
| [Archive](docs/archive/README.md) | You are looking for an earlier plan or design proposal |

Maintainers also use [improvement_v2.md](improvement_v2.md) for the phased roadmap and [execution_tracker.md](execution_tracker.md) for the item-level status ledger.

## Deployment

The GitHub Pages site is built and deployed automatically from `main`. The workflow runs after the checks pass for the same commit.

- `pnpm build` builds for a site served at `/`.
- `GITHUB_PAGES=true pnpm build` builds for the project-page base path used by GitHub Pages.

GitHub is the source of truth for branches, pull requests and releases. The [GitLab repository](https://gitlab.com/sireenyadav/algorithmvizualizer) is a read-only mirror.

## Contributing

Small, focused pull requests are easiest to review. Start with [CONTRIBUTING.md](docs/CONTRIBUTING.md). It includes the golden path for adding an algorithm, the rules the linter enforces, the testing strategy and the pull-request checklist.

If you are changing a public behaviour, add or update a test. If you are changing a structural decision, add or update an ADR. The [PR template](.github/PULL_REQUEST_TEMPLATE.md) repeats the short version.

## License

[MIT](LICENSE) © 2025 Manish Kumar Sah.

Maintained by the Algorithm Visualizer contributors. See the [contributor graph](https://github.com/meraxes89/algorithmvizualizer/graphs/contributors).

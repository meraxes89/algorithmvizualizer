# Execution Tracker

`improvement_v2.md` owns the strategy; this file owns the per-item status ledger.
`[x]` verified present in code · `[ ]` planned or still missing · `[-]` removed because the target was dead code.

---

## Improvement v2 — Maintainability & Scalability

### Phase 0 — Stop the bleeding

#### Verified runtime bugs (audit §1, items 6–11)

- [x] **#6** `SortingVisualizer.jsx` rendered `<RotateCcw/>` without importing it — ReferenceError in the default 2D view (`82d33e5`)
- [x] **#7** `linearSearch` took 5 params while `SearchingVisualizer` passed 6, so `setSearchRange` landed in the `speed` slot and the search ran instantly (`f320f9d`)
- [x] **#8** `StepControls` 2x chip read the non-existent `SPEED_PRESETS.NORMAL` and set the speed to `undefined` (`7d131aa`)
- [x] **#9** `InteractiveGraphBuilder` fired `onGraphChange` on mount and on every parent re-render — it wiped the live graph, closed the modal, and its `{ nodes }` payload never matched the parent's `{ vertices }` (`206775c`)
- [x] **#10** `animate-in` / `fade-in` / `zoom-in` / `slide-in-from-*` had no plugin behind them — `tailwindcss-animate` added as a devDependency and registered (`ce4008a`)
- [x] **#11** `AnimatePresence` tracked an unkeyed `<Suspense>` child, so it never saw the route change and the exit variants never ran (`f5dedcb`)

#### Hygiene

- [x] Unify the `soundEngine` export on the named export (`04c74e4`)
- [x] De-collide `data/treeAlgorithms.js` — `algorithmData` renamed to `treeAlgorithmData` (`9f3bfa1`)
- [x] Remove unused imports across `src/` — 45 dead symbols and 27 redundant `import React` lines (`45d339d`)
- [x] Add `engines` (node >= 24, pnpm >= 12), `.nvmrc`, `.editorconfig` (`f063622`)
- [x] Delete the dead-code list from audit §1.5 — done with the family ports: `nQueens.js`, `towerOfHanoi.js`, the tree re-export shims, orphan `avl.js` and the unused `RecursionVisualizer.jsx` are all gone
- [x] Remove the stale `package-lock.json` — gone; `pnpm-lock.yaml` is the only lockfile
- [x] README bugs section — replaced by the honest Phase 5 rewrite

#### Phase 0 acceptance

- [x] Zero known P0 runtime bugs
- [x] Production build green after every commit
- [x] `grep`-verified dead-code list empty — the §1.5 list is gone
- [x] README bugs section gone — Phase 5 rewrite

### Phase 1 — Safety net

#### Tooling

- [x] TypeScript config: `strict`, `allowJs` + `checkJs`, path aliases `@core @registry @algorithms @components @hooks @data`, mirrored by `resolve.alias` in `vite.config.js` (`9ebc954`)
- [x] ESLint flat config with layer-boundary rules (`9ebc954`)
- [x] `import/no-cycle` — module graph verified acyclic (`9ebc954`)
- [x] `local/no-legacy-js-file` — blocks *new* plain `.js`/`.jsx` under `src/`; 107 pre-existing files grandfathered in `.eslint-legacy-allowlist.json` (`9ebc954`)
- [x] Prettier configured; wired into lint-staged for typed/config files only (`9ebc954`, `779da68`)
- [x] husky + lint-staged pre-commit hook (`fcf0517`)
- [x] Vitest with jsdom, setup file and a coverage gate on the typed surface (`922b659`)
- [x] CI `checks` job live on every PR: lint → typecheck → test:coverage (`05d31e1`)
- [x] CI `build` job with a per-chunk bundle budget (`05d31e1`)
- [x] Deploy gated on the Checks workflow via `workflow_run` (`05d31e1`)

#### Bugs the new lint found

- [x] `SortingVisualizer` called `useMemo`/`useCallback` without importing them — a `ReferenceError` on every render, same class as the missing `RotateCcw` import (`72f763f`)
- [x] 35 lint errors of genuinely dead code removed across 21 files (`50699d7`)

#### Deferred

- [x] Playwright e2e job — Phase 4 added `e2e/` with an axe route sweep and keyboard specs
- [ ] Prettier sweep over the 94 legacy files that are not formatted — a separate, explicit decision
- [ ] `react-hooks/exhaustive-deps` warnings (17) and `react-refresh` warnings (2) — warnings today, errors when the components are rewritten
- [ ] `checkJs` over the legacy surface — **measured, not enabled**: `tsc` over `.js` + `.ts` reports **104 errors in 9 files** (`editor/executors.js` 33, `soundEngine.js` 17, `animationHelpers.js` 12, `animatedFavicon.js` 12, `completions.js` 10, `confettiHelper.js` 9, and four more); over `.jsx` as well it is **1,511 errors**, dominated by the unported visualizers. Enabling it today would fail the gate on files the migration has not reached, so the plan's per-file rule stands: each file is checked as it converts. The `onFinish` regression is the argument for doing it sooner — it lived in a `.jsx` file that no checker read.

#### Phase 1 acceptance

- [x] CI green — lint, typecheck, tests, build and bundle budget all pass locally
- [x] CI green in GitHub Actions — run 39671048032 on `4c50fb8`, both jobs (`lint · typecheck · test` and `build · bundle budget`) succeeded
- [x] The boundary rule blocks itself — a React import inside `src/algorithms`, a `document` reference there, and a new plain `.js` file under `src/` were each confirmed to fail the lint

### Phase 2 — Core contract & engine

#### The core

- [x] `core/steps.ts` — the typed step schema, one discriminated union per family (`2a879de`)
- [x] `core/playback.ts` — the playback engine: rAF, accumulated elapsed time, play/pause/step/seek/reset/speed, auto-pause on a hidden tab; the browser globals are injectable so it is testable without fake timers or a DOM (`2a879de`)
- [x] `core/events.ts` — the typed step-event bus, per family, carrying a source and metadata (`2a879de`)
- [x] `hooks/usePlayback.ts` — the thin React binding (`2a879de`)
- [x] `docs/adr/0001-step-trace-contract.md` — the reasoning, the rejected alternatives, the costs (`2a879de`)

#### Family ports

- [x] **sorting** — 5 pure generators, golden + property tests, typed `SortingBars` renderer; the 5 callback modules, 4 proxy setters and the `setTimeout` chain are gone (`92bb435`)
- [x] **searching** — 2 pure generators, golden + property tests, typed `SearchingBars` renderer; the 2 callback modules are gone (`92ea357`)
- [x] **pathfinding** — 4 pure generators, golden + property tests, a shared grid model; the 4 callback modules **and the 6 inline copies inside the visualizer** are gone (`49aafa3`)
- [x] **graph** — 8 pure generators, golden + invariant tests, a family registry; the 953-line `src/utils/GraphAlgorithms.js` and the visualizer's own table of algorithms are gone (`474b66d`)
- [x] **the arena races the registry** — `raceTraces.js` and its nine private copies of the algorithms are gone; the pathfinding race now searches a grid with real weights, so its "Dijkstra" is a weighted search (`d3d516b`)
- [x] **trees — BST / AVL / heap** — the BST insert, search and delete, the four traversals, the AVL insert, search and delete with all four rotation cases, and the heap insert and delete, all as pure generators with property tests; the tree visualizers read the tree from the current step, so a rotation is visible the moment it happens; `bstOperations.js`, `avlOperations.js`, `heapOperations.js`, `traversals.js` and the orphan `avl.js` are gone (`7755a57`, `3ccb1ec`)
- [x] **segment tree / trie** — build, range query and point update for the segment tree; insert, search, autocomplete and delete for the trie; both got views of their own because neither is a tree of pointers; `segmentTreeOperations.js` and `trieOperations.js` are gone (`7755a57`, `3ccb1ec`)
- [x] **recursion engines** — the six tree-recursion algorithms and the four board searches as generators; the contract gained a node map for the call tree and a `board` family for the searches; `engine.js`, `gridEngine.js` and the two dead duplicate modules (`nQueens.js`, `towerOfHanoi.js`) are gone (`b6165ed`, `0dc8d16`)
- [x] **puzzles** — the Tower of Hanoi is a `puzzle` family generator now, with a pegs view; the visualizer reads it through the playback engine
- [x] **the last two visualizers that owned time** — `GraphVisualizer` and `TowerOfHanoiVisualizer` now use the playback engine. The remaining `setInterval` calls are not playback: the favicon animation, the confetti animation, and the arena's race timer
- [x] **DP** — the knapsack, the longest common subsequence and Fibonacci as generators, checked against brute force; the table snapshot lives in the generator now, one place instead of per component; `DPVisualizer` is playback-driven and its tabs come from the family registry (`9086385`)
- [x] the maze generator — typed, not traced: a maze is built in one synchronous pass and the search is what gets played back (`80b601b`)

#### The golden path, dogfooded

- [x] Heap Sort and Jump Search added the way the plan says a new algorithm should be added: the generator and its test, one line in the family registry, and the metadata — and they appear in the sorting page, the searching page and the arena with **zero** further edits (`d3d516b`)
- [x] Fibonacci-DP — the third dogfood: generator, test, one registry line, metadata, and it appears on the DP page without the page being touched (the tabs are built from the registry now) (`9086385`)


#### Found by the safety net, not by reading

- [x] `SortingVisualizer` called `useMemo`/`useCallback` without importing them — a `ReferenceError` on every render (`72f763f`)
- [x] `usePlayback` had no test at all; function coverage was 81.57% against the 85% gate (`9abc1c2`)
- [x] insertion sort wrote the array on a `mark` step instead of a `swap` step — caught by the property test
- [x] A* expanded the whole grid because ties were broken arbitrarily
- [x] the BST delete left the in-order successor pointing at itself, so the tree became a cycle and the in-order walk never ended — caught by the delete property test and fixed in the port (`e895c6c`)
- [x] the subsets trace pushed two pseudo-call frames per level and popped one, so the displayed call stack grew faster than the real depth; the decisions are their own step kind now (`b6165ed`)
- [x] the segment tree's node snapshot had no coordinates for the layout; the layout helper assigns them and the type says so
- [x] the knight's tour numbers its squares from zero, not one — the test asserts what the algorithm actually does
- [x] `usePlayback` dropped the `onFinish` a visualizer passed it, **and** the tick loop skipped the final `advance()` once a trace was finished — so no run ever called `onFinish` or paused itself: the confetti and the completion toast never fired, and `isPlaying` stayed true at the end. Found in the Phase 2 audit, fixed in the engine with a test that pins both.
- [x] `FAMILIES` in the event bus listed 7 of the 11 step families, so `onAny` silently skipped the rest. The list is now a `Record<StepFamily, true>`, which stops compiling when a family is added without updating it.
- [x] `SortingVisualizer` passed `onFinish` to a hook that had no such option; the TypeScript-free `.jsx` boundary is why nothing caught it — see the `checkJs` note below
- [x] the sound subscriber played every `sorting` event regardless of which playback instance published it, so compare mode doubled the notes; the source is instance-scoped now and only the left instance is audible
- [x] `GridNode.weight` had no lower bound, so a zero or negative weight would quietly break the shortest-path guarantee; `weightOf()` clamps it in one place, used by both Dijkstra and A*

#### Rules added

- [x] `src/core` and `src/algorithms` may not import from the untyped layers
- [x] the path aliases live in one typed module shared by Vite, Vitest and TypeScript

#### Phase 2 acceptance

- [x] Golden traces pass for every ported family
- [ ] Component smoke tests pass for every ported family — **only `SortingBars` and `SearchingBars` have component tests today (2 of 11 families)**; everything else is covered at the algorithm layer, and the visualizers are exercised by the build and by hand. Adding jsdom smoke tests per visualizer is open work, not done.
- [x] The old implementation is gone for every ported family — verified by grep
- [x] Every family ported — sorting, searching, pathfinding, graph, trees (BST, AVL, heap, segment tree, trie), recursion (call tree and board searches), puzzles (Tower of Hanoi) and DP; the only remaining algorithm module is the maze generator, which is a constructor rather than an animation and is typed

### Phase 3 — Registry drives the app

- [x] Extract hardcoded nav/tab/palette lists into `registry/`
- [x] Deep-linkable algorithm selection via query params
- [x] Dogfood: Heap Sort, Jump Search, Fibonacci-DP flow from the registry to the page tabs and the palette without editing either surface

The registry is two layers on purpose:

- `src/algorithms/<family>/index.ts` stays the source of truth for the implementations (unchanged).
- `src/registry/index.ts` is the shell's display registry: id, name, family, path, plus the tree operations and recursion groups. It imports no generators. The navbar, category grid and command palette live in the initial bundle; importing the family registries there would ship every generator up front.

`src/registry/registry.test.ts` compares the display registry against the five family registries (ids and names) and against `recursionAlgorithmsData`, so the two layers cannot drift without a failing test.

Surfaces moved onto the registry:

- [x] `Navbar` desktop dropdown and mobile drawer derive their seven family links from `algorithmFamilies`
- [x] `CategoriesPage` derives all ten cards. Algorithm bullets are the first five of each family plus a `+N more` line, which removes the old drift (a nonexistent "Grid Paths", missing Jump Search, 3 of 8 graph algorithms)
- [x] `CommandPalette` lists every algorithm in every family; each result deep-links to that algorithm instead of its family page
- [x] `GraphPage` tabs come from `graphAlgorithms` instead of a hand-written list. Switching algorithms clears the old trace but keeps the graph the user built
- [x] `TreeAlgorithms` and `RecursionAlgorithms` tabs and groups come from the registry; their content tables stay the copy source

Deep links:

- `?algo=<id>` on all seven pages, read on mount and written with `replace: true` (`useParamSelection`)
- `?algo=<category>&op=<operation>` on the tree page
- an unknown or stale id falls back to the first entry; a bare path behaves as before
- palette results and pasted links therefore open the named algorithm

Verification:

- [x] `pnpm typecheck`
- [x] `pnpm lint` — 0 errors, 25 warnings (one fewer than Phase 2)
- [x] `pnpm test` — 308 passing across 41 files (+22 registry, +7 hook)
- [x] `pnpm test:coverage` — 89.62% statements, 89.31% branches, 93.35% functions
- [x] `pnpm build`
- [x] `pnpm size` — budget OK; `useParamSelection.js` is a new 0.4 kB chunk, the registry folds into existing chunks, no repricing needed

Still open for a later phase: universal `StepControls` scrubbing, metadata unification (`algorithmData.js` still covers four families), component smoke tests for 9 of the 11 families.

### Phase 4 — Design system completion

#### Token contract

- [x] Semantic `--viz-*` block in `src/index.css` for surfaces/ink, state colours, node gradients, code/logo and 3D scenes; light and dark values
- [x] `src/theme/vizTokens.ts` exports `viz` (CSS references) and `readVizColors()` (resolved values). `useVizColors()` re-reads after the theme class changes, so canvas and Three.js do not hold stale colours
- [x] `COLORS` removed from `animationHelpers`; sorting, searching, pathfinding, graph and tree visualizers use tokens directly
- [x] Route accents and confetti colours live in `src/theme/accentPalettes.ts` and `src/theme/confettiPalette.ts`; no component owns a hex value
- [x] Hex literals outside `src/theme/` = 0, enforced by an ESLint `no-restricted-syntax` rule that catches both string and template literals
- [x] Contrast pass: `--ink-3`, `--accent` and the six route accents were darkened to AA; muted Tailwind text moved from 400/500 to 600; coloured text and white-on-colour buttons moved to safe steps; graph node labels switch to dark ink on bright state fills

#### Gallery and inputs

- [x] Lazy `/_dev` gallery: state/surface swatches, node gradients, SortingBars/SearchingBars and deep links to all seven families
- [x] `GraphVisualizer` inline edge-weight input replaces `prompt()`; invalid weights are rejected with a toast and keep the pending source selection
- [x] `GraphVisualizer` `alert()` replaced with a toast
- [x] Canvas guards added where a 2D context can be unavailable (grid, favicon, home canvases, easter egg)

#### Accessibility

- [x] Command palette: `dialog`/`combobox`/`listbox` semantics, `aria-activedescendant`, scroll-into-view for the active result, focus trap and focus restoration, labelled clear control
- [x] Navbar: keyboard-operable Algorithms disclosure (`aria-expanded`/`aria-controls`, Escape), named primary/skip/quick landmarks, mobile menu state, labelled theme toggle
- [x] Toasts: `aria-live` region, `status`/`alert` roles, labelled dismiss button
- [x] Onboarding tour: dialog semantics and labelled close button
- [x] Skip link + skip-navigation landmark; `#main-content` focus target
- [x] Inputs/selects named across tree, graph, pathfinding, sorting, searching, playground, arena and test-case controls; icon-only buttons named; Arena heading order fixed
- [x] Local structural axe smoke on all 12 page components (jsdom, contrast disabled); no structural violations

#### CI gate

- [x] `@playwright/test` + `@axe-core/playwright` added; `playwright.config.ts` builds from `vite preview`
- [x] `e2e/a11y.spec.ts` scans all 14 routes in light and dark, plus the open command palette and mobile navigation
- [x] `e2e/keyboard.spec.ts` covers palette focus trapping/restoration, the Algorithms disclosure and the mobile menu state
- [x] `a11y` job in `.github/workflows/checks.yml`: build → install Chromium → `pnpm e2e`
- [x] Playwright cannot run on the Android/Termux development host (`Unsupported platform: android`); the Ubuntu CI job is the executor, not a local skip

Verification:

- [x] `pnpm lint` — 0 errors, 25 warnings
- [x] `pnpm typecheck`
- [x] `pnpm test` — 311 passing across 43 files (+2 token/hook tests)
- [x] `pnpm test:coverage` — 86.90% statements, 89.34% branches, 92.83% functions
- [x] `pnpm build`
- [x] `pnpm size` — budget OK; `AVLVisualizer.js` and `renderLoop.js` repriced after legitimate growth, and budgets added for `SearchingBars.js`, `SortingBars.js`, `useCanvasPalette.js`, `layout.js` and `useParamSelection.js`
- [x] `grep` hex count outside `src/theme/` — 0
- [x] CI run 39783243026 on `4f3e43a` — checks, build and the 33-test a11y job (30 axe scans + 3 keyboard flows) all green

Still open for a later phase: visual screenshot regression on the 3D scenes, reduced-motion audit beyond the current guards, universal `StepControls` scrubbing, metadata unification (`algorithmData.js` still covers four families), and component smoke tests for 9 of the 11 families.

### Phase 5 — Docs for strangers

#### Documentation set

- [x] `README.md` rewritten around the live app, honest feature coverage, prerequisites, verification commands, the data-flow model, project layout and a direct documentation index
- [x] `docs/ARCHITECTURE.md` — layer map, dependency rules, Step Trace Contract reference, playback and event bus, registry boundaries, theming, testing/CI, extension table, glossary and known boundaries
- [x] `docs/CONTRIBUTING.md` — setup, the golden path from generator to registry to page, new-family checklist, enforced rules, testing, accessibility, performance and PR checklist
- [x] ADR 0002 registry, ADR 0003 incremental TypeScript, ADR 0004 pnpm, ADR 0005 class-based dark mode and ADR 0006 playback engine; ADR 0001 remains the Step Trace Contract record
- [x] `docs/adr/README.md` index and `docs/adr/TEMPLATE.md` for future decisions
- [x] `.github/PULL_REQUEST_TEMPLATE.md` with the verification matrix and a docs/ADR checkbox
- [x] `docs/archive/` index plus the three superseded documents: `improvement_v1.md`, `extreme_ui_ux_proposal.md` and `applied.md`
- [x] Active `improvement_v2.md` and `execution_tracker.md` stay at the root by design; the archive README explains why the working ledger was not moved
- [x] `improvement_v2.md` status/decision table updated to reflect phased delivery and the archived v1 path
- [x] Stale source comments corrected where they contradicted the new docs (family-registry scope, app-registry tab ownership, playback scope, event-bus subscribers)

#### Acceptance

- [x] "Where do I add X?" is one click from the README to `docs/CONTRIBUTING.md` (golden path) or one click to `docs/ARCHITECTURE.md` (extension table), with ADRs one click further
- [x] No maintained document links to a missing local file (the archived `improvement_v1.md` retains its historical `file://` links and is explicitly marked unmaintained)

#### Verification

- [x] `pnpm exec prettier --check` on the new and rewritten documents — all matched files use Prettier style
- [x] Relative-link and anchor audit across the maintained Markdown — 13 files, 0 missing targets or anchors
- [x] `pnpm lint` — 0 errors, 25 pre-existing warnings
- [x] `pnpm typecheck`
- [x] `pnpm test` — 311 passing across 43 files
- [x] `pnpm test:coverage` — 87.36% statements, 89.49% branches, 92.83% functions
- [x] `GITHUB_PAGES=true pnpm build`
- [x] `pnpm size` — bundle budget OK; no new budget changes

### Phase 6 — Continuous hardening

- [ ] Hot files migrated to real TS strictness
- [ ] Coverage gate raised gradually
- [ ] Dependabot/renovate, release tagging

---

## Repository remotes

Decided 2026-10-22, Phase 1 risk register ("Dual remotes (GitHub + GitLab) diverge").

| Remote | URL | Role |
| :--- | :--- | :--- |
| `github` | `git@github.com:meraxes89/algorithmvizualizer.git` | **Primary.** Source of truth for branches, PRs, CI and releases. |
| `origin` | `git@gitlab.com:sireenyadav/algorithmvizualizer.git` | Read-only mirror. Push here only to re-sync the mirror. |

Policy:

1. `remote.pushDefault` is set to `github`, so a bare `git push` goes to GitHub. `main` and every feature branch track `github/*` and push to it.
2. GitLab is a mirror, not an upstream. Never open a PR against GitLab and never force-push to it.
3. After `main` moves on GitHub, re-sync the mirror with `git push origin main:refs/heads/main` — a fast-forward only. If the mirror has diverged, reset it to `github/main` rather than merging.
4. Releases, tags and CI runs are cut on GitHub only.

Current state: GitHub `main` is at `e62c25f`; the GitLab mirror is behind at `20e58bc`.

---

## Archive — Improvement v1 (Performance Engineering)

Audited against source on 2026-10-21. `[x]` means verified present in code. `[ ]` means planned or still missing. `[-]` means the item was removed because the target was dead code.

## Phase 1: React Render Architecture
- [x] `React.memo` on visualizers, educational components and leaf components (33 files)
- [x] `ThemeContext` value memoized (`src/context/ThemeContext.jsx:62`)
- [ ] Atomic render units under `src/components/atoms/` — directory does not exist
- [ ] Hoisting every inline `style={{}}` object — only partially applied

## Phase 2: Critical Path Render Engine
- [x] Pathfinding canvas renderer — `src/components/pathfinding/GridCanvas.jsx` draws the 20×48 grid, with pointer painting for walls and node dragging
- [x] Arena runner state held in refs (`ArenaPage.jsx`)
- [ ] Arena rAF loop and `Set` lookups — still uses `setInterval` and `Array.includes` in render; the loop now pauses when the tab is hidden
- [x] Sorting visualizer uses `Set` lookups, memoized `maxValue`, `transform: scaleY()` bars
- [x] Searching visualizer uses memoized `maxValue` and `transform: scaleY()` bars

## Phase 3: Three.js
- [x] `InstancedMesh` in `Sorting3DVisualizer` and `PathFinding3DVisualizer`
- [x] `src/utils/threeDisposal.js` used by both 3D visualizers
- [-] `Hero3DVisualizer` removed — it had no importers
- [x] `isFPV` removed from the animation effect dependency list
- [ ] `updateProjectionMatrix()` guard — still called in several per-frame branches
- [x] Render loops pause when the tab is hidden or the canvas leaves the viewport (`src/utils/renderLoop.js`)
- [x] Shadow maps, 512px shadow textures and per-mesh shadows are disabled on low-tier or reduced-motion devices

## Phase 4: CSS & GPU Compositor
- [ ] Backdrop-filter elimination — utilities remain plus `.footer-glass`; the heaviest `2xl`/`3xl` tiers were collapsed to `xl`
- [x] Cursor glow reduced to a 400px `translate3d` layer
- [ ] SVG noise removal — `feTurbulence` remains in `.glass-card::after`
- [x] `cursor: none` scoped to `html, body` under fine-pointer media query
- [x] Layout-triggering bar animations replaced with `transform`

## Phase 5: Event Handling & Animation Loops
- [x] `CustomCursor` uses `data-cursor` instead of `getComputedStyle`
- [ ] `CustomCursor` rAF batching — position updates still run through framer springs
- [x] `DioramaWrapper` drives transforms from a single rAF loop
- [x] `TiltCard` caches bounds on `mouseenter`
- [-] `MagneticButton` removed — it was unused and its hook fix never shipped
- [x] `OnboardingTour` scroll handling throttled with `requestAnimationFrame`
- [x] `CommandPalette` and `StepControls` bind one global keydown listener

## Phase 6: Build & Bundle
- [x] `manualChunks` plus `drop: ['console', 'debugger']` in `vite.config.js`
- [x] Monaco wrapper chunked (Monaco itself still loads from CDN at runtime)
- [x] Non-blocking font loading in `index.html`
- [x] Unused Playfair weights and italics trimmed from the Google Fonts request
- [x] 3D visualizers, per-category tree visualizers and `CodeViewer` split into lazy chunks
- [x] Route warmup gated by `saveData`/2G and staggered to keep idle prefetch off the critical path
- [x] Algorithm data split behind lazy routes

## Phase 7: Advanced Techniques
- [x] `EasterEgg` renders matrix rain on a canvas
- [-] `MatrixBackground` — component does not exist in this repo
- [ ] `GraphAlgorithms` adjacency `Map` lookups — not implemented
- [-] `stepTracker.js` removed — it was never wired in
- [x] DP deep-clone removal — the table snapshot lives in the DP generator now, once per step, instead of in the component; the `JSON.parse(JSON.stringify(...))` at `DPVisualizer.jsx` is gone with the component's step generation (`9086385`)
- [ ] Tree `Set` lookups — not implemented in Heap, Segment Tree or Trie visualizers
- [-] `performanceBudget.js` removed — it was never imported

Unchecked items are tracked in the refactor plan. Do not check an item without code evidence.

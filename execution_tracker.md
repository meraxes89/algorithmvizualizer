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
- [ ] Delete the dead-code list from audit §1.5 — deliberately deferred, not in this pass
- [ ] Remove the stale `package-lock.json` — deliberately deferred, not in this pass
- [ ] README bugs section — deferred to Phase 5 (docs rewrite)

#### Phase 0 acceptance

- [x] Zero known P0 runtime bugs
- [x] Production build green after every commit
- [ ] `grep`-verified dead-code list empty — blocked on the deferred sweep above
- [ ] README bugs section gone — deferred to Phase 5

### Phase 1 — Safety net

- [ ] TypeScript config (`strict`, `allowJs`/`checkJs`, path aliases)
- [ ] ESLint flat config with layer-boundary rules
- [ ] Prettier
- [ ] husky + lint-staged
- [ ] Vitest wired with jsdom + coverage
- [ ] CI `checks` job live on every PR

### Phase 2 — Core contract & engine

- [ ] `core/steps.ts` (typed step schema per family)
- [ ] `core/playback.ts` (play/pause/step/seek/speed engine)
- [ ] `core/events.ts` (typed step-event bus)
- [ ] Family-by-family ports: sorting → searching → pathfinding → graph → trees → segment/trie → recursion → DP → arena

### Phase 3 — Registry drives the app

- [ ] Extract hardcoded nav/tab/palette lists into `registry/`
- [ ] Deep-linkable algorithm selection via query params
- [ ] Dogfood: Heap Sort, Jump Search, Fibonacci-DP through the golden path

### Phase 4 — Design system completion

- [ ] Semantic viz-token block replacing `COLORS` and the scattered hexes
- [ ] `/_dev` gallery route
- [ ] `prompt()` / `alert()` retired in `GraphVisualizer`
- [ ] a11y pass wired to the CI axe gate

### Phase 5 — Docs for strangers

- [ ] `README.md` rewrite
- [ ] `docs/ARCHITECTURE.md`, `docs/CONTRIBUTING.md`, `docs/adr/`
- [ ] Legacy plan/tracker docs moved to `docs/archive/`

### Phase 6 — Continuous hardening

- [ ] Hot files migrated to real TS strictness
- [ ] Coverage gate raised gradually
- [ ] Dependabot/renovate, release tagging

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
- [ ] DP deep-clone removal — `JSON.parse(JSON.stringify(...))` remains at `DPVisualizer.jsx:197,219`
- [ ] Tree `Set` lookups — not implemented in Heap, Segment Tree or Trie visualizers
- [-] `performanceBudget.js` removed — it was never imported

Unchecked items are tracked in the refactor plan. Do not check an item without code evidence.

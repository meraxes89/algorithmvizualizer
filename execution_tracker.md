# Execution Tracker — Performance Engineering

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

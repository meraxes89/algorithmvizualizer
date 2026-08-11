# 🚀 Execution Tracker — Performance Engineering Masterplan

> **Tracking progress for 90–120 FPS performance overhaul.**  
> *Rules: Each task is checked (`[x]`) upon completion, followed by a local git commit.*

---

## 🧠 Phase 1: React Render Architecture Overhaul
- [x] **1.1 Universal Component Memoization Strategy**
  - [x] Leaf Components: `GlassCard`, `Logo`, `GitLabIcon`, `SoundControls`, `OdometerCounter`, `MagneticButton`, `TiltCard`, `EasterEgg`
  - [x] Educational Components: `ExplanationPanel`, `CodeViewer`, `StepControls`, `CustomTestCases`, `ComparisonMode`, `InteractiveGraphBuilder`
  - [x] Core Visualizers & Controls: `SortingVisualizer`, `SearchingVisualizer`, `PathFindingVisualizer`, `GraphVisualizer`, `TreeVisualizer`, `RecursionVisualizer`, `DPVisualizer`, `HeapVisualizer`, `BSTVisualizer`, `AVLVisualizer`, `SegmentTreeVisualizer`, `TrieVisualizer`, `TreeRecursionVisualizer`, `TowerOfHanoiVisualizer`, `GridBacktrackingVisualizer`
- [x] **1.2 ThemeContext Provider Value Memoization**
  - [x] Memoize context object with `useMemo` & `useCallback` in `ThemeContext.jsx`
- [x] **1.3 Extract Memoized Atomic Render Units**
  - [x] `src/components/atoms/GridCell.jsx`
  - [x] `src/components/atoms/ArrayBar.jsx`
  - [x] `src/components/atoms/TreeNode.jsx`
  - [x] `src/components/atoms/GraphNode.jsx` & `GraphEdge.jsx`
  - [x] `src/components/atoms/HeapArrayItem.jsx`
  - [x] `src/components/atoms/DPTableCell.jsx`
  - [x] `src/components/atoms/TrieNode.jsx`
- [x] **1.4 Eliminate Inline Object Allocation Pandemic**
  - [x] Hoist static `style={{}}` objects to module-level constants across components
  - [x] Wrap visualizer components with `React.memo`

---

## 🎯 Phase 2: Critical Path Render Engine Rewrite
- [x] **2.1 PathFindingVisualizer: Canvas Render Engine**
  - [x] Create `src/engines/GridCanvasRenderer.js` (flat `Uint8Array`, dirty-rect double buffering)
  - [x] Refactor `PathFindingVisualizer.jsx` to canvas-backed render engine
- [x] **2.2 ArenaPage: Decoupled Render Architecture**
  - [x] Ref-based computation loop in `ArenaPage.jsx`
  - [x] Throttled rAF render loop
  - [x] Replace `array.includes()` with `Set.has()`
  - [x] Convert height animations to `transform: scaleY()`
- [x] **2.3 SortingVisualizer: CSS Transform + Set-Based Lookups**
  - [x] Use `Set` for `comparingIndices`, `swappingIndices`, `sortedIndices`
  - [x] Memoize `maxValue`
  - [x] Animate bars via `transform: scaleY()`
- [x] **2.4 SearchingVisualizer: Batched State Updates**
  - [x] Consolidate state & use `Set`-based index lookups
  - [x] Memoize `maxValue` & animate bars via `transform: scaleY()`

---

## ⚡ Phase 3: Three.js WebGL Performance Engineering
- [x] **3.1 InstancedMesh Architecture for All 3D Visualizers**
  - [x] Refactor `Hero3DVisualizer.jsx` to `InstancedMesh`
  - [x] Refactor `Sorting3DVisualizer.jsx` to `InstancedMesh`
  - [x] Refactor `PathFinding3DVisualizer.jsx` to `InstancedMesh`
- [x] **3.2 Eliminate WebGL Context Destruction on Toggle**
  - [x] Remove `isFPV` from `useEffect` dependency array in `PathFinding3DVisualizer.jsx`
- [x] **3.3 Eliminate Redundant Per-Frame Computations**
  - [x] Add condition guard for `updateProjectionMatrix()`
  - [x] Use `THREE.Clock` / time delta for camera orbit
- [x] **3.4 Proper GPU Resource Disposal**
  - [x] Create `src/utils/threeDisposal.js`
  - [x] Add recursive scene graph disposal to all 3D visualizers

---

## 🎨 Phase 4: CSS & GPU Compositor Optimization
- [x] **4.1 Backdrop-Filter Elimination Strategy**
  - [x] Replace `backdrop-filter: blur()` on GlassCards with pre-computed semi-transparent backgrounds
  - [x] Remove backdrop blur from BottomDock, Toasts, dropdowns, StepControls, modals
- [x] **4.2 Full-Screen Cursor Glow Elimination**
  - [x] Replace 100vw × 100vh radial-gradient in `index.css` with 400px glow div on `transform: translate3d()`
- [x] **4.3 SVG Noise Filter Removal from Glass Cards**
  - [x] Replace SVG noise calculation with CSS gradients
- [x] **4.4 Universal `cursor: none` Selector Optimization**
  - [x] Replace `* { cursor: none !important; }` with `html, body { cursor: none; }`
- [x] **4.5 Animation Property Optimization**
  - [x] Replace layout-triggering `width`/`height` animations with `transform`

---

## 🏎️ Phase 5: Event Handling & Animation Loop Engineering
- [x] **5.1 CustomCursor: Eliminate Layout Thrashing**
  - [x] Use `data-cursor` attribute & eliminate `getComputedStyle`
  - [x] Batch position updates with rAF
- [x] **5.2 DioramaWrapper: Proper RAF Management**
  - [x] Implement persistent rAF loop reading mouse position refs
  - [x] Cache window dimensions and media query checks
- [x] **5.3 TiltCard: Eliminate getBoundingClientRect in RAF**
  - [x] Cache card bounds on `mouseenter`
- [x] **5.4 MagneticButton: Fix Rules of Hooks Violation**
  - [x] Move `useTransform` calls to component top-level
- [x] **5.5 OnboardingTour: Throttle Scroll Listener**
  - [x] Wrap scroll & resize listeners in `requestAnimationFrame`
- [x] **5.6 CommandPalette & StepControls: Fix Event Listener Churn**
  - [x] Bind global keydown listeners once using `useRef` for mutable state

---

## 📦 Phase 6: Build & Bundle Optimization
- [x] **6.1 Vite Build Pipeline Overhaul**
  - [x] Configure code-splitting manualChunks and drop console/debugger in `vite.config.js`
- [x] **6.2 Monaco Editor Optimization**
  - [x] Optimize code chunking for `@monaco-editor`
- [x] **6.3 Font Loading Optimization**
  - [x] Add preconnect and non-blocking font CSS in `index.html`
- [x] **6.4 Static Data Code-Splitting**
  - [x] Category data structure organization in `algorithmData.js`

---

## 🧪 Phase 7: Advanced Engineering Techniques
- [ ] **7.1 EasterEgg: Canvas Matrix Rain**
  - [ ] Replace 2,000 DOM `<span>` nodes with HTML5 Canvas renderer
- [ ] **7.2 MatrixBackground: Reduce Particle Overhead**
  - [ ] Reduce particle count to 30, use `detectsOn: 'canvas'`, hoist options object
- [ ] **7.3 GraphAlgorithms.js: Pre-Built Adjacency Maps**
  - [ ] Add vertex and adjacency `Map` lookups to eliminate inner-loop $O(N)$ searches
- [ ] **7.4 stepTracker.js: Ring Buffer Instead of Unbounded Array**
  - [ ] Implement `StepRingBuffer` to bound snapshot memory usage
- [ ] **7.5 DPVisualizer: Eliminate JSON.parse(JSON.stringify)**
  - [ ] Replace deep cloning with shallow row cloning
- [ ] **7.6 Tree Visualizers: Set-Based Lookups**
  - [ ] Convert node state arrays in BST, AVL, Heap, Segment Tree, Trie to `Set` objects
- [ ] **7.7 Adaptive Performance Budget System**
  - [ ] Create `src/utils/performanceBudget.js`
  - [ ] Connect performance budget tier to visualizers and particle effects

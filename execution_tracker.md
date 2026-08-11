# 🚀 Execution Tracker — Performance Engineering Masterplan

> **Tracking progress for 90–120 FPS performance overhaul.**  
> *Rules: Each task is checked (`[x]`) upon completion, followed by a local git commit.*

---

## 🧠 Phase 1: React Render Architecture Overhaul
- [ ] **1.1 Universal Component Memoization Strategy**
  - [x] Leaf Components: `GlassCard`, `Logo`, `GitLabIcon`, `SoundControls`, `OdometerCounter`, `MagneticButton`, `TiltCard`, `EasterEgg`
  - [x] Educational Components: `ExplanationPanel`, `CodeViewer`, `StepControls`, `CustomTestCases`, `ComparisonMode`, `InteractiveGraphBuilder`
  - [ ] Core Visualizers & Controls
- [x] **1.2 ThemeContext Provider Value Memoization**
  - [x] Memoize context object with `useMemo` & `useCallback` in `ThemeContext.jsx`
- [ ] **1.3 Extract Memoized Atomic Render Units**
  - [ ] `src/components/atoms/GridCell.jsx`
  - [ ] `src/components/atoms/ArrayBar.jsx`
  - [ ] `src/components/atoms/TreeNode.jsx`
  - [ ] `src/components/atoms/GraphNode.jsx` & `GraphEdge.jsx`
  - [ ] `src/components/atoms/HeapArrayItem.jsx`
  - [ ] `src/components/atoms/DPTableCell.jsx`
  - [ ] `src/components/atoms/TrieNode.jsx`
- [ ] **1.4 Eliminate Inline Object Allocation Pandemic**
  - [ ] Hoist static `style={{}}` objects to module-level constants across all components
  - [ ] Use `useMemo` for dynamic style calculations

---

## 🎯 Phase 2: Critical Path Render Engine Rewrite
- [ ] **2.1 PathFindingVisualizer: Canvas Render Engine**
  - [ ] Create `src/engines/GridCanvasRenderer.js` (flat `Uint8Array`, dirty-rect double buffering)
  - [ ] Refactor `PathFindingVisualizer.jsx` to canvas-backed render engine
- [ ] **2.2 ArenaPage: Decoupled Render Architecture**
  - [ ] Ref-based computation loop in `ArenaPage.jsx`
  - [ ] Throttled 60 FPS rAF render loop
  - [ ] Replace `array.includes()` with `Set.has()`
  - [ ] Convert height animations to `transform: scaleY()`
- [ ] **2.3 SortingVisualizer: CSS Transform + Set-Based Lookups**
  - [ ] Use `Set` for `comparingIndices`, `swappingIndices`, `sortedIndices`
  - [ ] Memoize `maxValue`
  - [ ] Animate bars via `transform: scaleY()`
- [ ] **2.4 SearchingVisualizer: Batched State Updates**
  - [ ] Consolidate state via `useReducer`
  - [ ] Use `Set`-based index lookups
  - [ ] Memoize `maxValue`

---

## ⚡ Phase 3: Three.js WebGL Performance Engineering
- [ ] **3.1 InstancedMesh Architecture for All 3D Visualizers**
  - [ ] Refactor `Hero3DVisualizer.jsx` to `InstancedMesh`
  - [ ] Refactor `Sorting3DVisualizer.jsx` to `InstancedMesh`
  - [ ] Refactor `PathFinding3DVisualizer.jsx` to `InstancedMesh`
- [ ] **3.2 Eliminate WebGL Context Destruction on Toggle**
  - [ ] Remove `isFPV` from `useEffect` dependency array in `PathFinding3DVisualizer.jsx`
- [ ] **3.3 Eliminate Redundant Per-Frame Computations**
  - [ ] Add condition guard for `updateProjectionMatrix()`
  - [ ] Use `THREE.Clock` for delta timing
- [ ] **3.4 Proper GPU Resource Disposal**
  - [ ] Create `src/utils/threeDisposal.js`
  - [ ] Add recursive scene graph disposal to all 3D visualizers

---

## 🎨 Phase 4: CSS & GPU Compositor Optimization
- [ ] **4.1 Backdrop-Filter Elimination Strategy**
  - [ ] Replace `backdrop-filter: blur()` on GlassCards with pre-computed semi-transparent backgrounds
  - [ ] Remove backdrop blur from BottomDock, Toasts, dropdowns, StepControls, modals
- [ ] **4.2 Full-Screen Cursor Glow Elimination**
  - [ ] Replace 100vw × 100vh radial-gradient in `index.css` with 400px glow div on `transform: translate3d()`
- [ ] **4.3 SVG Noise Filter Removal from Glass Cards**
  - [ ] Replace inline SVG `feTurbulence` with static tiled noise asset
- [ ] **4.4 Universal `cursor: none` Selector Optimization**
  - [ ] Replace `* { cursor: none !important; }` with `html { cursor: none; }`
- [ ] **4.5 Animation Property Optimization**
  - [ ] Replace `width` animations in `ExplanationPanel.jsx` and `StepControls.jsx` with `transform`

---

## 🏎️ Phase 5: Event Handling & Animation Loop Engineering
- [ ] **5.1 CustomCursor: Eliminate Layout Thrashing**
  - [ ] Use `data-cursor` attribute instead of `getComputedStyle`
  - [ ] Batch position updates with rAF
- [ ] **5.2 DioramaWrapper: Proper RAF Management**
  - [ ] Implement persistent rAF loop reading mouse position refs
  - [ ] Cache window dimensions and media query checks
- [ ] **5.3 TiltCard: Eliminate getBoundingClientRect in RAF**
  - [ ] Cache card bounds on `mouseenter`
- [ ] **5.4 MagneticButton: Fix Rules of Hooks Violation**
  - [ ] Move `useTransform` calls to component top-level
- [ ] **5.5 OnboardingTour: Throttle Scroll Listener**
  - [ ] Wrap scroll listener in `requestAnimationFrame`
- [ ] **5.6 CommandPalette & StepControls: Fix Event Listener Churn**
  - [ ] Bind global keydown listeners once using `useRef` for mutable state

---

## 📦 Phase 6: Build & Bundle Optimization
- [ ] **6.1 Vite Build Pipeline Overhaul**
  - [ ] Configure `vite-plugin-compression2` (Brotli & Gzip)
  - [ ] Configure manual code-splitting chunks and terser console drop in `vite.config.js`
- [ ] **6.2 Monaco Editor Optimization**
  - [ ] Optimize loading props and worker bundling
- [ ] **6.3 Font Loading Optimization**
  - [ ] Add preconnect and non-blocking font CSS in `index.html`
- [ ] **6.4 Static Data Code-Splitting**
  - [ ] Dynamic imports for per-category algorithm data

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

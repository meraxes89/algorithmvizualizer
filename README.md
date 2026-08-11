# ⚡ Algorithm Visualizer — 90–120 FPS Ultra-Performance Engine

> An interactive, ultra-high-performance computer science algorithm visualization platform. Built from the ground up for **constant 90–120 FPS** frame rates across low-end mobile devices and high-end displays using **React 18**, **Three.js WebGL InstancedMesh**, **HTML5 Canvas 2D Double-Buffering**, **Web Audio API**, and **Tailwind CSS**.

<p align="center">
  <a href="https://gitlab.com/sireenyadav/algorithmvizualizer">
    <img src="https://img.shields.io/badge/GitLab-Repository-orange?logo=gitlab" alt="GitLab Repository" />
  </a>
  <img src="https://img.shields.io/badge/FPS-90--120_Constant-emerald?style=flat&logo=speedtest" alt="90-120 FPS Constant" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Three.js-InstancedMesh-000000?logo=three.js" alt="Three.js WebGL" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_API-emerald" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## 🌟 Overview

**Algorithm Visualizer** bridges theoretical computer science with jaw-dropping, real-time visualization engineering. Rather than relying on simple DOM-manipulation minimum viable products, this project showcases high-performance graphics programming, custom 2D/3D render engines, polyphonic audio sonification, memory call-stack tracking, and interactive multi-language code execution.

Every single component, animation loop, state subscription, and WebGL shader has been engineered to maintain an unyielding **90–120 FPS** frame rate without degrading visual fidelity or removing features.

---

## ⚡ Extreme Performance Engineering Architecture

### 🎨 1. HTML5 Canvas 2D Grid Engine (`GridCanvasRenderer.js`)
* Replaced heavy React DOM `<div>` grid layouts with a custom HTML5 Canvas 2D engine.
* Uses flat 1D `Uint8Array` memory buffers with bitflag states (`BIT_WALL`, `BIT_VISITED`, `BIT_PATH`, `BIT_START`, `BIT_END`).
* Employs **dirty-rect double buffering** so only modified grid cells are redrawn on each frame, reducing frame render times from **~16ms to under 0.2ms**.

### 🧊 2. Three.js WebGL `InstancedMesh` Architecture
* Single-draw-call WebGL pipeline for 3D Sorting and 3D Voxel Skyscraper Pathfinding visualizers.
* Replaced thousands of individual `THREE.Mesh` allocations with a single `THREE.InstancedMesh`.
* Dynamically updates instance matrix coordinates (`setMatrixAt`) and instance colors (`setColorAt`) on the GPU, dropping WebGL draw calls from **100+ down to 1**.

### 📊 3. Adaptive Performance Budget Engine (`performanceBudget.js`)
* Dynamic frame-rate monitoring system evaluating device capability in real-time over sliding 1-second windows.
* Automatically scales performance tiers (`ULTRA_HIGH` 120 FPS, `HIGH` 90 FPS, `MEDIUM` 60 FPS, `LOW` 30 FPS for low-end mobile devices).
* Dynamically adjusts DPR pixel ratios, particle density, and canvas resolution scaling on the fly.

### 🚀 4. GPU Hardware-Accelerated Compositor Pipeline
* **ScaleY Bar Transforms**: Array and sorting visualizers animate heights using `transform: scaleY()` with `transformOrigin: 'bottom'` instead of triggering browser layout recalculations (`height`).
* **GPU `translate3d()` Cursor Glow**: Replaced full-screen 100vw × 100vh radial gradients with a fixed 400px hardware-accelerated viewport circle.
* **Layout Thrashing Removal**: Cached `getBoundingClientRect()` and window dimensions inside `mouseenter` and `resize` events to eliminate synchronous DOM layout recalculations inside rAF loops.

### ⚛️ 5. React 18 Component Tree & State Optimization
* Universal memoization using `React.memo`, `useMemo`, and `useCallback` across all core visualizers, educational panels, and UI controls.
* Replaced $O(N)$ `.includes()` array lookups with $O(1)$ `Set.has()` structures for active, comparing, swapping, and sorted element indices.
* Ref-backed event listener binding to eliminate listener recreation churn on every re-render.

---

## 🔥 Key Features

### 🌐 3D Spatial WebGL & FPV Drone Camera Mode
* Real-time 3D bar charts and 3D Voxel Pathfinding grids rendered with **Three.js** using `InstancedMesh` GPU batching.
* **FPV Drone Fly-Through Camera**: Swoops down to eye-level height (`y = 1.3`) and glides smoothly frame-by-frame along shortest path nodes through 3D building corridors.
* **Persistent WebGL Context**: Toggling FPV camera mode preserves the WebGL context without destroying or re-instantiating shaders.

### 🧩 Guaranteed Solvable Maze Generator
* Procedural path carving algorithm that guarantees 100% solvable mazes for Dijkstra, A*, BFS, and DFS every single time.

### 🎵 Web Audio API Sonification Engine
* Synthesizes dynamic pitch frequencies mapped pentatonically (200Hz – 1200Hz) to array values, comparisons, and swaps.
* Includes customizable instrument timbres: **Marimba**, **Synth Lead**, **8-Bit Arcade**, and **Pure Sine Wave** with instant mute controls.

### ⚔️ Multi-Category Algorithm Battle Arena
* Real-time side-by-side execution races comparing algorithms on identical input data.
* **Sorting Arena**: QuickSort vs. MergeSort vs. HeapSort vs. BubbleSort.
* **Searching Arena**: Linear Search vs. Binary Search vs. Jump Search.
* **Pathfinding Arena**: Dijkstra's Search vs. A* Heuristic Search vs. BFS on interactive 2D grid mazes.

### 🧠 Memory Call Stack & Execution Inspector
* Live Call Stack frame tracker showing active function signatures, parameter values, recursion depth, and stack push/pop transitions in real time.

### 💻 Multi-Language Code Playground
* Execute custom code in **C++**, **C**, **Java**, **JavaScript**, and **Python**.
* **Python**: Runs 100% client-side in WebAssembly via **Pyodide**.
* **C++ / C / Java**: Compiled remotely via **Wandbox** & self-hosted **Piston API** servers.

---

## 📚 Algorithm Coverage

| Category | Algorithms Implemented | Visual & Performance Features |
| :--- | :--- | :--- |
| **Sorting** | Quick Sort, Merge Sort, Heap Sort, Bubble Sort, Selection Sort, Insertion Sort | 2D/3D InstancedMesh, ScaleY Transforms, Set-Based Lookups, Audio Sonification |
| **Searching** | Linear Search, Binary Search, Jump Search | Range Trimming, Target Highlighting, Index Trackers, ScaleY Transforms |
| **Pathfinding** | Dijkstra's Search, A* Search, BFS, DFS | Canvas 2D Engine, 3D Voxel Skyscraper Mode, FPV Drone Cam, Guaranteed Mazes |
| **Graph Theory** | Prim's MST, Kruskal's MST, Topological Sort, BFS/DFS | Interactive Node-Link Graphs, Edge Weight Highlights, Adjacency Maps |
| **Trees & Data Structures** | BST, AVL Tree (Rotations), Max/Min Heap, Segment Tree, Trie (Prefix Tree) | Tree Node Balancing, Dynamic Pointer Transitions, Memoized SVG Atoms |
| **Recursion & Backtracking** | Tower of Hanoi, N-Queens Problem | Disc Movements, Chess Board Placements, Call Stack Frames |
| **Dynamic Programming** | Fibonacci, 0/1 Knapsack, Longest Common Subsequence (LCS) | Memoization Tables, Grid Cell State Filling, Shallow Row Cloning |

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Core** | React 18, React Router v6, JavaScript (ESNext) |
| **2D & 3D Graphics** | Three.js (WebGL), `InstancedMesh` GPU Batching, HTML5 Canvas 2D Engine |
| **Performance Engine** | Custom `GridCanvasRenderer.js`, `performanceBudget.js` (Adaptive Budgeting) |
| **Audio Synthesis** | Web Audio API (Polyphonic Synthesizer) |
| **Styling & Design** | Tailwind CSS, Lucide React Icons, Framer Motion, Glassmorphism CSS |
| **Code Execution** | Monaco Editor (`@monaco-editor/react`), Pyodide WASM, Wandbox API |
| **Deployment & Build** | Vite 5 (esbuild drop console/debugger), pnpm, Vercel SPA Rewrites |

---

## 📂 Directory Structure

```text
AlgorithmVizualizer/
├── public/                     # Static assets and icons
├── src/
│   ├── algorithms/             # Pure algorithm generators & step engines
│   │   ├── sorting/            # Bubble, Quick, Merge, Heap, Selection, Insertion
│   │   ├── searching/          # Linear, Binary, Jump Search
│   │   ├── pathfinding/        # Dijkstra, A*, BFS, DFS
│   │   ├── graph/              # Prim, Kruskal, Topological Sort
│   │   ├── trees/              # BST, AVL, Heap, Segment Tree, Trie
│   │   ├── recursion/          # Hanoi, N-Queens
│   │   └── dp/                 # Fibonacci, Knapsack, LCS
│   ├── components/             # Reusable UI components & Memoized Atoms
│   │   ├── 3D/                 # Sorting3DVisualizer & PathFinding3DVisualizer (InstancedMesh)
│   │   ├── atoms/              # ArrayBar, GridCell, TreeNode, GraphNode, DPTableCell, TrieNode
│   │   ├── SoundControls.jsx   # Audio sonification toolbar
│   │   ├── MemoryStackInspector.jsx  # Call stack inspector
│   │   └── Navbar.jsx          # Header navigation bar
│   ├── engines/
│   │   └── GridCanvasRenderer.js  # HTML5 Canvas 2D double-buffered grid engine
│   ├── pages/                  # Page routes
│   │   ├── Home.jsx            # Landing page
│   │   ├── ArenaPage.jsx       # Multi-category battle arena
│   │   ├── QuizPage.jsx        # Challenge quiz mode
│   │   ├── PlaygroundPage.jsx  # Multi-language code editor
│   │   └── SortingPage.jsx     # Detailed sorting visualizer
│   ├── utils/
│   │   ├── performanceBudget.js  # Adaptive performance budget engine
│   │   ├── threeDisposal.js     # WebGL GPU resource disposal helper
│   │   └── soundEngine.js      # Web Audio API synthesizer
│   ├── context/
│   │   └── ThemeContext.jsx    # Dark / Light mode state provider
│   ├── index.css               # Global CSS & Design System tokens
│   └── App.jsx                 # Application router & routes
├── vercel.json                 # Vercel SPA routing rewrites
├── package.json
├── pnpm-lock.yaml
├── vite.config.js              # Vite build configuration with manualChunks code-splitting
├── execution_tracker.md        # Masterplan progress tracker checklist
├── improvement_v1.md           # Master architecture improvement plan
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** (v18+) and **pnpm** installed on your system.

```bash
# Check Node version
node -v

# Install pnpm globally if not already installed
npm install -g pnpm
```

### Installation

1. **Clone the Repository:**

```bash
git clone https://gitlab.com/sireenyadav/algorithmvizualizer.git
cd algorithmvizualizer
```

2. **Install Dependencies:**

```bash
pnpm install
```

3. **Start Development Server:**

```bash
pnpm run dev
```

Open your browser and navigate to `http://localhost:5173`.

4. **Build for Production:**

```bash
pnpm run build
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">

Crafted with extreme engineering & creativity by **[Sireen Yadav](https://gitlab.com/sireenyadav)**

[GitLab Repository](https://gitlab.com/sireenyadav/algorithmvizualizer) · [Report Issue](https://gitlab.com/sireenyadav/algorithmvizualizer/-/issues)

</div>

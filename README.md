# ⚡ Algorithm Visualizer

> An interactive, high-performance web platform designed to visualize, explore, and master computer science algorithms through real-time step-by-step animations, 3D spatial rendering, dynamic audio sonification, and multi-language code execution.

<p align="center">
  <a href="https://gitlab.com/sireenyadav/algorithmvizualizer">
    <img src="https://img.shields.io/badge/GitLab-Repository-orange?logo=gitlab" alt="GitLab Repository" />
  </a>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-000000?logo=three.js" alt="Three.js WebGL" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_API-emerald" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## 🌟 Overview

**Algorithm Visualizer** bridges the gap between theoretical computer science and intuitive understanding. Instead of static diagrams or complex code traceouts, users can watch algorithms execute live with frame-by-frame precision, inspect memory call stacks, hear frequency-mapped sound synthesis, and run multi-algorithm speed races in real time.

Built with **React 18**, **Three.js WebGL**, **Web Audio API**, **Tailwind CSS**, and **Vite**, the application delivers 60 FPS animations, responsive glassmorphism design, full dark/light theme adaptability, and multi-language code execution support.

---

## 🔥 Key Features

### 🌐 3D Spatial WebGL Rendering
* Real-time 3D bar chart rendering using **Three.js** with ambient lighting, specular point lights, reflective ground floor grid, and camera rotation controls.
* Seamless 1-click toggle between standard 2D view and 3D WebGL spatial view.

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

### 🏆 Interactive Challenge & Quiz Mode
* Step-by-step prediction challenges testing algorithm concepts, time complexities, and data structure properties with streak counters and celebratory confetti.

---

## 📚 Algorithm Coverage

| Category | Algorithms Implemented | Visual Features |
| :--- | :--- | :--- |
| **Sorting** | Quick Sort, Merge Sort, Heap Sort, Bubble Sort, Selection Sort, Insertion Sort | 2D/3D Bars, Swap Highlights, Comparisons, Audio Sonification |
| **Searching** | Linear Search, Binary Search, Jump Search | Range Trimming, Target Highlighting, Index Trackers |
| **Pathfinding** | Dijkstra's Search, A* Search, BFS, DFS | Interactive Grid, Visited Cells Expansion, Shortest Path Routing |
| **Graph Theory** | Prim's MST, Kruskal's MST, Topological Sort, BFS/DFS | Interactive Node-Link Graphs, Edge Weight Highlights |
| **Trees & Data Structures** | BST, AVL Tree (Rotations), Max/Min Heap, Segment Tree, Trie (Prefix Tree) | Tree Node Balancing, Dynamic Pointer Transitions |
| **Recursion & Backtracking** | Tower of Hanoi, N-Queens Problem | Disc Movements, Chess Board Placements, Call Stack Frames |
| **Dynamic Programming** | Fibonacci, 0/1 Knapsack, Longest Common Subsequence (LCS) | Memoization Tables, Grid Cell State Filling |

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Core** | React 18, React Router v6, JavaScript (ESNext) |
| **3D & Graphics** | Three.js (WebGL), HTML5 Canvas |
| **Audio Synthesis** | Web Audio API (Polyphonic Synthesizer) |
| **Styling & Design** | Tailwind CSS, Lucide React Icons, Framer Motion, Glassmorphism CSS |
| **Code Editor & Execution** | Monaco Editor (`@monaco-editor/react`), Pyodide WASM, Wandbox API |
| **Build & Tooling** | Vite 5, pnpm, PostCSS, Autoprefixer |

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
│   ├── components/             # Reusable UI components
│   │   ├── 3D/                 # Sorting3DVisualizer (Three.js)
│   │   ├── SoundControls.jsx   # Audio sonification toolbar
│   │   ├── MemoryStackInspector.jsx  # Call stack inspector
│   │   ├── GitLabIcon.jsx      # Vector logo component
│   │   └── Navbar.jsx          # Header navigation bar
│   ├── pages/                  # Page routes
│   │   ├── Home.jsx            # Landing page
│   │   ├── ArenaPage.jsx       # Multi-category battle arena
│   │   ├── QuizPage.jsx        # Challenge quiz mode
│   │   ├── PlaygroundPage.jsx  # Multi-language code editor
│   │   └── SortingPage.jsx     # Detailed sorting visualizer
│   ├── utils/
│   │   └── soundEngine.js      # Web Audio API synthesizer
│   ├── context/
│   │   └── ThemeContext.jsx    # Dark / Light mode state provider
│   ├── index.css               # Global CSS & Design System tokens
│   └── App.jsx                 # Application router & routes
├── package.json
├── pnpm-lock.yaml
├── vite.config.js
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

Crafted by **[Sireen Yadav](https://gitlab.com/sireenyadav)**

[GitLab Repository](https://gitlab.com/sireenyadav/algorithmvizualizer) · [Report Issue](https://gitlab.com/sireenyadav/algorithmvizualizer/-/issues)

</div>

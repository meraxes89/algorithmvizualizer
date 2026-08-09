import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Swords, Trophy, CheckCircle2, Search as SearchIcon, Network, BarChart2 } from 'lucide-react';
import SoundControls from '../components/SoundControls';
import soundEngine from '../utils/soundEngine';
import { useTheme } from '../context/ThemeContext';

// ----------------------------------------------------
// 1. SORTING ALGORITHMS
// ----------------------------------------------------
const SORTING_ALGORITHMS = {
  quickSort: {
    name: 'Quick Sort',
    category: 'Sorting',
    complexity: 'O(N log N)',
    color: 'from-blue-500 to-indigo-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      function* partition(low, high) {
        const pivot = a[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          comps++;
          yield { array: [...a], comparing: [j, high], pivot: high, comps, swaps };
          if (a[j] < pivot) {
            i++;
            [a[i], a[j]] = [a[j], a[i]];
            swaps++;
            yield { array: [...a], comparing: [i, j], swapped: [i, j], pivot: high, comps, swaps };
          }
        }
        [a[i + 1], a[high]] = [a[high], a[i + 1]];
        swaps++;
        yield { array: [...a], comparing: [i + 1, high], swapped: [i + 1, high], comps, swaps };
        return i + 1;
      }
      function* quickSortHelper(low, high) {
        if (low < high) {
          const pi = yield* partition(low, high);
          yield* quickSortHelper(low, pi - 1);
          yield* quickSortHelper(pi + 1, high);
        }
      }
      yield* quickSortHelper(0, a.length - 1);
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  },
  mergeSort: {
    name: 'Merge Sort',
    category: 'Sorting',
    complexity: 'O(N log N)',
    color: 'from-purple-500 to-pink-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      function* merge(l, m, r) {
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = a.slice(l, m + 1);
        const R = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
          comps++;
          yield { array: [...a], comparing: [l + i, m + 1 + j], comps, swaps };
          if (L[i] <= R[j]) {
            a[k] = L[i];
            i++;
          } else {
            a[k] = R[j];
            j++;
          }
          swaps++;
          yield { array: [...a], comparing: [k], swapped: [k], comps, swaps };
          k++;
        }
        while (i < n1) {
          a[k] = L[i]; i++; k++;
          yield { array: [...a], comparing: [k - 1], comps, swaps };
        }
        while (j < n2) {
          a[k] = R[j]; j++; k++;
          yield { array: [...a], comparing: [k - 1], comps, swaps };
        }
      }
      function* mergeSortHelper(l, r) {
        if (l < r) {
          const m = Math.floor(l + (r - l) / 2);
          yield* mergeSortHelper(l, m);
          yield* mergeSortHelper(m + 1, r);
          yield* merge(l, m, r);
        }
      }
      yield* mergeSortHelper(0, a.length - 1);
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  },
  heapSort: {
    name: 'Heap Sort',
    category: 'Sorting',
    complexity: 'O(N log N)',
    color: 'from-emerald-500 to-teal-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      function* heapify(n, i) {
        let largest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n) {
          comps++;
          yield { array: [...a], comparing: [l, largest], comps, swaps };
          if (a[l] > a[largest]) largest = l;
        }
        if (r < n) {
          comps++;
          yield { array: [...a], comparing: [r, largest], comps, swaps };
          if (a[r] > a[largest]) largest = r;
        }
        if (largest !== i) {
          [a[i], a[largest]] = [a[largest], a[i]];
          swaps++;
          yield { array: [...a], comparing: [i, largest], swapped: [i, largest], comps, swaps };
          yield* heapify(n, largest);
        }
      }
      for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) yield* heapify(a.length, i);
      for (let i = a.length - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        swaps++;
        yield { array: [...a], comparing: [0, i], swapped: [0, i], comps, swaps };
        yield* heapify(i, 0);
      }
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  },
  bubbleSort: {
    name: 'Bubble Sort',
    category: 'Sorting',
    complexity: 'O(N²)',
    color: 'from-amber-500 to-orange-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
          comps++;
          yield { array: [...a], comparing: [j, j + 1], comps, swaps };
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            swaps++;
            yield { array: [...a], comparing: [j, j + 1], swapped: [j, j + 1], comps, swaps };
          }
        }
      }
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  }
};

// ----------------------------------------------------
// 2. SEARCHING ALGORITHMS
// ----------------------------------------------------
const SEARCHING_ALGORITHMS = {
  binarySearch: {
    name: 'Binary Search',
    category: 'Searching',
    complexity: 'O(log N)',
    color: 'from-cyan-500 to-blue-600',
    generator: function* (arr, target) {
      const a = [...arr].sort((x, y) => x - y);
      let low = 0, high = a.length - 1, comps = 0;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        comps++;
        yield { array: [...a], comparing: [mid], range: [low, high], comps, found: a[mid] === target };
        if (a[mid] === target) {
          yield { array: [...a], comparing: [mid], foundIndex: mid, finished: true, comps };
          return;
        }
        if (a[mid] < target) low = mid + 1;
        else high = mid - 1;
      }
      yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
    }
  },
  linearSearch: {
    name: 'Linear Search',
    category: 'Searching',
    complexity: 'O(N)',
    color: 'from-rose-500 to-pink-600',
    generator: function* (arr, target) {
      const a = [...arr].sort((x, y) => x - y);
      let comps = 0;
      for (let i = 0; i < a.length; i++) {
        comps++;
        yield { array: [...a], comparing: [i], comps, found: a[i] === target };
        if (a[i] === target) {
          yield { array: [...a], comparing: [i], foundIndex: i, finished: true, comps };
          return;
        }
      }
      yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
    }
  },
  jumpSearch: {
    name: 'Jump Search',
    category: 'Searching',
    complexity: 'O(√N)',
    color: 'from-amber-500 to-emerald-600',
    generator: function* (arr, target) {
      const a = [...arr].sort((x, y) => x - y);
      const n = a.length;
      let step = Math.floor(Math.sqrt(n));
      let prev = 0;
      let comps = 0;

      while (a[Math.min(step, n) - 1] < target) {
        comps++;
        yield { array: [...a], comparing: [Math.min(step, n) - 1], comps };
        prev = step;
        step += Math.floor(Math.sqrt(n));
        if (prev >= n) {
          yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
          return;
        }
      }

      while (a[prev] < target) {
        comps++;
        yield { array: [...a], comparing: [prev], comps };
        prev++;
        if (prev === Math.min(step, n)) {
          yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
          return;
        }
      }

      comps++;
      if (a[prev] === target) {
        yield { array: [...a], comparing: [prev], foundIndex: prev, finished: true, comps };
      } else {
        yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
      }
    }
  }
};

// ----------------------------------------------------
// 3. PATHFINDING ALGORITHMS
// ----------------------------------------------------
const PATHFINDING_ALGORITHMS = {
  dijkstra: {
    name: "Dijkstra's Search",
    category: 'Pathfinding',
    complexity: 'O(V log V + E)',
    color: 'from-indigo-500 to-purple-600',
    generator: function* (rows = 8, cols = 12) {
      const start = [1, 1], end = [6, 10];
      const visited = new Set();
      const parent = {};
      const queue = [[...start, 0]];
      let steps = 0;

      while (queue.length > 0) {
        queue.sort((a, b) => a[2] - b[2]);
        const [r, c, dist] = queue.shift();
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        visited.add(key);
        steps++;

        const visitedArr = Array.from(visited);
        const isTarget = r === end[0] && c === end[1];

        yield { visitedList: visitedArr, activeNode: [r, c], steps, finished: isTarget };

        if (isTarget) {
          const path = [];
          let curr = `${end[0]},${end[1]}`;
          while (curr) {
            path.push(curr);
            curr = parent[curr];
          }
          yield { visitedList: visitedArr, pathList: path, activeNode: [r, c], finished: true, steps };
          return;
        }

        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          const nkey = `${nr},${nc}`;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nkey)) {
            if (!parent[nkey]) parent[nkey] = key;
            queue.push([nr, nc, dist + 1]);
          }
        }
      }
      yield { visitedList: Array.from(visited), finished: true, steps };
    }
  },
  astar: {
    name: 'A* Heuristic Search',
    category: 'Pathfinding',
    complexity: 'O(E)',
    color: 'from-emerald-500 to-cyan-600',
    generator: function* (rows = 8, cols = 12) {
      const start = [1, 1], end = [6, 10];
      const visited = new Set();
      const parent = {};
      const queue = [[...start, 0, Math.abs(1 - 6) + Math.abs(1 - 10)]];
      let steps = 0;

      while (queue.length > 0) {
        queue.sort((a, b) => (a[2] + a[3]) - (b[2] + b[3]));
        const [r, c, dist] = queue.shift();
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        visited.add(key);
        steps++;

        const visitedArr = Array.from(visited);
        const isTarget = r === end[0] && c === end[1];

        yield { visitedList: visitedArr, activeNode: [r, c], steps, finished: isTarget };

        if (isTarget) {
          const path = [];
          let curr = `${end[0]},${end[1]}`;
          while (curr) {
            path.push(curr);
            curr = parent[curr];
          }
          yield { visitedList: visitedArr, pathList: path, activeNode: [r, c], finished: true, steps };
          return;
        }

        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          const nkey = `${nr},${nc}`;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nkey)) {
            if (!parent[nkey]) parent[nkey] = key;
            const h = Math.abs(nr - end[0]) + Math.abs(nc - end[1]);
            queue.push([nr, nc, dist + 1, h]);
          }
        }
      }
      yield { visitedList: Array.from(visited), finished: true, steps };
    }
  },
  bfs: {
    name: 'BFS Breadth-First',
    category: 'Pathfinding',
    complexity: 'O(V + E)',
    color: 'from-blue-500 to-teal-500',
    generator: function* (rows = 8, cols = 12) {
      const start = [1, 1], end = [6, 10];
      const visited = new Set();
      const parent = {};
      const queue = [[...start]];
      let steps = 0;

      while (queue.length > 0) {
        const [r, c] = queue.shift();
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        visited.add(key);
        steps++;

        const visitedArr = Array.from(visited);
        const isTarget = r === end[0] && c === end[1];

        yield { visitedList: visitedArr, activeNode: [r, c], steps, finished: isTarget };

        if (isTarget) {
          const path = [];
          let curr = `${end[0]},${end[1]}`;
          while (curr) {
            path.push(curr);
            curr = parent[curr];
          }
          yield { visitedList: visitedArr, pathList: path, activeNode: [r, c], finished: true, steps };
          return;
        }

        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          const nkey = `${nr},${nc}`;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nkey)) {
            if (!parent[nkey]) parent[nkey] = key;
            queue.push([nr, nc]);
          }
        }
      }
      yield { visitedList: Array.from(visited), finished: true, steps };
    }
  }
};

const ArenaPage = () => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('sorting'); // 'sorting' | 'searching' | 'pathfinding'
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(40);
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState(null);

  const [runners, setRunners] = useState({});
  const [searchTarget, setSearchTarget] = useState(45);

  const initCategory = (cat = activeCategory) => {
    setIsRunning(false);
    setWinner(null);

    if (cat === 'sorting') {
      const arr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 85) + 15);
      const initialRunners = {};
      Object.keys(SORTING_ALGORITHMS).forEach(key => {
        initialRunners[key] = {
          array: [...arr],
          comparing: [],
          swapped: [],
          comps: 0,
          swaps: 0,
          finished: false,
          generator: SORTING_ALGORITHMS[key].generator(arr)
        };
      });
      setRunners(initialRunners);
    } else if (cat === 'searching') {
      const arr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10).sort((a, b) => a - b);
      const target = arr[Math.floor(Math.random() * arr.length)];
      setSearchTarget(target);

      const initialRunners = {};
      Object.keys(SEARCHING_ALGORITHMS).forEach(key => {
        initialRunners[key] = {
          array: [...arr],
          comparing: [],
          comps: 0,
          finished: false,
          foundIndex: null,
          generator: SEARCHING_ALGORITHMS[key].generator(arr, target)
        };
      });
      setRunners(initialRunners);
    } else if (cat === 'pathfinding') {
      const initialRunners = {};
      Object.keys(PATHFINDING_ALGORITHMS).forEach(key => {
        initialRunners[key] = {
          visitedCount: 0,
          activeNode: null,
          steps: 0,
          finished: false,
          generator: PATHFINDING_ALGORITHMS[key].generator(10, 15)
        };
      });
      setRunners(initialRunners);
    }
  };

  useEffect(() => {
    initCategory(activeCategory);
  }, [activeCategory, arraySize]);

  useEffect(() => {
    let intervalId = null;
    if (isRunning) {
      intervalId = setInterval(() => {
        setRunners(prev => {
          let updated = { ...prev };
          let activeCount = 0;
          let newlyFinished = [];

          Object.keys(updated).forEach(key => {
            const runner = updated[key];
            if (!runner.finished) {
              const res = runner.generator.next();
              if (res.done || res.value.finished) {
                updated[key] = {
                  ...runner,
                  ...res.value,
                  finished: true
                };
                newlyFinished.push(key);
              } else {
                activeCount++;
                updated[key] = {
                  ...runner,
                  ...res.value
                };
                soundEngine.playCompare(res.value.visitedCount || res.value.comps || 50, 10, 100);
              }
            }
          });

          if (newlyFinished.length > 0) {
            setWinner(prevWinner => {
              if (!prevWinner) {
                soundEngine.playSuccess();
                let name = '';
                if (activeCategory === 'sorting') name = SORTING_ALGORITHMS[newlyFinished[0]]?.name;
                else if (activeCategory === 'searching') name = SEARCHING_ALGORITHMS[newlyFinished[0]]?.name;
                else if (activeCategory === 'pathfinding') name = PATHFINDING_ALGORITHMS[newlyFinished[0]]?.name;
                return name;
              }
              return prevWinner;
            });
          }

          if (activeCount === 0) {
            setIsRunning(false);
          }

          return updated;
        });
      }, 100 - speed);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, speed, activeCategory]);

  const toggleRun = () => {
    if (Object.values(runners).every(r => r.finished)) {
      initCategory(activeCategory);
    }
    setIsRunning(!isRunning);
  };

  const getActiveDict = () => {
    if (activeCategory === 'sorting') return SORTING_ALGORITHMS;
    if (activeCategory === 'searching') return SEARCHING_ALGORITHMS;
    return PATHFINDING_ALGORITHMS;
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/60 backdrop-blur-xl shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <Swords className="w-5 h-5" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Algorithm Battle Arena
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Race algorithms side-by-side across Sorting, Searching, and Pathfinding categories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SoundControls />
            <button
              onClick={() => initCategory(activeCategory)}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Battle
            </button>
            <button
              onClick={toggleRun}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'PAUSE BATTLE' : 'START RACE'}</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-fit">
          {[
            { id: 'sorting', label: 'Sorting Race', icon: BarChart2 },
            { id: 'searching', label: 'Search Race', icon: SearchIcon },
            { id: 'pathfinding', label: 'Pathfinding Race', icon: Network },
          ].map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {activeCategory !== 'pathfinding' && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-24">Data Size: {arraySize}</span>
              <input
                type="range"
                min="15"
                max="50"
                value={arraySize}
                disabled={isRunning}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-24">Speed: {speed}%</span>
            <input
              type="range"
              min="1"
              max="95"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
          </div>

          {activeCategory === 'searching' && (
            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold">
              <span>Target Value: {searchTarget}</span>
            </div>
          )}

          {winner && (
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold">
              <Trophy className="w-4 h-4 text-amber-500" /> Winner: {winner}
            </div>
          )}
        </div>

        {/* Arena Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(getActiveDict()).map((key) => {
            const runner = runners[key] || {};
            const algInfo = getActiveDict()[key];

            return (
              <div
                key={key}
                className={`relative flex flex-col bg-white dark:bg-slate-800/70 border rounded-3xl p-5 backdrop-blur-md transition-all shadow-sm ${
                  runner.finished && winner === algInfo.name
                    ? 'border-amber-500/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700/60'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${algInfo.color}`} />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{algInfo.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                      {algInfo.complexity}
                    </span>
                  </div>

                  {runner.finished && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Finished
                    </span>
                  )}
                </div>

                {/* Visualizer Renderer */}
                {activeCategory === 'sorting' && (
                  <div className="h-44 bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3 flex items-end justify-center gap-1 border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden">
                    {runner.array?.map((val, idx) => {
                      const maxVal = Math.max(...runner.array, 100);
                      const isComparing = runner.comparing?.includes(idx);
                      const isSwapped = runner.swapped?.includes(idx);

                      let barColor = `bg-gradient-to-t ${algInfo.color}`;
                      if (isSwapped) barColor = 'bg-rose-500';
                      else if (isComparing) barColor = 'bg-amber-400';

                      return (
                        <div
                          key={idx}
                          style={{ height: `${(val / maxVal) * 100}%` }}
                          className={`flex-1 rounded-t-sm transition-all duration-75 ${barColor}`}
                        />
                      );
                    })}
                  </div>
                )}

                {activeCategory === 'searching' && (
                  <div className="h-44 bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3 flex items-end justify-center gap-1 border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden">
                    {runner.array?.map((val, idx) => {
                      const maxVal = Math.max(...runner.array, 100);
                      const isComparing = runner.comparing?.includes(idx);
                      const isFound = runner.foundIndex === idx;

                      let barColor = 'bg-indigo-400/50 dark:bg-indigo-600/40';
                      if (isFound) barColor = 'bg-emerald-500 ring-2 ring-emerald-400';
                      else if (isComparing) barColor = 'bg-amber-400';

                      return (
                        <div
                          key={idx}
                          style={{ height: `${(val / maxVal) * 100}%` }}
                          className={`flex-1 rounded-t-sm transition-all duration-75 ${barColor}`}
                        />
                      );
                    })}
                  </div>
                )}

                {activeCategory === 'pathfinding' && (
                  <div className="h-44 bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-2.5 flex items-center justify-center border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden">
                    <div className="grid grid-rows-8 grid-cols-12 gap-1 w-full h-full">
                      {Array.from({ length: 8 }).map((_, r) =>
                        Array.from({ length: 12 }).map((_, c) => {
                          const key = `${r},${c}`;
                          const isStart = r === 1 && c === 1;
                          const isTarget = r === 6 && c === 10;
                          const isVisited = runner.visitedList?.includes(key);
                          const isPath = runner.pathList?.includes(key);
                          const isActive = runner.activeNode && runner.activeNode[0] === r && runner.activeNode[1] === c;

                          let cellStyle = 'bg-slate-200/50 dark:bg-slate-800/40 border-slate-300/30 dark:border-slate-800/30';
                          if (isStart) cellStyle = 'bg-emerald-500 ring-2 ring-emerald-400 font-bold';
                          else if (isTarget) cellStyle = 'bg-rose-500 ring-2 ring-rose-400 font-bold';
                          else if (isPath) cellStyle = 'bg-amber-400 dark:bg-amber-500 shadow-md shadow-amber-500/50';
                          else if (isActive) cellStyle = 'bg-amber-300 dark:bg-amber-400 animate-pulse';
                          else if (isVisited) cellStyle = 'bg-indigo-400/40 dark:bg-indigo-600/50';

                          return (
                            <div
                              key={key}
                              className={`rounded-sm border text-[9px] flex items-center justify-center transition-all duration-100 ${cellStyle}`}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Footer */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {activeCategory === 'pathfinding' ? 'Total Operations' : 'Comparisons'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 font-mono">
                      {runner.steps || runner.comps || 0}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      {activeCategory === 'sorting' ? 'Array Swaps' : activeCategory === 'searching' ? 'Status' : 'Exploration'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 font-mono">
                      {activeCategory === 'sorting' ? runner.swaps || 0 : runner.foundIndex !== undefined && runner.foundIndex !== null ? 'TARGET FOUND' : runner.finished ? 'DONE' : 'RUNNING'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ArenaPage;

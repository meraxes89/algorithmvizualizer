import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Swords, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import SoundControls from '../components/SoundControls';
import soundEngine from '../utils/soundEngine';
import { useTheme } from '../context/ThemeContext';

const SORTING_ALGORITHMS = {
  bubbleSort: {
    name: 'Bubble Sort',
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
  },
  quickSort: {
    name: 'Quick Sort',
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
          a[k] = L[i];
          i++;
          k++;
          yield { array: [...a], comparing: [k - 1], comps, swaps };
        }
        while (j < n2) {
          a[k] = R[j];
          j++;
          k++;
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
    complexity: 'O(N log N)',
    color: 'from-emerald-500 to-teal-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;

      function* heapify(n, i) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

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

      for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {
        yield* heapify(a.length, i);
      }
      for (let i = a.length - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        swaps++;
        yield { array: [...a], comparing: [0, i], swapped: [0, i], comps, swaps };
        yield* heapify(i, 0);
      }

      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  }
};

const ArenaPage = () => {
  const { isDark } = useTheme();
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(40);
  const [baseArray, setBaseArray] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState(null);

  const [selectedAlgs] = useState(['quickSort', 'mergeSort', 'heapSort', 'bubbleSort']);
  const [runners, setRunners] = useState({});

  const generateArray = (size = arraySize) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 15);
    setBaseArray(arr);
    setWinner(null);
    setIsRunning(false);

    const initialRunners = {};
    selectedAlgs.forEach(key => {
      initialRunners[key] = {
        array: [...arr],
        comparing: [],
        swapped: [],
        pivot: null,
        comps: 0,
        swaps: 0,
        finished: false,
        generator: SORTING_ALGORITHMS[key].generator(arr)
      };
    });
    setRunners(initialRunners);
  };

  useEffect(() => {
    generateArray();
  }, [arraySize, selectedAlgs]);

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
                  array: res.value?.array || runner.array,
                  comparing: [],
                  swapped: [],
                  finished: true,
                  comps: res.value?.comps || runner.comps,
                  swaps: res.value?.swaps || runner.swaps
                };
                newlyFinished.push(key);
              } else {
                activeCount++;
                updated[key] = {
                  ...runner,
                  ...res.value
                };
                if (res.value.comparing?.length > 0) {
                  soundEngine.playCompare(res.value.array[res.value.comparing[0]], 15, 100);
                }
              }
            }
          });

          if (newlyFinished.length > 0) {
            setWinner(prevWinner => {
              if (!prevWinner) {
                soundEngine.playSuccess();
                return SORTING_ALGORITHMS[newlyFinished[0]].name;
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
  }, [isRunning, speed]);

  const toggleRun = () => {
    if (Object.values(runners).every(r => r.finished)) {
      generateArray();
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

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
              Watch algorithms compete side-by-side in real time on identical data sets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SoundControls />
            <button
              onClick={() => generateArray()}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Array
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

        {/* Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-24">Array Size: {arraySize}</span>
            <input
              type="range"
              min="15"
              max="60"
              value={arraySize}
              disabled={isRunning}
              onChange={(e) => setArraySize(Number(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
          </div>
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

          {winner && (
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold">
              <Trophy className="w-4 h-4 text-amber-500" /> Winner: {winner}
            </div>
          )}
        </div>

        {/* Arena Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedAlgs.map((key) => {
            const runner = runners[key] || { array: [], comps: 0, swaps: 0, finished: false };
            const algInfo = SORTING_ALGORITHMS[key];
            const maxVal = Math.max(...runner.array, 100);

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

                {/* Bars Visualizer */}
                <div className="h-44 bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-3 flex items-end justify-center gap-1 border border-slate-200 dark:border-slate-800 mb-4 overflow-hidden">
                  {runner.array.map((val, idx) => {
                    const isComparing = runner.comparing?.includes(idx);
                    const isSwapped = runner.swapped?.includes(idx);
                    const isPivot = runner.pivot === idx;

                    let barColor = `bg-gradient-to-t ${algInfo.color}`;
                    if (isSwapped) barColor = 'bg-rose-500';
                    else if (isComparing) barColor = 'bg-amber-400';
                    else if (isPivot) barColor = 'bg-emerald-400';

                    return (
                      <div
                        key={idx}
                        style={{ height: `${(val / maxVal) * 100}%` }}
                        className={`flex-1 rounded-t-sm transition-all duration-75 ${barColor}`}
                      />
                    );
                  })}
                </div>

                {/* Stats Footer */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Comparisons</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 font-mono">{runner.comps}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Array Swaps</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 font-mono">{runner.swaps}</span>
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

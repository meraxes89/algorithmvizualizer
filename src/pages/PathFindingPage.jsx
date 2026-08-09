import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PathFindingVisualizer from '../components/PathFindingVisualizer';
import { astar, astarInfo } from '../algorithms/pathfinding/astar';
import { dijkstra, dijkstraInfo } from '../algorithms/pathfinding/dijkstra';
import { bfs, bfsInfo } from '../algorithms/pathfinding/bfs';
import { dfs, dfsInfo } from '../algorithms/pathfinding/dfs';

const PathFindingPage = () => {
  const algorithms = [
    { name: 'A* Search', algorithm: astar, info: astarInfo },
    { name: "Dijkstra's Algorithm", algorithm: dijkstra, info: dijkstraInfo },
    { name: 'Breadth-First Search', algorithm: bfs, info: bfsInfo },
    { name: 'Depth-First Search', algorithm: dfs, info: dfsInfo },
  ];

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col">

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <Link to="/algorithms" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pathfinding Algorithms</h1>
          <div className="w-[140px] hidden md:block" />
        </div>

        {/* Algorithm Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {algorithms.map((algo, index) => {
            const isActive = selectedAlgorithm.name === algo.name;
            return (
              <button
                key={index}
                onClick={() => setSelectedAlgorithm(algo)}
                className={`px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all shadow-sm ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-blue-200'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-blue-600'
                }`}
              >
                {algo.name}
              </button>
            );
          })}
        </div>

        {/* Visualizer Container */}
        <div className="flex-1 min-h-[600px] w-full bg-white dark:bg-black border border-slate-200 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <PathFindingVisualizer
            algorithm={selectedAlgorithm.algorithm}
            algorithmInfo={selectedAlgorithm.info}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-zinc-900 bg-white dark:bg-black px-8 py-8 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <img src="/logo-icon.svg" alt="Algo Visualizer" className="w-6 h-6 select-none" draggable="false" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">© 2025 Algorithm Visualizer.</span>
        </div>
      </footer>
    </div>
  );
};

export default PathFindingPage;

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Layers,
  Search,
  MapPin,
  Network,
  Boxes,
  Trees,
  Sparkles,
  Zap
} from 'lucide-react';
import TiltCard from '../components/TiltCard';

const CategoriesPage = () => {
  const categories = [
    {
      title: 'Sorting Algorithms',
      description: 'Visualize popular sorting algorithms like Quick Sort, Merge Sort, Heap Sort, and Bubble Sort.',
      icon: <Layers className="w-6 h-6 text-indigo-400" />,
      path: '/sorting',
      tag: 'SORTING',
      accentColor: 'indigo',
      algorithms: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort', 'Selection Sort']
    },
    {
      title: 'Searching Algorithms',
      description: 'Explore linear and binary search algorithms with range bounds tracking.',
      icon: <Search className="w-6 h-6 text-emerald-400" />,
      path: '/searching',
      tag: 'SEARCHING',
      accentColor: 'emerald',
      algorithms: ['Linear Search', 'Binary Search', 'Jump Search']
    },
    {
      title: 'Pathfinding & 3D Drone',
      description: 'Watch pathfinding algorithms find shortest paths in 2D grids and 3D NYC skyscraper drone mode.',
      icon: <MapPin className="w-6 h-6 text-cyan-400" />,
      path: '/pathfinding',
      tag: 'PATHFINDING',
      accentColor: 'cyan',
      algorithms: ["Dijkstra's Algorithm", 'A* Search', 'BFS', 'DFS']
    },
    {
      title: 'Graph Theory',
      description: 'Explore minimum spanning trees and topological sorting on weighted graphs.',
      icon: <Network className="w-6 h-6 text-purple-400" />,
      path: '/graph',
      tag: 'GRAPHS',
      accentColor: 'purple',
      algorithms: ["Kruskal's MST", "Prim's MST", 'Topological Sort']
    },
    {
      title: 'Recursion & Backtracking',
      description: 'Solve classic recursive problems like Tower of Hanoi and N-Queens with call stack inspector.',
      icon: <Boxes className="w-6 h-6 text-rose-400" />,
      path: '/recursion',
      tag: 'RECURSION',
      accentColor: 'rose',
      algorithms: ['Tower of Hanoi', 'N-Queens Problem']
    },
    {
      title: 'Tree Data Structures',
      description: 'Explore BSTs, AVL Tree rotations, Max/Min Heaps, Tries, and Segment Trees.',
      icon: <Trees className="w-6 h-6 text-amber-400" />,
      path: '/trees',
      tag: 'TREES',
      accentColor: 'amber',
      algorithms: ['Binary Search Tree', 'AVL Rotations', 'Heap Operations', 'Trie Visualizer', 'Segment Tree']
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      {/* Ambient Background is now handled globally by DioramaWrapper */}

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        {/* Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algorithm Categories</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight mb-6 text-slate-900 dark:text-white translate-z-40">Explore Domains</h1>
          <p className="text-base md:text-xl font-display text-slate-600 dark:text-slate-400 leading-relaxed font-medium translate-z-20">
            Select a category to launch interactive 2D/3D visualizations, audio sonification, and step-by-step code traceouts.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <TiltCard key={index} className="rounded-3xl h-full group" breathingDelay={index * 0.3}>
              <Link
                to={category.path}
                className="glass-card p-8 h-full flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/50 transition-all shadow-sm">
                      {category.icon}
                    </div>
                    <span className="font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 group-hover:border-indigo-500/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {category.tag}
                    </span>
                  </div>

                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
                    {category.title}
                  </h2>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-6 relative z-10">
                    {category.description}
                  </p>

                  {/* Ultra-Premium Micro-Visualizer Backgrounds */}
                  {category.tag === 'SORTING' && (
                    <div className="absolute right-4 bottom-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-end gap-1 z-0">
                      <div className="w-1.5 bg-indigo-500/40 dark:bg-indigo-400/90 dark:shadow-[0_0_12px_rgba(129,140,248,0.8)] rounded-full" style={{ animation: 'bars-swap 1.5s infinite ease-in-out' }}></div>
                      <div className="w-1.5 bg-indigo-500/40 dark:bg-indigo-400/90 dark:shadow-[0_0_12px_rgba(129,140,248,0.8)] rounded-full" style={{ animation: 'bars-swap 1.5s infinite ease-in-out 0.2s', height: '15px' }}></div>
                      <div className="w-1.5 bg-indigo-500/40 dark:bg-indigo-400/90 dark:shadow-[0_0_12px_rgba(129,140,248,0.8)] rounded-full" style={{ animation: 'bars-swap 1.5s infinite ease-in-out 0.4s', height: '8px' }}></div>
                    </div>
                  )}
                  {category.tag === 'PATHFINDING' && (
                    <div className="absolute left-4 right-4 bottom-24 h-px bg-cyan-500/20 dark:bg-cyan-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-300 shadow-[0_0_10px_cyan] dark:shadow-[0_0_15px_#67e8f9]" style={{ animation: 'path-solve 2.5s infinite ease-in-out' }}></div>
                    </div>
                  )}

                  <div className="space-y-2.5 mb-6 pt-6 border-t border-slate-100 dark:border-white/5">
                    {category.algorithms.map((algo, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                        <Zap className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span>{algo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-indigo-600 dark:text-indigo-400 pt-5 border-t border-slate-100 dark:border-white/5 group-hover:translate-x-2 transition-transform">
                  <span>Launch Visualizer</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoriesPage;

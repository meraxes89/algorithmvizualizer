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
      {/* Aurora Background */}
      <div className="bg-aurora">
        <div className="bg-aurora-orb"></div>
        <div className="bg-cyber-grid"></div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALGORITHM CATEGORIES</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Explore Domains</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Select a category to launch interactive 2D/3D visualizations, audio sonification, and step-by-step code traceouts.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <TiltCard key={index} className="rounded-3xl h-full">
              <Link
                to={category.path}
                className="glass-card p-8 h-full flex flex-col justify-between group border border-white/10 dark:border-indigo-500/20 hover:border-indigo-500/40 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-indigo-500/20">
                      {category.tag}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-400 transition-colors">
                    {category.title}
                  </h2>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {category.description}
                  </p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                    {category.algorithms.map((algo, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{algo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-indigo-400 pt-4 border-t border-white/5 group-hover:translate-x-1 transition-transform">
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

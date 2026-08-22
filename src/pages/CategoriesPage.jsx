import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Layers,
  Search,
  MapPin,
  Network,
  Boxes,
  Trees,
  Sparkles,
  Zap,
  Brain,
  Swords,
  Code2,
  Trophy,
} from 'lucide-react';
import TiltCard from '../components/TiltCard';

const EASE = [0.22, 1, 0.36, 1];

const CATEGORIES = [
  {
    title: 'Sorting Algorithms',
    description: 'Quick Sort, Merge Sort, Heap Sort and friends — bars, sound and every comparison on screen.',
    Icon: Layers,
    path: '/sorting',
    tag: 'SORTING',
    algorithms: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort', 'Selection Sort']
  },
  {
    title: 'Searching Algorithms',
    description: 'Linear scans versus logarithmic bisection with live range bounds tracking.',
    Icon: Search,
    path: '/searching',
    tag: 'SEARCHING',
    algorithms: ['Linear Search', 'Binary Search', 'Jump Search']
  },
  {
    title: 'Pathfinding & 3D Drone',
    description: 'Shortest paths through mazes and weighted grids — plus a 3D NYC skyscraper drone camera.',
    Icon: MapPin,
    path: '/pathfinding',
    tag: 'PATHFINDING',
    algorithms: ["Dijkstra's Algorithm", 'A* Search', 'BFS', 'DFS']
  },
  {
    title: 'Graph Theory',
    description: 'Minimum spanning trees and topological ordering on graphs you build yourself.',
    Icon: Network,
    path: '/graph',
    tag: 'GRAPHS',
    algorithms: ["Kruskal's MST", "Prim's MST", 'Topological Sort']
  },
  {
    title: 'Recursion & Backtracking',
    description: 'Tower of Hanoi and N-Queens unfolding frame by frame with a call stack inspector.',
    Icon: Boxes,
    path: '/recursion',
    tag: 'RECURSION',
    algorithms: ['Tower of Hanoi', 'N-Queens Problem']
  },
  {
    title: 'Tree Data Structures',
    description: 'BST insertions, AVL rotations, heaps, tries and segment trees — grown before your eyes.',
    Icon: Trees,
    path: '/trees',
    tag: 'TREES',
    algorithms: ['Binary Search Tree', 'AVL Rotations', 'Heap Operations', 'Trie Visualizer', 'Segment Tree']
  },
  {
    title: 'Dynamic Programming',
    description: 'Watch DP tables fill cell by cell — Fibonacci to knapsack to longest common subsequence.',
    Icon: Brain,
    path: '/dp',
    tag: 'DP',
    algorithms: ['Fibonacci', '0/1 Knapsack', 'LCS', 'Grid Paths']
  },
  {
    title: 'Battle Arena',
    description: 'Race sorting, searching and pathfinding algorithms head-to-head on identical inputs.',
    Icon: Swords,
    path: '/arena',
    tag: 'ARENA',
    algorithms: ['Live Races', 'Race Charts', 'Commentary']
  },
  {
    title: 'Code Playground',
    description: 'Multi-language Monaco editor with in-browser execution for JS and Python.',
    Icon: Code2,
    path: '/playground',
    tag: 'PLAYGROUND',
    algorithms: ['C++ · Java · Python · JS', 'Pyodide WASM', 'Multi-file VFS']
  },
  {
    title: 'Algorithm Quiz',
    description: 'Prove your intuition — complexity, patterns and edge cases, scored as you go.',
    Icon: Trophy,
    path: '/quiz',
    tag: 'QUIZ',
    algorithms: ['Complexity Drills', 'Pattern Recognition', 'Instant Scoring']
  }
];

const CategoriesPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 bg-accent-soft border border-line-subtle text-accent px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algorithm Categories</span>
          </motion.div>
          <h1 className="font-display text-5xl md:text-6xl italic tracking-tight mb-6 text-ink">
            Explore Domains
          </h1>
          <p className="text-base md:text-lg text-ink-2 leading-relaxed">
            Ten rooms of the studio — interactive 2D/3D visualizations, audio
            sonification, and step-by-step code traces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.tag}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE, delay: (index % 3) * 0.08 }}
            >
              <TiltCard className="rounded-3xl h-full group" breathingDelay={index * 0.3}>
                <Link
                  to={category.path}
                  className="glass-card p-7 h-full flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <motion.div
                        layoutId={`icon-${category.tag}`}
                        className="w-11 h-11 rounded-xl bg-accent-soft border border-line-subtle text-accent flex items-center justify-center group-hover:scale-110 transition-all"
                      >
                        <category.Icon className="w-5 h-5" />
                      </motion.div>
                      <span className="font-mono bg-paper-1 text-ink-3 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-line-subtle group-hover:text-accent group-hover:border-accent/40 transition-colors">
                        {category.tag}
                      </span>
                    </div>

                    <motion.h2
                      layoutId={`title-${category.tag}`}
                      className="font-display text-xl font-bold text-ink tracking-tight mb-2.5 group-hover:text-accent transition-colors relative z-10"
                    >
                      {category.title}
                    </motion.h2>

                    <p className="text-[13px] text-ink-2 leading-relaxed mb-5 relative z-10">
                      {category.description}
                    </p>

                    {category.tag === 'SORTING' && (
                      <div className="absolute right-5 bottom-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-end gap-1 z-0">
                        {[10, 15, 8].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-accent rounded-full"
                            style={{ height: `${h}px`, animation: `bars-swap 1.5s infinite ease-in-out ${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    )}
                    {category.tag === 'PATHFINDING' && (
                      <div className="absolute left-5 right-5 bottom-28 h-px bg-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]"
                          style={{ animation: 'path-solve 2.5s infinite ease-in-out' }}
                        />
                      </div>
                    )}

                    <div className="space-y-2 mb-5 pt-4 border-t border-line-subtle">
                      {category.algorithms.map((algo, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-[13px] text-ink-2 font-semibold">
                          <Zap className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{algo}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold text-accent pt-4 border-t border-line-subtle group-hover:translate-x-2 transition-transform">
                    <span>Launch Visualizer</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoriesPage;

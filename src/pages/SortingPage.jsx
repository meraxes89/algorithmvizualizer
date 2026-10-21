import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import SortingVisualizer from '../components/SortingVisualizer';
import ComparisonMode from '../components/educational/ComparisonMode';
import { bubbleSort, bubbleSortInfo } from '../algorithms/sorting/bubbleSort';
import { selectionSort, selectionSortInfo } from '../algorithms/sorting/selectionSort';
import { insertionSort, insertionSortInfo } from '../algorithms/sorting/insertionSort';
import { mergeSort, mergeSortInfo } from '../algorithms/sorting/mergeSort';
import { quickSort, quickSortInfo } from '../algorithms/sorting/quickSort';

const SortingPage = () => {
  const algorithms = [
    { name: 'Bubble Sort', algorithm: bubbleSort, info: bubbleSortInfo },
    { name: 'Selection Sort', algorithm: selectionSort, info: selectionSortInfo },
    { name: 'Insertion Sort', algorithm: insertionSort, info: insertionSortInfo },
    { name: 'Merge Sort', algorithm: mergeSort, info: mergeSortInfo },
    { name: 'Quick Sort', algorithm: quickSort, info: quickSortInfo },
  ];

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareAlgos, setCompareAlgos] = useState(null);

  const handleCompare = (algo1Name, algo2Name) => {
    const a1 = algorithms.find(a => a.name === algo1Name);
    const a2 = algorithms.find(a => a.name === algo2Name);
    if (a1 && a2) {
      setCompareAlgos([a1, a2]);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      {/* Ambient Background */}
      <div className="bg-ambient"></div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <Link
            to="/algorithms"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 bg-slate-900/60 dark:bg-black/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md transition-all hover:border-indigo-500/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Link>

          <div className="flex flex-col items-center justify-center">
            <motion.div layoutId="icon-SORTING" className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 hidden md:flex">
              <Layers className="w-6 h-6 text-indigo-400" />
            </motion.div>
            <motion.h1 layoutId="title-SORTING" className="text-3xl font-extrabold tracking-tight">
              Sorting Algorithms
            </motion.h1>
            <p className="text-xs text-slate-400 mt-1">Real-time array operations & sound synthesis</p>
          </div>

          <button
            onClick={() => {
              setIsCompareOpen(!isCompareOpen);
              if (isCompareOpen) setCompareAlgos(null);
            }}
            className={`text-xs px-4 py-2 rounded-xl transition-all ${
              isCompareOpen ? 'btn-premium' : 'btn-secondary'
            }`}
          >
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>{isCompareOpen ? 'Exit Compare' : 'Compare Mode'}</span>
          </button>
        </div>

        {/* Comparison Selector */}
        {isCompareOpen && (
          <div className="mb-8 glass-card border border-indigo-500/20 p-4 rounded-3xl overflow-hidden shadow-2xl">
            <ComparisonMode
              algorithms={algorithms}
              onCompare={handleCompare}
              isOpen={isCompareOpen}
            />
          </div>
        )}

        {/* Algorithm Selector Pills */}
        {!compareAlgos && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {algorithms.map((algo, index) => {
              const isActive = selectedAlgorithm.name === algo.name;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedAlgorithm(algo)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50 scale-105'
                      : 'glass-card text-slate-400 hover:text-white hover:border-indigo-500/30'
                  }`}
                >
                  {algo.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Visualizer Stage */}
        {compareAlgos ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px] w-full">
            <div className="glass-card border border-white/10 dark:border-indigo-500/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              <SortingVisualizer
                algorithm={compareAlgos[0].algorithm}
                algorithmInfo={compareAlgos[0].info}
              />
            </div>
            <div className="glass-card border border-white/10 dark:border-indigo-500/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              <SortingVisualizer
                algorithm={compareAlgos[1].algorithm}
                algorithmInfo={compareAlgos[1].info}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[600px] w-full glass-card border border-white/10 dark:border-indigo-500/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <SortingVisualizer
              algorithm={selectedAlgorithm.algorithm}
              algorithmInfo={selectedAlgorithm.info}
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default SortingPage;

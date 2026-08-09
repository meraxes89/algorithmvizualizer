import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ArrowRight,
  PlayCircle,
  Code2,
  BarChart2,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ChevronDown,
  List,
  Activity,
  Bookmark,
  Share2,
  GitBranch,
  Network,
  Search,
  BookOpen as BookOpenIcon,
  Notebook as NotebookIcon
} from 'lucide-react';
import GitLabIcon from '../components/GitLabIcon';
import Logo from '../components/Logo';

const QUICK_SORT_FRAMES = [
  // 0: Initial
  [
    { val: 8, color: 'bg-indigo-200' }, { val: 3, color: 'bg-indigo-200' }, { val: 7, color: 'bg-indigo-200' },
    { val: 4, color: 'bg-indigo-200' }, { val: 9, color: 'bg-indigo-200' }, { val: 2, color: 'bg-indigo-200' },
    { val: 6, color: 'bg-indigo-200' }, { val: 1, color: 'bg-indigo-200' }, { val: 5, color: 'bg-indigo-500' }
  ],
  // 1: Compare 8 and 5 -> 8 > 5 (Pink comparing)
  [
    { val: 8, color: 'bg-pink-400' }, { val: 3, color: 'bg-indigo-200' }, { val: 7, color: 'bg-indigo-200' },
    { val: 4, color: 'bg-indigo-200' }, { val: 9, color: 'bg-indigo-200' }, { val: 2, color: 'bg-indigo-200' },
    { val: 6, color: 'bg-indigo-200' }, { val: 1, color: 'bg-indigo-200' }, { val: 5, color: 'bg-indigo-500' }
  ],
  // 2: Compare 3 and 5 -> 3 < 5, swap (i=0)
  [
    { val: 3, color: 'bg-orange-400' }, { val: 8, color: 'bg-indigo-200' }, { val: 7, color: 'bg-indigo-200' },
    { val: 4, color: 'bg-indigo-200' }, { val: 9, color: 'bg-indigo-200' }, { val: 2, color: 'bg-indigo-200' },
    { val: 6, color: 'bg-indigo-200' }, { val: 1, color: 'bg-indigo-200' }, { val: 5, color: 'bg-indigo-500' }
  ],
  // 3: Compare 4 and 5 -> 4 < 5, swap (i=1)
  [
    { val: 3, color: 'bg-indigo-200' }, { val: 4, color: 'bg-orange-400' }, { val: 7, color: 'bg-indigo-200' },
    { val: 8, color: 'bg-indigo-200' }, { val: 9, color: 'bg-indigo-200' }, { val: 2, color: 'bg-indigo-200' },
    { val: 6, color: 'bg-indigo-200' }, { val: 1, color: 'bg-indigo-200' }, { val: 5, color: 'bg-indigo-500' }
  ],
  // 4: Compare 2 and 5 -> 2 < 5, swap (i=2)
  [
    { val: 3, color: 'bg-indigo-200' }, { val: 4, color: 'bg-indigo-200' }, { val: 2, color: 'bg-orange-400' },
    { val: 8, color: 'bg-indigo-200' }, { val: 9, color: 'bg-indigo-200' }, { val: 7, color: 'bg-indigo-200' },
    { val: 6, color: 'bg-indigo-200' }, { val: 1, color: 'bg-indigo-200' }, { val: 5, color: 'bg-indigo-500' }
  ],
  // 5: Compare 1 and 5 -> 1 < 5, swap (i=3)
  [
    { val: 3, color: 'bg-indigo-200' }, { val: 4, color: 'bg-indigo-200' }, { val: 2, color: 'bg-indigo-200' },
    { val: 1, color: 'bg-orange-400' }, { val: 9, color: 'bg-indigo-200' }, { val: 7, color: 'bg-indigo-200' },
    { val: 6, color: 'bg-indigo-200' }, { val: 8, color: 'bg-indigo-200' }, { val: 5, color: 'bg-indigo-500' }
  ],
  // 6: End loop, swap pivot with i+1
  [
    { val: 3, color: 'bg-indigo-200' }, { val: 4, color: 'bg-indigo-200' }, { val: 2, color: 'bg-indigo-200' },
    { val: 1, color: 'bg-indigo-200' }, { val: 5, color: 'bg-orange-400' }, { val: 7, color: 'bg-indigo-200' },
    { val: 6, color: 'bg-indigo-200' }, { val: 8, color: 'bg-indigo-200' }, { val: 9, color: 'bg-indigo-200' }
  ]
];

const TYPEWRITER_PHRASES = [
  "Watching.",
  "Step-by-Step Execution.",
  "Interactive 3D Rendering.",
  "Building Intuition.",
  "Mastering Code Logic.",
];

const TypewriterText = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetPhrase = TYPEWRITER_PHRASES[phraseIndex];
    let typingSpeed = isDeleting ? 35 : 65;

    if (!isDeleting && currentText === targetPhrase) {
      typingSpeed = 2200; // Pause when word is fully typed
      const timeout = setTimeout(() => setIsDeleting(true), typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      typingSpeed = 300; // Pause before typing next word
      const timeout = setTimeout(() => {}, typingSpeed);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setCurrentText(
        isDeleting
          ? targetPhrase.substring(0, currentText.length - 1)
          : targetPhrase.substring(0, currentText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  return (
    <span className="inline-inline">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 font-extrabold">
        {currentText}
      </span>
      <span className="inline-block w-[3px] h-[0.8em] bg-indigo-600 dark:bg-cyan-400 ml-1 rounded-full animate-pulse align-middle" />
    </span>
  );
};

const Home = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % QUICK_SORT_FRAMES.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => setCurrentFrame(0);
  const handleNext = () => setCurrentFrame((prev) => Math.min(prev + 1, QUICK_SORT_FRAMES.length - 1));

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-blue-100 transition-colors duration-200">

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-32">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm">
              <Star className="w-3.5 h-3.5" />
              Visualize. Understand. Master.
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.15] font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight min-h-[140px] sm:min-h-[125px]">
              Visualize Algorithms.<br />
              Learn by <TypewriterText />
            </h1>
            
            <p className="text-[17px] text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-xl">
              Explore interactive visualizations of data structures and algorithms. Understand how they work step by step.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <Link to="/algorithms" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
                Explore Algorithms
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/playground" className="flex items-center gap-2 bg-[#faf7f2] dark:bg-zinc-900 hover:bg-[#f2eee7] dark:hover:bg-zinc-800 text-slate-800 dark:text-slate-200 border border-[#e7e1d7] dark:border-zinc-800 font-medium px-6 py-3 rounded-xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
                Try Playground
                <Code2 className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[13px] font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-indigo-500" />
                Step-by-step Execution
              </div>
              <div className="w-px h-4 bg-[#e7e1d7] dark:bg-zinc-800"></div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                View Code
              </div>
              <div className="w-px h-4 bg-[#e7e1d7] dark:bg-zinc-800"></div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-500" />
                Track Complexity
              </div>
            </div>
          </div>

          {/* Right Content - Mock Chart */}
          <div className="flex-1 w-full max-w-xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-3xl transform rotate-3 scale-105 -z-10 blur-xl"></div>
            <div className="bg-[#faf7f2] dark:bg-zinc-950 border border-[#e7e1d7] dark:border-zinc-800/80 rounded-2xl shadow-2xl shadow-indigo-500/5 dark:shadow-black/50 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Quick Sort</h3>
                  <span className="inline-block bg-[#f0ebe1] dark:bg-zinc-900 text-slate-600 dark:text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 border border-[#e3dcd0] dark:border-zinc-800">
                    Divide and Conquer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm shadow-indigo-500/20 transition-all">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center bg-[#faf7f2] dark:bg-zinc-900 border border-[#e7e1d7] dark:border-zinc-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-[#f2eee7] dark:hover:bg-zinc-800">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button onClick={handleReset} className="w-8 h-8 flex items-center justify-center bg-[#faf7f2] dark:bg-zinc-900 border border-[#e7e1d7] dark:border-zinc-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:bg-[#f2eee7] dark:hover:bg-zinc-800">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 bg-[#faf7f2] dark:bg-zinc-900 border border-[#e7e1d7] dark:border-zinc-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2 py-1.5 rounded-lg ml-2 shadow-sm">
                    1x <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Chart Graphic */}
              <div className="h-48 flex items-end justify-center gap-3 mb-6 relative">
                {QUICK_SORT_FRAMES[currentFrame].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group relative">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{item.val}</span>
                    <div className={`w-8 rounded-t-sm ${item.color} transition-all duration-300`} style={{ height: `${item.val * 16}px` }}></div>
                    <span className="text-[10px] text-slate-400 absolute -bottom-5">{i}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-8 mt-2 border-t border-[#e7e1d7] dark:border-zinc-900">
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-sm bg-indigo-200"></div> Low
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-sm bg-indigo-300"></div> High
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-sm bg-indigo-500"></div> Pivot
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-sm bg-pink-400"></div> Comparing
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <div className="w-3 h-3 rounded-sm bg-orange-400"></div> Sorted
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Algorithms */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Popular Algorithms</h2>
            <Link to="/algorithms" className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all algorithms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick Sort */}
            <Link to="/sorting" className="bg-[#faf7f2] dark:bg-zinc-950 border border-[#e7e1d7] dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100/80 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center">
                  <List className="w-5 h-5" />
                </div>
                <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">Sorting</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Quick Sort</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Efficient sorting using divide and conquer
              </p>
              <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 transition-colors">
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Avg. O(n log n)</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Merge Sort */}
            <Link to="/sorting" className="bg-[#faf7f2] dark:bg-zinc-950 border border-[#e7e1d7] dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100/80 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-500/20">Sorting</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Merge Sort</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Stable sorting using divide and conquer
              </p>
              <div className="flex items-center justify-between text-slate-400 group-hover:text-orange-500 transition-colors">
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Avg. O(n log n)</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Binary Search */}
            <Link to="/searching" className="bg-[#faf7f2] dark:bg-zinc-950 border border-[#e7e1d7] dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">Searching</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Binary Search</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Efficient search in sorted arrays
              </p>
              <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-600 transition-colors">
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">O(log n)</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Dijkstra's */}
            <Link to="/pathfinding" className="bg-[#faf7f2] dark:bg-zinc-950 border border-[#e7e1d7] dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center">
                  <Network className="w-5 h-5" />
                </div>
                <span className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-500/20">Graphs</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Dijkstra's</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Shortest path in weighted graphs
              </p>
              <div className="flex items-center justify-between text-slate-400 group-hover:text-blue-600 transition-colors">
                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">O((V + E) log V)</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
          
          <div className="flex justify-center mt-8 gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
             <div className="w-2 h-2 rounded-full bg-[#e7e1d7] dark:bg-zinc-800"></div>
             <div className="w-2 h-2 rounded-full bg-[#e7e1d7] dark:bg-zinc-800"></div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="bg-[#f0ebe1] dark:bg-zinc-950 border border-[#e3dcd0] dark:border-zinc-800/80 rounded-3xl p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#faf7f2] dark:bg-zinc-900 shadow-sm border border-[#e7e1d7] dark:border-zinc-800 flex items-center justify-center shrink-0">
                <PlayCircle className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-slate-900 dark:text-white mb-1">Interactive Visualizations</h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">Watch algorithms come to life with beautiful animations.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#faf7f2] dark:bg-zinc-900 shadow-sm border border-[#e7e1d7] dark:border-zinc-800 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-slate-900 dark:text-white mb-1">Real Code, Real Logic</h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">See the source code and understand the logic behind each step.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#faf7f2] dark:bg-zinc-900 shadow-sm border border-[#e7e1d7] dark:border-zinc-800 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-slate-900 dark:text-white mb-1">Analyze Complexity</h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">Understand time and space complexity with ease.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#faf7f2] dark:bg-zinc-900 shadow-sm border border-[#e7e1d7] dark:border-zinc-800 flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-slate-900 dark:text-white mb-1">Save & Track Progress</h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">Save your favorite algorithms and continue learning.</p>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#f2eee7] dark:bg-black border-t border-[#e7e1d7] dark:border-zinc-900 px-8 py-12 mt-16 transition-colors duration-200">
        <div className="max-w-5xl mx-auto">

          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">

            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo className="w-9 h-9" />
                <span className="text-[15px] font-medium text-slate-800 dark:text-slate-100">Algorithm Visualizer</span>
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                An interactive platform to explore sorting, searching, graph, and pathfinding algorithms — step by step, visually.
              </p>
              <div className="flex gap-2">
                <span className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400">
                  Open Source
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400">
                  v1.0
                </span>
              </div>
            </div>

            {/* Resources Column */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">Resources</p>
              <div className="flex flex-col gap-3">
                <a href="https://gitlab.com/sireenyadav/algorithmvizualizer" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 no-underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <GitLabIcon className="w-4 h-4 text-indigo-500" />
                  GitLab Repository
                </a>
                <a href="https://gitlab.com/sireenyadav" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 no-underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <GitLabIcon className="w-4 h-4 text-indigo-500" />
                  GitLab Profile
                </a>
              </div>
            </div>

            {/* Topics Column */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {["Sorting", "Searching", "Graphs", "Pathfinding", "Trees", "DP"].map(tag => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12px] text-slate-500 dark:text-slate-600 m-0">
              Built by{" "}
              <a href="https://gitlab.com/sireenyadav/algorithmvizualizer" target="_blank" rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-500 no-underline hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                Sireen Yadav
              </a>{" "}
              · Interactive Algorithm Visualizer
            </p>
            <p className="text-[12px] text-slate-500 dark:text-slate-600 m-0">© 2026 Algorithm Visualizer</p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;
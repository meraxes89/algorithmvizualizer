import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  ArrowRight,
  PlayCircle,
  Code2,
  BarChart2,
  Activity,
  Bookmark,
  Share2,
  Network,
  Search,
  List,
  Layers,
  Cpu,
  Swords,
  Trophy,
  Box
} from 'lucide-react';
import GitLabIcon from '../components/GitLabIcon';
import Logo from '../components/Logo';
import TiltCard from '../components/TiltCard';
import Hero3DVisualizer from '../components/3D/Hero3DVisualizer';
import MagneticButton from '../components/MagneticButton';

const TYPEWRITER_PHRASES = [
  { 
    text: "Watching.", 
    color: "text-indigo-600 dark:text-indigo-400", 
    font: "font-cursive font-bold text-4xl sm:text-5xl lg:text-[3.8rem]" 
  },
  { 
    text: "Step-by-Step Execution.", 
    color: "text-emerald-600 dark:text-emerald-400", 
    font: "font-pixel tracking-wider text-xl sm:text-2xl lg:text-[2.2rem]" 
  },
  { 
    text: "Interactive 3D Rendering.", 
    color: "text-cyan-500 dark:text-cyan-400", 
    font: "font-orbitron font-extrabold tracking-widest text-2xl sm:text-3xl lg:text-[2.6rem]" 
  },
  { 
    text: "Building Intuition.", 
    color: "text-rose-600 dark:text-rose-400", 
    font: "font-serif-italic italic font-bold text-3xl sm:text-4xl lg:text-[3.2rem]" 
  },
  { 
    text: "Mastering Code Logic.", 
    color: "text-amber-600 dark:text-amber-400", 
    font: "font-mono font-bold tracking-tight text-2xl sm:text-3xl lg:text-[2.8rem]" 
  },
];

const TypewriterText = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetPhrase = TYPEWRITER_PHRASES[phraseIndex].text;
    let typingSpeed = isDeleting ? 35 : 65;

    if (!isDeleting && currentText === targetPhrase) {
      typingSpeed = 2200;
      const timeout = setTimeout(() => setIsDeleting(true), typingSpeed);
      return () => clearTimeout(timeout);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      typingSpeed = 300;
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

  const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];

  return (
    <span className="inline">
      <span className={`${currentPhrase.color} ${currentPhrase.font} transition-all duration-300`}>
        {currentText}
      </span>
      <span className="inline-block w-[3px] h-[0.8em] bg-current ml-1.5 rounded-full animate-pulse align-middle" />
    </span>
  );
};

const Home = () => {
  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
      {/* Ambient Background is now handled globally by DioramaWrapper */}

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 mb-28">
          
          {/* Left Content */}
          <div className="flex-1 max-w-2xl text-left">
            
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.15] font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight min-h-[140px] sm:min-h-[125px] translate-z-40">
              Visualize Algorithms.<br />
              Learn by <TypewriterText />
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-xl">
              Explore interactive visualizations of data structures and algorithms with frame-by-frame precision, 3D WebGL rendering, and multi-language execution.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12 translate-z-20 preserve-3d">
              <MagneticButton>
                <Link
                  to="/algorithms"
                  className="btn-premium px-7 py-3.5 text-sm rounded-2xl flex items-center gap-2"
                >
                  <span>Explore Algorithms</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton>
                <Link
                  to="/arena"
                  className="btn-secondary glass-card px-6 py-3.5 text-sm rounded-2xl flex items-center gap-2"
                >
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>Battle Arena</span>
                </Link>
              </MagneticButton>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>60 FPS WebGL</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Code Inspector</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Client WASM</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Call Stack Trace</span>
              </div>
            </div>

          </div>

          {/* Right Content: 3D Stage matching theme */}
          <div className="flex-1 w-full max-w-xl">
            <Hero3DVisualizer />
          </div>

        </div>

        {/* POPULAR ALGORITHMS GRID */}
        <motion.div 
          className="mb-28"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <motion.div variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
                Popular Algorithms
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Explore real-time visualizers across core computer science domains.
              </p>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }}>
              <Link
                to="/algorithms"
                className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1.5 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 transition-all hover:border-indigo-500/40"
              >
                <span>View All Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Quick Sort */}
            <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }}>
              <TiltCard className="rounded-2xl h-full">
                <Link to="/sorting" className="block glass-card p-6 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <List className="w-5 h-5" />
                      </div>
                      <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-indigo-500/20">
                        SORTING
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      Quick Sort
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      Divide-and-conquer partition sorting with 3D bars and step highlights.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-400 transition-colors pt-4 border-t border-white/5">
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">Avg. O(n log n)</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </TiltCard>
            </motion.div>

            {/* Merge Sort */}
            <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }}>
              <TiltCard className="rounded-2xl h-full">
                <Link to="/sorting" className="block glass-card p-6 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <span className="bg-purple-500/10 text-purple-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-purple-500/20">
                        SORTING
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-purple-400 transition-colors">
                      Merge Sort
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      Guaranteed O(n log n) stable sorting using recursive sub-array division.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-purple-400 transition-colors pt-4 border-t border-white/5">
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">O(n log n)</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </TiltCard>
            </motion.div>

            {/* Dijkstra's Search */}
            <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }}>
              <TiltCard className="rounded-2xl h-full">
                <Link to="/pathfinding" className="block glass-card p-6 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Network className="w-5 h-5" />
                      </div>
                      <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-cyan-500/20">
                        PATHFINDING
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      Dijkstra's Algorithm
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      Shortest-path graph traversal with 3D NYC skyscraper drone camera mode.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400 transition-colors pt-4 border-t border-white/5">
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">O((V + E) log V)</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </TiltCard>
            </motion.div>

            {/* Binary Search */}
            <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }}>
              <TiltCard className="rounded-2xl h-full">
                <Link to="/searching" className="block glass-card p-6 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Search className="w-5 h-5" />
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-500/20">
                        SEARCHING
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      Binary Search
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      Logarithmic range trimming on sorted arrays with dynamic bounds tracking.
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-400 transition-colors pt-4 border-t border-white/5">
                    <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">O(log n)</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </TiltCard>
            </motion.div>

          </div>
        </motion.div>

        {/* FEATURE HIGHLIGHT CARDS */}
        <motion.div 
          className="glass-card p-8 lg:p-10 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <motion.div 
              className="flex items-start gap-4"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  Step-by-Step Control
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pause, step forward, rewind, or scrub speeds at 60 FPS precision.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-4"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  Real Code & Logic
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Inspect source code and line-by-line step updates in real time.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-4"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  Algorithm Battle Arena
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Race algorithms side-by-side on identical input data in real time.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-4"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                  Client WASM Editor
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Run C++, Python, Java, and JS code directly in Monaco Editor playground.
                </p>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </main>

      {/* FOOTER */}
      <footer className="w-full relative z-10 bg-slate-100/80 dark:bg-black/60 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 px-8 py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Algorithm Visualizer</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <a
              href="https://gitlab.com/sireenyadav/algorithmvizualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <GitLabIcon className="w-4 h-4 text-indigo-500" />
              GitLab Repository
            </a>
            <span>•</span>
            <p className="m-0">Designed & Engineered by <strong className="text-slate-800 dark:text-slate-200">Sireen Yadav</strong></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
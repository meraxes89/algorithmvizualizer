import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Search, Shuffle, Settings, BookOpen, Code2, FileText } from 'lucide-react';
import { generateSortedArray, SPEED_PRESETS, COLORS } from '../utils/animationHelpers';
import ExplanationPanel from './educational/ExplanationPanel';
import CodeViewer from './educational/CodeViewer';
import CustomTestCases from './educational/CustomTestCases';
import { algorithmDatabase } from '../data/algorithmData';

const SearchingVisualizer = ({ algorithm, algorithmInfo }) => {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [foundIndex, setFoundIndex] = useState(-1);
  const [searchRange, setSearchRange] = useState([-1, -1]);
  const [isSearching, setIsSearching] = useState(false);
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(SPEED_PRESETS.MEDIUM);
  const [searchResult, setSearchResult] = useState(null);

  const [showExplanation, setShowExplanation] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [showCustomTest, setShowCustomTest] = useState(false);

  useEffect(() => {
    resetArray();
  }, [arraySize, algorithmInfo.name]);

  const resetArray = () => {
    if (!isSearching) {
      const newArray = generateSortedArray(arraySize, 1, 100);
      setArray(newArray);
      setTarget(newArray[Math.floor(Math.random() * newArray.length)]);
      setCurrentIndex(-1);
      setFoundIndex(-1);
      setSearchRange([-1, -1]);
      setSearchResult(null);
    }
  };

  const handleSearch = async () => {
    if (isSearching) return;
    
    setIsSearching(true);
    setCurrentIndex(-1);
    setFoundIndex(-1);
    setSearchRange([-1, -1]);
    setSearchResult(null);

    const startTime = Date.now();
    const result = await algorithm(
      array,
      target,
      setCurrentIndex,
      setFoundIndex,
      setSearchRange,
      speed
    );
    const endTime = Date.now();

    setSearchResult({
      found: result !== -1,
      index: result,
      time: endTime - startTime,
    });

    setIsSearching(false);
  };

  const getBarColor = (index) => {
    if (foundIndex === index) return '#10b981'; // emerald-500
    if (currentIndex === index) return '#f43f5e'; // rose-500
    if (searchRange[0] !== -1 && index >= searchRange[0] && index <= searchRange[1]) {
      return '#34d399'; // emerald-400
    }
    return '#a7f3d0'; // emerald-200 (using a light green base)
  };

  const maxValue = Math.max(...array, 1);

  return (
    <div className="w-full flex-1 min-h-[600px] relative flex flex-col bg-slate-50 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/50">
      
      {/* Visualization Area */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 w-full h-full flex items-end justify-center gap-[4px] p-6 pb-24 overflow-hidden">
          {array.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="rounded-t-md transition-all duration-150 border border-black/5 shadow-sm"
                style={{
                  height: `${(value / maxValue) * 80}%`,
                  width: `${Math.max(800 / array.length, 16)}px`,
                  backgroundColor: getBarColor(idx),
                  minHeight: '24px',
                }}
              />
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Telemetry & Info Header (Top Left) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="pointer-events-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 px-5 py-4 rounded-2xl shadow-xl shadow-emerald-500/5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-500" />
            {algorithmInfo.name}
          </h2>
          
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <div className="bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50">
              <span className="opacity-60 mr-1">Time:</span> <span className="font-mono font-bold">{algorithmInfo.timeComplexity}</span>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50">
              <span className="opacity-60 mr-1">Space:</span> <span className="font-mono font-bold">{algorithmInfo.spaceComplexity}</span>
            </div>
          </div>
          
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            {algorithmInfo.description}
          </p>

          {/* Search Result Float */}
          {searchResult && (
            <div className={`mt-3 px-3 py-2 text-[12px] font-bold rounded-lg border shadow-sm ${
              searchResult.found 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
            }`}>
              {searchResult.found
                ? `Found at index ${searchResult.index} in ${searchResult.time}ms`
                : `Element ${target} not found in ${searchResult.time}ms`}
            </div>
          )}
        </div>
      </div>

      {/* Floating HUD Controls (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 p-2 rounded-2xl shadow-2xl shadow-emerald-500/10">
          
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-2 py-1 focus-within:border-emerald-500/50 transition-colors mr-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Target</span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              disabled={isSearching}
              className="w-14 bg-transparent text-slate-900 dark:text-white font-bold text-sm outline-none text-center appearance-none"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95"
          >
            <Search size={16} /> {isSearching ? 'Wait...' : 'Search'}
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          <button
            onClick={resetArray}
            disabled={isSearching}
            title="New Random Array"
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[12px] font-bold transition-all"
          >
            <Shuffle size={16} className="text-slate-400" /> Array
          </button>

          {/* Array Size slider inside HUD */}
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-1.5 ml-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Size</span>
            <input
              type="range"
              min="10"
              max="50"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isSearching}
              className="w-16 accent-emerald-500"
            />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 w-4 text-center">{arraySize}</span>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          {/* Educational Tools */}
          <div className="flex bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-0.5">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              title="Algorithm Explanation"
              className={`p-1.5 rounded-lg transition-all ${showExplanation ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={() => setShowCodeViewer(!showCodeViewer)}
              title="Source Code"
              className={`p-1.5 rounded-lg transition-all ${showCodeViewer ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <Code2 size={16} />
            </button>
            <button
              onClick={() => setShowCustomTest(!showCustomTest)}
              title="Custom Test Case"
              className={`p-1.5 rounded-lg transition-all ${showCustomTest ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <FileText size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* Floating Legend (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none hidden lg:block">
        <div className="flex flex-col gap-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-lg shadow-emerald-500/5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-sm bg-[#a7f3d0]"></div>
            <span className="uppercase tracking-widest">Unsearched</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-sm bg-[#34d399]"></div>
            <span className="uppercase tracking-widest">Search Range</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-sm bg-[#f43f5e]"></div>
            <span className="uppercase tracking-widest">Checking</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-sm bg-[#10b981]"></div>
            <span className="uppercase tracking-widest">Found</span>
          </div>
        </div>
      </div>

      {/* Educational Modals/Overlays */}
      <ExplanationPanel
        algorithmInfo={algorithmDatabase.searching[algorithmInfo.name === 'Binary Search' ? 'binarySearch' : 'linearSearch'] || algorithmInfo}
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
      />

      {showCodeViewer && (
        <div className="absolute bottom-24 right-6 h-[60%] w-[400px] z-40">
          <div className="w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-2 right-2 z-50">
              <button onClick={() => setShowCodeViewer(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 p-1.5 rounded-full"><BookOpen size={14} /></button>
            </div>
             <CodeViewer
              codeSnippets={algorithmDatabase.searching[algorithmInfo.name === 'Binary Search' ? 'binarySearch' : 'linearSearch']?.codeSnippets}
              isOpen={showCodeViewer}
              onClose={() => setShowCodeViewer(false)}
            />
          </div>
        </div>
      )}

      {showCustomTest && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl rounded-2xl overflow-hidden p-2">
            <CustomTestCases
              onApplyTest={(customArr) => {
                const sorted = [...customArr].sort((a, b) => a - b);
                setArray(sorted);
                if (!sorted.includes(target)) setTarget(sorted[0] || 0);
                setShowCustomTest(false);
              }}
              isOpen={showCustomTest}
              onClose={() => setShowCustomTest(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchingVisualizer;

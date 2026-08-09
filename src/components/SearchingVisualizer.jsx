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
      
      {/* Top Header & Telemetry Bar */}
      <div className="w-full z-10 p-4 sm:p-6 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-500" />
            {algorithmInfo.name}
          </h2>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            {algorithmInfo.description}
          </p>
        </div>

        {/* Telemetry & Search Result Float */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <span className="opacity-60 mr-1">Time:</span> <span className="font-mono font-bold">{algorithmInfo.timeComplexity}</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <span className="opacity-60 mr-1">Space:</span> <span className="font-mono font-bold">{algorithmInfo.spaceComplexity}</span>
          </div>
          {searchResult && (
            <div className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border shadow-sm ${
              searchResult.found 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
            }`}>
              {searchResult.found
                ? `Found @ idx ${searchResult.index} (${searchResult.time}ms)`
                : `Not found (${searchResult.time}ms)`}
            </div>
          )}
        </div>
      </div>

      {/* Main Visualization Viewport */}
      <div className="flex-1 w-full relative flex items-end justify-center gap-[4px] p-6 pb-32 overflow-hidden">
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

      {/* Legend & HUD Floating Control Dock */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-0 mx-auto z-20 flex flex-col items-center gap-2 w-full max-w-full px-2 pointer-events-none">
        
        {/* Compact Horizontal Legend Dock */}
        <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 px-3 sm:px-4 py-1 rounded-full shadow-lg text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 overflow-x-auto max-w-full scrollbar-hide">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full bg-[#a7f3d0]" />
            <span className="uppercase tracking-wider">Unsearched</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            <span className="uppercase tracking-wider">Range</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
            <span className="uppercase tracking-wider">Checking</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="uppercase tracking-wider">Found</span>
          </div>
        </div>

        {/* Floating HUD Controls Pill Container */}
        <div className="pointer-events-auto w-full max-w-full overflow-x-auto scrollbar-hide flex justify-start sm:justify-center px-1">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 p-1.5 sm:p-2 rounded-2xl shadow-2xl shadow-emerald-500/10 min-w-max mx-auto">
            
            <div className="flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-2 py-1 focus-within:border-emerald-500/50 transition-colors mr-0.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-0.5">Target</span>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                disabled={isSearching}
                className="w-12 bg-transparent text-slate-900 dark:text-white font-bold text-xs outline-none text-center appearance-none"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Search size={15} /> {isSearching ? 'Wait...' : 'Search'}
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>

            <button
              onClick={resetArray}
              disabled={isSearching}
              title="New Random Array"
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all whitespace-nowrap"
            >
              <Shuffle size={15} className="text-slate-400" /> Array
            </button>

            {/* Array Size slider inside HUD */}
            <div className="flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-2 py-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Size</span>
              <input
                type="range"
                min="10"
                max="50"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isSearching}
                className="w-14 accent-emerald-500"
              />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 w-3 text-center">{arraySize}</span>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>

            {/* Educational Tools */}
            <div className="flex bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-0.5">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                title="Algorithm Explanation"
                className={`p-1.5 rounded-lg transition-all ${showExplanation ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <BookOpen size={15} />
              </button>
              <button
                onClick={() => setShowCodeViewer(!showCodeViewer)}
                title="Source Code"
                className={`p-1.5 rounded-lg transition-all ${showCodeViewer ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <Code2 size={15} />
              </button>
              <button
                onClick={() => setShowCustomTest(!showCustomTest)}
                title="Custom Test Case"
                className={`p-1.5 rounded-lg transition-all ${showCustomTest ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <FileText size={15} />
              </button>
            </div>

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
        <div className="absolute bottom-28 right-4 sm:right-6 h-[60%] w-[90%] sm:w-[400px] z-40">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50">
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

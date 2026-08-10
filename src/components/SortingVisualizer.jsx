import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Shuffle, Settings, BookOpen, Code2, FileText, SkipForward, Box, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { generateRandomArray, SPEED_PRESETS, COLORS } from '../utils/animationHelpers';
import StepControls from './educational/StepControls';
import ExplanationPanel from './educational/ExplanationPanel';
import CodeViewer from './educational/CodeViewer';
import CustomTestCases from './educational/CustomTestCases';
import { algorithmDatabase } from '../data/algorithmData';
import { soundEngine } from '../utils/soundEngine';
import { triggerVictoryConfetti, getColorsFromTailwind } from '../utils/confettiHelper';
import SoundControls from './SoundControls';
import Sorting3DVisualizer from './3D/Sorting3DVisualizer';
import MemoryStackInspector from './MemoryStackInspector';
import { toast } from './Toast';
import { useGesture } from '@use-gesture/react';

const SortingVisualizer = ({ algorithm, algorithmInfo }) => {
  const [array, setArray] = useState([]);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  
  const [arraySize, setArraySize] = useState(40);
  const [speed, setSpeed] = useState(SPEED_PRESETS.FAST);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [showCustomTest, setShowCustomTest] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  
  // Playback state
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSorting, setIsSorting] = useState(false); // true while pre-computing

  useEffect(() => {
    resetArray();
  }, [arraySize, algorithmInfo.name]);

  const resetArray = (customArray = null) => {
    setIsPlaying(false);
    setIsPaused(false);
    setSteps([]);
    setCurrentStepIndex(0);
    
    const newArray = customArray || generateRandomArray(arraySize);
    setArray(newArray);
    setComparingIndices([]);
    setSwappingIndices([]);
    setSortedIndices([]);
  };

  const handleSort = async () => {
    if (steps.length > 0 && currentStepIndex === 0) {
      // If we already have steps computed and we're at the start, just play
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }
    
    // Otherwise, generate the steps
    setIsSorting(true);
    
    const generatedSteps = [];
    let currentArrayState = [...array];
    let currentComparing = [];
    let currentSwapping = [];

    const addStep = (arr, comp, swap) => {
      generatedSteps.push({
        arrayState: [...(arr || currentArrayState)],
        comparingIndices: [...(comp || currentComparing)],
        swappingIndices: [...(swap || currentSwapping)],
        isSorted: false
      });
    };

    const proxyUpdateArray = (newArr) => {
      currentArrayState = [...newArr];
      addStep(currentArrayState, currentComparing, currentSwapping);
    };

    const proxySetComparing = (indices) => {
      currentComparing = [...indices];
      addStep(currentArrayState, currentComparing, currentSwapping);
    };

    const proxySetSwapping = (indices) => {
      currentSwapping = [...indices];
      addStep(currentArrayState, currentComparing, currentSwapping);
    };

    const instantSpeedRef = { current: 0 };
    
    // Add initial step
    addStep(array, [], []);

    // Wait slightly to let UI update to sorting state (showing loading if needed)
    await new Promise(resolve => setTimeout(resolve, 0));

    // Pre-compute all steps instantly
    await algorithm(
      array,
      proxyUpdateArray,
      proxySetComparing,
      proxySetSwapping,
      instantSpeedRef
    );

    // Add final sorted state step
    generatedSteps.push({
      arrayState: [...currentArrayState],
      comparingIndices: [],
      swappingIndices: [],
      isSorted: true
    });

    setSteps(generatedSteps);
    setCurrentStepIndex(0);
    setIsSorting(false);
    
    // Automatically start playing
    setIsPlaying(true);
    setIsPaused(false);
  };

  // Playback effect loop
  useEffect(() => {
    let timeoutId;
    if (isPlaying && !isPaused && currentStepIndex < steps.length - 1) {
      timeoutId = setTimeout(() => {
        applyStep(currentStepIndex + 1);
      }, speed);
    } else if (isPlaying && currentStepIndex >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
      setIsPaused(false);
      triggerVictoryConfetti(getColorsFromTailwind(algorithmInfo.color || ''));
      toast.success('Algorithm execution finished!');
    }
    return () => clearTimeout(timeoutId);
  }, [isPlaying, isPaused, currentStepIndex, steps, speed]);

  const applyStep = (index) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      const step = steps[index];
      setArray(step.arrayState);
      setComparingIndices(step.comparingIndices);
      setSwappingIndices(step.swappingIndices);
      if (step.isSorted) {
         setSortedIndices(step.arrayState.map((_, i) => i));
      } else {
         setSortedIndices([]);
         
         // Play sound based on action
         const maxVal = Math.max(...step.arrayState, 1);
         if (step.swappingIndices.length === 2) {
           const [i, j] = step.swappingIndices;
           soundEngine.playSwap(step.arrayState[i], step.arrayState[j], 1, maxVal, {
             algorithm: algorithmInfo.name,
             index: i,
             arrayLength: step.arrayState.length
           });
         } else if (step.comparingIndices.length > 0) {
           const i = step.comparingIndices[0];
           soundEngine.playCompare(step.arrayState[i], 1, maxVal, {
             algorithm: algorithmInfo.name,
             index: i,
             arrayLength: step.arrayState.length
           });
         }
      }
    }
  };

  // Playback control handlers
  const handleStepPlay = () => {
    if (steps.length === 0) {
      handleSort();
    } else {
      if (currentStepIndex >= steps.length - 1) {
        applyStep(0);
      }
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStepPause = () => {
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setIsPaused(true);
    if (currentStepIndex < steps.length - 1) {
      applyStep(currentStepIndex + 1);
    }
  };

  const handleStepPrevious = () => {
    setIsPlaying(false);
    setIsPaused(true);
    if (currentStepIndex > 0) {
      applyStep(currentStepIndex - 1);
    }
  };

  const handleStepReset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    if (steps.length > 0) {
      applyStep(0);
    }
  };

  const handleCustomTest = (testArray) => {
    resetArray(testArray);
    setShowCustomTest(false);
  };

  const getAlgorithmData = (name) => {
    const nameMap = {
      'Bubble Sort': 'bubbleSort',
      'Selection Sort': 'selectionSort',
      'Insertion Sort': 'insertionSort',
      'Merge Sort': 'mergeSort',
      'Quick Sort': 'quickSort'
    };
    const key = nameMap[name];
    return key ? algorithmDatabase.sorting[key] : null;
  };

  const getBarColor = (index) => {
    if (sortedIndices.includes(index)) return COLORS.SORTED || '#fb923c';
    if (swappingIndices.includes(index)) return COLORS.SWAPPING || '#f43f5e';
    if (comparingIndices.includes(index)) return COLORS.COMPARING || '#f472b6';
    return COLORS.DEFAULT || '#a5b4fc';
  };

  const maxValue = Math.max(...array, 1);

  // Gesture Controls for Mobile
  const bindGestures = useGesture({
    onDragEnd: ({ movement: [mx], velocity: [vx], direction: [dx] }) => {
      if (Math.abs(mx) > 40 && vx > 0.3) {
        if (dx > 0) {
          handleStepPrevious(); // Swipe Right -> Previous Step
        } else if (dx < 0) {
          handleStepNext(); // Swipe Left -> Next Step
        }
      }
    }
  });

  return (
    <div {...bindGestures()} className="w-full flex-1 min-h-[600px] relative flex flex-col bg-slate-50 dark:bg-black rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800/80 touch-pan-y">
      
      {/* Top Header & Telemetry Bar */}
      <div className="w-full z-10 p-4 sm:p-6 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/80">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            {algorithmInfo.name}
          </h2>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            {algorithmInfo.description}
          </p>
        </div>

        {/* Telemetry & Info Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-800/80 shadow-sm">
            <span className="opacity-60 mr-1">Time:</span> <span className="font-mono font-bold">{algorithmInfo.timeComplexity}</span>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-800/80 shadow-sm">
            <span className="opacity-60 mr-1">Space:</span> <span className="font-mono font-bold">{algorithmInfo.spaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Main Visualization Viewport */}
      <div className="flex-1 w-full relative flex items-end justify-center gap-[2px] p-6 pb-32 overflow-hidden">
        {is3DMode ? (
          <div className="w-full h-full min-h-[450px]">
            <Sorting3DVisualizer
              array={array}
              comparing={comparingIndices}
              swapped={swappingIndices}
            />
          </div>
        ) : (
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={3} centerOnInit={true}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Floating 2D Zoom Widget */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/80 p-1 rounded-xl shadow-md">
                  <button
                    onClick={() => zoomIn()}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <TransformComponent wrapperClassName="w-full h-full" contentClassName="w-full h-full flex items-end justify-center">
                  <div className="w-full h-full flex items-end justify-center gap-[2px]">
                    {array.map((value, idx) => (
                      <div
                        key={idx}
                        className="transition-all duration-75 rounded-t-sm shadow-sm"
                        style={{
                          height: `${(value / maxValue) * 85}%`,
                          width: `${100 / array.length}%`,
                          backgroundColor: getBarColor(idx),
                          minWidth: '2px',
                        }}
                        title={`Value: ${value}, Index: ${idx}`}
                      />
                    ))}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-slate-200/60 dark:border-zinc-800/80 p-4 rounded-2xl shadow-2xl shadow-indigo-500/10 flex gap-6 w-80">
            <div className="flex-1">
              <label className="text-slate-700 dark:text-slate-200 text-[11px] font-bold mb-2 flex justify-between">
                Array Size <span className="text-indigo-600 dark:text-indigo-400">{arraySize}</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isPlaying}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step Controls (Floating above HUD) */}
      {steps.length > 0 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 scale-90 origin-bottom shadow-2xl rounded-2xl">
          <StepControls
            currentStep={currentStepIndex + 1}
            totalSteps={steps.length}
            isPlaying={isPlaying}
            isPaused={isPaused}
            onPlay={handleStepPlay}
            onPause={handleStepPause}
            onResume={handleStepPlay}
            onNext={handleStepNext}
            onPrevious={handleStepPrevious}
            onReset={handleStepReset}
            onSeek={(val) => applyStep(val)}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      )}

      {/* Legend & HUD Floating Control Dock */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-0 mx-auto z-20 flex flex-col items-center gap-2 w-full max-w-full px-2 pointer-events-none">
        
        {/* Compact Horizontal Legend Dock */}
        <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 px-3 sm:px-4 py-1 rounded-full shadow-lg text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 overflow-x-auto max-w-full scrollbar-hide">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.DEFAULT || '#94a3b8' }}></div>
            <span className="uppercase tracking-wider">Unsorted</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.COMPARING || '#fbbf24' }}></div>
            <span className="uppercase tracking-wider">Comparing</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.SWAPPING || '#f43f5e' }}></div>
            <span className="uppercase tracking-wider">Swapping</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.SORTED || '#34d399' }}></div>
            <span className="uppercase tracking-wider">Sorted</span>
          </div>
        </div>

        {/* Floating HUD Controls Pill Container */}
        <div className="pointer-events-auto w-full max-w-full overflow-x-auto scrollbar-hide flex justify-start sm:justify-center px-1">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-slate-200/60 dark:border-zinc-800/80 p-1.5 sm:p-2 rounded-2xl shadow-2xl shadow-indigo-500/10 min-w-max mx-auto">
            
            {steps.length === 0 && (
              <button
                onClick={handleSort}
                disabled={isSorting}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 mr-0.5 whitespace-nowrap"
              >
                <Play size={15} fill="currentColor" /> {isSorting ? 'Wait...' : 'Sort'}
              </button>
            )}

            <button
              onClick={() => resetArray()}
              title="New Random Array"
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all whitespace-nowrap"
            >
              <Shuffle size={15} className="text-slate-400" /> Array
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>

            <button
              onClick={() => setIs3DMode(!is3DMode)}
              title="Toggle 3D Mode"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all border whitespace-nowrap ${
                is3DMode
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-sm shadow-cyan-500/10'
                  : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Box size={15} className={is3DMode ? "text-cyan-500" : ""} /> {is3DMode ? '3D' : '2D'}
            </button>

            <SoundControls className="scale-85" />

            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              className={`p-2 rounded-xl transition-all ${
                showSettings ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings size={16} />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>

            {/* Educational Tools */}
            <div className="flex bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-0.5">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                title="Algorithm Explanation"
                className={`p-1.5 rounded-lg transition-all ${showExplanation ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <BookOpen size={15} />
              </button>
              <button
                onClick={() => setShowCodeViewer(!showCodeViewer)}
                title="Source Code"
                className={`p-1.5 rounded-lg transition-all ${showCodeViewer ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <Code2 size={15} />
              </button>
              <button
                onClick={() => setShowCustomTest(!showCustomTest)}
                title="Custom Test Case"
                className={`p-1.5 rounded-lg transition-all ${showCustomTest ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <FileText size={15} />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Educational Modals/Overlays */}
      <ExplanationPanel
        algorithmInfo={getAlgorithmData(algorithmInfo.name) || algorithmInfo}
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
      />

      {showCodeViewer && (
        <div className="absolute bottom-28 right-4 sm:right-6 h-[60%] w-[90%] sm:w-[400px] z-40">
          <div className="w-full h-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-2 right-2 z-50">
              <button onClick={() => setShowCodeViewer(false)} className="bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-700 p-1.5 rounded-full"><BookOpen size={14} /></button>
            </div>
             <CodeViewer
              codeSnippets={getAlgorithmData(algorithmInfo.name)?.codeSnippets}
              isOpen={showCodeViewer}
              onClose={() => setShowCodeViewer(false)}
            />
          </div>
        </div>
      )}

      {showCustomTest && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50">
          <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden p-2">
            <CustomTestCases
              onApplyTest={handleCustomTest}
              isOpen={showCustomTest}
              onClose={() => setShowCustomTest(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingVisualizer;

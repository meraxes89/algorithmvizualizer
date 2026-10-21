import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Play, Shuffle, Settings, BookOpen, Code2, FileText, Box, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { generateRandomArray, SPEED_PRESETS, COLORS } from '../utils/animationHelpers';
import StepControls from './educational/StepControls';
import ExplanationPanel from './educational/ExplanationPanel';
const CodeViewer = lazy(() => import('./educational/CodeViewer'));
import CustomTestCases from './educational/CustomTestCases';
import { algorithmDatabase } from '../data/algorithmData';
import { soundEngine } from '../utils/soundEngine';
import { triggerVictoryConfetti, getColorsFromTailwind } from '../utils/confettiHelper';
import { startFaviconAnimation, stopFaviconAnimation } from '../utils/animatedFavicon';
import SoundControls from './SoundControls';
const Sorting3DVisualizer = lazy(() => import('./3D/Sorting3DVisualizer'));
import { toast } from './Toast';
import { useGesture } from '@use-gesture/react';

const SortingVisualizer = React.memo(({ algorithm, algorithmInfo }) => {
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

  // Favicon animation
  useEffect(() => {
    if (isPlaying) {
      startFaviconAnimation();
    } else {
      stopFaviconAnimation();
    }
    return () => stopFaviconAnimation();
  }, [isPlaying]);

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

  const sortedSet = useMemo(() => new Set(sortedIndices), [sortedIndices]);
  const swappingSet = useMemo(() => new Set(swappingIndices), [swappingIndices]);
  const comparingSet = useMemo(() => new Set(comparingIndices), [comparingIndices]);

  const getBarColor = useCallback((index) => {
    if (sortedSet.has(index)) return COLORS.SORTED || '#fb923c';
    if (swappingSet.has(index)) return COLORS.SWAPPING || '#f43f5e';
    if (comparingSet.has(index)) return COLORS.COMPARING || '#f472b6';
    return COLORS.DEFAULT || '#a5b4fc';
  }, [sortedSet, swappingSet, comparingSet]);

  const maxValue = useMemo(() => Math.max(...array, 1), [array]);

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
    <div {...bindGestures()} className="w-full flex-1 min-h-[600px] relative flex flex-col bg-paper-0/50 dark:bg-paper-0 rounded-3xl overflow-hidden border border-line-subtle touch-pan-y">
      
      {/* Top Header & Telemetry Bar */}
      <div className="w-full z-10 p-4 sm:p-6 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper-1/70 dark:bg-paper-0/80 backdrop-blur-xl border-b border-line-subtle">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            {algorithmInfo.name}
          </h2>
          <p className="text-xs text-ink-3 mt-0.5">
            {algorithmInfo.description || 'Watch elements rearrange in real-time.'}
          </p>
        </div>

        {/* Telemetry Metrics Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-soft border border-accent/20 text-accent text-xs font-mono font-bold">
            <span>Size:</span>
            <span className="text-accent">{array.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
            <span>Comparing:</span>
            <span className="text-amber-900 dark:text-amber-100">{comparingIndices.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold">
            <span>Swaps:</span>
            <span className="text-rose-900 dark:text-rose-100">{swappingIndices.length}</span>
          </div>
        </div>
      </div>

      {/* Main Visualization Viewport */}
      <div className="flex-1 w-full relative flex items-center justify-center p-4 sm:p-8">
        {is3DMode ? (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-xs font-semibold text-ink-3">Loading 3D view…</div>}>
            <Sorting3DVisualizer
              array={array}
              comparing={comparingIndices}
              swapped={swappingIndices}
              pivot={-1}
            />
          </Suspense>
        ) : (
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Floating 2D Zoom Widget */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-paper-1/85 dark:bg-paper-0/85 backdrop-blur-md p-1 rounded-xl border border-line-subtle shadow-md">
                  <button
                    onClick={() => zoomIn()}
                    className="p-1.5 hover:bg-paper-2/70 rounded-lg text-ink-2 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="p-1.5 hover:bg-paper-2/70 rounded-lg text-ink-2 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="p-1.5 hover:bg-paper-2/70 rounded-lg text-ink-2 transition-colors"
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
                        className="transition-all duration-75 rounded-t-sm shadow-sm flex-1 h-full"
                        style={{
                          transform: `scaleY(${(value / maxValue) * 0.85})`,
                          transformOrigin: 'bottom',
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
          <div className="bg-paper-1/95 dark:bg-paper-0/95 backdrop-blur-xl border border-line-subtle p-4 rounded-2xl shadow-2xl shadow-accent/10 flex gap-6 w-80">
            <div className="flex-1">
              <label className="text-ink text-[11px] font-bold mb-2 flex justify-between">
                Array Size <span className="text-accent">{arraySize}</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isPlaying}
                className="w-full accent-accent cursor-pointer h-1.5 bg-ink-3/20 rounded-lg appearance-none"
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
        <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 bg-paper-1/90 dark:bg-paper-0/90 backdrop-blur-xl border border-line-subtle px-3 sm:px-4 py-1 rounded-full shadow-lg text-[10px] sm:text-[11px] font-bold text-ink-2 overflow-x-auto max-w-full scrollbar-hide">
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
          <div className="flex items-center gap-1.5 sm:gap-2 bg-paper-1/95 dark:bg-paper-0/95 backdrop-blur-xl border border-line-subtle p-1.5 sm:p-2 rounded-2xl shadow-2xl shadow-accent/10 min-w-max mx-auto">
            
            {steps.length === 0 && (
              <button
                onClick={handleSort}
                disabled={isSorting}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent-strong disabled:bg-ink-3/30 disabled:cursor-not-allowed text-accent-fg px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shadow-md shadow-accent/20 hover:scale-105 active:scale-95 mr-0.5 whitespace-nowrap"
              >
                <Play size={15} fill="currentColor" /> {isSorting ? 'Wait...' : 'Sort'}
              </button>
            )}

            <button
              onClick={() => resetArray()}
              title="New Random Array"
              className="flex items-center gap-1 px-2.5 py-1.5 text-ink-2 hover:bg-paper-2/70 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all whitespace-nowrap"
            >
              <Shuffle size={15} className="text-ink-3" /> Array
            </button>

            <div className="w-px h-6 bg-line-subtle mx-0.5"></div>

            <button
              onClick={() => setIs3DMode(!is3DMode)}
              title="Toggle 3D Mode"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all border whitespace-nowrap ${
                is3DMode
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-sm shadow-cyan-500/10'
                  : 'bg-transparent border-transparent text-ink-3 hover:bg-paper-2/70 hover:text-ink'
              }`}
            >
              <Box size={15} className={is3DMode ? "text-cyan-500" : ""} /> {is3DMode ? '3D' : '2D'}
            </button>

            <SoundControls className="scale-90" />

            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              className={`p-2 rounded-xl transition-all ${
                showSettings ? 'bg-accent-soft text-accent' : 'text-ink-3 hover:text-ink hover:bg-paper-2/70'
              }`}
            >
              <Settings size={16} />
            </button>

            <div className="w-px h-6 bg-line-subtle mx-0.5"></div>

            {/* Educational Tools */}
            <div className="flex bg-paper-0/60 dark:bg-paper-2/40 border border-line-subtle rounded-xl p-0.5">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                title="Algorithm Explanation"
                className={`p-1.5 rounded-lg transition-all ${showExplanation ? 'bg-paper-2 text-accent shadow-sm' : 'text-ink-3 hover:text-ink'}`}
              >
                <BookOpen size={15} />
              </button>
              <button
                onClick={() => setShowCodeViewer(!showCodeViewer)}
                title="Source Code"
                className={`p-1.5 rounded-lg transition-all ${showCodeViewer ? 'bg-paper-2 text-accent shadow-sm' : 'text-ink-3 hover:text-ink'}`}
              >
                <Code2 size={15} />
              </button>
              <button
                onClick={() => setShowCustomTest(!showCustomTest)}
                title="Custom Test Case"
                className={`p-1.5 rounded-lg transition-all ${showCustomTest ? 'bg-paper-2 text-accent shadow-sm' : 'text-ink-3 hover:text-ink'}`}
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
          <div className="w-full h-full bg-paper-1/95 dark:bg-paper-0/95 border border-line-subtle shadow-2xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-2 right-2 z-50">
              <button onClick={() => setShowCodeViewer(false)} className="bg-paper-0 dark:bg-paper-2/70 text-ink-3 hover:text-ink p-1.5 rounded-full"><BookOpen size={14} /></button>
            </div>
            <Suspense fallback={<div className="flex h-full items-center justify-center text-xs font-semibold text-ink-3">Loading source…</div>}>
              <CodeViewer
                codeSnippets={getAlgorithmData(algorithmInfo.name)?.codeSnippets}
                isOpen={showCodeViewer}
                onClose={() => setShowCodeViewer(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {showCustomTest && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50">
          <div className="bg-paper-1/95 dark:bg-paper-0/95 border border-line-subtle shadow-2xl rounded-2xl overflow-hidden p-2">
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
});

export default SortingVisualizer;

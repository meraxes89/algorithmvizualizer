import { memo, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Settings } from 'lucide-react';
import { SPEED_PRESETS } from '../utils/animationHelpers';
import { runTowerOfHanoiTrace } from '../algorithms/recursion/puzzleEngine';
import { usePlayback } from '../hooks/usePlayback';
import { collectSteps } from '../core/playback';
import type { PuzzleStep } from '@core/steps';
import { recursionAlgorithmsData } from '../data/recursionAlgorithms';

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

type TowerOfHanoiVisualizerProps = {
  algorithmId: string;
};

type RecursionMeta = {
  name?: string;
  complexities?: { time?: string; space?: string };
};

const TowerOfHanoiVisualizer = memo(({ algorithmId }: TowerOfHanoiVisualizerProps) => {
  // Config state
  const [inputValue, setInputValue] = useState('3'); // Default 3 disks

  // Simulation State
  const [trace, setTrace] = useState<PuzzleStep[]>([]);

  const {
    index: currentStepIndex,
    isPlaying,
    speed,
    play,
    pause,
    next,
    reset: resetPlayback,
    setSpeed,
  } = usePlayback(trace, {
    autoplay: true,
    speed: SPEED_PRESETS.MEDIUM,
    source: 'puzzle',
    meta: { algorithm: algorithmId },
  });

  // UI Panels
  const [showSettings, setShowSettings] = useState(false);

  // Derived state for the current step
  const currentStep =
    currentStepIndex >= 0 && currentStepIndex < trace.length ? trace[currentStepIndex] : null;

  // Update default input based on algorithm
  useEffect(() => {
    setInputValue('3');
    handleReset();
  }, [algorithmId]);

  /* ---------- Operations ---------- */

  const handleRun = () => {
    handleReset();
    let numDisks = Number.parseInt(inputValue, 10);
    if (Number.isNaN(numDisks) || numDisks < 1) numDisks = 3;
    if (numDisks > 8) numDisks = 8; // Cap at 8 for performance/visual limits
    setInputValue(numDisks.toString());

    let newTrace: PuzzleStep[] = [];
    try {
      newTrace = collectSteps(runTowerOfHanoiTrace(numDisks));
    } catch (e) {
      console.error(e);
      return;
    }

    setTrace(newTrace);
  };

  const handleReset = () => {
    resetPlayback();
    setTrace([]);
  };

  const togglePlay = () => {
    if (trace.length === 0) {
      handleRun();
    } else if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const stepForward = () => {
    pause();
    next();
  };

  /* ---------- Rendering Helpers ---------- */

  const meta = (recursionAlgorithmsData as Record<string, RecursionMeta>)[algorithmId] ?? {};

  const getDiskColor = (diskNum: number): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-fuchsia-500',
    ];
    // Map colors so smallest disk is always the same relative color, etc.
    return colors[(diskNum - 1) % colors.length];
  };

  const renderPeg = (pegName: string, disks: readonly number[], totalDisks: number) => {
    const pegHeight = totalDisks * 24 + 40; // dynamically size peg height

    return (
      <div
        className="relative mx-4 flex flex-col items-center justify-end"
        style={{ height: `${pegHeight}px`, width: '120px' }}
      >
        {/* The Peg (Pole) */}
        <div
          className="absolute bottom-0 w-3 rounded-t-full bg-slate-300 shadow-inner"
          style={{ height: '100%' }}
        />

        {/* The Base */}
        <div className="absolute bottom-0 z-10 h-4 w-full rounded-lg bg-slate-300 shadow-md" />

        {/* Disks */}
        <div className="z-20 flex w-full flex-col-reverse items-center gap-1 pb-4">
          {disks.map((disk) => {
            const widthPct = 30 + (disk / Math.max(totalDisks, 1)) * 70;
            return (
              <div
                key={disk}
                className={`h-5 rounded-full shadow-md ${getDiskColor(disk)} flex items-center justify-center border border-white/20 transition-all duration-300`}
                style={{ width: `${widthPct}%` }}
              >
                <span className="text-[10px] font-bold text-white/90">{disk}</span>
              </div>
            );
          })}
        </div>

        {/* Peg Label */}
        <div className="absolute -bottom-8 text-sm font-bold text-slate-600 dark:text-slate-400">
          Peg {pegName}
        </div>
      </div>
    );
  };

  const renderPuzzle = () => {
    if (!currentStep || !currentStep.view) return null;
    const pegs = currentStep.view.pegs;
    const totalDisks = Math.max(1, Number.parseInt(inputValue, 10));

    return (
      <div className="flex w-full max-w-3xl items-end justify-center pb-16">
        {renderPeg('A', pegs.A, totalDisks)}
        {renderPeg('B', pegs.B, totalDisks)}
        {renderPeg('C', pegs.C, totalDisks)}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white shadow-lg">
        <div>
          <h2 className="text-xl font-bold">{meta.name || 'Tower of Hanoi'}</h2>
          <p className="mt-0.5 text-xs">Visualize the classic recursive puzzle</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="rounded-full bg-black/20 px-2.5 py-1">
            <span className="font-semibold">Time:</span> {meta.complexities?.time}
          </div>
          <div className="rounded-full bg-black/20 px-2.5 py-1">
            <span className="font-semibold">Space:</span> {meta.complexities?.space}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-600 dark:bg-slate-700">
          <span className="border-r border-slate-200 px-2 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">
            Disks
          </span>
          <input
            aria-label="Number of disks"
            type="number"
            min="1"
            max="8"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-16 rounded border border-transparent bg-slate-50 px-2 py-1 text-sm text-slate-800 focus:border-blue-400 focus:outline-none dark:bg-slate-600 dark:text-white"
          />
        </div>

        <button
          onClick={handleRun}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <RotateCcw size={14} /> Run
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={stepForward}
          disabled={isPlaying || currentStepIndex >= trace.length - 1}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-600"
        >
          <FastForward size={14} /> Step
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors ${
            showSettings
              ? 'border-blue-300 bg-blue-100 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          <Settings size={14} /> Speed
        </button>
      </div>

      {/* Speed settings */}
      {showSettings && (
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100 p-3 dark:border-slate-700 dark:bg-slate-800">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Animation Speed
          </span>
          <div className="flex gap-2">
            {Object.entries(SPEED_PRESETS).map(([name, value]) => (
              <button
                key={name}
                onClick={() => setSpeed(value)}
                className={`rounded border px-3 py-1 text-sm transition-colors ${
                  speed === value
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {name.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Puzzle View */}
        <div
          role="group"
          tabIndex={0}
          aria-label="Visualization canvas"
          className="custom-scrollbar relative flex flex-1 flex-col items-center justify-center overflow-auto p-4 dark:bg-slate-900"
          style={{
            backgroundColor: 'var(--viz-canvas)',
            backgroundImage: 'radial-gradient(var(--viz-canvas-dot) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {trace.length === 0 ? (
            <div className="absolute inset-0 flex select-none items-center justify-center text-lg font-medium text-slate-600 dark:text-slate-400">
              Click <span className="mx-1 text-blue-600 dark:text-blue-400">Run</span> to visualize
              Tower of Hanoi
            </div>
          ) : (
            renderPuzzle()
          )}
        </div>

        {/* Right Side Call Stack & Logs removed – classic puzzle visualizer now only shows the animation panel */}
      </div>
    </div>
  );
});

export default TowerOfHanoiVisualizer;

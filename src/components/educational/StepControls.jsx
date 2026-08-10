import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { SPEED_PRESETS } from '../../utils/animationHelpers';

const StepControls = ({
  currentStep,
  totalSteps,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onNext,
  onPrevious,
  onReset,
  onSeek,
  speed,
  onSpeedChange,
  disabled = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        isPlaying ? onPause() : onPlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < totalSteps) onNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentStep > 1) onPrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isPlaying, onPause, onPlay, onNext, onPrevious, currentStep, totalSteps]);

  const progress = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-[400px] max-w-full glass-card bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl border border-white/40 dark:border-zinc-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-3xl p-5 flex flex-col gap-4">
      
      {/* Timeline Scrubber */}
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          <span>{String(currentStep).padStart(3, '0')}</span>
          <span className="uppercase tracking-widest text-[8px] text-indigo-500">Timeline</span>
          <span>{String(totalSteps).padStart(3, '0')}</span>
        </div>
        <div className="relative w-full flex items-center group">
          <input
            type="range"
            min="0"
            max={totalSteps > 0 ? totalSteps - 1 : 0}
            value={currentStep > 0 ? currentStep - 1 : 0}
            onChange={(e) => onSeek && onSeek(Number(e.target.value))}
            disabled={disabled}
            className="absolute z-20 w-full opacity-0 cursor-pointer h-full"
          />
          {/* Custom Track */}
          <div className="w-full h-2 bg-slate-200/50 dark:bg-zinc-800/50 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Custom Thumb */}
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-indigo-500 rounded-full shadow-md z-10 pointer-events-none group-hover:scale-125 transition-transform"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
      </div>

      {/* Playback Controls & Speed */}
      <div className="flex items-center justify-between w-full">
        
        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={disabled}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50 relative group"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>

        {/* Music Player Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl p-1 border border-slate-200/50 dark:border-zinc-800/50 relative">
          <button
            onClick={onPrevious}
            disabled={disabled || currentStep <= 1}
            title="Previous [←]"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-indigo-500 rounded-xl transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <SkipBack size={16} />
          </button>

          {!isPlaying ? (
            <button
              onClick={onPlay}
              disabled={disabled || currentStep >= totalSteps}
              title="Play [Space]"
              className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 relative"
            >
              <Play size={18} className="ml-0.5" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={onPause}
              disabled={disabled}
              title="Pause [Space]"
              className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Pause size={18} fill="currentColor" />
            </button>
          )}

          <button
            onClick={onNext}
            disabled={disabled || currentStep >= totalSteps}
            title="Next [→]"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-indigo-500 rounded-xl transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Speed Chips */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/50 dark:border-zinc-800/50">
          {[
            { label: '1x', val: SPEED_PRESETS.SLOW },
            { label: '2x', val: SPEED_PRESETS.NORMAL },
            { label: '4x', val: SPEED_PRESETS.FAST }
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => onSpeedChange && onSpeedChange(sp.val)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                speed === sp.val 
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StepControls;

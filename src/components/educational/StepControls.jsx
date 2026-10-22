import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { SPEED_PRESETS } from '../../utils/animationHelpers';

const SPEED_CHIPS = [
  { label: '1x', val: SPEED_PRESETS.SLOW },
  { label: '2x', val: SPEED_PRESETS.MEDIUM },
  { label: '4x', val: SPEED_PRESETS.FAST }
];

const StepControls = React.memo(({
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
  onSeek,
  speed,
  onSpeedChange,
  disabled = false
}) => {
  const propsRef = useRef({ disabled, isPlaying, onPause, onPlay, onNext, onPrevious, currentStep, totalSteps });
  propsRef.current = { disabled, isPlaying, onPause, onPlay, onNext, onPrevious, currentStep, totalSteps };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { disabled, isPlaying, onPause, onPlay, onNext, onPrevious, currentStep, totalSteps } = propsRef.current;
      if (disabled) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          onPause?.();
        } else {
          onPlay?.();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < totalSteps) onNext?.();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentStep > 1) onPrevious?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const progress = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-[400px] max-w-full bg-paper-1/95 dark:bg-paper-0/95 border border-line-subtle shadow-paper rounded-3xl p-5 flex flex-col gap-4">
      
      {/* Timeline Scrubber */}
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-ink-3">
          <span>{String(currentStep).padStart(3, '0')}</span>
          <span className="uppercase tracking-widest text-[8px] text-accent">Timeline</span>
          <span>{String(totalSteps).padStart(3, '0')}</span>
        </div>
        <div className="relative w-full flex items-center group">
          <input aria-label="Step position"
            type="range"
            min="0"
            max={totalSteps > 0 ? totalSteps - 1 : 0}
            value={currentStep > 0 ? currentStep - 1 : 0}
            onChange={(e) => onSeek && onSeek(Number(e.target.value))}
            disabled={disabled}
            className="absolute z-20 w-full opacity-0 cursor-pointer h-full"
          />
          {/* Custom Track */}
          <div className="w-full h-2 bg-line-subtle rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Custom Thumb */}
          <div 
            className="absolute w-3 h-3 bg-paper-1 border-2 border-accent rounded-full shadow-md z-10 pointer-events-none group-hover:scale-125 transition-transform"
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
          className="p-2 text-ink-3 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50 relative group"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>

        {/* Music Player Controls */}
        <div className="flex items-center gap-1.5 bg-paper-0/60 rounded-2xl p-1 border border-line-subtle relative">
          <button
            onClick={onPrevious}
            disabled={disabled || currentStep <= 1}
            title="Previous [←]"
            className="p-2 text-ink-2 hover:bg-paper-1 dark:hover:bg-paper-2/60 hover:text-accent rounded-xl transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <SkipBack size={16} />
          </button>

          {!isPlaying ? (
            <button
              onClick={onPlay}
              disabled={disabled || currentStep >= totalSteps}
              title="Play [Space]"
              className="w-10 h-10 flex items-center justify-center bg-ink hover:bg-accent text-accent-fg rounded-xl transition-all shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 relative"
            >
              <Play size={18} className="ml-0.5" fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={onPause}
              disabled={disabled}
              title="Pause [Space]"
              className="w-10 h-10 flex items-center justify-center bg-ink hover:bg-accent text-accent-fg rounded-xl transition-all shadow-lg shadow-accent/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Pause size={18} fill="currentColor" />
            </button>
          )}

          <button
            onClick={onNext}
            disabled={disabled || currentStep >= totalSteps}
            title="Next [→]"
            className="p-2 text-ink-2 hover:bg-paper-1 dark:hover:bg-paper-2/60 hover:text-accent rounded-xl transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Speed Chips */}
        <div className="flex items-center gap-1 bg-paper-0/60 p-1 rounded-xl border border-line-subtle">
          {SPEED_CHIPS.map((sp) => (
            <button
              key={sp.label}
              onClick={() => onSpeedChange && onSpeedChange(sp.val)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                speed === sp.val 
                  ? 'bg-paper-2 text-accent shadow-sm' 
                  : 'text-ink-3 hover:text-ink dark:hover:text-ink-3'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
});

export default StepControls;

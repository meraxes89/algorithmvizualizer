import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SPEED, Playback, type PlaybackEnv } from '../core/playback';

export type UsePlaybackOptions = {
  /** Milliseconds between steps. Defaults to 200. */
  speed?: number;
  /** Start playing as soon as a trace is loaded. */
  autoplay?: boolean;
  /** Injectable browser environment. Tests use this. */
  env?: PlaybackEnv;
  /** Identifies which visualizer this playback belongs to. */
  source?: string;
  /** Context attached to every published event, e.g. the algorithm name. */
  meta?: Record<string, unknown>;
};

export type UsePlaybackResult = {
  /** Position in the trace. */
  index: number;
  /** How many steps the trace has. */
  total: number;
  /** Whether the engine is advancing. */
  isPlaying: boolean;
  /** Whether the current position is the last one. */
  isFinished: boolean;
  /** Milliseconds between steps. */
  speed: number;
  /** The step at the current position. */
  step: unknown;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
};

/**
 * The React binding for the playback engine.
 *
 * Deliberately thin: all the timing lives in `core/playback.ts`, and this
 * hook only mirrors the engine's state into React. Every visualizer uses
 * this, so they all get the same play, pause, scrub and speed behaviour
 * without any of them owning a timer.
 */
export function usePlayback(
  steps: readonly unknown[],
  options: UsePlaybackOptions = {}
): UsePlaybackResult {
  const { speed: initialSpeed = DEFAULT_SPEED, autoplay = false, env, source, meta } = options;

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(initialSpeed);

  // The engine is created once and kept for the life of the component.
  const playbackRef = useRef<Playback | null>(null);
  if (playbackRef.current === null) {
    playbackRef.current = new Playback(
      {
        speed: initialSpeed,
        source,
        meta,
        onStep: (next) => setIndex(next),
        onPlayStateChange: (playing) => setIsPlaying(playing),
      },
      env
    );
  }
  const playback = playbackRef.current;

  // Keep the event metadata current, e.g. when the algorithm changes.
  useEffect(() => {
    if (meta) {
      playback.setMeta(meta);
    }
  }, [playback, meta]);

  // Load a new trace whenever the caller hands us a different one.
  useEffect(() => {
    playback.load(steps, { autoplay });
  }, [playback, steps, autoplay]);

  // Release the engine's timers and listeners when the component goes away.
  useEffect(() => {
    return () => playback.destroy();
  }, [playback]);

  const setSpeed = useCallback(
    (next: number) => {
      setSpeedState(next);
      playback.setSpeed(next);
    },
    [playback]
  );

  return {
    index,
    total: steps.length,
    isPlaying,
    isFinished: steps.length > 0 && index >= steps.length - 1,
    speed,
    step: steps[index],
    play: useCallback(() => playback.play(), [playback]),
    pause: useCallback(() => playback.pause(), [playback]),
    toggle: useCallback(() => playback.toggle(), [playback]),
    next: useCallback(() => playback.next(), [playback]),
    previous: useCallback(() => playback.previous(), [playback]),
    seek: useCallback((target: number) => playback.seek(target), [playback]),
    reset: useCallback(() => playback.reset(), [playback]),
    setSpeed,
  };
}

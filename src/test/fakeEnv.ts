import type { PlaybackEnv } from '../core/playback';

/**
 * A hand-driven stand-in for the browser bits the playback engine uses.
 *
 * The engine is driven by explicitly advancing a clock, so the tests are
 * deterministic and need neither fake timers nor a DOM.
 */
export type FakeEnv = {
  env: PlaybackEnv;
  /** Advance the clock and run every frame that was queued. */
  advance: (ms: number) => void;
  /** Flip the tab's visibility and notify the engine. */
  setHidden: (hidden: boolean) => void;
  /** How many frames are queued but have not run yet. */
  pendingFrames: () => number;
  /** The current fake time. */
  now: () => number;
};

export function createFakeEnv(startTime = 0): FakeEnv {
  let time = startTime;
  let nextHandle = 1;
  let frames: { handle: number; callback: (t: number) => void }[] = [];
  let hidden = false;
  const listeners = new Set<(hidden: boolean) => void>();

  const env: PlaybackEnv = {
    now: () => time,
    requestAnimationFrame: (callback) => {
      const handle = nextHandle++;
      frames.push({ handle, callback });
      return handle;
    },
    cancelAnimationFrame: (handle) => {
      frames = frames.filter((frame) => frame.handle !== handle);
    },
    isHidden: () => hidden,
    onVisibilityChange: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  return {
    env,
    advance(ms) {
      time += ms;
      const due = frames;
      frames = [];
      for (const frame of due) {
        frame.callback(time);
      }
    },
    setHidden(next) {
      hidden = next;
      for (const listener of [...listeners]) {
        listener(hidden);
      }
    },
    pendingFrames: () => frames.length,
    now: () => time,
  };
}

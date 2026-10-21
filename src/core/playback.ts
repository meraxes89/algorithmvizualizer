/**
 * The playback engine.
 *
 * This is the single place in the app where time is owned. Every
 * visualizer — all ten of them — drives its timeline through this
 * engine, so play, pause, single-step, scrub and speed behave the same
 * everywhere, and no component needs a `setTimeout` chain of its own.
 *
 * The engine is deliberately framework-agnostic: it knows nothing about
 * React. `src/hooks/usePlayback.ts` is the thin React wrapper around it.
 *
 * The browser globals it needs (requestAnimationFrame, performance.now,
 * document.visibilityState) are injectable, so the whole engine can be
 * driven by fakes in tests without fake timers or a DOM.
 */

/** The shape of the browser bits the engine uses. */
export type PlaybackEnv = {
  now: () => number;
  requestAnimationFrame: (callback: (time: number) => void) => number;
  cancelAnimationFrame: (handle: number) => void;
  /** True when the tab is hidden. */
  isHidden: () => boolean;
  /** Subscribe to visibility changes; returns an unsubscribe function. */
  onVisibilityChange: (listener: (hidden: boolean) => void) => () => void;
};

/** The default environment: the real browser. */
export const browserEnv: PlaybackEnv = {
  now: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
  requestAnimationFrame: (callback) =>
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame(callback)
      : (setTimeout(() => callback(Date.now()), 16) as unknown as number),
  cancelAnimationFrame: (handle) => {
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(handle);
    } else {
      clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
    }
  },
  isHidden: () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
  onVisibilityChange: (listener) => {
    if (typeof document === 'undefined') return () => {};
    const handler = () => listener(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  },
};

export type PlaybackConfig = {
  /** Milliseconds between steps. 0 means "as fast as the frame rate". */
  speed?: number;
  /** Called whenever the current step index changes. */
  onStep?: (index: number) => void;
  /** Called when playback reaches the end of the trace. */
  onFinish?: () => void;
  /** Called when playback starts or stops. */
  onPlayStateChange?: (isPlaying: boolean) => void;
};

export const DEFAULT_SPEED = 200;

/**
 * Drive a trace of steps.
 *
 * The engine holds the trace, the position in it, and the clock. It
 * advances using requestAnimationFrame, accumulating elapsed time so the
 * playback rate does not depend on the frame rate.
 */
export class Playback {
  private steps: readonly unknown[] = [];
  private index = 0;
  private speed: number;
  private playing = false;
  private frame: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private destroyed = false;

  private readonly env: PlaybackEnv;
  private readonly config: PlaybackConfig;
  private readonly unsubscribeVisibility: () => void;

  constructor(config: PlaybackConfig = {}, env: PlaybackEnv = browserEnv) {
    this.config = config;
    this.env = env;
    this.speed = config.speed ?? DEFAULT_SPEED;

    this.unsubscribeVisibility = env.onVisibilityChange((hidden) => {
      // A hidden tab cannot show anything, so stop burning frames on it.
      if (hidden && this.playing) {
        this.pause();
      }
    });
  }

  // ── Reading the state ───────────────────────────────────────────────────

  /** The current position in the trace. */
  get currentIndex(): number {
    return this.index;
  }

  /** How many steps the trace has. */
  get total(): number {
    return this.steps.length;
  }

  /** Whether the engine is currently advancing. */
  get isPlaying(): boolean {
    return this.playing;
  }

  /** Whether the current position is the last one. */
  get isFinished(): boolean {
    return this.steps.length > 0 && this.index >= this.steps.length - 1;
  }

  /** Milliseconds between steps. */
  get currentSpeed(): number {
    return this.speed;
  }

  /** The step at the current position, if there is one. */
  get currentStep(): unknown {
    return this.steps[this.index];
  }

  // ── Loading a trace ─────────────────────────────────────────────────────

  /**
   * Replace the trace and rewind.
   *
   * @param steps the new trace.
   * @param options `autoplay` starts playing straight away.
   */
  load(steps: readonly unknown[], options: { autoplay?: boolean } = {}): void {
    this.steps = steps;
    this.index = 0;
    this.accumulator = 0;
    this.config.onStep?.(this.index);

    if (options.autoplay) {
      this.play();
    }
  }

  // ── Transport ───────────────────────────────────────────────────────────

  /** Start advancing. */
  play(): void {
    if (this.destroyed || this.playing) return;
    if (this.steps.length === 0) return;
    if (this.isFinished) {
      // Pressing play at the end restarts from the beginning.
      this.seek(0);
    }

    this.playing = true;
    this.lastTime = this.env.now();
    this.accumulator = 0;
    this.config.onPlayStateChange?.(true);
    this.scheduleFrame();
  }

  /** Stop advancing, keeping the current position. */
  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    this.cancelFrame();
    this.config.onPlayStateChange?.(false);
  }

  /** Play if paused, pause if playing. */
  toggle(): void {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  /** Advance one step. */
  next(): void {
    this.seek(Math.min(this.index + 1, Math.max(this.steps.length - 1, 0)));
  }

  /** Go back one step. */
  previous(): void {
    this.seek(Math.max(this.index - 1, 0));
  }

  /**
   * Jump to a position in the trace.
   *
   * Out-of-range positions are clamped. Seeking does not stop playback —
   * scrubbing while running is a normal thing to do.
   */
  seek(index: number): void {
    const clamped = Math.max(0, Math.min(index, Math.max(this.steps.length - 1, 0)));
    if (clamped === this.index) return;

    this.index = clamped;
    this.accumulator = 0;
    this.config.onStep?.(this.index);

    if (this.isFinished) {
      this.pause();
      this.config.onFinish?.();
    }
  }

  /** Go back to the first step. */
  reset(): void {
    this.pause();
    this.seek(0);
  }

  /** Change the playback rate. */
  setSpeed(speed: number): void {
    this.speed = Math.max(0, speed);
    this.accumulator = 0;
  }

  /** Release the engine's resources. */
  destroy(): void {
    this.pause();
    this.unsubscribeVisibility();
    this.destroyed = true;
  }

  // ── The clock ───────────────────────────────────────────────────────────

  private scheduleFrame(): void {
    this.frame = this.env.requestAnimationFrame(this.tick);
  }

  private cancelFrame(): void {
    if (this.frame !== null) {
      this.env.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  private readonly tick = (time: number): void => {
    if (!this.playing) return;

    const delta = Math.max(0, time - this.lastTime);
    this.lastTime = time;
    this.accumulator += delta;

    // With a speed of 0, advance one step per frame.
    const perStep = this.speed;
    if (perStep === 0) {
      this.advance();
    } else {
      // Catch up, but never render more than one step per frame beyond a
      // sane bound, so a long stall does not fast-forward the whole trace.
      let budget = 4;
      while (this.accumulator >= perStep && budget > 0 && !this.isFinished) {
        this.accumulator -= perStep;
        this.advance();
        budget -= 1;
      }
      if (this.accumulator > perStep * 4) {
        this.accumulator = 0;
      }
    }

    if (this.playing) {
      this.scheduleFrame();
    }
  };

  private advance(): void {
    if (this.index >= this.steps.length - 1) {
      this.pause();
      this.config.onFinish?.();
      return;
    }

    this.index += 1;
    this.config.onStep?.(this.index);
  }
}

/**
 * Drain a generator into an array of steps.
 *
 * Algorithms are generators; the playback engine works on a materialised
 * trace so that seeking is instant and the trace can be snapshotted by
 * a golden test.
 */
export const collectSteps = <T>(generator: Generator<T, void, undefined>): T[] => {
  const steps: T[] = [];
  for (const step of generator) {
    steps.push(step);
  }
  return steps;
};

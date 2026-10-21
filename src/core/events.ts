/**
 * The step event bus.
 *
 * Side effects — the sound engine, the confetti burst, the animated
 * favicon — subscribe to step events. They are never passed into an
 * algorithm and never called by one. An algorithm yields steps and
 * nothing else; anything that wants to react to a step listens here.
 *
 * That separation is what keeps `src/algorithms` free of React, of the
 * DOM, and of the audio context.
 */

import type { StepByFamily, StepFamily } from './steps';

/** A step event, tagged with where in the trace it happened. */
export type StepEvent<F extends StepFamily = StepFamily> = {
  readonly family: F;
  readonly step: StepByFamily[F];
  /** Position of the step in the trace. */
  readonly index: number;
  /** Total number of steps in the trace, when it is known. */
  readonly total: number;
};

export type StepEventHandler<F extends StepFamily = StepFamily> = (event: StepEvent<F>) => void;

/**
 * A tiny typed publish/subscribe bus.
 *
 * Handlers are stored per family, so a sound handler that only cares
 * about sorting never sees a graph step. Unsubscribing is done by
 * calling the function that `on` returns.
 */
export class StepEventBus {
  private readonly handlers = new Map<StepFamily, Set<(event: never) => void>>();

  /**
   * Subscribe to the steps of one family.
   *
   * @returns a function that unsubscribes.
   */
  on<F extends StepFamily>(family: F, handler: StepEventHandler<F>): () => void {
    let bucket = this.handlers.get(family);
    if (!bucket) {
      bucket = new Set();
      this.handlers.set(family, bucket);
    }

    const wrapped = handler as (event: never) => void;
    bucket.add(wrapped);

    return () => {
      bucket?.delete(wrapped);
    };
  }

  /**
   * Subscribe to every family's steps.
   *
   * @returns a function that unsubscribes.
   */
  onAny(handler: (event: StepEvent) => void): () => void {
    const removers: (() => void)[] = [];

    for (const family of FAMILIES) {
      removers.push(
        this.on(family, (event) => {
          handler(event as StepEvent);
        })
      );
    }

    return () => {
      removers.forEach((remove) => remove());
    };
  }

  /** Publish a step to the handlers of its own family. */
  emit<F extends StepFamily>(event: StepEvent<F>): void {
    const bucket = this.handlers.get(event.family);
    if (!bucket) return;

    // Copy first: a handler may unsubscribe while we are iterating.
    for (const handler of [...bucket]) {
      (handler as StepEventHandler<F>)(event);
    }
  }

  /** Number of handlers subscribed to a family. Mostly for tests. */
  handlerCount(family: StepFamily): number {
    return this.handlers.get(family)?.size ?? 0;
  }

  /** Drop every subscription. Mostly for tests. */
  clear(): void {
    this.handlers.clear();
  }
}

/** Every family, in a stable order. */
export const FAMILIES: readonly StepFamily[] = [
  'sorting',
  'searching',
  'pathfinding',
  'graph',
  'trees',
  'recursion',
  'dp',
];

/** The bus the app uses. Subscribers attach to this one. */
export const stepBus = new StepEventBus();

/**
 * Publish a step on the shared bus.
 *
 * Convenience wrapper so callers do not have to spell out the generics.
 */
export const publishStep = <F extends StepFamily>(
  family: F,
  step: StepByFamily[F],
  index: number,
  total: number
): void => {
  stepBus.emit({ family, step, index, total });
};

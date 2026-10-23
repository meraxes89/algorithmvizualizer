import { describe, expect, it } from 'vitest';
import { runTowerOfHanoiTrace } from './puzzleEngine';
import type { PuzzleStep } from '@core/steps';

const trace = (n: number): PuzzleStep[] => [...runTowerOfHanoiTrace(n)];

const disksOnPegs = (step: PuzzleStep): number[] =>
  [...(step.view.pegs.A ?? []), ...(step.view.pegs.B ?? []), ...(step.view.pegs.C ?? [])].sort(
    (a, b) => a - b
  );

describe('runTowerOfHanoiTrace', () => {
  it('starts with a start step and ends with success', () => {
    const steps = trace(3);

    expect(steps[0].t).toBe('start');
    expect(steps[steps.length - 1].t).toBe('success');
  });

  it('moves every disk exactly 2^n - 1 times', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const moves = trace(n).filter((step) => step.t === 'move');
      expect(moves).toHaveLength(2 ** n - 1);
    }
  });

  it('leaves every disk on the target peg', () => {
    const steps = trace(4);
    const last = steps[steps.length - 1];

    expect(last.view.pegs.A).toEqual([]);
    expect(last.view.pegs.B).toEqual([]);
    // Pegs store the largest disk first, matching the starting layout.
    expect(last.view.pegs.C).toEqual([4, 3, 2, 1]);
  });

  it('never loses or duplicates a disk', () => {
    for (const step of trace(4)) {
      expect(disksOnPegs(step)).toEqual([1, 2, 3, 4]);
    }
  });

  it('keeps the call stack balanced', () => {
    const steps = trace(4);

    expect(steps[0].view.stack).toEqual([]);
    expect(steps[steps.length - 1].view.stack).toEqual([]);

    for (let i = 1; i < steps.length - 1; i++) {
      const previous = steps[i - 1].view.stack.length;
      const current = steps[i].view.stack.length;

      // The stack only ever grows by one, and only on a call.
      if (current > previous) {
        expect(steps[i].t).toBe('call');
        expect(current - previous).toBe(1);
      }

      // It never unwinds more than one frame at a time.
      expect(previous - current).toBeLessThanOrEqual(1);

      // A frame is open for every step between start and success.
      expect(current).toBeGreaterThan(0);
    }
  });

  it('handles a single disk with one move', () => {
    const steps = trace(1);
    const moves = steps.filter((step) => step.t === 'move');

    expect(moves).toHaveLength(1);
    expect(steps[steps.length - 1].view.pegs.C).toEqual([1]);
  });

  it('hands every step a snapshot of the pegs', () => {
    const steps = trace(3);

    // A later move must not rewrite an earlier step's view.
    const firstMove = steps.find((step) => step.t === 'move');
    const before = JSON.stringify(firstMove?.view.pegs);
    const after = JSON.stringify(steps[steps.length - 1].view.pegs);

    expect(before).not.toBe(after);
  });
});

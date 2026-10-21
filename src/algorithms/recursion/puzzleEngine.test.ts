import { describe, expect, it } from 'vitest';
import { runTowerOfHanoiTrace, type HanoiTraceStep } from './puzzleEngine';

const disksOnPegs = (step: HanoiTraceStep): number[] =>
  [...step.pegs.A, ...step.pegs.B, ...step.pegs.C].sort((a, b) => a - b);

describe('runTowerOfHanoiTrace', () => {
  it('starts with START and ends with SUCCESS', () => {
    const trace = runTowerOfHanoiTrace(3);

    expect(trace[0].type).toBe('START');
    expect(trace[trace.length - 1].type).toBe('SUCCESS');
  });

  it('moves every disk exactly 2^n - 1 times', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const moves = runTowerOfHanoiTrace(n).filter((step) => step.type === 'MOVE');
      expect(moves).toHaveLength(2 ** n - 1);
    }
  });

  it('leaves every disk on the target peg', () => {
    const trace = runTowerOfHanoiTrace(4);
    const last = trace[trace.length - 1];

    expect(last.pegs.A).toEqual([]);
    expect(last.pegs.B).toEqual([]);
    // Pegs store the largest disk first, matching the starting layout.
    expect(last.pegs.C).toEqual([4, 3, 2, 1]);
  });

  it('never loses or duplicates a disk', () => {
    const trace = runTowerOfHanoiTrace(4);

    for (const step of trace) {
      expect(disksOnPegs(step)).toEqual([1, 2, 3, 4]);
    }
  });

  it('keeps the call stack balanced', () => {
    const trace = runTowerOfHanoiTrace(4);

    expect(trace[0].stack).toEqual([]);
    expect(trace[trace.length - 1].stack).toEqual([]);

    for (let i = 1; i < trace.length - 1; i++) {
      const previous = trace[i - 1].stack.length;
      const current = trace[i].stack.length;

      // The stack only ever grows by one, and only on a CALL.
      if (current > previous) {
        expect(trace[i].type).toBe('CALL');
        expect(current - previous).toBe(1);
      }

      // It never unwinds more than one frame at a time.
      expect(previous - current).toBeLessThanOrEqual(1);

      // A frame is open for every step between START and SUCCESS.
      expect(current).toBeGreaterThan(0);
    }
  });

  it('handles a single disk with one move', () => {
    const trace = runTowerOfHanoiTrace(1);
    const moves = trace.filter((step) => step.type === 'MOVE');

    expect(moves).toHaveLength(1);
    expect(trace[trace.length - 1].pegs.C).toEqual([1]);
  });
});

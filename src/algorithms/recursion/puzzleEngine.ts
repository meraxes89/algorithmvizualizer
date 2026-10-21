// src/algorithms/recursion/puzzleEngine.ts
// Trace generator for puzzle algorithms.
//
// This is the first module in the TypeScript migration. It is deliberately
// one of the pure ones: no React, no DOM, no timers — just a function that
// returns a trace.

/** The three pegs of a Tower of Hanoi puzzle. */
export type PegName = 'A' | 'B' | 'C';

/** The kind of event a trace step represents. */
export type HanoiTraceType = 'START' | 'CALL' | 'MOVE' | 'RETURN' | 'SUCCESS';

/** The contents of all three pegs at a point in time. */
export type HanoiPegs = Record<PegName, number[]>;

/** One entry in a Tower of Hanoi trace. */
export type HanoiTraceStep = {
  type: HanoiTraceType;
  pegs: HanoiPegs;
  message: string;
  stack: string[];
};

const clonePegs = (pegs: HanoiPegs): HanoiPegs => ({
  A: [...pegs.A],
  B: [...pegs.B],
  C: [...pegs.C],
});

/**
 * Build the full execution trace of a Tower of Hanoi solution.
 *
 * @param n - how many disks to move.
 * @returns the trace, from START to SUCCESS.
 */
export const runTowerOfHanoiTrace = (n: number): HanoiTraceStep[] => {
  const trace: HanoiTraceStep[] = [];
  const stack: string[] = [];

  // Peg A starts with every disk, largest first.
  const pegs: HanoiPegs = {
    A: Array.from({ length: n }, (_, i) => n - i),
    B: [],
    C: [],
  };

  const recurse = (disk: number, source: PegName, auxiliary: PegName, target: PegName): void => {
    stack.push(`hanoi(${disk}, ${source}, ${target}, ${auxiliary})`);

    trace.push({
      type: 'CALL',
      pegs: clonePegs(pegs),
      message: `Moving ${disk} disk(s) from ${source} to ${target}`,
      stack: [...stack],
    });

    if (disk === 1) {
      pegs[target].push(pegs[source].pop()!);

      trace.push({
        type: 'MOVE',
        pegs: clonePegs(pegs),
        message: `Moved disk ${pegs[target][pegs[target].length - 1]} from ${source} to ${target}`,
        stack: [...stack],
      });

      stack.pop();
      return;
    }

    recurse(disk - 1, source, target, auxiliary);

    pegs[target].push(pegs[source].pop()!);

    trace.push({
      type: 'MOVE',
      pegs: clonePegs(pegs),
      message: `Moved disk ${pegs[target][pegs[target].length - 1]} from ${source} to ${target}`,
      stack: [...stack],
    });

    recurse(disk - 1, auxiliary, source, target);

    trace.push({
      type: 'RETURN',
      pegs: clonePegs(pegs),
      message: `Finished moving ${disk} disk(s) from ${source} to ${target}`,
      stack: [...stack],
    });

    stack.pop();
  };

  trace.push({
    type: 'START',
    pegs: clonePegs(pegs),
    message: `Starting Tower of Hanoi with ${n} disks`,
    stack: [],
  });

  recurse(n, 'A', 'B', 'C');

  trace.push({
    type: 'SUCCESS',
    pegs: clonePegs(pegs),
    message: 'All disks moved successfully!',
    stack: [],
  });

  return trace;
};

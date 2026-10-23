import type { PuzzleStep, PuzzleView, RecursionFrame } from '@core/steps';

/** The three pegs of a Tower of Hanoi puzzle. */
export type PegName = 'A' | 'B' | 'C';

/** The contents of all three pegs at a point in time. */
export type HanoiPegs = Record<PegName, number[]>;

/**
 * Build a puzzle step.
 *
 * The helper keeps the object literal out of the ambiguous position
 * after `yield`.
 */
export const puzzleStep = (step: PuzzleStep): PuzzleStep => step;

const clonePegs = (pegs: HanoiPegs): HanoiPegs => ({
  A: [...pegs.A],
  B: [...pegs.B],
  C: [...pegs.C],
});

/**
 * The full execution trace of a Tower of Hanoi solution.
 *
 * Yields a step every time a disk moves or a call is made or returned,
 * so the puzzle can be scrubbed to any position.
 *
 * @param n - how many disks to move.
 */
export function* runTowerOfHanoiTrace(n: number): Generator<PuzzleStep, void, undefined> {
  const stack: string[] = [];

  const frames = (): readonly RecursionFrame[] => stack.map((name, depth) => ({ name, depth }));

  const view = (pegs: HanoiPegs): PuzzleView => ({
    pegs: clonePegs(pegs),
    stack: frames(),
  });

  // Peg A starts with every disk, largest first.
  const pegs: HanoiPegs = {
    A: Array.from({ length: n }, (_, i) => n - i),
    B: [],
    C: [],
  };

  function* recurse(
    disk: number,
    source: PegName,
    auxiliary: PegName,
    target: PegName
  ): Generator<PuzzleStep, void, undefined> {
    stack.push(`hanoi(${disk}, ${source}, ${target}, ${auxiliary})`);

    yield puzzleStep({
      family: 'puzzle',
      t: 'call',
      view: view(pegs),
      message: `Moving ${disk} disk(s) from ${source} to ${target}`,
    });

    if (disk === 1) {
      pegs[target].push(pegs[source].pop() as number);

      yield puzzleStep({
        family: 'puzzle',
        t: 'move',
        view: view(pegs),
        message: `Moved disk ${pegs[target][pegs[target].length - 1]} from ${source} to ${target}`,
      });

      stack.pop();
      return;
    }

    yield* recurse(disk - 1, source, target, auxiliary);

    pegs[target].push(pegs[source].pop() as number);

    yield puzzleStep({
      family: 'puzzle',
      t: 'move',
      view: view(pegs),
      message: `Moved disk ${pegs[target][pegs[target].length - 1]} from ${source} to ${target}`,
    });

    yield* recurse(disk - 1, auxiliary, source, target);

    yield puzzleStep({
      family: 'puzzle',
      t: 'return',
      view: view(pegs),
      message: `Finished moving ${disk} disk(s) from ${source} to ${target}`,
    });

    stack.pop();
  }

  yield puzzleStep({
    family: 'puzzle',
    t: 'start',
    view: view(pegs),
    message: `Starting Tower of Hanoi with ${n} disks`,
  });

  yield* recurse(n, 'A', 'B', 'C');

  yield puzzleStep({
    family: 'puzzle',
    t: 'success',
    view: view(pegs),
    message: 'All disks moved successfully!',
  });
}

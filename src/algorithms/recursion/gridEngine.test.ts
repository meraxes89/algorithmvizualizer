import { describe, expect, it } from 'vitest';
import {
  runKnightsTourTrace,
  runNQueensTrace,
  runRatInMazeTrace,
  runSudokuTrace,
} from './gridEngine';
import type { BoardStep } from '@core/steps';

const trace = (generator: Generator<BoardStep, void, undefined>) => [...generator];

const isIterable = (value: unknown): value is Iterable<BoardStep> =>
  typeof value === 'object' && value !== null && Symbol.iterator in value;

/** The board a search finished with. */
const finalBoard = (steps: readonly BoardStep[]): readonly (readonly BoardCell[])[] | null => {
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].view.board.length > 0) return steps[i].view.board;
  }
  return null;
};

describe('the grid engine', () => {
  it('solves the four-queens puzzle', () => {
    const generator = runNQueensTrace(4);
    if (!isIterable(generator)) throw new Error('runNQueensTrace did not return a trace');

    const steps = trace(generator);
    const board = finalBoard(steps);
    expect(board).not.toBeNull();

    // Four queens, one per row, no two sharing a column or diagonal.
    const queens: [number, number][] = [];
    (board as readonly (readonly BoardCell[])[]).forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell === 'Q') queens.push([i, j]);
      })
    );

    expect(queens).toHaveLength(4);
    expect(new Set(queens.map(([, col]) => col)).size).toBe(4);

    for (const [r1, c1] of queens) {
      for (const [r2, c2] of queens) {
        if (r1 === r2 && c1 === c2) continue;
        expect(Math.abs(r1 - r2)).not.toBe(Math.abs(c1 - c2));
      }
    }
  });

  it('solves a sudoku', () => {
    const puzzle = [
      '53..7....',
      '6..195...',
      '.98....6.',
      '8...6...3',
      '4..8.3..1',
      '7...2...6',
      '.6....28.',
      '...419..5',
      '....8..79',
    ].map((row) => row.split(''));

    const steps = trace(runSudokuTrace(puzzle));
    const board = finalBoard(steps) as readonly (readonly string[])[] | null;

    expect(board).not.toBeNull();

    // Every row is a permutation of one to nine.
    for (const row of board as readonly (readonly string[])[]) {
      expect([...new Set(row)].sort()).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    }
  });

  it('walks the rat through the maze', () => {
    const maze = [
      [1, 0, 0, 0],
      [1, 1, 0, 1],
      [0, 1, 0, 0],
      [0, 1, 1, 1],
    ];

    const steps = trace(runRatInMazeTrace(maze));

    expect(steps.some((step) => step.t === 'success')).toBe(true);

    // The path starts at the entrance and ends at the exit.
    const board = finalBoard(steps) as readonly (readonly number[])[] | null;
    expect(board?.[0][0]).toBe(1);
    expect(board?.[3][3]).toBe(1);
  });

  it('tours a five-by-five board with a knight', () => {
    const steps = trace(runKnightsTourTrace(5));
    const board = finalBoard(steps) as readonly (readonly number[])[] | null;

    expect(board).not.toBeNull();

    // Every square is visited exactly once, and the start counts as move
    // zero, so the numbers zero to twenty-four all appear.
    const values = (board as readonly (readonly number[])[]).flat();
    expect([...new Set(values)].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 25 }, (_, i) => i)
    );
  });

  it('carries the stack in every view', () => {
    const steps = trace(runNQueensTrace(4));

    for (const step of steps) {
      expect(step.view.stack).toBeTypeOf('object');
      expect(step.family).toBe('board');
    }
  });
});

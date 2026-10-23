import { describe, expect, it } from 'vitest';
import {
  generateComplexMaze,
  generateDFSBacktrackingMaze,
  generatePrimsMaze,
  generateRecursiveDivisionMaze,
  type MazeGrid,
} from './mazeGenerator';
import type { CellRef } from '@core/steps';

const ROWS = 15;
const COLS = 15;

const emptyGrid = (rows = ROWS, cols = COLS): MazeGrid =>
  Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({ row, col, isWall: false }))
  );

const start: CellRef = { row: 1, col: 1 };
const end: CellRef = { row: ROWS - 2, col: COLS - 2 };

/** Whether the exit can be reached from the entrance without crossing a wall. */
const isConnected = (grid: MazeGrid, from: CellRef, to: CellRef): boolean => {
  const seen = new Set([`${from.row},${from.col}`]);
  const queue: CellRef[] = [from];

  while (queue.length > 0) {
    const current = queue.shift() as CellRef;

    if (current.row === to.row && current.col === to.col) return true;

    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const row = current.row + dr;
      const col = current.col + dc;

      if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) continue;
      if (grid[row][col].isWall) continue;

      const key = `${row},${col}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({ row, col });
      }
    }
  }

  return false;
};

const strategies = [
  ['dfs', generateDFSBacktrackingMaze],
  ['recursive_division', generateRecursiveDivisionMaze],
  ['prims', generatePrimsMaze],
] as const;

describe('the maze generator', () => {
  it.each(strategies)('builds a %s maze with the entrance and exit open', (_, build) => {
    const grid = build(emptyGrid(), start, end);

    expect(grid).toHaveLength(ROWS);
    expect(grid[0]).toHaveLength(COLS);
    expect(grid[start.row][start.col].isWall).toBe(false);
    expect(grid[end.row][end.col].isWall).toBe(false);
  });

  it.each(strategies)('leaves the %s maze solvable', (_, build) => {
    const grid = build(emptyGrid(), start, end);

    expect(isConnected(grid, start, end)).toBe(true);
  });

  it.each(strategies)('keeps every cell on the %s grid', (_, build) => {
    const grid = build(emptyGrid(), start, end);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        expect(grid[row][col]).toBeTypeOf('object');
        expect(typeof grid[row][col].isWall).toBe('boolean');
      }
    }
  });

  it('routes through the router by name', () => {
    const grid = generateComplexMaze(emptyGrid(), start, end, 'recursive_division');

    expect(isConnected(grid, start, end)).toBe(true);
  });

  it('builds the default maze when no type is given', () => {
    const grid = generateComplexMaze(emptyGrid(), start, end);

    expect(isConnected(grid, start, end)).toBe(true);
  });

  it('connects an entrance that starts walled in', () => {
    const grid = emptyGrid();

    // Wall everything: the connectivity pass has to carve its way out.
    for (const row of grid) {
      for (const cell of row) cell.isWall = true;
    }
    grid[start.row][start.col].isWall = false;

    const built = generateDFSBacktrackingMaze(grid, start, end);

    expect(isConnected(built, start, end)).toBe(true);
  });

  it('works on a grid that is not square', () => {
    const grid = emptyGrid(10, 21);
    const from: CellRef = { row: 1, col: 1 };
    const to: CellRef = { row: 8, col: 19 };

    const built = generateComplexMaze(grid, from, to, 'prims');

    expect(built).toHaveLength(10);
    expect(built[0]).toHaveLength(21);
    expect(isConnected(built, from, to)).toBe(true);
  });
});

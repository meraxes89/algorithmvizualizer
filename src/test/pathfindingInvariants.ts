import { expect } from 'vitest';
import type { CellRef, PathStep } from '@core/steps';
import { cellKey, sameCell, type Grid } from '../algorithms/pathfinding/grid';

/**
 * The invariants every pathfinding trace has to satisfy.
 *
 * These are checked for every input the property tests throw at an
 * algorithm, and against the golden traces.
 */
export function expectValidPathTrace(
  grid: Grid,
  start: CellRef,
  end: CellRef,
  trace: readonly PathStep[]
): void {
  expect(trace.length).toBeGreaterThan(0);

  for (const step of trace) {
    expect(step.family).toBe('pathfinding');
  }

  // The trace opens by discovering the start and closes by finishing.
  expect(trace[0].t).toBe('frontier');
  expect(trace[trace.length - 1].t).toBe('done');

  const last = trace[trace.length - 1];
  const path = last.view.path;

  // Every cell the search touched is a real cell of the grid, and none
  // of them is a wall.
  const seen = new Set<string>();
  for (const step of trace) {
    for (const cell of [...step.view.visited, ...step.view.frontier, ...step.view.path]) {
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThan(grid.length);
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThan(grid[0].length);
      expect(grid[cell.row][cell.col].isWall).toBe(false);
      seen.add(cellKey(cell));
    }
  }

  // A cell is never visited twice.
  const visitedKeys = last.view.visited.map(cellKey);
  expect(new Set(visitedKeys).size).toBe(visitedKeys.length);

  if (path.length > 0) {
    // The route starts where the search started and ends where it was
    // looking for the target.
    expect(sameCell(path[0], start)).toBe(true);
    expect(sameCell(path[path.length - 1], end)).toBe(true);

    // Every step of the route moves to an orthogonal neighbour.
    for (let i = 1; i < path.length; i++) {
      const distance =
        Math.abs(path[i].row - path[i - 1].row) + Math.abs(path[i].col - path[i - 1].col);
      expect(distance).toBe(1);
    }

    // The route never goes through a wall.
    for (const cell of path) {
      expect(grid[cell.row][cell.col].isWall).toBe(false);
    }
  }
}

/** The number of steps a route takes. */
export const pathLength = (path: readonly CellRef[]): number => path.length;

export const GRID_ROWS = 5;
export const GRID_COLS = 5;

export const GRID_START: CellRef = { row: 0, col: 0 };
export const GRID_END: CellRef = { row: GRID_ROWS - 1, col: GRID_COLS - 1 };

/** A grid with no walls at all. */
export const openGrid = (): Grid => gridWith(() => false);

/**
 * A grid built from a predicate.
 *
 * The grid model is read-only, so a test says where the walls are rather
 * than mutating a grid after the fact.
 */
export const gridWith = (
  isWall: (row: number, col: number) => boolean,
  rows = GRID_ROWS,
  cols = GRID_COLS
): Grid =>
  Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({ row, col, isWall: isWall(row, col) }))
  );

/**
 * A grid whose only route snakes right, down, back left, and down again.
 *
 * The route is sixteen steps long where the Manhattan distance is eight,
 * so a search that finds it has demonstrably gone around something.
 */
export const snakeGrid = (): Grid => {
  const open: [number, number][] = [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 4],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 0],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ];

  return gridWith((row, col) => !open.some(([r, c]) => r === row && c === col));
};

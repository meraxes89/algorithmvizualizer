import type { CellRef } from '@core/steps';

/**
 * The grid a pathfinding algorithm searches.
 *
 * Only the walls are part of the grid. Everything the search *does* to
 * the grid — which cells it expanded, which route it found — lives in
 * the trace, not here. That is what lets the same algorithm run over a
 * grid that the user is still editing.
 */
export type GridNode = {
  readonly row: number;
  readonly col: number;
  readonly isWall: boolean;
  /**
   * The cost of moving into this cell.
   *
   * It defaults to 1, so a grid without weights is the uniform-cost
   * case. A grid with weights makes Dijkstra's algorithm a genuinely
   * weighted one, and A* a search that weighs its estimate against a
   * real cost.
   */
  readonly weight?: number;
};

export type Grid = readonly (readonly GridNode[])[];

/** A stable key for a cell, for use in a set or a map. */
export const cellKey = (cell: CellRef): string => `${cell.row},${cell.col}`;

/** Whether two cells are the same. */
export const sameCell = (a: CellRef, b: CellRef): boolean => a.row === b.row && a.col === b.col;

/**
 * The open neighbours of a cell: the four orthogonal ones that are not
 * walls.
 */
export const neighbours = (cell: CellRef, grid: Grid): CellRef[] => {
  const { row, col } = cell;
  const candidates: CellRef[] = [];

  if (row > 0) candidates.push({ row: row - 1, col });
  if (row < grid.length - 1) candidates.push({ row: row + 1, col });
  if (col > 0) candidates.push({ row, col: col - 1 });
  if (col < grid[0].length - 1) candidates.push({ row, col: col + 1 });

  return candidates.filter((candidate) => !grid[candidate.row][candidate.col].isWall);
};

/**
 * Walk the `previous` chain back from `end` to the start.
 *
 * `previous` maps a cell key to the cell it was reached from.
 */
export const reconstructPath = (
  previous: ReadonlyMap<string, CellRef>,
  end: CellRef,
  start: CellRef
): CellRef[] => {
  const path: CellRef[] = [end];
  let current = end;

  while (!sameCell(current, start)) {
    const step = previous.get(cellKey(current));
    if (!step) {
      return [];
    }
    path.unshift(step);
    current = step;
  }

  return path;
};

/** The Manhattan distance between two cells. */
export const manhattan = (a: CellRef, b: CellRef): number =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

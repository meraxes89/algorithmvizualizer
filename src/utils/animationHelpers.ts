/** Helpers shared by the visualizer controls and the array demos. */

/** One editable cell in the two-dimensional pathfinding grid. */
export type GridCell = {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  isVisited: boolean;
  isPath?: boolean;
  distance: number;
  previousNode: GridCell | null;
};

/** Build an array of random integers in the inclusive range. */
export const generateRandomArray = (size = 50, min = 5, max = 500): number[] =>
  Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);

/** Build a sorted array of random integers in the inclusive range. */
export const generateSortedArray = (size = 50, min = 5, max = 500): number[] =>
  generateRandomArray(size, min, max).sort((a, b) => a - b);

/** Playback speeds in milliseconds between steps. */
export const SPEED_PRESETS = {
  SLOW: 500,
  MEDIUM: 200,
  FAST: 50,
  VERY_FAST: 10,
  INSTANT: 1,
} as const;

/**
 * Create the editable grid used by the pathfinding page.
 *
 * The start and end cells sit on the middle row, five cells in from each
 * side. The search itself works on a smaller grid model built from the
 * walls; this object also carries the UI-only visited and path flags.
 */
export const createInitialGrid = (rows = 20, cols = 50): GridCell[][] => {
  const middleRow = Math.floor(rows / 2);

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      isStart: row === middleRow && col === 5,
      isEnd: row === middleRow && col === cols - 6,
      isWall: false,
      isVisited: false,
      distance: Infinity,
      previousNode: null,
    }))
  );
};

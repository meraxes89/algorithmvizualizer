import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { breadthFirstSearch } from './bfs';
import {
  expectValidPathTrace,
  gridWith,
  openGrid,
  snakeGrid,
} from '../../../test/pathfindingInvariants';
import type { Grid } from '../grid';
import type { CellRef, PathStep } from '@core/steps';

const ROWS = 5;
const COLS = 5;

const start: CellRef = { row: 0, col: 0 };
const end: CellRef = { row: ROWS - 1, col: COLS - 1 };

const trace = (grid: Grid, from: CellRef, to: CellRef): PathStep[] => [
  ...breadthFirstSearch(grid, from, to),
];

describe('breadthFirstSearch', () => {
  it('produces the golden trace for an open grid', () => {
    const steps = trace(openGrid(), start, end);

    expect(steps[0].t).toBe('frontier');
    expect(steps[steps.length - 1].t).toBe('done');

    const path = steps[steps.length - 1].view.path;
    expect(path).toHaveLength(9);
    expect(path[0]).toEqual(start);
    expect(path[path.length - 1]).toEqual(end);
  });

  it('satisfies the pathfinding invariants', () => {
    const grid = openGrid();
    expectValidPathTrace(grid, start, end, trace(grid, start, end));
  });

  it('goes the long way round when the short way is walled off', () => {
    const grid = snakeGrid();
    const steps = trace(grid, start, end);

    expectValidPathTrace(grid, start, end, steps);

    const path = steps[steps.length - 1].view.path;
    // The snake is sixteen steps, where the direct route would be eight.
    expect(path).toHaveLength(17);
  });

  it('reports that there is no route when the end is walled off', () => {
    const grid = gridWith((row, col) => row === end.row && col === end.col);

    const steps = trace(grid, start, end);
    expect(steps.some((step) => step.t === 'not-found')).toBe(true);
    expect(steps[steps.length - 1].view.path).toEqual([]);
  });

  it('finds a valid route on any grid', () => {
    fc.assert(
      fc.property(
        fc.array(fc.array(fc.boolean(), { minLength: COLS, maxLength: COLS }), {
          minLength: ROWS,
          maxLength: ROWS,
        }),
        (walls) => {
          // The search always starts and ends on open ground.
          const grid: Grid = gridWith(
            (row, col) =>
              walls[row][col] &&
              !(row === 0 && col === 0) &&
              !(row === ROWS - 1 && col === COLS - 1)
          );

          const steps = trace(grid, start, end);
          expectValidPathTrace(grid, start, end, steps);

          // A route can never be longer than the number of cells.
          if (steps[steps.length - 1].view.path.length > 0) {
            expect(steps[steps.length - 1].view.path.length).toBeLessThanOrEqual(ROWS * COLS);
          }
        }
      ),
      { numRuns: 40 }
    );
  });
});

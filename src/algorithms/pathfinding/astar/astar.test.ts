import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { aStar } from './astar';
import {
  GRID_COLS,
  GRID_END,
  GRID_ROWS,
  GRID_START,
  expectValidPathTrace,
  gridWith,
  openGrid,
  snakeGrid,
} from '../../../test/pathfindingInvariants';
import type { Grid } from '../grid';
import type { CellRef, PathStep } from '@core/steps';

const trace = (grid: Grid, from: CellRef, to: CellRef): PathStep[] => [...aStar(grid, from, to)];

describe('aStar', () => {
  it('produces the golden trace for an open grid', () => {
    const steps = trace(openGrid(), GRID_START, GRID_END);

    expect(steps[0].t).toBe('frontier');
    expect(steps[steps.length - 1].t).toBe('done');

    const path = steps[steps.length - 1].view.path;
    expect(path).toHaveLength(9);
    expect(path[0]).toEqual(GRID_START);
    expect(path[path.length - 1]).toEqual(GRID_END);
  });

  it('satisfies the pathfinding invariants', () => {
    const grid = openGrid();
    expectValidPathTrace(grid, GRID_START, GRID_END, trace(grid, GRID_START, GRID_END));
  });

  it('takes the long way round when the short way is walled off', () => {
    const grid = snakeGrid();
    const steps = trace(grid, GRID_START, GRID_END);

    expectValidPathTrace(grid, GRID_START, GRID_END, steps);
    expect(steps[steps.length - 1].view.path).toHaveLength(17);
  });

  it('visits fewer cells than a blind search would', () => {
    // A* is directed by the goal, so it should not sweep the whole grid.
    const steps = trace(openGrid(), GRID_START, GRID_END);
    const visited = steps[steps.length - 1].view.visited;

    expect(visited.length).toBeLessThan(GRID_ROWS * GRID_COLS);
  });

  it('reports that there is no route when the end is walled off', () => {
    const grid = gridWith((row, col) => row === GRID_END.row && col === GRID_END.col);

    const steps = trace(grid, GRID_START, GRID_END);
    expect(steps.some((step) => step.t === 'not-found')).toBe(true);
  });

  it('finds a valid route on any grid', () => {
    fc.assert(
      fc.property(
        fc.array(fc.array(fc.boolean(), { minLength: GRID_COLS, maxLength: GRID_COLS }), {
          minLength: GRID_ROWS,
          maxLength: GRID_ROWS,
        }),
        (walls) => {
          const grid: Grid = gridWith(
            (row, col) =>
              walls[row][col] &&
              !(row === 0 && col === 0) &&
              !(row === GRID_ROWS - 1 && col === GRID_COLS - 1)
          );

          const steps = trace(grid, GRID_START, GRID_END);
          expectValidPathTrace(grid, GRID_START, GRID_END, steps);
        }
      ),
      { numRuns: 40 }
    );
  });
});

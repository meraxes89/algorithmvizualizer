import { describe, expect, it } from 'vitest';
import {
  SPEED_PRESETS,
  createInitialGrid,
  generateRandomArray,
  generateSortedArray,
} from './animationHelpers';

describe('animation helpers', () => {
  it('builds an array of the requested size inside the range', () => {
    const values = generateRandomArray(25, 3, 9);

    expect(values).toHaveLength(25);
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(9);
    }
  });

  it('sorts the generated array without changing its values', () => {
    const values = generateSortedArray(30, 1, 100);

    expect(values).toHaveLength(30);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it('builds the default pathfinding grid with one start and one end', () => {
    const grid = createInitialGrid();

    expect(grid).toHaveLength(20);
    expect(grid[0]).toHaveLength(50);
    expect(grid.flat().filter((cell) => cell.isStart)).toHaveLength(1);
    expect(grid.flat().filter((cell) => cell.isEnd)).toHaveLength(1);
  });

  it('places the start and end on the middle row of a custom grid', () => {
    const grid = createInitialGrid(11, 21);
    const middle = grid[5];

    expect(middle[5].isStart).toBe(true);
    expect(middle[15].isEnd).toBe(true);
    expect(middle[5].row).toBe(5);
    expect(middle[5].col).toBe(5);
  });

  it('exposes the playback speeds the controls use', () => {
    expect(SPEED_PRESETS.SLOW).toBeGreaterThan(SPEED_PRESETS.MEDIUM);
    expect(SPEED_PRESETS.MEDIUM).toBeGreaterThan(SPEED_PRESETS.FAST);
    expect(SPEED_PRESETS.INSTANT).toBe(1);
  });
});

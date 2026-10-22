import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { jumpSearch } from './jump-search';
import type { SearchStep } from '@core/steps';

const trace = (array: readonly number[], target: number): SearchStep[] => [
  ...jumpSearch(array, target),
];

function expectValidSearchTrace(
  array: readonly number[],
  target: number,
  steps: readonly SearchStep[]
): void {
  expect(steps.length).toBeGreaterThan(0);

  for (const step of steps) {
    expect(step.family).toBe('searching');
    expect([...step.view.array]).toEqual([...array]);
  }

  expect(steps[0].t).toBe('set-array');

  const last = steps[steps.length - 1];
  const foundIndex = array.indexOf(target);

  if (foundIndex === -1) {
    expect(last.t).toBe('not-found');
    expect(last.view.found).toBe(-1);
  } else {
    expect(last.t).toBe('found');
    expect(last.view.found).toBe(foundIndex);
    expect(array[last.view.found]).toBe(target);
  }

  for (const step of steps) {
    if (step.t === 'probe') {
      expect(step.index).toBeGreaterThanOrEqual(0);
      expect(step.index).toBeLessThan(array.length);
    }
  }
}

describe('jumpSearch', () => {
  it('produces the golden trace for a fixed input', () => {
    const steps = trace([2, 4, 6, 8, 10, 12, 14, 16, 18], 10);

    expect(steps[0].t).toBe('set-array');
    expect(steps[steps.length - 1].t).toBe('found');
    expect(steps[steps.length - 1].view.found).toBe(4);
  });

  it('satisfies the search invariants', () => {
    expectValidSearchTrace(
      [2, 4, 6, 8, 10, 12, 14, 16, 18],
      10,
      trace([2, 4, 6, 8, 10, 12, 14, 16, 18], 10)
    );
  });

  it('reports a target that is not there', () => {
    const steps = trace([2, 4, 6, 8, 10], 7);
    expect(steps[steps.length - 1].t).toBe('not-found');
  });

  it('finds any target that is present, and only that', () => {
    fc.assert(
      fc.property(
        fc
          .uniqueArray(fc.integer({ min: 0, max: 40 }))
          .map((array) => [...array].sort((a, b) => a - b)),
        fc.integer({ min: 0, max: 40 }),
        (array, target) => {
          expectValidSearchTrace(array, target, trace(array, target));
        }
      ),
      { numRuns: 50 }
    );
  });

  it('handles an empty array', () => {
    const steps = trace([], 5);
    expect(steps[steps.length - 1].t).toBe('not-found');
  });
});

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { binarySearch } from './binary-search';
import type { SearchStep } from '@core/steps';

const trace = (array: readonly number[], target: number): SearchStep[] => [
  ...binarySearch(array, target),
];

/**
 * The index a step looked at.
 *
 * Only the steps that actually examine an element carry one, so this
 * narrows the union for the type checker.
 */
const indexOf = (step: SearchStep): number => {
  if (step.t !== 'probe' && step.t !== 'found') {
    throw new Error(`expected a probe or found step, got ${step.t}`);
  }
  return step.index;
};

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
  }

  // The window only ever narrows, and it always contains the target
  // while the search is still running.
  let previous: [number, number] | null = null;
  for (const step of steps) {
    if (step.t === 'probe' && step.view.range) {
      const [low, high] = step.view.range;
      expect(low).toBeGreaterThanOrEqual(0);
      expect(high).toBeLessThan(array.length);
      expect(low).toBeLessThanOrEqual(high);

      if (previous) {
        expect(low).toBeGreaterThanOrEqual(previous[0]);
        expect(high).toBeLessThanOrEqual(previous[1]);
      }
      previous = [low, high];
    }
  }
}

describe('binarySearch', () => {
  it('produces the golden trace for a fixed input', () => {
    const steps = trace([2, 4, 6, 8, 10], 6);

    expect(steps.map((step) => step.t)).toEqual(['set-array', 'probe', 'found']);
    expect(indexOf(steps[1])).toBe(2);
    expect(steps[2].view.found).toBe(2);
  });

  it('narrows the window on every probe', () => {
    const steps = trace([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10);

    expect(steps.map((step) => step.t)).toEqual([
      'set-array',
      'probe',
      'probe',
      'probe',
      'probe',
      'found',
    ]);
    expect(steps[1].view.range).toEqual([0, 9]);
    expect(steps[2].view.range).toEqual([5, 9]);
    expect(steps[3].view.range).toEqual([8, 9]);
    expect(steps[4].view.range).toEqual([9, 9]);
  });

  it('reports a target that is not there', () => {
    const steps = trace([2, 4, 6, 8, 10], 7);
    expect(steps[steps.length - 1].t).toBe('not-found');
  });

  it('satisfies the search invariants', () => {
    expectValidSearchTrace([2, 4, 6, 8, 10], 6, trace([2, 4, 6, 8, 10], 6));
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

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { linearSearch } from './linear-search';
import type { SearchStep } from '@core/steps';

const trace = (array: readonly number[], target: number): SearchStep[] => [
  ...linearSearch(array, target),
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

/** The invariants every search trace has to satisfy. */
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

  // Every probed index is inside the array.
  for (const step of steps) {
    if (step.t === 'probe') {
      expect(step.index).toBeGreaterThanOrEqual(0);
      expect(step.index).toBeLessThan(array.length);
    }
  }
}

describe('linearSearch', () => {
  it('produces the golden trace for a fixed input', () => {
    const steps = trace([2, 4, 6, 8, 10], 6);

    expect(steps).toHaveLength(5);
    expect(steps.map((step) => step.t)).toEqual(['set-array', 'probe', 'probe', 'probe', 'found']);
    expect(indexOf(steps[3])).toBe(2);
    expect(steps[4].view.found).toBe(2);
  });

  it('reports a target that is not there', () => {
    const steps = trace([2, 4, 6, 8, 10], 7);

    expect(steps[steps.length - 1].t).toBe('not-found');
    // One step to set the array, one per element, one to report the miss.
    expect(steps).toHaveLength(7);
  });

  it('satisfies the search invariants', () => {
    expectValidSearchTrace([2, 4, 6, 8, 10], 6, trace([2, 4, 6, 8, 10], 6));
  });

  it('finds any target that is present, and only that', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 40 })),
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

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { heapSort } from './heap-sort';
import { expectValidSortingTrace, stepTypeHistogram } from '../../../test/sortingInvariants';
import type { SortStep } from '@core/steps';

const trace = (input: readonly number[]): SortStep[] => [...heapSort(input)];

describe('heapSort', () => {
  it('produces the golden trace for a fixed input', () => {
    const steps = trace([5, 2, 8, 1, 9, 3]);

    expect(steps).toHaveLength(33);
    expect(stepTypeHistogram(steps)).toEqual({
      'set-array': 1,
      compare: 15,
      swap: 11,
      mark: 5,
      done: 1,
    });
    expect([...steps[steps.length - 1].view.array]).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it('satisfies the sorting invariants', () => {
    expectValidSortingTrace([5, 2, 8, 1, 9, 3], trace([5, 2, 8, 1, 9, 3]));
  });

  it('sorts any array into a sorted permutation of itself', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: -50, max: 50 })), (input) => {
        expectValidSortingTrace(input, trace(input));
      }),
      { numRuns: 50 }
    );
  });

  it('handles an empty array', () => {
    expectValidSortingTrace([], trace([]));
  });

  it('handles a single element', () => {
    expectValidSortingTrace([7], trace([7]));
  });
});

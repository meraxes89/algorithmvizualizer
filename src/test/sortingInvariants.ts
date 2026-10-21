import { expect } from 'vitest';
import type { SortStep } from '@core/steps';

/**
 * The invariants every sorting trace has to satisfy.
 *
 * These are the properties that make a sorting algorithm a sorting
 * algorithm, as opposed to a particular sequence of steps. They are
 * checked against every input the property tests throw at an algorithm,
 * and against the golden traces.
 */
export function expectValidSortingTrace(
  input: readonly number[],
  trace: readonly SortStep[]
): void {
  expect(trace.length).toBeGreaterThan(0);

  // Every step belongs to the sorting family.
  for (const step of trace) {
    expect(step.family).toBe('sorting');
  }

  // The trace opens by setting the array and closes by declaring itself
  // done.
  expect(trace[0].t).toBe('set-array');
  expect(trace[trace.length - 1].t).toBe('done');

  // The first step shows the input unchanged.
  expect([...trace[0].view.array]).toEqual([...input]);

  // The final array is sorted.
  const result = [...trace[trace.length - 1].view.array];
  expect(result).toEqual([...result].sort((a, b) => a - b));

  // The final array is a permutation of the input: nothing lost, nothing
  // invented.
  expect([...result].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b));

  // The final view marks every position as sorted.
  const done = trace[trace.length - 1];
  expect([...done.view.sorted].sort((a, b) => a - b)).toEqual(result.map((_, index) => index));

  // The array only ever changes on a swap step.
  for (let i = 1; i < trace.length; i++) {
    const previous = trace[i - 1].view.array;
    const current = trace[i].view.array;
    const changed = previous.some((value, index) => value !== current[index]);

    if (changed) {
      expect(trace[i].t).toBe('swap');
    }
  }

  // Highlighted indices are always inside the array.
  const length = trace[0].view.array.length;
  for (const step of trace) {
    for (const index of [...step.view.comparing, ...step.view.swapping]) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(length);
    }
  }

  // A step is either comparing, swapping, or neither — never both.
  for (const step of trace) {
    expect(step.view.comparing.length === 0 || step.view.swapping.length === 0).toBe(true);
  }
}

/** A histogram of the step types in a trace, for the golden tests. */
export function stepTypeHistogram(trace: readonly SortStep[]): Record<string, number> {
  const histogram: Record<string, number> = {};
  for (const step of trace) {
    histogram[step.t] = (histogram[step.t] ?? 0) + 1;
  }
  return histogram;
}

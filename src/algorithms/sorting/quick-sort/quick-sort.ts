import type { SortStep, SortView } from '@core/steps';

/**
 * Quick Sort.
 *
 * Picks a pivot, partitions the array around it, and recurses into the
 * two halves. The pivot is marked as such in the trace, because it is the
 * one element whose final position is known immediately.
 */
export function* quickSort(input: readonly number[]): Generator<SortStep, void, undefined> {
  const array = [...input];
  const sorted: number[] = [];

  const view = (comparing: readonly number[] = [], swapping: readonly number[] = []): SortView => ({
    array: [...array],
    comparing: [...comparing],
    swapping: [...swapping],
    sorted: [...sorted],
  });

  const allSortedView = (): SortView => ({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: array.map((_, index) => index),
  });

  yield { family: 'sorting', t: 'set-array', view: view() };

  // The internal helper hands the pivot index back to its caller, so it
  // returns a number rather than void. The public generator still ends in
  // void, as the contract requires.
  function* partition(low: number, high: number): Generator<SortStep, number, undefined> {
    const pivot = array[high];
    let i = low - 1;

    yield { family: 'sorting', t: 'mark', view: view(), state: 'pivot' };

    for (let j = low; j < high; j++) {
      yield { family: 'sorting', t: 'compare', view: view([j, high]) };

      if (array[j] < pivot) {
        i += 1;

        if (i !== j) {
          [array[i], array[j]] = [array[j], array[i]];
          yield { family: 'sorting', t: 'swap', view: view([], [i, j]) };
        }
      }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    yield { family: 'sorting', t: 'swap', view: view([], [i + 1, high]) };

    sorted.push(i + 1);
    yield { family: 'sorting', t: 'mark', view: view(), state: 'sorted' };

    return i + 1;
  }

  function* sort(low: number, high: number): Generator<SortStep, void, undefined> {
    if (low >= high) {
      return;
    }

    const pivotIndex = yield* partition(low, high);
    yield* sort(low, pivotIndex - 1);
    yield* sort(pivotIndex + 1, high);
  }

  yield* sort(0, array.length - 1);

  yield { family: 'sorting', t: 'done', view: allSortedView() };
}

import type { SortStep, SortView } from '@core/steps';

/**
 * Merge Sort.
 *
 * Splits the array in half, sorts each half, then merges the two sorted
 * runs back together. The merge is where the comparisons happen, so the
 * trace highlights the two elements being weighed against each other.
 */
export function* mergeSort(input: readonly number[]): Generator<SortStep, void, undefined> {
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

  function* merge(
    left: number,
    middle: number,
    right: number
  ): Generator<SortStep, void, undefined> {
    const leftRun = array.slice(left, middle + 1);
    const rightRun = array.slice(middle + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftRun.length && j < rightRun.length) {
      yield {
        family: 'sorting',
        t: 'compare',
        view: view([left + i, middle + 1 + j]),
      };

      if (leftRun[i] <= rightRun[j]) {
        array[k] = leftRun[i];
        i += 1;
      } else {
        array[k] = rightRun[j];
        j += 1;
      }

      yield { family: 'sorting', t: 'swap', view: view([], [k]) };
      k += 1;
    }

    while (i < leftRun.length) {
      array[k] = leftRun[i];
      i += 1;
      yield { family: 'sorting', t: 'swap', view: view([], [k]) };
      k += 1;
    }

    while (j < rightRun.length) {
      array[k] = rightRun[j];
      j += 1;
      yield { family: 'sorting', t: 'swap', view: view([], [k]) };
      k += 1;
    }
  }

  function* sort(left: number, right: number): Generator<SortStep, void, undefined> {
    if (left >= right) {
      return;
    }

    const middle = Math.floor((left + right) / 2);
    yield* sort(left, middle);
    yield* sort(middle + 1, right);
    yield* merge(left, middle, right);
  }

  yield* sort(0, array.length - 1);

  sorted.push(...array.map((_, index) => index));
  yield { family: 'sorting', t: 'mark', view: view(), state: 'sorted' };
  yield { family: 'sorting', t: 'done', view: allSortedView() };
}

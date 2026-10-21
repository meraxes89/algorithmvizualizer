import type { SortStep, SortView } from '@core/steps';

/**
 * Insertion Sort.
 *
 * Grows a sorted prefix one element at a time: each new element is
 * compared against the prefix and shifted left until it sits in the
 * right place.
 */
export function* insertionSort(input: readonly number[]): Generator<SortStep, void, undefined> {
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

  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;

    while (j >= 0) {
      yield { family: 'sorting', t: 'compare', view: view([j, j + 1]) };

      if (array[j] <= key) {
        break;
      }

      array[j + 1] = array[j];
      yield { family: 'sorting', t: 'swap', view: view([], [j, j + 1]) };
      j -= 1;
    }

    // The key lands in the slot the shifting left open. When nothing was
    // shifted it is already there, and the array has not changed.
    if (j + 1 !== i) {
      array[j + 1] = key;
      yield { family: 'sorting', t: 'swap', view: view([], [j + 1, i]) };
    }

    sorted.push(j + 1);
    yield { family: 'sorting', t: 'mark', view: view(), state: 'sorted' };
  }

  yield { family: 'sorting', t: 'done', view: allSortedView() };
}

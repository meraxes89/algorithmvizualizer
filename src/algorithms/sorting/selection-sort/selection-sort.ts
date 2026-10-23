import type { SortStep, SortView } from '@core/steps';

/**
 * Selection Sort.
 *
 * Scans the unsorted remainder for the smallest element and swaps it
 * into place, one position at a time.
 */
export function* selectionSort(input: readonly number[]): Generator<SortStep, void, undefined> {
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

  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < array.length; j++) {
      yield { family: 'sorting', t: 'compare', view: view([minIndex, j]) };

      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      yield { family: 'sorting', t: 'swap', view: view([], [i, minIndex]) };
    }

    sorted.push(i);
    yield { family: 'sorting', t: 'mark', view: view(), state: 'sorted' };
  }

  yield { family: 'sorting', t: 'done', view: allSortedView() };
}

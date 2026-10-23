import type { SortStep, SortView } from '@core/steps';

/**
 * Bubble Sort.
 *
 * Repeatedly walks the array, comparing adjacent elements and swapping
 * them when they are out of order. After each pass the largest remaining
 * element has bubbled to the end, so that position is marked sorted.
 */
export function* bubbleSort(input: readonly number[]): Generator<SortStep, void, undefined> {
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

  for (let end = array.length - 1; end > 0; end--) {
    let swapped = false;

    for (let j = 0; j < end; j++) {
      yield { family: 'sorting', t: 'compare', view: view([j, j + 1]) };

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
        yield { family: 'sorting', t: 'swap', view: view([], [j, j + 1]) };
      }
    }

    sorted.push(end);
    yield { family: 'sorting', t: 'mark', view: view(), state: 'sorted' };

    // An early exit keeps the trace honest on inputs that are already
    // ordered: nothing else needs to move.
    if (!swapped) {
      break;
    }
  }

  yield { family: 'sorting', t: 'done', view: allSortedView() };
}

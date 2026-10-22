import type { SortStep, SortView } from '@core/steps';

/**
 * Heap Sort.
 *
 * Builds a max heap out of the array, then repeatedly moves the root —
 * the largest element left — to the end and repairs the heap.
 */
export function* heapSort(input: readonly number[]): Generator<SortStep, void, undefined> {
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

  const size = array.length;

  /**
   * Push the element at `root` down until the heap property holds
   * again, swapping it with whichever of its children is larger.
   */
  function* siftDown(root: number, heapSize: number): Generator<SortStep, void, undefined> {
    let current = root;

    for (;;) {
      const left = current * 2 + 1;
      if (left >= heapSize) return;

      let largest = left;
      const right = left + 1;

      if (right < heapSize) {
        yield { family: 'sorting', t: 'compare', view: view([left, right]) };
        if (array[right] > array[left]) {
          largest = right;
        }
      }

      yield { family: 'sorting', t: 'compare', view: view([current, largest]) };
      if (array[current] >= array[largest]) return;

      [array[current], array[largest]] = [array[largest], array[current]];
      yield { family: 'sorting', t: 'swap', view: view([], [current, largest]) };

      current = largest;
    }
  }

  // Build the heap, bottom up.
  for (let i = Math.floor(size / 2) - 1; i >= 0; i--) {
    yield* siftDown(i, size);
  }

  // Move the largest to the end, over and over.
  for (let end = size - 1; end > 0; end--) {
    [array[0], array[end]] = [array[end], array[0]];
    yield { family: 'sorting', t: 'swap', view: view([], [0, end]) };

    yield* siftDown(0, end);

    sorted.push(end);
    yield { family: 'sorting', t: 'mark', view: view(), state: 'sorted' };
  }

  yield { family: 'sorting', t: 'done', view: allSortedView() };
}

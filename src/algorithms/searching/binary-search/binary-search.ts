import type { SearchStep, SearchView } from '@core/steps';

/**
 * Binary Search.
 *
 * Halves the window still under consideration on every step. The window
 * is what the view highlights, so the halving is visible.
 */
export function* binarySearch(
  array: readonly number[],
  target: number
): Generator<SearchStep, void, undefined> {
  const view = (current: number, found: number, range: [number, number] | null): SearchView => ({
    array: [...array],
    current,
    found,
    range,
  });

  yield {
    family: 'searching',
    t: 'set-array',
    view: view(-1, -1, null),
    note: `Searching for ${target}`,
  };

  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    yield {
      family: 'searching',
      t: 'probe',
      view: view(mid, -1, [left, right]),
      index: mid,
    };

    if (array[mid] === target) {
      yield {
        family: 'searching',
        t: 'found',
        view: view(mid, mid, [left, right]),
        index: mid,
      };
      return;
    }

    if (array[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  yield { family: 'searching', t: 'not-found', view: view(-1, -1, null) };
}

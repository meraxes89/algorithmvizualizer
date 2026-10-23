import type { SearchStep, SearchView } from '@core/steps';

/**
 * Linear Search.
 *
 * Walks the array from the front, checking each element until the
 * target turns up or the array runs out.
 */
export function* linearSearch(
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

  for (let i = 0; i < array.length; i++) {
    yield { family: 'searching', t: 'probe', view: view(i, -1, [i, array.length - 1]), index: i };

    if (array[i] === target) {
      yield { family: 'searching', t: 'found', view: view(i, i, [i, array.length - 1]), index: i };
      return;
    }
  }

  yield { family: 'searching', t: 'not-found', view: view(-1, -1, null) };
}

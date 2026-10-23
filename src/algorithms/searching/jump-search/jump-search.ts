import type { SearchStep, SearchView } from '@core/steps';

/**
 * Jump Search.
 *
 * Skips over the array a block at a time until it finds a block that
 * could hold the target, then scans that block one element at a time.
 * It trades comparisons for a square-root number of blocks.
 */
export function* jumpSearch(
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

  const size = array.length;
  const block = Math.max(1, Math.floor(Math.sqrt(size)));

  // Skip whole blocks while the block's last element is too small.
  let blockStart = 0;
  while (blockStart < size) {
    const blockEnd = Math.min(blockStart + block, size) - 1;

    yield {
      family: 'searching',
      t: 'probe',
      view: view(blockStart, -1, [blockStart, blockEnd]),
      index: blockStart,
    };

    if (array[blockEnd] >= target) {
      break;
    }

    blockStart += block;
  }

  // Scan the block the target could be in.
  const limit = Math.min(blockStart + block, size);
  for (let i = blockStart; i < limit; i++) {
    yield {
      family: 'searching',
      t: 'probe',
      view: view(i, -1, [blockStart, limit - 1]),
      index: i,
    };

    if (array[i] === target) {
      yield {
        family: 'searching',
        t: 'found',
        view: view(i, i, [blockStart, limit - 1]),
        index: i,
      };
      return;
    }
  }

  yield { family: 'searching', t: 'not-found', view: view(-1, -1, null) };
}

import type { SearchGenerator } from '@core/steps';
import { binarySearch } from './binary-search/binary-search';
import { jumpSearch } from './jump-search/jump-search';
import { linearSearch } from './linear-search/linear-search';
import { searchingMeta, type SearchingMeta } from './meta';

export { binarySearch } from './binary-search/binary-search';
export { jumpSearch } from './jump-search/jump-search';
export { linearSearch } from './linear-search/linear-search';
export type { SearchingMeta } from './meta';

/** One searching algorithm, as the page knows it. */
export type SearchingAlgorithm = {
  /** Stable id — the URL (`?algo=`) and the display registry use it too. */
  id: string;
  /** Display name. */
  name: string;
  /** The pure generator that produces the trace. */
  generator: (array: readonly number[], target: number) => SearchGenerator;
  /**
   * Educational metadata (description, complexities, pseudocode, code
   * snippets). It lives on the entry, so it cannot drift from the
   * implementation the way the old `algorithmData.js` table could.
   */
  meta: SearchingMeta;
};

/**
 * The searching family.
 *
 * Both algorithms need a sorted array, which is what the page gives them.
 * Educational metadata is part of each entry (from `./meta`), so an entry
 * and its explanation are added together.
 */
export const searchingAlgorithms: readonly SearchingAlgorithm[] = [
  {
    id: 'linearSearch',
    name: 'Linear Search',
    generator: linearSearch,
    meta: searchingMeta.linearSearch,
  },
  {
    id: 'binarySearch',
    name: 'Binary Search',
    generator: binarySearch,
    meta: searchingMeta.binarySearch,
  },
  { id: 'jumpSearch', name: 'Jump Search', generator: jumpSearch, meta: searchingMeta.jumpSearch },
];

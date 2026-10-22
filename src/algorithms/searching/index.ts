import type { SearchGenerator } from '@core/steps';
import { binarySearch } from './binary-search/binary-search';
import { jumpSearch } from './jump-search/jump-search';
import { linearSearch } from './linear-search/linear-search';

export { binarySearch } from './binary-search/binary-search';
export { jumpSearch } from './jump-search/jump-search';
export { linearSearch } from './linear-search/linear-search';

/** One searching algorithm, as the page knows it. */
export type SearchingAlgorithm = {
  /** Key into the algorithm metadata table. */
  id: string;
  /** Display name. */
  name: string;
  /** The pure generator that produces the trace. */
  generator: (array: readonly number[], target: number) => SearchGenerator;
};

/**
 * The searching family.
 *
 * Both algorithms need a sorted array, which is what the page gives them.
 */
export const searchingAlgorithms: readonly SearchingAlgorithm[] = [
  { id: 'linearSearch', name: 'Linear Search', generator: linearSearch },
  { id: 'binarySearch', name: 'Binary Search', generator: binarySearch },
  { id: 'jumpSearch', name: 'Jump Search', generator: jumpSearch },
];

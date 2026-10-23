import type { SortGenerator } from '@core/steps';
import { bubbleSort } from './bubble-sort/bubble-sort';
import { heapSort } from './heap-sort/heap-sort';
import { insertionSort } from './insertion-sort/insertion-sort';
import { mergeSort } from './merge-sort/merge-sort';
import { quickSort } from './quick-sort/quick-sort';
import { selectionSort } from './selection-sort/selection-sort';
import { sortingMeta, type SortingMeta } from './meta';

export { bubbleSort } from './bubble-sort/bubble-sort';
export { heapSort } from './heap-sort/heap-sort';
export { insertionSort } from './insertion-sort/insertion-sort';
export { mergeSort } from './merge-sort/merge-sort';
export { quickSort } from './quick-sort/quick-sort';
export { selectionSort } from './selection-sort/selection-sort';
export type { SortingMeta } from './meta';

/** One sorting algorithm, as the page knows it. */
export type SortingAlgorithm = {
  /** Stable id — the URL (`?algo=`) and the display registry use it too. */
  id: string;
  /** Display name. */
  name: string;
  /** The pure generator that produces the trace. */
  generator: (input: readonly number[]) => SortGenerator;
  /**
   * Educational metadata (description, complexities, pseudocode, code
   * snippets). It lives on the entry, so it cannot drift from the
   * implementation the way the old `algorithmData.js` table could.
   */
  meta: SortingMeta;
};

/**
 * The sorting family.
 *
 * This is the family's own mini-registry. The display-only app-wide
 * registry in `src/registry` mirrors these ids and names for navigation,
 * the category grid and the palette; `registry.test.ts` keeps the two in
 * sync. Educational metadata is part of each entry (from `./meta`), so an
 * entry and its explanation are added together.
 */
export const sortingAlgorithms: readonly SortingAlgorithm[] = [
  { id: 'bubbleSort', name: 'Bubble Sort', generator: bubbleSort, meta: sortingMeta.bubbleSort },
  {
    id: 'selectionSort',
    name: 'Selection Sort',
    generator: selectionSort,
    meta: sortingMeta.selectionSort,
  },
  {
    id: 'insertionSort',
    name: 'Insertion Sort',
    generator: insertionSort,
    meta: sortingMeta.insertionSort,
  },
  { id: 'mergeSort', name: 'Merge Sort', generator: mergeSort, meta: sortingMeta.mergeSort },
  { id: 'quickSort', name: 'Quick Sort', generator: quickSort, meta: sortingMeta.quickSort },
  { id: 'heapSort', name: 'Heap Sort', generator: heapSort, meta: sortingMeta.heapSort },
];

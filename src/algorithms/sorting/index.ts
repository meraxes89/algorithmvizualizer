import type { SortGenerator } from '@core/steps';
import { bubbleSort } from './bubble-sort/bubble-sort';
import { heapSort } from './heap-sort/heap-sort';
import { insertionSort } from './insertion-sort/insertion-sort';
import { mergeSort } from './merge-sort/merge-sort';
import { quickSort } from './quick-sort/quick-sort';
import { selectionSort } from './selection-sort/selection-sort';

export { bubbleSort } from './bubble-sort/bubble-sort';
export { heapSort } from './heap-sort/heap-sort';
export { insertionSort } from './insertion-sort/insertion-sort';
export { mergeSort } from './merge-sort/merge-sort';
export { quickSort } from './quick-sort/quick-sort';
export { selectionSort } from './selection-sort/selection-sort';

/** One sorting algorithm, as the page knows it. */
export type SortingAlgorithm = {
  /** Key into the algorithm metadata table. */
  id: string;
  /** Display name. */
  name: string;
  /** The pure generator that produces the trace. */
  generator: (input: readonly number[]) => SortGenerator;
};

/**
 * The sorting family.
 *
 * This is the family's own mini-registry. The app-wide registry in
 * `src/registry` derives from these, so adding an algorithm here is all
 * that is needed for it to appear everywhere.
 */
export const sortingAlgorithms: readonly SortingAlgorithm[] = [
  { id: 'bubbleSort', name: 'Bubble Sort', generator: bubbleSort },
  { id: 'selectionSort', name: 'Selection Sort', generator: selectionSort },
  { id: 'insertionSort', name: 'Insertion Sort', generator: insertionSort },
  { id: 'mergeSort', name: 'Merge Sort', generator: mergeSort },
  { id: 'quickSort', name: 'Quick Sort', generator: quickSort },
  { id: 'heapSort', name: 'Heap Sort', generator: heapSort },
];

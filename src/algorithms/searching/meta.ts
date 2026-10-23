/**
 * Educational metadata for the searching family.
 *
 * The metadata lives with the family — the registry entries in
 * `./index.ts` carry it as a required `meta` field — so an entry and its
 * explanation can no longer drift apart. This file replaced the
 * hand-keyed `searching` section of the old `src/data/algorithmData.js`
 * database; the content is unchanged.
 */

/** The educational companion of one searching algorithm. */
export type SearchingMeta = {
  /** Display name, identical to the registry entry's `name`. */
  name: string;
  /** One-sentence summary shown under the visualizer's title. */
  description: string;
  /** What the algorithm is for. */
  purpose: string;
  /** How the algorithm works, in prose. */
  workingPrinciple: string;
  /** Best-case time complexity. */
  bestCase: string;
  /** Average-case time complexity. */
  averageCase: string;
  /** Worst-case time complexity. */
  worstCase: string;
  /** Space complexity. */
  spaceComplexity: string;
  /** Where the algorithm is used. */
  applications: string[];
  /** What the algorithm does well. */
  advantages: string[];
  /** What the algorithm does poorly. */
  disadvantages: string[];
  /** Language-neutral pseudocode, one step per line. */
  pseudocode: string[];
  /** The same algorithm in the four languages the code viewer offers. */
  codeSnippets: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
  };
};

/** Metadata for every searching algorithm, keyed by registry id. */
export const searchingMeta: Record<string, SearchingMeta> = {
  linearSearch: {
    name: 'Linear Search',
    description: 'Linear Search sequentially checks each element until the target is found.',
    purpose: 'To find an element by checking each element sequentially.',
    workingPrinciple:
      'The algorithm starts from the first element and compares each element with the target until a match is found or all elements are checked.',
    bestCase: 'O(1)',
    averageCase: 'O(n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(1)',
    applications: [
      'Small datasets',
      'Unsorted data',
      'When simplicity is preferred',
      'Searching in linked lists',
    ],
    advantages: [
      'Simple implementation',
      'Works on unsorted data',
      'No extra space required',
      'Works on any data structure',
    ],
    disadvantages: [
      'Inefficient for large datasets',
      'O(n) time complexity',
      'Not suitable for frequent searches',
      'Slow compared to binary search for sorted data',
    ],
    pseudocode: [
      'procedure linearSearch(arr, target)',
      '  for i = 0 to length(arr) - 1 do',
      '    if arr[i] == target then',
      '      return i',
      '    end if',
      '  end for',
      '  return -1',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
      java: `int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
      javascript: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}`,
    },
  },
  binarySearch: {
    name: 'Binary Search',
    description:
      'Binary Search repeatedly divides the search interval in half to find the target element.',
    purpose: 'To efficiently find an element in a sorted array.',
    workingPrinciple:
      'The algorithm compares the target with the middle element. If they match, it returns the index. If target is smaller, it searches the left half; otherwise, it searches the right half.',
    bestCase: 'O(1)',
    averageCase: 'O(log n)',
    worstCase: 'O(log n)',
    spaceComplexity: 'O(1)',
    applications: [
      'Searching in sorted databases',
      'Finding elements in sorted arrays',
      'Game development (binary space partitioning)',
      'Debugging (binary search for bugs)',
    ],
    advantages: [
      'Very efficient for large sorted datasets',
      'O(log n) time complexity',
      'Simple implementation',
      'No extra space required (iterative version)',
    ],
    disadvantages: [
      'Requires sorted array',
      'Not suitable for unsorted data',
      'Inefficient for small datasets',
      'Insertion/deletion is expensive',
    ],
    pseudocode: [
      'procedure binarySearch(arr, target)',
      '  low = 0',
      '  high = length(arr) - 1',
      '  while low <= high do',
      '    mid = floor((low + high) / 2)',
      '    if arr[mid] == target then',
      '      return mid',
      '    else if arr[mid] < target then',
      '      low = mid + 1',
      '    else',
      '      high = mid - 1',
      '    end if',
      '  end while',
      '  return -1',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      java: `int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      javascript: `function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    },
  },
  jumpSearch: {
    name: 'Jump Search',
    description:
      'Jump Search skips over the array a block at a time until it finds the block that could hold the target, then scans that block.',
    purpose: 'To search a sorted array with far fewer comparisons than a linear search.',
    workingPrinciple:
      'The array is divided into blocks of about sqrt(n) elements. The search jumps block by block, comparing only the last element of each block, until it finds a block whose last element is at least the target. That block is then scanned linearly.',
    bestCase: 'O(1)',
    averageCase: 'O(√n)',
    worstCase: 'O(√n)',
    spaceComplexity: 'O(1)',
    applications: [
      'Searching a sorted array that is read-only',
      'Situations where comparisons are expensive but jumps are cheap',
    ],
    advantages: [
      'Far fewer comparisons than a linear search',
      'Uses no extra memory',
      'Simple to implement',
    ],
    disadvantages: [
      'Only works on a sorted array',
      'Slower than a binary search on a sorted array',
      'The block size has to be chosen well',
    ],
    pseudocode: [
      'procedure jumpSearch(arr, target)',
      '  step = floor(sqrt(n))',
      '  for i = 0 to n - step step step do',
      '    if arr[min(i + step - 1, n - 1)] < target then',
      '      continue',
      '    end if',
      '  end for',
      '  scan the last block linearly',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `int jumpSearch(int arr[], int n, int target) {
    int step = (int)sqrt(n);
    int prev = 0;
    while (arr[min(prev + step - 1, n - 1)] < target) {
        prev += step;
        if (prev >= n) return -1;
    }
    while (arr[prev] <= target) {
        if (arr[prev] == target) return prev;
        if (prev == n - 1) return -1;
        prev++;
    }
    return -1;
}`,
      java: `int jumpSearch(int[] arr, int target) {
    int n = arr.length;
    int step = (int) Math.sqrt(n);
    int prev = 0;
    while (arr[Math.min(prev + step - 1, n - 1)] < target) {
        prev += step;
        if (prev >= n) return -1;
    }
    while (arr[prev] <= target) {
        if (arr[prev] == target) return prev;
        if (prev == n - 1) return -1;
        prev++;
    }
    return -1;
}`,
      python: `def jump_search(arr, target):
    n = len(arr)
    step = int(n ** 0.5)
    prev = 0
    while arr[min(prev + step - 1, n - 1)] < target:
        prev += step
        if prev >= n:
            return -1
    while arr[prev] <= target:
        if arr[prev] == target:
            return prev
        if prev == n - 1:
            return -1
        prev += 1
    return -1`,
      javascript: `function jumpSearch(arr, target) {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(prev + step - 1, n - 1)] < target) {
    prev += step;
    if (prev >= n) return -1;
  }
  while (arr[prev] <= target) {
    if (arr[prev] === target) return prev;
    if (prev === n - 1) return -1;
    prev++;
  }
  return -1;
}`,
    },
  },
};

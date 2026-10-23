/**
 * Educational metadata for the sorting family.
 *
 * The metadata lives with the family — the registry entries in
 * `./index.ts` carry it as a required `meta` field — so an entry and its
 * explanation can no longer drift apart. This file replaced the
 * hand-keyed `sorting` section of the old `src/data/algorithmData.js`
 * database; the content is unchanged.
 */

/** The educational companion of one sorting algorithm. */
export type SortingMeta = {
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

/** Metadata for every sorting algorithm, keyed by registry id. */
export const sortingMeta: Record<string, SortingMeta> = {
  bubbleSort: {
    name: 'Bubble Sort',
    description:
      'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    purpose:
      'To sort an array by repeatedly swapping adjacent elements if they are in the wrong order.',
    workingPrinciple:
      'The algorithm works by repeatedly swapping adjacent elements if they are in the wrong order. This process continues until no swaps are needed, indicating the array is sorted.',
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    applications: [
      'Simple to implement and understand',
      'Useful for small datasets',
      'Educational purposes to teach sorting concepts',
      'Detecting whether a list is already sorted',
    ],
    advantages: [
      'Simple implementation',
      'No additional memory required',
      'Stable sort (maintains relative order of equal elements)',
      'Adaptive (can detect already sorted arrays)',
    ],
    disadvantages: [
      'Inefficient for large datasets',
      'O(n²) time complexity in average and worst cases',
      'Slow compared to other sorting algorithms',
      'Not suitable for real-time applications',
    ],
    pseudocode: [
      'procedure bubbleSort(arr)',
      '  n = length(arr)',
      '  for i = 0 to n-1 do',
      '    for j = 0 to n-i-1 do',
      '      if arr[j] > arr[j+1] then',
      '        swap(arr[j], arr[j+1])',
      '      end if',
      '    end for',
      '  end for',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
      java: `void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
      javascript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
    },
  },
  selectionSort: {
    name: 'Selection Sort',
    description:
      'Selection Sort divides the input into a sorted and unsorted region, and repeatedly selects the smallest element from the unsorted region.',
    purpose: 'To sort an array by finding the minimum element and placing it at the beginning.',
    workingPrinciple:
      'The algorithm divides the array into two parts: sorted and unsorted. It repeatedly finds the minimum element from the unsorted part and puts it at the beginning of the unsorted part.',
    bestCase: 'O(n²)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    applications: [
      'Small datasets where simplicity is preferred',
      'Memory-constrained environments',
      'When write operations are expensive',
    ],
    advantages: [
      'Simple implementation',
      'No additional memory required',
      'Performs well on small lists',
      'Reduces number of swaps compared to bubble sort',
    ],
    disadvantages: [
      'Inefficient for large datasets',
      'O(n²) time complexity in all cases',
      'Not adaptive',
      'Not stable by default',
    ],
    pseudocode: [
      'procedure selectionSort(arr)',
      '  n = length(arr)',
      '  for i = 0 to n-1 do',
      '    minIdx = i',
      '    for j = i+1 to n do',
      '      if arr[j] < arr[minIdx] then',
      '        minIdx = j',
      '      end if',
      '    end for',
      '    swap(arr[i], arr[minIdx])',
      '  end for',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        swap(arr[i], arr[minIdx]);
    }
}`,
      java: `void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
      javascript: `function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`,
    },
  },
  insertionSort: {
    name: 'Insertion Sort',
    description:
      'Insertion Sort builds the final sorted array one item at a time by comparing each new element with the already-sorted elements.',
    purpose: 'To sort an array by building a sorted array one element at a time.',
    workingPrinciple:
      'The algorithm works by taking one element at a time and inserting it into its correct position in the already sorted portion of the array.',
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    applications: [
      'Small datasets',
      'Nearly sorted arrays',
      'Online sorting (data arriving in real-time)',
      'When memory is limited',
    ],
    advantages: [
      'Simple implementation',
      'Efficient for small and nearly sorted datasets',
      'Stable sort',
      'In-place sorting',
      'Adaptive algorithm',
    ],
    disadvantages: [
      'Inefficient for large datasets',
      'O(n²) time complexity in average and worst cases',
      'Not suitable for large lists',
    ],
    pseudocode: [
      'procedure insertionSort(arr)',
      '  n = length(arr)',
      '  for i = 1 to n do',
      '    key = arr[i]',
      '    j = i - 1',
      '    while j >= 0 and arr[j] > key do',
      '      arr[j + 1] = arr[j]',
      '      j = j - 1',
      '    end while',
      '    arr[j + 1] = key',
      '  end for',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      java: `void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
      javascript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
    },
  },
  mergeSort: {
    name: 'Merge Sort',
    description:
      'Merge Sort divides the array into halves, recursively sorts them, and then merges the sorted halves.',
    purpose: 'To sort an array using divide and conquer strategy.',
    workingPrinciple:
      'The algorithm divides the array into two halves, recursively sorts each half, and then merges the two sorted halves back together.',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(n)',
    applications: [
      'Large datasets',
      "External sorting (sorting data that doesn't fit in memory)",
      'Parallel processing',
      'When stable sorting is required',
    ],
    advantages: [
      'Consistent O(n log n) time complexity',
      'Stable sort',
      'Suitable for large datasets',
      'Can be parallelized',
      'Works well with external storage',
    ],
    disadvantages: [
      'Requires O(n) additional space',
      'Slower than quicksort for in-memory sorting',
      'Not in-place',
      'More complex implementation',
    ],
    pseudocode: [
      'procedure mergeSort(arr)',
      '  if length(arr) <= 1 then',
      '    return arr',
      '  end if',
      '  mid = length(arr) / 2',
      '  left = mergeSort(arr[0:mid])',
      '  right = mergeSort(arr[mid:])',
      '  return merge(left, right)',
      'end procedure',
      '',
      'procedure merge(left, right)',
      '  result = []',
      '  while left and right are not empty do',
      '    if left[0] <= right[0] then',
      '      append left[0] to result',
      '      remove left[0]',
      '    else',
      '      append right[0] to result',
      '      remove right[0]',
      '    end if',
      '  end while',
      '  append remaining elements to result',
      '  return result',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
      java: `void merge(int[] arr, int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    int[] L = new int[n1];
    int[] R = new int[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
      javascript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
}`,
    },
  },
  quickSort: {
    name: 'Quick Sort',
    description:
      'Quick Sort selects a pivot element and partitions the array around it, then recursively sorts the sub-arrays.',
    purpose: 'To sort an array using divide and conquer with partitioning.',
    workingPrinciple:
      'The algorithm selects a pivot element and partitions the array around it such that elements less than pivot are on the left and greater are on the right. It then recursively sorts the sub-arrays.',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(log n)',
    applications: [
      'Large datasets',
      'When average-case performance is important',
      'In-place sorting',
      'Cache-efficient sorting',
    ],
    advantages: [
      'Efficient in practice (fast average case)',
      'In-place sorting (minimal extra space)',
      'Cache-friendly',
      'Widely used in standard libraries',
    ],
    disadvantages: [
      'Worst-case O(n²) time complexity',
      'Not stable by default',
      'Sensitive to pivot selection',
      'Complex implementation',
    ],
    pseudocode: [
      'procedure quickSort(arr, low, high)',
      '  if low < high then',
      '    pivotIdx = partition(arr, low, high)',
      '    quickSort(arr, low, pivotIdx - 1)',
      '    quickSort(arr, pivotIdx + 1, high)',
      '  end if',
      'end procedure',
      '',
      'procedure partition(arr, low, high)',
      '  pivot = arr[high]',
      '  i = low - 1',
      '  for j = low to high - 1 do',
      '    if arr[j] < pivot then',
      '      i = i + 1',
      '      swap(arr[i], arr[j])',
      '    end if',
      '  end for',
      '  swap(arr[i + 1], arr[high])',
      '  return i + 1',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      java: `int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}

void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      python: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`,
      javascript: `function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}`,
    },
  },
  heapSort: {
    name: 'Heap Sort',
    description:
      'Heap Sort builds a max heap out of the array and repeatedly moves the largest remaining element to the end.',
    purpose: 'To sort an array in place with a guaranteed O(n log n) worst case.',
    workingPrinciple:
      'The array is rearranged into a max heap, where every parent is at least as large as its children. The root is then swapped to the end of the unsorted region and the heap is repaired by sifting the new root down.',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(1)',
    applications: [
      'Guaranteed worst-case performance',
      'In-place sorting with no extra memory',
      'Priority queues and heaps in standard libraries',
    ],
    advantages: [
      'Worst case is O(n log n), unlike quick sort',
      'In-place, so it needs no extra memory',
      'The heap structure is useful on its own',
    ],
    disadvantages: [
      'Not a stable sort',
      'More comparisons than quick sort in practice',
      'Poor cache locality compared to a merge sort',
    ],
    pseudocode: [
      'procedure heapSort(arr)',
      '  buildMaxHeap(arr)',
      '  for end = n - 1 down to 1 do',
      '    swap(arr[0], arr[end])',
      '    siftDown(arr, 0, end)',
      '  end for',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(arr, i, n);
    for (int end = n - 1; end > 0; end--) {
        swap(arr[0], arr[end]);
        siftDown(arr, 0, end);
    }
}`,
      java: `void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(arr, i, n);
    for (int end = n - 1; end > 0; end--) {
        int temp = arr[0]; arr[0] = arr[end]; arr[end] = temp;
        siftDown(arr, 0, end);
    }
}`,
      python: `def heap_sort(arr):
    n = len(arr)

    def sift_down(root, size):
        while True:
            largest = root
            left = 2 * root + 1
            right = left + 1
            if left < size and arr[left] > arr[largest]:
                largest = left
            if right < size and arr[right] > arr[largest]:
                largest = right
            if largest == root:
                return
            arr[root], arr[largest] = arr[largest], arr[root]
            root = largest

    for i in range(n // 2 - 1, -1, -1):
        sift_down(i, n)
    for end in range(n - 1, 0, -1):
        arr[0], arr[end] = arr[end], arr[0]
        sift_down(0, end)`,
      javascript: `function heapSort(arr) {
  const siftDown = (root, size) => {
    let current = root;
    for (;;) {
      const left = current * 2 + 1;
      if (left >= size) return;
      let largest = left;
      const right = left + 1;
      if (right < size && arr[right] > arr[left]) largest = right;
      if (arr[current] >= arr[largest]) return;
      [arr[current], arr[largest]] = [arr[largest], arr[current]];
      current = largest;
    }
  };

  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(0, end);
  }
}`,
    },
  },
};

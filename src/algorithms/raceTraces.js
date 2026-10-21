// ----------------------------------------------------
// 1. SORTING ALGORITHMS
// ----------------------------------------------------
export const SORTING_ALGORITHMS = {
  quickSort: {
    name: 'Quick Sort',
    category: 'Sorting',
    complexity: 'O(N log N)',
    color: 'from-blue-500 to-indigo-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      function* partition(low, high) {
        const pivot = a[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          comps++;
          yield { array: [...a], comparing: [j, high], pivot: high, comps, swaps };
          if (a[j] < pivot) {
            i++;
            [a[i], a[j]] = [a[j], a[i]];
            swaps++;
            yield { array: [...a], comparing: [i, j], swapped: [i, j], pivot: high, comps, swaps };
          }
        }
        [a[i + 1], a[high]] = [a[high], a[i + 1]];
        swaps++;
        yield { array: [...a], comparing: [i + 1, high], swapped: [i + 1, high], comps, swaps };
        return i + 1;
      }
      function* quickSortHelper(low, high) {
        if (low < high) {
          const pi = yield* partition(low, high);
          yield* quickSortHelper(low, pi - 1);
          yield* quickSortHelper(pi + 1, high);
        }
      }
      yield* quickSortHelper(0, a.length - 1);
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  },
  mergeSort: {
    name: 'Merge Sort',
    category: 'Sorting',
    complexity: 'O(N log N)',
    color: 'from-purple-500 to-pink-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      function* merge(l, m, r) {
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = a.slice(l, m + 1);
        const R = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
          comps++;
          yield { array: [...a], comparing: [l + i, m + 1 + j], comps, swaps };
          if (L[i] <= R[j]) {
            a[k] = L[i];
            i++;
          } else {
            a[k] = R[j];
            j++;
          }
          swaps++;
          yield { array: [...a], comparing: [k], swapped: [k], comps, swaps };
          k++;
        }
        while (i < n1) {
          a[k] = L[i]; i++; k++;
          yield { array: [...a], comparing: [k - 1], comps, swaps };
        }
        while (j < n2) {
          a[k] = R[j]; j++; k++;
          yield { array: [...a], comparing: [k - 1], comps, swaps };
        }
      }
      function* mergeSortHelper(l, r) {
        if (l < r) {
          const m = Math.floor(l + (r - l) / 2);
          yield* mergeSortHelper(l, m);
          yield* mergeSortHelper(m + 1, r);
          yield* merge(l, m, r);
        }
      }
      yield* mergeSortHelper(0, a.length - 1);
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  },
  heapSort: {
    name: 'Heap Sort',
    category: 'Sorting',
    complexity: 'O(N log N)',
    color: 'from-emerald-500 to-teal-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      function* heapify(n, i) {
        let largest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n) {
          comps++;
          yield { array: [...a], comparing: [l, largest], comps, swaps };
          if (a[l] > a[largest]) largest = l;
        }
        if (r < n) {
          comps++;
          yield { array: [...a], comparing: [r, largest], comps, swaps };
          if (a[r] > a[largest]) largest = r;
        }
        if (largest !== i) {
          [a[i], a[largest]] = [a[largest], a[i]];
          swaps++;
          yield { array: [...a], comparing: [i, largest], swapped: [i, largest], comps, swaps };
          yield* heapify(n, largest);
        }
      }
      for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) yield* heapify(a.length, i);
      for (let i = a.length - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        swaps++;
        yield { array: [...a], comparing: [0, i], swapped: [0, i], comps, swaps };
        yield* heapify(i, 0);
      }
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  },
  bubbleSort: {
    name: 'Bubble Sort',
    category: 'Sorting',
    complexity: 'O(N²)',
    color: 'from-amber-500 to-orange-600',
    generator: function* (arr) {
      const a = [...arr];
      let comps = 0, swaps = 0;
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
          comps++;
          yield { array: [...a], comparing: [j, j + 1], comps, swaps };
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            swaps++;
            yield { array: [...a], comparing: [j, j + 1], swapped: [j, j + 1], comps, swaps };
          }
        }
      }
      yield { array: [...a], comparing: [], finished: true, comps, swaps };
    }
  }
};

// ----------------------------------------------------
// 2. SEARCHING ALGORITHMS
// ----------------------------------------------------
export const SEARCHING_ALGORITHMS = {
  binarySearch: {
    name: 'Binary Search',
    category: 'Searching',
    complexity: 'O(log N)',
    color: 'from-cyan-500 to-blue-600',
    generator: function* (arr, target) {
      const a = [...arr].sort((x, y) => x - y);
      let low = 0, high = a.length - 1, comps = 0;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        comps++;
        yield { array: [...a], comparing: [mid], range: [low, high], comps, found: a[mid] === target };
        if (a[mid] === target) {
          yield { array: [...a], comparing: [mid], foundIndex: mid, finished: true, comps };
          return;
        }
        if (a[mid] < target) low = mid + 1;
        else high = mid - 1;
      }
      yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
    }
  },
  linearSearch: {
    name: 'Linear Search',
    category: 'Searching',
    complexity: 'O(N)',
    color: 'from-rose-500 to-pink-600',
    generator: function* (arr, target) {
      const a = [...arr].sort((x, y) => x - y);
      let comps = 0;
      for (let i = 0; i < a.length; i++) {
        comps++;
        yield { array: [...a], comparing: [i], comps, found: a[i] === target };
        if (a[i] === target) {
          yield { array: [...a], comparing: [i], foundIndex: i, finished: true, comps };
          return;
        }
      }
      yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
    }
  },
  jumpSearch: {
    name: 'Jump Search',
    category: 'Searching',
    complexity: 'O(√N)',
    color: 'from-amber-500 to-emerald-600',
    generator: function* (arr, target) {
      const a = [...arr].sort((x, y) => x - y);
      const n = a.length;
      let step = Math.floor(Math.sqrt(n));
      let prev = 0;
      let comps = 0;

      while (a[Math.min(step, n) - 1] < target) {
        comps++;
        yield { array: [...a], comparing: [Math.min(step, n) - 1], comps };
        prev = step;
        step += Math.floor(Math.sqrt(n));
        if (prev >= n) {
          yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
          return;
        }
      }

      while (a[prev] < target) {
        comps++;
        yield { array: [...a], comparing: [prev], comps };
        prev++;
        if (prev === Math.min(step, n)) {
          yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
          return;
        }
      }

      comps++;
      if (a[prev] === target) {
        yield { array: [...a], comparing: [prev], foundIndex: prev, finished: true, comps };
      } else {
        yield { array: [...a], comparing: [], finished: true, comps, notFound: true };
      }
    }
  }
};

// ----------------------------------------------------
// 3. PATHFINDING ALGORITHMS
// ----------------------------------------------------
export const PATHFINDING_ALGORITHMS = {
  dijkstra: {
    name: "Dijkstra's Search",
    category: 'Pathfinding',
    complexity: 'O(V log V + E)',
    color: 'from-indigo-500 to-purple-600',
    generator: function* (rows = 8, cols = 12) {
      const start = [1, 1], end = [rows - 2, cols - 2];
      const visited = new Set();
      const parent = {};
      const queue = [[...start, 0]];
      let steps = 0;

      while (queue.length > 0) {
        queue.sort((a, b) => a[2] - b[2]);
        const [r, c, dist] = queue.shift();
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        visited.add(key);
        steps++;

        const visitedArr = Array.from(visited);
        const isTarget = r === end[0] && c === end[1];

        yield { visitedList: visitedArr, activeNode: [r, c], steps, finished: isTarget };

        if (isTarget) {
          const path = [];
          let curr = `${end[0]},${end[1]}`;
          while (curr) {
            path.push(curr);
            curr = parent[curr];
          }
          yield { visitedList: visitedArr, pathList: path, activeNode: [r, c], finished: true, steps };
          return;
        }

        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          const nkey = `${nr},${nc}`;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nkey)) {
            if (!parent[nkey]) parent[nkey] = key;
            queue.push([nr, nc, dist + 1]);
          }
        }
      }
      yield { visitedList: Array.from(visited), finished: true, steps };
    }
  },
  astar: {
    name: 'A* Heuristic Search',
    category: 'Pathfinding',
    complexity: 'O(E)',
    color: 'from-emerald-500 to-cyan-600',
    generator: function* (rows = 8, cols = 12) {
      const start = [1, 1], end = [rows - 2, cols - 2];
      const visited = new Set();
      const parent = {};
      const queue = [[...start, 0, Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1])]];
      let steps = 0;

      while (queue.length > 0) {
        queue.sort((a, b) => (a[2] + a[3]) - (b[2] + b[3]));
        const [r, c, dist] = queue.shift();
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        visited.add(key);
        steps++;

        const visitedArr = Array.from(visited);
        const isTarget = r === end[0] && c === end[1];

        yield { visitedList: visitedArr, activeNode: [r, c], steps, finished: isTarget };

        if (isTarget) {
          const path = [];
          let curr = `${end[0]},${end[1]}`;
          while (curr) {
            path.push(curr);
            curr = parent[curr];
          }
          yield { visitedList: visitedArr, pathList: path, activeNode: [r, c], finished: true, steps };
          return;
        }

        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          const nkey = `${nr},${nc}`;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nkey)) {
            if (!parent[nkey]) parent[nkey] = key;
            const h = Math.abs(nr - end[0]) + Math.abs(nc - end[1]);
            queue.push([nr, nc, dist + 1, h]);
          }
        }
      }
      yield { visitedList: Array.from(visited), finished: true, steps };
    }
  },
  bfs: {
    name: 'BFS Breadth-First',
    category: 'Pathfinding',
    complexity: 'O(V + E)',
    color: 'from-blue-500 to-teal-500',
    generator: function* (rows = 8, cols = 12) {
      const start = [1, 1], end = [rows - 2, cols - 2];
      const visited = new Set();
      const parent = {};
      const queue = [[...start]];
      let steps = 0;

      while (queue.length > 0) {
        const [r, c] = queue.shift();
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        visited.add(key);
        steps++;

        const visitedArr = Array.from(visited);
        const isTarget = r === end[0] && c === end[1];

        yield { visitedList: visitedArr, activeNode: [r, c], steps, finished: isTarget };

        if (isTarget) {
          const path = [];
          let curr = `${end[0]},${end[1]}`;
          while (curr) {
            path.push(curr);
            curr = parent[curr];
          }
          yield { visitedList: visitedArr, pathList: path, activeNode: [r, c], finished: true, steps };
          return;
        }

        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          const nkey = `${nr},${nc}`;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nkey)) {
            if (!parent[nkey]) parent[nkey] = key;
            queue.push([nr, nc]);
          }
        }
      }
      yield { visitedList: Array.from(visited), finished: true, steps };
    }
  }
};
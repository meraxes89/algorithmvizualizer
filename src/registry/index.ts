/**
 * The app-wide registry.
 *
 * The navigation, the category page, the command palette and every
 * algorithm page's tab bar read their lists from here. Adding an
 * algorithm means adding one line to its family registry and one entry
 * here, and it appears in all of them.
 *
 * This module is deliberately display-only: names, ids and routes, no
 * generators. It is imported by the shell, which is in the initial
 * bundle, and importing the algorithm modules here would pull every
 * generator into that bundle. The family registries stay the source of
 * truth for the implementations, and `registry.test.ts` cross-checks the
 * two so they cannot drift apart.
 *
 * Not yet on the registry: the arena's race pickers and the home page's
 * search suggestions. They keep their own lists for now.
 */

/** The algorithm families the app has pages for. */
export type FamilyId =
  'sorting' | 'searching' | 'pathfinding' | 'graph' | 'trees' | 'recursion' | 'dp';

/** One operation inside a visualizer, e.g. on the tree page. */
export type AlgorithmOperation = {
  readonly id: string;
  readonly name: string;
};

/** One algorithm, as the shell knows it. */
export type AlgorithmEntry = {
  /** Stable id, also the `?algo=` value. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
  /** The page that hosts it. */
  readonly path: string;
  /** The family it belongs to. */
  readonly family: FamilyId;
  /** How a page groups its entries, when it shows groups. */
  readonly group?: string;
  /** Which visualizer hosts the entry, when the family has more than one. */
  readonly kind?: 'tree' | 'grid' | 'puzzle';
  /** The operations the visualizer exposes, when it has more than one. */
  readonly operations?: readonly AlgorithmOperation[];
};

/** One family of algorithms, as the shell knows it. */
export type AlgorithmFamily = {
  readonly id: FamilyId;
  readonly name: string;
  readonly shortName: string;
  readonly path: string;
  readonly tag: string;
  readonly description: string;
  readonly algorithms: readonly AlgorithmEntry[];
};

/** A non-algorithm page the palette and the category grid also list. */
export type ToolEntry = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly category: string;
  readonly tag: string;
  readonly description: string;
  /** Short feature bullets for the category card. */
  readonly features: readonly string[];
};

/** Build an entry for a family, so every entry carries its family and path. */
const bind =
  (family: FamilyId, path: string) =>
  (
    id: string,
    name: string,
    extra: Partial<Omit<AlgorithmEntry, 'id' | 'name' | 'family' | 'path'>> = {}
  ): AlgorithmEntry => ({ id, name, family, path, ...extra });

const sorting = bind('sorting', '/sorting');
const searching = bind('searching', '/searching');
const pathfinding = bind('pathfinding', '/pathfinding');
const graph = bind('graph', '/graph');
const trees = bind('trees', '/trees');
const recursion = bind('recursion', '/recursion');
const dp = bind('dp', '/dp');

/**
 * Display names for the recursion entries. `registry.test.ts` checks
 * these against the content table, so a rename cannot leave the two
 * saying different things.
 */
const RECURSION_NAMES: Record<string, string> = {
  factorial: 'Factorial',
  fibonacci: 'Fibonacci Sequence',
  permutations: 'Permutations',
  combinationSum: 'Combination Sum',
  generateParentheses: 'Generate Parentheses',
  subsets: 'Subset Generation',
  nQueens: 'N-Queens',
  sudoku: 'Sudoku Solver',
  ratInMaze: 'Rat in a Maze',
  knightsTour: "Knight's Tour",
  towerOfHanoi: 'Tower of Hanoi',
};

/**
 * The recursion entries carry the group they are shown under and which
 * visualizer plays them. The names come from the same content table the
 * page's panels use, so they cannot say different things.
 */
const RECURSION_ENTRIES = [
  ['factorial', 'Tree Recursion', 'tree'],
  ['fibonacci', 'Tree Recursion', 'tree'],
  ['permutations', 'Tree Recursion', 'tree'],
  ['combinationSum', 'Tree Recursion', 'tree'],
  ['generateParentheses', 'Tree Recursion', 'tree'],
  ['subsets', 'Tree Recursion', 'tree'],
  ['nQueens', 'Grid Backtracking', 'grid'],
  ['sudoku', 'Grid Backtracking', 'grid'],
  ['ratInMaze', 'Grid Backtracking', 'grid'],
  ['knightsTour', 'Grid Backtracking', 'grid'],
  ['towerOfHanoi', 'Classic Puzzles', 'puzzle'],
] as const;

export const algorithmFamilies: readonly AlgorithmFamily[] = [
  {
    id: 'sorting',
    name: 'Sorting Algorithms',
    shortName: 'Sorting',
    path: '/sorting',
    tag: 'SORTING',
    description:
      'Quick Sort, Merge Sort, Heap Sort and friends — bars, sound and every comparison on screen.',
    algorithms: [
      sorting('bubbleSort', 'Bubble Sort'),
      sorting('selectionSort', 'Selection Sort'),
      sorting('insertionSort', 'Insertion Sort'),
      sorting('mergeSort', 'Merge Sort'),
      sorting('quickSort', 'Quick Sort'),
      sorting('heapSort', 'Heap Sort'),
    ],
  },
  {
    id: 'searching',
    name: 'Searching Algorithms',
    shortName: 'Searching',
    path: '/searching',
    tag: 'SEARCHING',
    description: 'Linear scans versus logarithmic bisection with live range bounds tracking.',
    algorithms: [
      searching('linearSearch', 'Linear Search'),
      searching('binarySearch', 'Binary Search'),
      searching('jumpSearch', 'Jump Search'),
    ],
  },
  {
    id: 'pathfinding',
    name: 'Pathfinding & 3D Drone',
    shortName: 'Pathfinding',
    path: '/pathfinding',
    tag: 'PATHFINDING',
    description:
      'Shortest paths through mazes and weighted grids — plus a 3D NYC skyscraper drone camera.',
    algorithms: [
      pathfinding('bfs', 'Breadth-First Search'),
      pathfinding('dfs', 'Depth-First Search'),
      pathfinding('dijkstra', "Dijkstra's Algorithm"),
      pathfinding('astar', 'A* Search'),
    ],
  },
  {
    id: 'graph',
    name: 'Graph Theory',
    shortName: 'Graph',
    path: '/graph',
    tag: 'GRAPHS',
    description: 'Minimum spanning trees and topological ordering on graphs you build yourself.',
    algorithms: [
      graph('BFS', 'Breadth-First Search (BFS)'),
      graph('DFS', 'Depth-First Search (DFS)'),
      graph('Dijkstra', "Dijkstra's Algorithm"),
      graph('Bellman-Ford', 'Bellman-Ford Algorithm'),
      graph('Floyd-Warshall', 'Floyd-Warshall Algorithm'),
      graph("Prim's MST", "Prim's Minimum Spanning Tree"),
      graph("Kruskal's MST", "Kruskal's Minimum Spanning Tree"),
      graph('Topological Sort', 'Topological Sort'),
    ],
  },
  {
    id: 'trees',
    name: 'Tree Data Structures',
    shortName: 'Trees',
    path: '/trees',
    tag: 'TREES',
    description:
      'BST insertions, AVL rotations, heaps, tries and segment trees — grown before your eyes.',
    algorithms: [
      trees('traversals', 'Traversals', {
        operations: [
          { id: 'preOrder', name: 'Pre-order' },
          { id: 'inOrder', name: 'In-order' },
          { id: 'postOrder', name: 'Post-order' },
          { id: 'levelOrder', name: 'Level-order' },
        ],
      }),
      trees('bst', 'BST Operations'),
      trees('avl', 'AVL Rotations'),
      trees('heap', 'Heap Operations'),
      trees('trie', 'Trie'),
      trees('segmentTree', 'Segment Tree'),
    ],
  },
  {
    id: 'recursion',
    name: 'Recursion & Backtracking',
    shortName: 'Recursion',
    path: '/recursion',
    tag: 'RECURSION',
    description:
      'Tower of Hanoi, N-Queens and the classic recursive routines unfolding frame by frame with a call-stack inspector.',
    algorithms: RECURSION_ENTRIES.map(([id, group, kind]) =>
      recursion(id, RECURSION_NAMES[id], { group, kind })
    ),
  },
  {
    id: 'dp',
    name: 'Dynamic Programming',
    shortName: 'Dynamic Programming',
    path: '/dp',
    tag: 'DP',
    description:
      'Watch DP tables fill cell by cell — Fibonacci to knapsack to longest common subsequence.',
    algorithms: [
      dp('knapsack', '0/1 Knapsack Problem'),
      dp('lcs', 'Longest Common Subsequence (LCS)'),
      dp('fibonacci', 'Fibonacci (bottom up)'),
    ],
  },
];

/** The pages that are not algorithms, for the palette and the grid. */
export const tools: readonly ToolEntry[] = [
  {
    id: 'arena',
    name: 'Battle Arena',
    path: '/arena',
    category: 'Gamification',
    tag: 'ARENA',
    description:
      'Race sorting, searching and pathfinding algorithms head-to-head on identical inputs.',
    features: ['Live Races', 'Race Charts', 'Commentary'],
  },
  {
    id: 'playground',
    name: 'Code Playground',
    path: '/playground',
    category: 'Interactive Tool',
    tag: 'PLAYGROUND',
    description: 'Multi-language Monaco editor with in-browser execution for JS and Python.',
    features: ['C++ · Java · Python · JS', 'Pyodide WASM', 'Multi-file VFS'],
  },
  {
    id: 'quiz',
    name: 'Algorithm Quiz',
    path: '/quiz',
    category: 'Gamification',
    tag: 'QUIZ',
    description: 'Prove your intuition — complexity, patterns and edge cases, scored as you go.',
    features: ['Complexity Drills', 'Pattern Recognition', 'Instant Scoring'],
  },
];

/** One family by id, or the first family. */
export const familyById = (id: FamilyId): AlgorithmFamily =>
  algorithmFamilies.find((family) => family.id === id) ?? algorithmFamilies[0];

/** The family a path belongs to, if any. */
export const familyByPath = (path: string): AlgorithmFamily | undefined =>
  algorithmFamilies.find((family) => family.path === path);

/** The href that opens an algorithm directly. */
export const algorithmHref = (family: FamilyId, algorithm: string): string =>
  `${familyById(family).path}?algo=${encodeURIComponent(algorithm)}`;

/** Every algorithm, flattened. */
export const allAlgorithms: readonly AlgorithmEntry[] = algorithmFamilies.flatMap(
  (family) => family.algorithms
);

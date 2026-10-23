import type { GraphStep } from '@core/steps';
import type { Edge, Vertex } from './graph';
import { generateBellmanFord } from './bellman-ford/bellman-ford';
import { generateBFS } from './bfs/bfs';
import { generateDFS } from './dfs/dfs';
import { generateDijkstra } from './dijkstra/dijkstra';
import { generateFloydWarshall } from './floyd-warshall/floyd-warshall';
import { generateKruskal } from './kruskal/kruskal';
import { generatePrim } from './prim/prim';
import { generateTopologicalSort } from './topological-sort/topological-sort';

export { generateBellmanFord } from './bellman-ford/bellman-ford';
export { generateBFS } from './bfs/bfs';
export { generateDFS } from './dfs/dfs';
export { generateDijkstra } from './dijkstra/dijkstra';
export { generateFloydWarshall } from './floyd-warshall/floyd-warshall';
export { generateKruskal } from './kruskal/kruskal';
export { generatePrim } from './prim/prim';
export { generateTopologicalSort } from './topological-sort/topological-sort';
export { getEdgeKey, type Edge, type Vertex } from './graph';

/** One graph algorithm, as the page knows it. */
export type GraphAlgorithm = {
  /** Key into the algorithm metadata table. */
  id: string;
  /** Display name. */
  name: string;
  /** A line of prose about what the algorithm does. */
  description: string;
  /** The pure generator that produces the trace. */
  generator: (
    vertices: Vertex[],
    edges: Edge[],
    sourceId: number | null,
    targetId: number | null,
    isDirected: boolean
  ) => Generator<GraphStep, void, undefined>;
  /** Whether the algorithm needs a source vertex. */
  needsSource: boolean;
  /** Whether the algorithm needs a target vertex. */
  needsTarget: boolean;
  /** Whether the algorithm only makes sense on a directed graph. */
  directedOnly?: boolean;
  /** Whether the algorithm only makes sense on an undirected graph. */
  undirectedOnly?: boolean;
};

/**
 * The graph family.
 *
 * One implementation per algorithm, shared by the page, the arena and
 * anything else that wants to run a graph algorithm.
 */
export const graphAlgorithms: readonly GraphAlgorithm[] = [
  {
    id: 'BFS',
    description:
      'Explores neighbors level-by-level using a Queue. Finds shortest paths in unweighted graphs.',
    name: 'Breadth-First Search (BFS)',
    generator: generateBFS,
    needsSource: true,
    needsTarget: true,
  },
  {
    id: 'DFS',
    description:
      'Explores as deep as possible along each branch before backtracking. Uses a Stack or Recursion.',
    name: 'Depth-First Search (DFS)',
    generator: generateDFS,
    needsSource: true,
    needsTarget: true,
  },
  {
    id: 'Dijkstra',
    description:
      'Finds the single-source shortest path in weighted graphs with non-negative weights.',
    name: "Dijkstra's Algorithm",
    generator: generateDijkstra,
    needsSource: true,
    needsTarget: true,
  },
  {
    id: 'Bellman-Ford',
    description:
      'Finds the single-source shortest paths in weighted graphs. Detects negative weight cycles.',
    name: 'Bellman-Ford Algorithm',
    generator: generateBellmanFord,
    needsSource: true,
    needsTarget: true,
  },
  {
    id: 'Floyd-Warshall',
    description:
      'All-pairs shortest path algorithm. Computes shortest paths between all pairs of nodes.',
    name: 'Floyd-Warshall Algorithm',
    generator: generateFloydWarshall,
    needsSource: true,
    needsTarget: true,
  },
  {
    id: "Prim's MST",
    description:
      'Grows a Minimum Spanning Tree from a starting node by greedily adding the cheapest cut edge.',
    name: "Prim's Minimum Spanning Tree",
    generator: generatePrim,
    needsSource: false,
    needsTarget: false,
    undirectedOnly: true,
  },
  {
    id: "Kruskal's MST",
    description:
      'Builds a Minimum Spanning Tree by sorting edges by weight and unioning disjoint components.',
    name: "Kruskal's Minimum Spanning Tree",
    generator: generateKruskal,
    needsSource: false,
    needsTarget: false,
    undirectedOnly: true,
  },
  {
    id: 'Topological Sort',
    description:
      'Linear ordering of vertices such that every directed edge u → v comes before v in the ordering. Requires a DAG.',
    name: 'Topological Sort',
    generator: generateTopologicalSort,
    needsSource: false,
    needsTarget: false,
  },
];

/** The algorithm with the given key, or the first one. */
export const graphAlgorithmByKey = (key: string): GraphAlgorithm =>
  graphAlgorithms.find((entry) => entry.id === key) ?? graphAlgorithms[0];

import type { CellRef, PathGenerator } from '@core/steps';
import { aStar } from './astar/astar';
import { breadthFirstSearch } from './bfs/bfs';
import { depthFirstSearch } from './dfs/dfs';
import { dijkstra } from './dijkstra/dijkstra';
import type { Grid } from './grid';

export { aStar } from './astar/astar';
export { breadthFirstSearch } from './bfs/bfs';
export { depthFirstSearch } from './dfs/dfs';
export { dijkstra } from './dijkstra/dijkstra';
export type { Grid, GridNode } from './grid';

/** One pathfinding algorithm, as the page knows it. */
export type PathfindingAlgorithm = {
  /** Key into the algorithm metadata table. */
  id: string;
  /** Display name. */
  name: string;
  /** The pure generator that produces the trace. */
  generator: (grid: Grid, start: CellRef, end: CellRef) => PathGenerator;
};

/**
 * The pathfinding family.
 *
 * One implementation per algorithm, shared by the page, the live preview
 * and the arena.
 */
export const pathfindingAlgorithms: readonly PathfindingAlgorithm[] = [
  { id: 'bfs', name: 'Breadth-First Search', generator: breadthFirstSearch },
  { id: 'dfs', name: 'Depth-First Search', generator: depthFirstSearch },
  { id: 'dijkstra', name: "Dijkstra's Algorithm", generator: dijkstra },
  { id: 'astar', name: 'A* Search', generator: aStar },
];

/** The algorithm with the given key, or the first one. */
export const pathfindingAlgorithmByKey = (key: string): PathfindingAlgorithm =>
  pathfindingAlgorithms.find((entry) => entry.id === key) ?? pathfindingAlgorithms[0];

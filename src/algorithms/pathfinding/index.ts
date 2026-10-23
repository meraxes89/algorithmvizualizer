import type { CellRef, PathGenerator } from '@core/steps';
import { aStar } from './astar/astar';
import { breadthFirstSearch } from './bfs/bfs';
import { depthFirstSearch } from './dfs/dfs';
import { dijkstra } from './dijkstra/dijkstra';
import { pathfindingMeta, type PathfindingMeta } from './meta';
import type { Grid } from './grid';

export { aStar } from './astar/astar';
export { breadthFirstSearch } from './bfs/bfs';
export { depthFirstSearch } from './dfs/dfs';
export { dijkstra } from './dijkstra/dijkstra';
export type { Grid, GridNode } from './grid';
export type { PathfindingMeta } from './meta';

/** One pathfinding algorithm, as the page knows it. */
export type PathfindingAlgorithm = {
  /** Stable id — the URL (`?algo=`) and the display registry use it too. */
  id: string;
  /** Display name. */
  name: string;
  /** The pure generator that produces the trace. */
  generator: (grid: Grid, start: CellRef, end: CellRef) => PathGenerator;
  /**
   * Educational metadata (description, complexities, pseudocode, code
   * snippets). It lives on the entry, so it cannot drift from the
   * implementation the way the old `algorithmData.js` table could.
   */
  meta: PathfindingMeta;
};

/**
 * The pathfinding family.
 *
 * One implementation per algorithm, shared by the page, the live preview
 * and the arena. Educational metadata is part of each entry (from
 * `./meta`), so an entry and its explanation are added together.
 */
export const pathfindingAlgorithms: readonly PathfindingAlgorithm[] = [
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    generator: breadthFirstSearch,
    meta: pathfindingMeta.bfs,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    generator: depthFirstSearch,
    meta: pathfindingMeta.dfs,
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    generator: dijkstra,
    meta: pathfindingMeta.dijkstra,
  },
  { id: 'astar', name: 'A* Search', generator: aStar, meta: pathfindingMeta.astar },
];

/** The algorithm with the given key, or the first one. */
export const pathfindingAlgorithmByKey = (key: string): PathfindingAlgorithm =>
  pathfindingAlgorithms.find((entry) => entry.id === key) ?? pathfindingAlgorithms[0];

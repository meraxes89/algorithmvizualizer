import type { CellRef, PathStep, PathView } from '@core/steps';
import { cellKey, manhattan, neighbours, reconstructPath, sameCell, type Grid } from '../grid';

/**
 * A* search.
 *
 * Dijkstra with a sense of direction: instead of expanding the cheapest
 * cell it knows about, it expands the cell that is cheapest to reach
 * *plus* how far it thinks it is from the goal. The Manhattan distance
 * is the estimate, which never overestimates on a grid where every move
 * costs the same.
 */
export function* aStar(
  grid: Grid,
  start: CellRef,
  end: CellRef
): Generator<PathStep, void, undefined> {
  const visited: CellRef[] = [];
  const frontier: CellRef[] = [];
  const previous = new Map<string, CellRef>();
  const distance = new Map<string, number>();
  const estimate = new Map<string, number>();
  const seen = new Set<string>([cellKey(start)]);

  const view = (): PathView => ({
    visited: [...visited],
    path: [],
    frontier: [...frontier],
  });

  const score = (cell: CellRef): number =>
    (distance.get(cellKey(cell)) ?? Infinity) + (estimate.get(cellKey(cell)) ?? Infinity);

  /**
   * The order the frontier is expanded in.
   *
   * Cheapest first, and when two cells cost the same, the one that is
   * closer to the goal wins. Without that tie-break A* wanders among all
   * the cells that lie on some shortest path, which is the opposite of
   * the point of the heuristic.
   */
  const byScore = (a: CellRef, b: CellRef): number => {
    const difference = score(a) - score(b);
    if (difference !== 0) return difference;

    return (estimate.get(cellKey(a)) ?? Infinity) - (estimate.get(cellKey(b)) ?? Infinity);
  };

  distance.set(cellKey(start), 0);
  estimate.set(cellKey(start), manhattan(start, end));
  frontier.push(start);
  yield { family: 'pathfinding', t: 'frontier', view: view(), cell: start };

  while (frontier.length > 0) {
    frontier.sort(byScore);

    const current = frontier.shift() as CellRef;
    visited.push(current);

    yield { family: 'pathfinding', t: 'visit', view: view(), cell: current };

    if (sameCell(current, end)) {
      const path = reconstructPath(previous, current, start);
      yield {
        family: 'pathfinding',
        t: 'path',
        view: { visited: [...visited], path: [...path], frontier: [...frontier] },
        path: [...path],
      };
      yield {
        family: 'pathfinding',
        t: 'done',
        view: { visited: [...visited], path: [...path], frontier: [...frontier] },
      };
      return;
    }

    const currentDistance = distance.get(cellKey(current)) ?? Infinity;

    for (const neighbour of neighbours(current, grid)) {
      const key = cellKey(neighbour);
      const candidate = currentDistance + 1;

      if (candidate < (distance.get(key) ?? Infinity)) {
        const isNew = !seen.has(key);
        distance.set(key, candidate);
        estimate.set(key, manhattan(neighbour, end));
        previous.set(key, current);

        if (isNew) {
          seen.add(key);
          frontier.push(neighbour);
          yield { family: 'pathfinding', t: 'frontier', view: view(), cell: neighbour };
        }
      }
    }
  }

  yield {
    family: 'pathfinding',
    t: 'not-found',
    view: { visited: [...visited], path: [], frontier: [...frontier] },
  };
  yield {
    family: 'pathfinding',
    t: 'done',
    view: { visited: [...visited], path: [], frontier: [] },
  };
}

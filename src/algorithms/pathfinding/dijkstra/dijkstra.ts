import type { CellRef, PathStep, PathView } from '@core/steps';
import { cellKey, neighbours, reconstructPath, sameCell, type Grid } from '../grid';

/**
 * Dijkstra's algorithm.
 *
 * Always expands the cheapest cell it knows about. With uniform move
 * costs that makes it a shortest-route search, and it is the baseline
 * that A* improves on.
 */
export function* dijkstra(
  grid: Grid,
  start: CellRef,
  end: CellRef
): Generator<PathStep, void, undefined> {
  const visited: CellRef[] = [];
  const frontier: CellRef[] = [];
  const previous = new Map<string, CellRef>();
  const distance = new Map<string, number>();
  const seen = new Set<string>([cellKey(start)]);

  const view = (): PathView => ({
    visited: [...visited],
    path: [],
    frontier: [...frontier],
  });

  distance.set(cellKey(start), 0);
  frontier.push(start);
  yield { family: 'pathfinding', t: 'frontier', view: view(), cell: start };

  while (frontier.length > 0) {
    // Cheapest known cell first.
    frontier.sort(
      (a, b) => (distance.get(cellKey(a)) ?? Infinity) - (distance.get(cellKey(b)) ?? Infinity)
    );

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
      const candidate = currentDistance + (grid[neighbour.row][neighbour.col].weight ?? 1);

      if (candidate < (distance.get(key) ?? Infinity)) {
        const isNew = !seen.has(key);
        distance.set(key, candidate);
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

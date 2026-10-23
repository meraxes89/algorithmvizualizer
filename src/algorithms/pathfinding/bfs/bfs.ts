import type { CellRef, PathStep, PathView } from '@core/steps';
import { cellKey, neighbours, reconstructPath, sameCell, type Grid } from '../grid';

/**
 * Breadth-First Search.
 *
 * Expands the cells level by level, so the first time it reaches the
 * end it has found a shortest route in a grid where every move costs
 * the same.
 *
 * The trace distinguishes two events: a cell being *discovered* (added
 * to the frontier) and a cell being *expanded* (taken off it).
 */
export function* breadthFirstSearch(
  grid: Grid,
  start: CellRef,
  end: CellRef
): Generator<PathStep, void, undefined> {
  const visited: CellRef[] = [];
  const frontier: CellRef[] = [];
  const previous = new Map<string, CellRef>();
  const seen = new Set<string>([cellKey(start)]);

  const view = (): PathView => ({
    visited: [...visited],
    path: [],
    frontier: [...frontier],
  });

  frontier.push(start);
  yield { family: 'pathfinding', t: 'frontier', view: view(), cell: start };

  while (frontier.length > 0) {
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

    for (const neighbour of neighbours(current, grid)) {
      const key = cellKey(neighbour);
      if (seen.has(key)) continue;

      seen.add(key);
      previous.set(key, current);
      frontier.push(neighbour);
      yield { family: 'pathfinding', t: 'frontier', view: view(), cell: neighbour };
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
    view: { visited: [...visited], path: [], frontier: [...frontier] },
  };
}

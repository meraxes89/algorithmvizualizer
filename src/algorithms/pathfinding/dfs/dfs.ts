import type { CellRef, PathStep, PathView } from '@core/steps';
import { cellKey, neighbours, reconstructPath, sameCell, type Grid } from '../grid';

/**
 * Depth-First Search.
 *
 * Always pushes deeper first: it takes the most recently discovered
 * cell and follows it down before coming back up. A shortest route is
 * not guaranteed.
 */
export function* depthFirstSearch(
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
    const current = frontier.pop() as CellRef;
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

    // Pushed in reverse so the first neighbour is the one popped next.
    const open = neighbours(current, grid);
    for (let i = open.length - 1; i >= 0; i--) {
      const neighbour = open[i];
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

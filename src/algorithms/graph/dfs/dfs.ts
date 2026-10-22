import type { GraphStep, EdgeState, VertexState } from '@core/steps';
import {
  getEdgeKey,
  toGraphStep,
  toView,
  type Edge,
  type RawGraphStep,
  type Vertex,
} from '../graph';
/**
 * Depth-First Search over a graph.
 */
export function* generateDFS(
  vertices: Vertex[],
  edges: Edge[],
  sourceId: number | null,
  targetId: number | null,
  isDirected = false
): Generator<GraphStep, void, undefined> {
  // The previous raw step, so the conversion can tell what changed.
  let previous: RawGraphStep | undefined;

  // Turn a raw step into a contract step and remember it.
  const emit = (raw: RawGraphStep): GraphStep => {
    const step = toGraphStep(previous, raw);
    previous = raw;
    return step;
  };

  // The final step of every trace.
  const done = (): GraphStep => ({
    family: 'graph',
    t: 'done',
    view: previous ? toView(previous) : { vertices: {}, edges: {}, path: [], queue: [], stack: [] },
  });

  // A search with no source has nothing to do.
  if (sourceId === null) {
    yield done();
    return;
  }
  const visited = new Set<number>();
  const stack = [sourceId];
  const parent: Record<number, number> = {};

  yield emit({
    verticesState: { [sourceId]: 'visiting' },
    edgesState: {},
    description: `Initialize DFS from source node ${vertices.find((v) => v.id === sourceId)?.label || sourceId}.`,
    stack: [...stack],
  });

  function* dfsRecursive(current: number): Generator<GraphStep, boolean, undefined> {
    visited.add(current);
    const currentLabel = vertices.find((v) => v.id === current)?.label || current;

    const verticesState: Record<number, VertexState> = {};
    visited.forEach((id) => {
      verticesState[id] = id === current ? 'visiting' : 'visited';
    });

    yield emit({
      verticesState: { ...verticesState },
      edgesState: {},
      description: `Visit node ${currentLabel}.`,
      stack: [...stack],
    });

    if (current === targetId) {
      return true;
    }

    const outgoing = edges.filter((e) => {
      if (isDirected) return e.from === current;
      return e.from === current || e.to === current;
    });

    for (const edge of outgoing) {
      const neighbor = edge.from === current ? edge.to : edge.from;
      const neighborLabel = vertices.find((v) => v.id === neighbor)?.label || neighbor;
      const edgeKey = getEdgeKey(edge.from, edge.to, isDirected);

      if (!visited.has(neighbor)) {
        parent[neighbor] = current;
        stack.push(neighbor);

        yield emit({
          verticesState: { ...verticesState, [neighbor]: 'visiting' },
          edgesState: { [edgeKey]: 'exploring' },
          description: `Traverse edge (${currentLabel} - ${neighborLabel}) to explore ${neighborLabel}.`,
          stack: [...stack],
        });

        const found = yield* dfsRecursive(neighbor);
        stack.pop();

        if (found) return true;

        // Backtracking step
        const backtrackVertices: Record<number, VertexState> = {};
        visited.forEach((id) => {
          backtrackVertices[id] = 'visited';
        });
        backtrackVertices[current] = 'visiting';

        yield emit({
          verticesState: backtrackVertices,
          edgesState: { [edgeKey]: 'rejected' },
          description: `Backtrack from node ${neighborLabel} to ${currentLabel}.`,
          stack: [...stack],
        });
      }
    }
    return false;
  }

  dfsRecursive(sourceId);

  // Path reconstruction
  if (targetId !== null && visited.has(targetId)) {
    const pathNodes: number[] = [];
    let curr = targetId;
    while (curr !== undefined) {
      pathNodes.unshift(curr);
      curr = parent[curr];
    }

    const finalEdges: Record<string, EdgeState> = {};
    for (let i = 0; i < pathNodes.length - 1; i++) {
      finalEdges[getEdgeKey(pathNodes[i], pathNodes[i + 1], isDirected)] = 'accepted';
    }
    const finalNodes: Record<number, VertexState> = {};
    pathNodes.forEach((id) => {
      finalNodes[id] = 'visited';
    });

    yield emit({
      verticesState: finalNodes,
      edgesState: finalEdges,
      description: `DFS Path found: ${pathNodes.map((id) => vertices.find((v) => v.id === id)?.label).join(' → ')}`,
      stack: [],
      path: pathNodes,
    });
  }

  yield done();

  return;
}

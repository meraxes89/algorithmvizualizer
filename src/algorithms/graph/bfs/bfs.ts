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
 * Breadth-First Search over a graph.
 */
export function* generateBFS(
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
  const queue = [sourceId];
  const parent: Record<number, number> = {};

  visited.add(sourceId);

  // Initial step
  yield emit({
    verticesState: { [sourceId]: 'visiting' },
    edgesState: {},
    description: `Initialize BFS from source node ${vertices.find((v) => v.id === sourceId)?.label || sourceId}.`,
    queue: [...queue],
  });

  while (queue.length > 0) {
    const current = queue.shift() as number;
    const currentLabel = vertices.find((v) => v.id === current)?.label || current;

    // Set visiting state
    const verticesState: Record<number, VertexState> = {};
    visited.forEach((id) => {
      verticesState[id] = id === current ? 'visiting' : 'visited';
    });

    yield emit({
      verticesState: { ...verticesState },
      edgesState: {},
      description: `Dequeue node ${currentLabel} and explore its neighbors.`,
      queue: [...queue],
    });

    if (current === targetId) {
      yield emit({
        verticesState: { ...verticesState, [current]: 'visited' },
        edgesState: {},
        description: `Target node ${currentLabel} reached! Stopping traversal.`,
        queue: [...queue],
        pathReached: true,
      });
      break;
    }

    // Find outgoing edges
    const outgoing = edges.filter((e) => {
      if (isDirected) return e.from === current;
      return e.from === current || e.to === current;
    });

    for (const edge of outgoing) {
      const neighbor = edge.from === current ? edge.to : edge.from;
      const neighborLabel = vertices.find((v) => v.id === neighbor)?.label || neighbor;
      const edgeKey = getEdgeKey(edge.from, edge.to, isDirected);

      const currentEdgesState: Record<string, EdgeState> = {};
      if (previous?.edgesState) {
        Object.assign(currentEdgesState, previous.edgesState);
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = current;
        queue.push(neighbor);

        currentEdgesState[edgeKey] = 'accepted';
        const nextVerticesState: Record<number, VertexState> = {
          ...verticesState,
          [neighbor]: 'visiting',
        };

        yield emit({
          verticesState: nextVerticesState,
          edgesState: { ...currentEdgesState },
          description: `Discover neighbor ${neighborLabel} via edge (${currentLabel} - ${neighborLabel}). Add to queue.`,
          queue: [...queue],
        });
      } else {
        // Already visited / in queue
        currentEdgesState[edgeKey] = 'rejected';
        yield emit({
          verticesState: { ...verticesState },
          edgesState: { ...currentEdgesState },
          description: `Neighbor ${neighborLabel} is already visited. Skip edge.`,
          queue: [...queue],
        });
      }
    }

    // Finish current
    const finishedVertices: Record<number, VertexState> = {};
    visited.forEach((id) => {
      finishedVertices[id] = 'visited';
    });
    yield emit({
      verticesState: finishedVertices,
      edgesState: {},
      description: `Completed exploration from node ${currentLabel}.`,
      queue: [...queue],
    });
  }

  // Reconstruct path if target reached
  if (targetId !== null && visited.has(targetId)) {
    const pathNodes: number[] = [];
    let curr = targetId;
    while (curr !== undefined) {
      pathNodes.unshift(curr);
      curr = parent[curr];
    }

    // Highlight final path
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
      description: `Shortest Path: ${pathNodes.map((id) => vertices.find((v) => v.id === id)?.label).join(' → ')}`,
      queue: [],
      path: pathNodes,
    });
  }

  yield done();

  return;
}

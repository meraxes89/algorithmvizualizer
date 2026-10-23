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
 * Topological sort of a directed acyclic graph.
 */
export function* generateTopologicalSort(
  vertices: Vertex[],
  edges: Edge[],
  // The spanning tree and topological sort algorithms do not use a source.
  _sourceId: number | null = null,
  _targetId: number | null = null,
  _isDirected = false
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
  const V = vertices.length;

  // Calculate indegrees
  const indegree: Record<number, number> = {};
  vertices.forEach((v) => {
    indegree[v.id] = 0;
  });
  edges.forEach((edge) => {
    indegree[edge.to]++;
  });

  yield emit({
    verticesState: {},
    edgesState: {},
    description: `Calculate in-degree for all vertices.`,
    indegrees: { ...indegree },
  });

  const queue: number[] = [];
  vertices.forEach((v) => {
    if (indegree[v.id] === 0) {
      queue.push(v.id);
    }
  });

  yield emit({
    verticesState: {},
    edgesState: {},
    description: `Find nodes with in-degree = 0: ${queue.map((id) => vertices.find((v) => v.id === id)?.label).join(', ')}. Push to queue.`,
    indegrees: { ...indegree },
    queue: [...queue],
  });

  const order: number[] = [];
  const edgesState: Record<string, EdgeState> = {};

  while (queue.length > 0) {
    const current = queue.shift() as number;
    const currentLabel = vertices.find((v) => v.id === current)?.label || current;

    const verticesState: Record<number, VertexState> = {};
    order.forEach((id) => {
      verticesState[id] = 'visited';
    });
    verticesState[current] = 'visiting';

    yield emit({
      verticesState: { ...verticesState },
      edgesState: { ...edgesState },
      description: `Dequeue node ${currentLabel} and add it to topological order.`,
      indegrees: { ...indegree },
      queue: [...queue],
      order: [...order, current],
    });

    order.push(current);

    // Find direct outgoing edges from current
    const outgoing = edges.filter((e) => e.from === current);

    for (const edge of outgoing) {
      const neighbor = edge.to;
      const neighborLabel = vertices.find((v) => v.id === neighbor)?.label || neighbor;
      const edgeKey = getEdgeKey(edge.from, edge.to, true);

      indegree[neighbor]--;
      edgesState[edgeKey] = 'exploring';

      yield emit({
        verticesState: { ...verticesState, [neighbor]: 'visiting' },
        edgesState: { ...edgesState },
        description: `Reduce in-degree of neighbor ${neighborLabel} to ${indegree[neighbor]}.`,
        indegrees: { ...indegree },
        queue: [...queue],
        order: [...order],
      });

      if (indegree[neighbor] === 0) {
        queue.push(neighbor);
        edgesState[edgeKey] = 'accepted';

        yield emit({
          verticesState: { ...verticesState, [neighbor]: 'visited' },
          edgesState: { ...edgesState },
          description: `Neighbor ${neighborLabel} now has in-degree = 0. Push to queue.`,
          indegrees: { ...indegree },
          queue: [...queue],
          order: [...order],
        });
      } else {
        edgesState[edgeKey] = 'rejected';
      }
    }
  }

  const verticesState: Record<number, VertexState> = {};
  vertices.forEach((v) => {
    verticesState[v.id] = order.includes(v.id) ? 'visited' : 'default';
  });

  if (order.length < V) {
    yield emit({
      verticesState,
      edgesState,
      description: `Graph contains a cycle! Topological sort is only possible on Directed Acyclic Graphs (DAGs).`,
      indegrees: { ...indegree },
      queue: [],
      order: [...order],
    });
  } else {
    yield emit({
      verticesState,
      edgesState,
      description: `Topological Sort complete: ${order.map((id) => vertices.find((v) => v.id === id)?.label).join(' → ')}`,
      indegrees: { ...indegree },
      queue: [],
      order: [...order],
    });
  }

  yield done();

  return;
}

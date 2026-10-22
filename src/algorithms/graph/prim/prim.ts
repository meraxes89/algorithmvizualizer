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
 * Prim's minimum spanning tree.
 */
export function* generatePrim(
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
  const visited = new Set<number>();
  const mstEdges: { from: number; to: number; weight: number }[] = [];
  const V = vertices.length;

  if (V === 0) {
    yield done();
    return;
  }

  const startNode = vertices[0].id;
  visited.add(startNode);

  yield emit({
    verticesState: { [startNode]: 'visited' },
    edgesState: {},
    description: `Start Prim's MST at vertex ${vertices[0].label}. Add to visited set.`,
  });

  while (visited.size < V) {
    let minEdge = null;
    let minWeight = Infinity;

    // Evaluate all edges cutting from visited nodes to unvisited nodes
    for (const edge of edges) {
      const u = edge.from;
      const v = edge.to;
      const w = Number(edge.weight || 1);

      const uVisited = visited.has(u);
      const vVisited = visited.has(v);

      if ((uVisited && !vVisited) || (!uVisited && vVisited)) {
        if (w < minWeight) {
          minWeight = w;
          minEdge = edge;
        }
      }
    }

    if (!minEdge) {
      // Graph is disconnected
      break;
    }

    const u = minEdge.from;
    const v = minEdge.to;
    const nextNode = visited.has(u) ? v : u;
    const nextLabel = vertices.find((vertex) => vertex.id === nextNode)?.label || nextNode;
    const edgeKey = getEdgeKey(u, v, false);

    // Show edge consideration step
    const preVerticesState: Record<number, VertexState> = {};
    visited.forEach((id) => {
      preVerticesState[id] = 'visited';
    });
    preVerticesState[nextNode] = 'visiting';

    yield emit({
      verticesState: { ...preVerticesState },
      edgesState: { [edgeKey]: 'considering' },
      description: `Find minimum cut edge. Edge (${vertices.find((vertex) => vertex.id === u)?.label} - ${vertices.find((vertex) => vertex.id === v)?.label}) has weight ${minWeight}.`,
    });

    visited.add(nextNode);
    mstEdges.push(minEdge);

    const postVerticesState: Record<number, VertexState> = {};
    visited.forEach((id) => {
      postVerticesState[id] = 'visited';
    });

    const postEdgesState: Record<string, EdgeState> = {};
    mstEdges.forEach((e) => {
      postEdgesState[getEdgeKey(e.from, e.to, false)] = 'accepted';
    });

    yield emit({
      verticesState: { ...postVerticesState },
      edgesState: { ...postEdgesState },
      description: `Add node ${nextLabel} and edge to MST. Tree currently contains ${visited.size} vertices.`,
    });
  }

  // Final summary
  const finalEdges: Record<string, EdgeState> = {};
  mstEdges.forEach((e) => {
    finalEdges[getEdgeKey(e.from, e.to, false)] = 'accepted';
  });
  const finalVertices: Record<number, VertexState> = {};
  vertices.forEach((v) => {
    finalVertices[v.id] = 'visited';
  });

  yield emit({
    verticesState: finalVertices,
    edgesState: finalEdges,
    description: `Prim's MST complete! Total MST edges = ${mstEdges.length}. Total Weight = ${mstEdges.reduce((sum, e) => sum + Number(e.weight || 0), 0)}.`,
    resultEdges: mstEdges,
  });

  yield done();

  return;
}

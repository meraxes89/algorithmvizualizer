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
 * Kruskal's minimum spanning tree.
 */
export function* generateKruskal(
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
  const mstEdges: { from: number; to: number; weight: number }[] = [];

  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => Number(a.weight || 1) - Number(b.weight || 1));

  yield emit({
    verticesState: {},
    edgesState: {},
    description: `Sort all edges by weight: ${sortedEdges.map((e) => `${vertices.find((v) => v.id === e.from)?.label}-${vertices.find((v) => v.id === e.to)?.label} (${e.weight})`).join(', ')}`,
  });

  // DSU structure helper
  const parent: Record<number, number> = {};
  const find = (i: number): number => {
    if (parent[i] === undefined) return i;
    let curr = i;
    while (parent[curr] !== undefined) {
      curr = parent[curr];
    }
    return curr;
  };
  const union = (i: number, j: number): boolean => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true;
    }
    return false;
  };

  for (const edge of sortedEdges) {
    const u = edge.from;
    const v = edge.to;
    const edgeKey = getEdgeKey(u, v, false);
    const w = Number(edge.weight || 1);

    const uLabel = vertices.find((vertex) => vertex.id === u)?.label || u;
    const vLabel = vertices.find((vertex) => vertex.id === v)?.label || v;

    const rootU = find(u);
    const rootV = find(v);

    const currentVertices: Record<number, VertexState> = {};
    currentVertices[u] = 'visiting';
    currentVertices[v] = 'visiting';

    const currentEdges: Record<string, EdgeState> = {};
    mstEdges.forEach((e) => {
      currentEdges[getEdgeKey(e.from, e.to, false)] = 'accepted';
    });
    currentEdges[edgeKey] = 'considering';

    yield emit({
      verticesState: currentVertices,
      edgesState: { ...currentEdges },
      description: `Consider edge (${uLabel} - ${vLabel}) with weight ${w}. Check if they belong to the same component.`,
    });

    if (rootU !== rootV) {
      union(u, v);
      mstEdges.push(edge);

      currentEdges[edgeKey] = 'accepted';
      const postVertices: Record<number, VertexState> = {};
      postVertices[u] = 'visited';
      postVertices[v] = 'visited';

      yield emit({
        verticesState: postVertices,
        edgesState: { ...currentEdges },
        description: `Components are disjoint. Accept edge into MST.`,
      });
    } else {
      currentEdges[edgeKey] = 'rejected';
      yield emit({
        verticesState: {},
        edgesState: { ...currentEdges },
        description: `Nodes ${uLabel} and ${vLabel} are in the same component. Reject edge to avoid a cycle.`,
      });
    }
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
    description: `Kruskal's MST complete! Total Weight = ${mstEdges.reduce((sum, e) => sum + Number(e.weight || 0), 0)}.`,
    resultEdges: mstEdges,
  });

  yield done();

  return;
}

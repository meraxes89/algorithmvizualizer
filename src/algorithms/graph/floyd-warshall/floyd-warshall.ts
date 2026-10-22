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
 * Floyd-Warshall, all pairs at once.
 */
export function* generateFloydWarshall(
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

  const V = vertices.length;
  const dist = Array.from({ length: V }, () => Array(V).fill(Infinity));
  const next = Array.from({ length: V }, () => Array(V).fill(null));

  for (let i = 0; i < V; i++) {
    dist[i][i] = 0;
  }

  edges.forEach((edge) => {
    const u = edge.from;
    const v = edge.to;
    const w = Number(edge.weight || 1);
    dist[u][v] = w;
    next[u][v] = v;

    if (!isDirected) {
      dist[v][u] = w;
      next[v][u] = u;
    }
  });

  yield emit({
    verticesState: {},
    edgesState: {},
    description: `Initialize Floyd-Warshall distance matrix with direct weights.`,
    matrix: dist.map((row) => [...row]),
  });

  for (let k = 0; k < V; k++) {
    const kLabel = vertices.find((vertex) => vertex.id === k)?.label || k;

    yield emit({
      verticesState: { [k]: 'visiting' },
      edgesState: {},
      description: `Choose intermediate vertex ${kLabel}. Try updating paths (i → j) using ${kLabel} as a bridge.`,
      matrix: dist.map((row) => [...row]),
    });

    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          const alt = dist[i][k] + dist[k][j];
          if (alt < dist[i][j]) {
            dist[i][j] = alt;
            next[i][j] = next[i][k];

            const iLabel = vertices.find((vertex) => vertex.id === i)?.label || i;
            const jLabel = vertices.find((vertex) => vertex.id === j)?.label || j;

            yield emit({
              verticesState: { [k]: 'visiting', [i]: 'visited', [j]: 'visited' },
              edgesState: {},
              description: `Relax path through intermediate ${kLabel}: dist(${iLabel} → ${jLabel}) updated to ${alt} (previous: ${dist[i][j] === Infinity ? '∞' : dist[i][j]}).`,
              matrix: dist.map((row) => [...row]),
            });
          }
        }
      }
    }
  }

  // Reconstruct path if source and target are selected
  if (sourceId !== null && targetId !== null && dist[sourceId][targetId] !== Infinity) {
    const pathNodes = [sourceId];
    let curr = sourceId;
    while (curr !== targetId) {
      curr = next[curr][targetId];
      if (curr === null) break;
      pathNodes.push(curr);
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
      description: `Shortest path Floyd-Warshall: ${pathNodes.map((id) => vertices.find((v) => v.id === id)?.label).join(' → ')} (Total Cost: ${dist[sourceId][targetId]})`,
      matrix: dist.map((row) => [...row]),
      path: pathNodes,
    });
  }

  yield done();

  return;
}

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
 * Bellman-Ford over a weighted graph.
 */
export function* generateBellmanFord(
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
  const distances: Record<number, number> = {};
  const parent: Record<number, number> = {};

  vertices.forEach((v) => {
    distances[v.id] = Infinity;
  });
  distances[sourceId] = 0;

  yield emit({
    verticesState: { [sourceId]: 'visiting' },
    edgesState: {},
    description: `Initialize Bellman-Ford: Source distance = 0, others = ∞.`,
    distances: { ...distances },
  });

  // Run V - 1 times relaxation

  const V = vertices.length;
  let relaxedAny = false;

  for (let round = 1; round <= V - 1; round++) {
    relaxedAny = false;
    yield emit({
      verticesState: {},
      edgesState: {},
      description: `Start relaxation Pass ${round} of ${V - 1}.`,
      distances: { ...distances },
    });

    for (const edge of edges) {
      const u = edge.from;
      const v = edge.to;
      const weight = Number(edge.weight || 1);
      const edgeKey = getEdgeKey(u, v, isDirected);

      const uLabel = vertices.find((vertex) => vertex.id === u)?.label || u;
      const vLabel = vertices.find((vertex) => vertex.id === v)?.label || v;

      // Relax (u -> v)
      if (distances[u] !== Infinity) {
        yield emit({
          verticesState: { [u]: 'visiting', [v]: 'visiting' },
          edgesState: { [edgeKey]: 'considering' },
          description: `Evaluate edge (${uLabel} → ${vLabel}). Current dist(${vLabel}) = ${distances[v] === Infinity ? '∞' : distances[v]}. Check alternative: dist(${uLabel}) + weight = ${distances[u]} + ${weight} = ${distances[u] + weight}.`,
          distances: { ...distances },
        });

        if (distances[u] + weight < distances[v]) {
          distances[v] = distances[u] + weight;
          parent[v] = u;
          relaxedAny = true;

          yield emit({
            verticesState: { [u]: 'visited', [v]: 'visited' },
            edgesState: { [edgeKey]: 'accepted' },
            description: `Relaxed edge! Updated dist(${vLabel}) = ${distances[v]}.`,
            distances: { ...distances },
          });
        }
      }

      // If undirected, we must also relax (v -> u)
      if (!isDirected && distances[v] !== Infinity) {
        yield emit({
          verticesState: { [u]: 'visiting', [v]: 'visiting' },
          edgesState: { [edgeKey]: 'considering' },
          description: `Evaluate edge (${vLabel} → ${uLabel}). Current dist(${uLabel}) = ${distances[u] === Infinity ? '∞' : distances[u]}. Check alternative: dist(${vLabel}) + weight = ${distances[v]} + ${weight} = ${distances[v] + weight}.`,
          distances: { ...distances },
        });

        if (distances[v] + weight < distances[u]) {
          distances[u] = distances[v] + weight;
          parent[u] = v;
          relaxedAny = true;

          yield emit({
            verticesState: { [u]: 'visited', [v]: 'visited' },
            edgesState: { [edgeKey]: 'accepted' },
            description: `Relaxed edge! Updated dist(${uLabel}) = ${distances[u]}.`,
            distances: { ...distances },
          });
        }
      }
    }

    if (!relaxedAny) {
      yield emit({
        verticesState: {},
        edgesState: {},
        description: `Pass ${round}: No distances updated. Graph has stabilized.`,
        distances: { ...distances },
      });
      break;
    }
  }

  // Pass V: Negative cycle detection
  let hasNegativeCycle = false;
  for (const edge of edges) {
    const u = edge.from;
    const v = edge.to;
    const weight = Number(edge.weight || 1);
    const edgeKey = getEdgeKey(u, v, isDirected);

    if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
      hasNegativeCycle = true;
      yield emit({
        verticesState: { [u]: 'visiting', [v]: 'visiting' },
        edgesState: { [edgeKey]: 'rejected' },
        description: `Negative cycle detected at edge (${vertices.find((vertex) => vertex.id === u)?.label} → ${vertices.find((vertex) => vertex.id === v)?.label})! Distance can decrease infinitely.`,
        distances: { ...distances },
      });
      break;
    }

    if (!isDirected && distances[v] !== Infinity && distances[v] + weight < distances[u]) {
      hasNegativeCycle = true;
      yield emit({
        verticesState: { [u]: 'visiting', [v]: 'visiting' },
        edgesState: { [edgeKey]: 'rejected' },
        description: `Negative cycle detected at edge (${vertices.find((vertex) => vertex.id === v)?.label} → ${vertices.find((vertex) => vertex.id === u)?.label})!`,
        distances: { ...distances },
      });
      break;
    }
  }

  if (!hasNegativeCycle && targetId !== null && distances[targetId] !== Infinity) {
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
      description: `Bellman-Ford completed. Shortest path to target is: ${pathNodes.map((id) => vertices.find((v) => v.id === id)?.label).join(' → ')} (Cost: ${distances[targetId]})`,
      distances: { ...distances },
      path: pathNodes,
    });
  }

  yield done();

  return;
}

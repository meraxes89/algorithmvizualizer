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
 * Dijkstra's algorithm over a weighted graph.
 */
export function* generateDijkstra(
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
  const visited = new Set<number>();
  const parent: Record<number, number> = {};

  vertices.forEach((v) => {
    distances[v.id] = Infinity;
  });
  distances[sourceId] = 0;

  yield emit({
    verticesState: { [sourceId]: 'visiting' },
    edgesState: {},
    description: `Set distance of source node to 0, all other nodes to ∞.`,
    distances: { ...distances },
  });

  const getUnvisitedMin = () => {
    let minNode = null;
    let minDist = Infinity;
    vertices.forEach((v) => {
      if (!visited.has(v.id) && distances[v.id] < minDist) {
        minDist = distances[v.id];
        minNode = v.id;
      }
    });
    return minNode;
  };

  for (let i = 0; i < vertices.length; i++) {
    const current = getUnvisitedMin();
    if (current === null) break;

    const currentLabel = vertices.find((v) => v.id === current)?.label || current;
    visited.add(current);

    const verticesState: Record<number, VertexState> = {};
    vertices.forEach((v) => {
      if (visited.has(v.id)) {
        verticesState[v.id] = v.id === current ? 'visiting' : 'visited';
      }
    });

    yield emit({
      verticesState: { ...verticesState },
      edgesState: {},
      description: `Select unvisited node ${currentLabel} with minimum distance (${distances[current]}).`,
      distances: { ...distances },
    });

    if (current === targetId) {
      yield emit({
        verticesState: { ...verticesState, [current]: 'visited' },
        edgesState: {},
        description: `Target node ${currentLabel} reached! Stopping Dijkstra.`,
        distances: { ...distances },
      });
      break;
    }

    // Relax neighbors
    const outgoing = edges.filter((e) => {
      if (isDirected) return e.from === current;
      return e.from === current || e.to === current;
    });

    for (const edge of outgoing) {
      const neighbor = edge.from === current ? edge.to : edge.from;
      if (visited.has(neighbor)) continue;

      const neighborLabel = vertices.find((v) => v.id === neighbor)?.label || neighbor;
      const edgeKey = getEdgeKey(edge.from, edge.to, isDirected);
      const weight = Number(edge.weight || 1);

      const alt = distances[current] + weight;

      const currentEdgesState: Record<string, EdgeState> = { [edgeKey]: 'considering' };

      yield emit({
        verticesState: { ...verticesState, [neighbor]: 'visiting' },
        edgesState: { ...currentEdgesState },
        description: `Check connection to neighbor ${neighborLabel}. Alternative path distance = ${distances[current]} + ${weight} = ${alt}.`,
        distances: { ...distances },
      });

      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        parent[neighbor] = current;

        yield emit({
          verticesState: { ...verticesState, [neighbor]: 'visited' },
          edgesState: { [edgeKey]: 'accepted' },
          description: `Relax edge: Update distance of ${neighborLabel} to ${alt} via parent ${currentLabel}.`,
          distances: { ...distances },
        });
      } else {
        yield emit({
          verticesState: { ...verticesState },
          edgesState: { [edgeKey]: 'rejected' },
          description: `Keep existing distance for ${neighborLabel} (${distances[neighbor]} < ${alt}).`,
          distances: { ...distances },
        });
      }
    }
  }

  // Path reconstruction
  if (targetId !== null && distances[targetId] !== Infinity) {
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
      description: `Shortest Path: ${pathNodes.map((id) => vertices.find((v) => v.id === id)?.label).join(' → ')} (Cost: ${distances[targetId]})`,
      distances: { ...distances },
      path: pathNodes,
    });
  }

  yield done();

  return;
}

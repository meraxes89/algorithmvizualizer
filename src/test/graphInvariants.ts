import { expect } from 'vitest';
import type { GraphStep } from '@core/steps';
import { getEdgeKey, type Edge, type Vertex } from '../algorithms/graph/graph';

/** A small undirected graph: A - B - C - D, with a shortcut A to C. */
export const graphVertices: Vertex[] = [
  { id: 0, label: 'A' },
  { id: 1, label: 'B' },
  { id: 2, label: 'C' },
  { id: 3, label: 'D' },
];

export const graphEdges: Edge[] = [
  { from: 0, to: 1, weight: 1 },
  { from: 1, to: 2, weight: 2 },
  { from: 2, to: 3, weight: 1 },
  { from: 0, to: 2, weight: 4 },
];

/** The same graph, directed. */
export const directedGraphEdges: Edge[] = [
  { from: 0, to: 1, weight: 1 },
  { from: 1, to: 2, weight: 2 },
  { from: 2, to: 3, weight: 1 },
  { from: 0, to: 2, weight: 4 },
];

export const SOURCE = 0;
export const TARGET = 3;

/** Whether two vertices are joined by an edge. */
export const areAdjacent = (
  edges: readonly Edge[],
  a: number,
  b: number,
  isDirected = false
): boolean =>
  edges.some(
    (edge) =>
      (edge.from === a && edge.to === b) || (!isDirected && edge.from === b && edge.to === a)
  );

/**
 * The invariants every graph trace has to satisfy.
 */
export function expectValidGraphTrace(
  vertices: readonly Vertex[],
  edges: readonly Edge[],
  trace: readonly GraphStep[],
  options: { isDirected?: boolean } = {}
): void {
  const isDirected = options.isDirected ?? false;
  const vertexIds = new Set(vertices.map((vertex) => vertex.id));
  const edgeKeys = new Set(edges.map((edge) => getEdgeKey(edge.from, edge.to, isDirected)));

  expect(trace.length).toBeGreaterThan(0);

  for (const step of trace) {
    expect(step.family).toBe('graph');
  }

  // The trace always ends with the algorithm finishing.
  expect(trace[trace.length - 1].t).toBe('done');

  const last = trace[trace.length - 1];

  // Every vertex the trace mentions is a real vertex.
  for (const id of Object.keys(last.view.vertices)) {
    expect(vertexIds.has(Number(id))).toBe(true);
  }

  // Every edge the trace mentions is a real edge.
  for (const key of Object.keys(last.view.edges)) {
    expect(edgeKeys.has(key)).toBe(true);
  }

  // A route, if there is one, walks real edges.
  const path = last.view.path;
  for (let i = 1; i < path.length; i++) {
    expect(areAdjacent(edges, path[i - 1], path[i], isDirected)).toBe(true);
  }

  // The route never repeats a vertex.
  expect(new Set(path).size).toBe(path.length);
}

/** The step types in a trace, for the golden tests. */
export const stepTypes = (trace: readonly GraphStep[]): string[] => trace.map((step) => step.t);

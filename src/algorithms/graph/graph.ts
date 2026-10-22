import type { EdgeState, GraphStep, GraphView, VertexState } from '@core/steps';

/** A vertex of the graph. */
export type Vertex = {
  id: number;
  label: string;
  x?: number;
  y?: number;
};

/** An edge of the graph. */
export type Edge = {
  from: number;
  to: number;
  weight: number;
};

/**
 * A unique key for an edge.
 *
 * An undirected edge has one key whichever way round it is drawn, so the
 * two halves of an undirected edge share their state.
 */
export const getEdgeKey = (from: number, to: number, isDirected = false): string => {
  if (isDirected) {
    return `${from}->${to}`;
  }
  return `${Math.min(from, to)}-${Math.max(from, to)}`;
};

/**
 * A graph step, before it is turned into a contract step.
 *
 * The algorithms build these because it is what they naturally know; the
 * conversion happens in one place, in `toGraphStep`.
 */
export type RawGraphStep = {
  verticesState: Record<number, VertexState>;
  edgesState: Record<string, EdgeState>;
  description?: string;
  queue?: number[];
  stack?: number[];
  path?: number[];
  pathReached?: boolean;
  distances?: Record<number, number>;
  matrix?: Record<number, Record<number, number>>;
  indegrees?: Record<number, number>;
  order?: number[];
  resultEdges?: readonly { from: number; to: number; weight: number }[];
};

/** The view of a raw step. */
export const toView = (raw: RawGraphStep): GraphView => ({
  vertices: { ...raw.verticesState },
  edges: { ...raw.edgesState },
  path: raw.path ? [...raw.path] : [],
  queue: raw.queue ? [...raw.queue] : [],
  stack: raw.stack ? [...raw.stack] : [],
  ...(raw.distances ? { distances: { ...raw.distances } } : {}),
  ...(raw.matrix ? { matrix: { ...raw.matrix } } : {}),
  ...(raw.indegrees ? { indegrees: { ...raw.indegrees } } : {}),
  ...(raw.order ? { order: [...raw.order] } : {}),
  ...(raw.resultEdges ? { resultEdges: [...raw.resultEdges] } : {}),
});

const sameRecord = (a: Record<string, unknown>, b: Record<string, unknown>): boolean => {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => a[key] === b[key]);
};

/**
 * Work out what a step did, by comparing it with the one before it.
 *
 * A step that carries a route is the path. A step whose edge states
 * changed is an edge event. Anything else is a visit.
 */
export const classifyStep = (
  previous: RawGraphStep | undefined,
  current: RawGraphStep
): GraphStep['t'] => {
  if (current.path) return 'path';
  if (!previous) return 'visit';
  if (!sameRecord(previous.edgesState, current.edgesState)) return 'edge';
  return 'visit';
};

/** Turn a raw step into a contract step. */
export const toGraphStep = (
  previous: RawGraphStep | undefined,
  current: RawGraphStep
): GraphStep => ({
  family: 'graph',
  t: classifyStep(previous, current),
  view: toView(current),
  description: current.description,
});

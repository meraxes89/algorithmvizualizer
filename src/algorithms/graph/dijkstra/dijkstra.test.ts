import { describe, expect, it } from 'vitest';
import { generateDijkstra } from './dijkstra';
import {
  SOURCE,
  TARGET,
  expectValidGraphTrace,
  graphEdges,
  graphVertices,
} from '../../../test/graphInvariants';

const trace = () => [...generateDijkstra(graphVertices, graphEdges, SOURCE, TARGET)];

describe('generateDijkstra', () => {
  it('produces a trace that ends with the algorithm finishing', () => {
    const steps = trace();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].t).toBe('done');
  });

  it('satisfies the graph invariants', () => {
    expectValidGraphTrace(graphVertices, graphEdges, trace());
  });

  it('finds the cheapest route, not the shortest one', () => {
    const steps = trace();

    // A-B-C-D costs 1 + 2 + 1 = 4. A-C-D costs 4 + 1 = 5, even though it
    // is one hop shorter. Dijkstra weighs the edges, so it takes the
    // four-cost route.
    expect(steps[steps.length - 1].view.path).toEqual([0, 1, 2, 3]);
  });

  it('shows the distances it has worked out', () => {
    const steps = trace();

    expect(steps.some((step) => step.view.distances !== undefined)).toBe(true);
  });
});

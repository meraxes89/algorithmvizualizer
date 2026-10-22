import { describe, expect, it } from 'vitest';
import { generatePrim } from './prim';
import { expectValidGraphTrace, graphEdges, graphVertices } from '../../../test/graphInvariants';

const trace = () => [...generatePrim(graphVertices, graphEdges)];

describe('generatePrim', () => {
  it('produces a trace that ends with the algorithm finishing', () => {
    const steps = trace();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].t).toBe('done');
  });

  it('satisfies the graph invariants', () => {
    expectValidGraphTrace(graphVertices, graphEdges, trace());
  });

  it('builds a spanning tree of the cheapest edges', () => {
    const steps = trace();
    const edges = steps[steps.length - 1].view.resultEdges ?? [];

    // A spanning tree of four vertices has three edges.
    expect(edges).toHaveLength(3);
    expect(edges.reduce((sum, edge) => sum + edge.weight, 0)).toBe(4);
  });
});

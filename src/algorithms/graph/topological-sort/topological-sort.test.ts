import { describe, expect, it } from 'vitest';
import { generateTopologicalSort } from './topological-sort';
import { expectValidGraphTrace, graphEdges, graphVertices } from '../../../test/graphInvariants';

const trace = () => [...generateTopologicalSort(graphVertices, graphEdges)];

describe('generateTopologicalSort', () => {
  it('produces a trace that ends with the algorithm finishing', () => {
    const steps = trace();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].t).toBe('done');
  });

  it('satisfies the graph invariants', () => {
    expectValidGraphTrace(graphVertices, graphEdges, trace(), { isDirected: true });
  });

  it('orders the vertices so every edge points forwards', () => {
    const steps = trace();
    const order = steps[steps.length - 1].view.order ?? [];

    expect(order).toHaveLength(4);
    expect(order.indexOf(0)).toBeLessThan(order.indexOf(1));
    expect(order.indexOf(1)).toBeLessThan(order.indexOf(2));
    expect(order.indexOf(2)).toBeLessThan(order.indexOf(3));
  });

  it('shows the in-degrees it is working from', () => {
    const steps = trace();

    expect(steps.some((step) => step.view.indegrees !== undefined)).toBe(true);
  });
});

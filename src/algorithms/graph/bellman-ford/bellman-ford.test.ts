import { describe, expect, it } from 'vitest';
import { generateBellmanFord } from './bellman-ford';
import {
  SOURCE,
  TARGET,
  expectValidGraphTrace,
  graphEdges,
  graphVertices,
} from '../../../test/graphInvariants';

const trace = () => [...generateBellmanFord(graphVertices, graphEdges, SOURCE, TARGET)];

describe('generateBellmanFord', () => {
  it('produces a trace that ends with the algorithm finishing', () => {
    const steps = trace();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].t).toBe('done');
  });

  it('satisfies the graph invariants', () => {
    expectValidGraphTrace(graphVertices, graphEdges, trace());
  });

  it('finds the cheapest route', () => {
    const steps = trace();

    expect(steps[steps.length - 1].view.path).toEqual([0, 1, 2, 3]);
  });

  it('shows the distances it has worked out', () => {
    const steps = trace();

    expect(steps.some((step) => step.view.distances !== undefined)).toBe(true);
  });
});

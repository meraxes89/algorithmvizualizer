import { describe, expect, it } from 'vitest';
import { generateFloydWarshall } from './floyd-warshall';
import {
  SOURCE,
  TARGET,
  expectValidGraphTrace,
  graphEdges,
  graphVertices,
} from '../../../test/graphInvariants';

const trace = () => [...generateFloydWarshall(graphVertices, graphEdges, SOURCE, TARGET)];

describe('generateFloydWarshall', () => {
  it('produces a trace that ends with the algorithm finishing', () => {
    const steps = trace();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].t).toBe('done');
  });

  it('satisfies the graph invariants', () => {
    expectValidGraphTrace(graphVertices, graphEdges, trace());
  });

  it('works out the distance between every pair of vertices', () => {
    const steps = trace();
    const matrix = steps[steps.length - 1].view.matrix;

    expect(matrix).toBeDefined();
    expect(matrix?.[0]?.[3]).toBe(4);
    expect(matrix?.[0]?.[0]).toBe(0);
  });
});

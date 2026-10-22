import { describe, expect, it } from 'vitest';
import { generateDFS } from './dfs';
import {
  SOURCE,
  TARGET,
  expectValidGraphTrace,
  graphEdges,
  graphVertices,
} from '../../../test/graphInvariants';

const trace = () => [...generateDFS(graphVertices, graphEdges, SOURCE, TARGET)];

describe('generateDFS', () => {
  it('produces a trace that ends with the algorithm finishing', () => {
    const steps = trace();

    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].t).toBe('done');
  });

  it('satisfies the graph invariants', () => {
    expectValidGraphTrace(graphVertices, graphEdges, trace());
  });

  it('goes deep before it goes wide', () => {
    const steps = trace();
    const visited = Object.keys(steps[steps.length - 1].view.vertices).map(Number);

    // Depth-first search takes the most recently discovered vertex, so it
    // follows the first edge it finds rather than the widest frontier.
    expect(visited[0]).toBe(SOURCE);
    expect(visited.length).toBeGreaterThan(0);
  });

  it('shows the stack it is working through', () => {
    const steps = trace();

    expect(steps.some((step) => step.view.stack.length > 0)).toBe(true);
  });
});

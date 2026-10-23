import { describe, expect, it } from 'vitest';
import { generateBFS } from './bfs';
import {
  SOURCE,
  TARGET,
  directedGraphEdges,
  expectValidGraphTrace,
  graphEdges,
  graphVertices,
  stepTypes,
} from '../../../test/graphInvariants';

const trace = () => [...generateBFS(graphVertices, graphEdges, SOURCE, TARGET)];

describe('generateBFS', () => {
  it('produces the golden trace for a fixed graph', () => {
    const steps = trace();

    expect(steps[steps.length - 1].t).toBe('done');
    expect(steps.map((step) => step.t)).toContain('path');
    expect(steps[steps.length - 1].view.path).toEqual([0, 2, 3]);
  });

  it('satisfies the graph invariants', () => {
    expectValidGraphTrace(graphVertices, graphEdges, trace());
  });

  it('finds the shortest route', () => {
    const steps = trace();
    const path = steps[steps.length - 1].view.path;

    // A to D is two hops through C, not three through B.
    expect(path).toHaveLength(3);
  });

  it('follows the direction of a directed graph', () => {
    const steps = [...generateBFS(graphVertices, directedGraphEdges, SOURCE, TARGET, true)];

    expectValidGraphTrace(graphVertices, directedGraphEdges, steps, { isDirected: true });
    expect(steps[steps.length - 1].view.path).toEqual([0, 2, 3]);
  });

  it('shows the worklist it is working through', () => {
    const steps = trace();
    const withQueue = steps.filter((step) => step.view.queue.length > 0);

    expect(withQueue.length).toBeGreaterThan(0);
  });

  it('never visits a vertex twice', () => {
    const steps = trace();
    const visited = steps[steps.length - 1].view.vertices;

    const visitedIds = Object.keys(visited).map(Number);
    expect(new Set(visitedIds).size).toBe(visitedIds.length);
  });

  it('reports that there is no route when the target cannot be reached', () => {
    const isolated: typeof graphEdges = [{ from: 1, to: 2, weight: 1 }];
    const steps = [...generateBFS(graphVertices, isolated, SOURCE, TARGET)];

    expectValidGraphTrace(graphVertices, isolated, steps);
    expect(steps[steps.length - 1].view.path).toEqual([]);
  });

  it('classifies its steps', () => {
    const types = stepTypes(trace());

    expect(types.filter((type) => type === 'edge').length).toBeGreaterThan(0);
    expect(types.filter((type) => type === 'visit').length).toBeGreaterThan(0);
  });
});

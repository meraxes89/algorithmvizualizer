import { describe, expect, it } from 'vitest';
import { isStepOfFamily, type AnyStep, type GraphStep, type SortStep } from './steps';

const sortStep: SortStep = {
  family: 'sorting',
  t: 'compare',
  view: { array: [1, 2], comparing: [0, 1], swapping: [], sorted: [] },
};

const graphStep: GraphStep = {
  family: 'graph',
  t: 'done',
  view: { vertices: {}, edges: {}, path: [], queue: [], stack: [] },
};

describe('isStepOfFamily', () => {
  it('recognises a step of its own family', () => {
    expect(isStepOfFamily('sorting', sortStep)).toBe(true);
    expect(isStepOfFamily('graph', graphStep)).toBe(true);
  });

  it('rejects a step of another family', () => {
    expect(isStepOfFamily('graph', sortStep)).toBe(false);
    expect(isStepOfFamily('sorting', graphStep)).toBe(false);
  });

  it('is sound even when two families share a discriminant', () => {
    // Both families use 'done'. The family tag is what disambiguates.
    const steps: AnyStep[] = [sortStep, graphStep];

    expect(steps.filter((s) => isStepOfFamily('graph', s))).toEqual([graphStep]);
    expect(steps.filter((s) => isStepOfFamily('sorting', s))).toEqual([sortStep]);
  });

  it('narrows the step type', () => {
    const step: AnyStep = sortStep;

    if (isStepOfFamily('sorting', step)) {
      // TypeScript knows this is a SortStep here.
      expect(step.t).toBe('compare');
      expect(step.view.comparing).toEqual([0, 1]);
    } else {
      throw new Error('expected a sorting step');
    }
  });
});

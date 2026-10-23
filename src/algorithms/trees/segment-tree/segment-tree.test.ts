import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  SEG_TYPES,
  buildSegmentTree,
  querySegmentTree,
  updateSegmentTree,
  type SegmentNode,
} from './segment-tree';

const drain = <T>(generator: Generator<unknown, T, undefined>): T => {
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value as T;
};

const naiveSum = (values: readonly number[], from: number, to: number) =>
  values.slice(from, to + 1).reduce((total, value) => total + value, 0);

describe('buildSegmentTree', () => {
  it('builds a tree over an array', () => {
    const root = drain(buildSegmentTree([1, 2, 3, 4], SEG_TYPES.SUM)) as SegmentNode;

    expect(root.l).toBe(0);
    expect(root.r).toBe(3);
    expect(root.val).toBe(10);
  });

  it('gives nothing for an empty array', () => {
    expect(drain(buildSegmentTree([], SEG_TYPES.SUM)) as SegmentNode | null).toBeNull();
  });

  it('carries the range of every node in the view', () => {
    const steps: { view: { ranges: Record<string, [number, number]> } }[] = [];
    const generator = buildSegmentTree([1, 2, 3, 4], SEG_TYPES.SUM);

    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    const last = steps[steps.length - 1];
    expect(Object.keys(last.view.ranges).length).toBe(7);
  });
});

describe('querySegmentTree', () => {
  it('answers a range query', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8];
    const root = drain(buildSegmentTree(values, SEG_TYPES.SUM)) as SegmentNode;

    const result = drain(querySegmentTree(root, SEG_TYPES.SUM, 2, 5)) as number;

    expect(result).toBe(naiveSum(values, 2, 5));
  });

  it('answers every range of a small array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 30 }), { minLength: 1, maxLength: 12 }),
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 0, max: 11 }),
        (values, from, to) => {
          const low = Math.min(from, to);
          const high = Math.max(from, to);

          const root = drain(buildSegmentTree(values, SEG_TYPES.SUM)) as SegmentNode;
          const result = drain(querySegmentTree(root, SEG_TYPES.SUM, low, high)) as number;

          expect(result).toBe(naiveSum(values, low, high));
        }
      ),
      { numRuns: 30 }
    );
  });

  it('answers a min query', () => {
    const values = [5, 2, 9, 1, 7];
    const root = drain(buildSegmentTree(values, SEG_TYPES.MIN)) as SegmentNode;

    const result = drain(querySegmentTree(root, SEG_TYPES.MIN, 1, 3)) as number;

    expect(result).toBe(Math.min(...values.slice(1, 4)));
  });

  it('answers a max query', () => {
    const values = [5, 2, 9, 1, 7];
    const root = drain(buildSegmentTree(values, SEG_TYPES.MAX)) as SegmentNode;

    const result = drain(querySegmentTree(root, SEG_TYPES.MAX, 0, 4)) as number;

    expect(result).toBe(9);
  });
});

describe('updateSegmentTree', () => {
  it('changes one element and recomputes the tree', () => {
    const values = [1, 2, 3, 4, 5];
    const root = drain(buildSegmentTree(values, SEG_TYPES.SUM)) as SegmentNode;

    const updated = drain(updateSegmentTree(root, SEG_TYPES.SUM, 2, 30)) as SegmentNode;

    expect(updated.val).toBe(42);
    expect(updated.left?.right?.val).toBe(30);
  });

  it('leaves the answers of other ranges alone', () => {
    const values = [1, 2, 3, 4, 5, 6];
    const root = drain(buildSegmentTree(values, SEG_TYPES.SUM)) as SegmentNode;

    drain(updateSegmentTree(root, SEG_TYPES.SUM, 0, 100));

    const result = drain(querySegmentTree(root, SEG_TYPES.SUM, 2, 4)) as number;
    expect(result).toBe(naiveSum(values, 2, 4));
  });

  it('refuses an index that is out of bounds', () => {
    const root = drain(buildSegmentTree([1, 2, 3], SEG_TYPES.SUM)) as SegmentNode;

    const updated = drain(updateSegmentTree(root, SEG_TYPES.SUM, 99, 5)) as SegmentNode;

    expect(updated.val).toBe(6);
  });
});

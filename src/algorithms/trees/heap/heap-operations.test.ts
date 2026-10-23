import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { heapDelete, heapInsert } from './heap-operations';

const drain = <T>(generator: Generator<unknown, T, undefined>): T => {
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value as T;
};

const isMaxHeap = (heap: readonly number[]): boolean => {
  for (let i = 1; i < heap.length; i++) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[parent] < heap[i]) return false;
  }
  return true;
};

const isMinHeap = (heap: readonly number[]): boolean => {
  for (let i = 1; i < heap.length; i++) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[parent] > heap[i]) return false;
  }
  return true;
};

describe('heapInsert', () => {
  it('inserts into an empty heap', () => {
    const result = drain(heapInsert([], 42, true)) as number[];
    expect(result).toEqual([42]);
  });

  it('keeps the max-heap property after every insert', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 60 }), { minLength: 1, maxLength: 20 }),
        (values) => {
          let heap: number[] = [];
          for (const value of values) {
            heap = drain(heapInsert(heap, value, true)) as number[];
            expect(isMaxHeap(heap)).toBe(true);
          }
        }
      ),
      { numRuns: 40 }
    );
  });

  it('keeps the min-heap property after every insert', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 60 }), { minLength: 1, maxLength: 20 }),
        (values) => {
          let heap: number[] = [];
          for (const value of values) {
            heap = drain(heapInsert(heap, value, false)) as number[];
            expect(isMinHeap(heap)).toBe(true);
          }
        }
      ),
      { numRuns: 40 }
    );
  });

  it('puts the largest value at the root of a max-heap', () => {
    let heap: number[] = [];
    for (const value of [5, 9, 3, 12, 7]) {
      heap = drain(heapInsert(heap, value, true)) as number[];
    }

    expect(heap[0]).toBe(12);
  });

  it('carries the whole heap in every step', () => {
    const steps: { view: { values: number[] } }[] = [];
    const generator = heapInsert([3, 7, 11], 5, true);

    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    for (const s of steps) {
      expect(s.view.values).toHaveLength(4);
    }
  });
});

describe('heapDelete', () => {
  it('takes the root out of a max-heap', () => {
    let heap: number[] = [];
    for (const value of [5, 9, 3, 12, 7]) {
      heap = drain(heapInsert(heap, value, true)) as number[];
    }

    const result = drain(heapDelete(heap, true)) as number[];

    expect(result).toHaveLength(4);
    expect(result).not.toContain(12);
    expect(isMaxHeap(result)).toBe(true);
  });

  it('takes the root out of a min-heap', () => {
    let heap: number[] = [];
    for (const value of [5, 9, 3, 12, 7]) {
      heap = drain(heapInsert(heap, value, false)) as number[];
    }

    const result = drain(heapDelete(heap, false)) as number[];

    expect(result).not.toContain(3);
    expect(isMinHeap(result)).toBe(true);
  });

  it('empties a heap of one element', () => {
    const result = drain(heapDelete([7], true)) as number[];
    expect(result).toEqual([]);
  });

  it('does nothing to an empty heap', () => {
    const result = drain(heapDelete([], true)) as number[];
    expect(result).toEqual([]);
  });

  it('keeps the heap property as it drains', () => {
    let heap: number[] = [];
    for (const value of [5, 9, 3, 12, 7, 1]) {
      heap = drain(heapInsert(heap, value, true)) as number[];
    }

    while (heap.length > 0) {
      heap = drain(heapDelete(heap, true)) as number[];
      expect(isMaxHeap(heap)).toBe(true);
    }

    expect(heap).toEqual([]);
  });
});

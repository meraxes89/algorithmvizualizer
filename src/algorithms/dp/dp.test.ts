import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { fibonacci, knapsack, longestCommonSubsequence } from './dp';

const drain = <T>(generator: Generator<unknown, T, undefined>): T => {
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value as T;
};

const naiveKnapsack = (items: readonly { value: number; weight: number }[], capacity: number) => {
  let best = 0;
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let value = 0;
    let weight = 0;
    for (let i = 0; i < items.length; i++) {
      if (mask & (1 << i)) {
        value += items[i].value;
        weight += items[i].weight;
      }
    }
    if (weight <= capacity) best = Math.max(best, value);
  }
  return best;
};

const naiveLcs = (a: string, b: string) => {
  const lengths: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0)
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      lengths[i][j] =
        a[i - 1] === b[j - 1]
          ? lengths[i - 1][j - 1] + 1
          : Math.max(lengths[i - 1][j], lengths[i][j - 1]);
    }
  }
  return lengths[a.length][b.length];
};

describe('knapsack', () => {
  it('fills the table', () => {
    const table = drain(
      knapsack(
        [
          { value: 60, weight: 10 },
          { value: 100, weight: 20 },
          { value: 120, weight: 30 },
        ],
        50
      )
    ) as number[][];

    expect(table[3][50]).toBe(220);
  });

  it('agrees with a brute-force search', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            value: fc.integer({ min: 1, max: 30 }),
            weight: fc.integer({ min: 1, max: 12 }),
          }),
          { minLength: 1, maxLength: 8 }
        ),
        fc.integer({ min: 1, max: 30 }),
        (items, capacity) => {
          const table = drain(knapsack(items, capacity)) as number[][];
          expect(table[items.length][capacity]).toBe(naiveKnapsack(items, capacity));
        }
      ),
      { numRuns: 30 }
    );
  });

  it('carries the table in every step', () => {
    const steps: { view: { table: number[][] } }[] = [];
    const generator = knapsack([{ value: 5, weight: 2 }], 3);

    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    expect(steps.length).toBeGreaterThan(0);
    for (const s of steps) {
      expect(s.view.table.length).toBe(2);
    }
  });
});

describe('longestCommonSubsequence', () => {
  it('finds the length of the common subsequence', () => {
    const table = drain(longestCommonSubsequence('ABCBDAB', 'BDCABA')) as number[][];

    expect(table[7][6]).toBe(4);
  });

  it('agrees with a brute-force search', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 8 }), fc.string({ maxLength: 8 }), (a, b) => {
        const table = drain(longestCommonSubsequence(a, b)) as number[][];
        expect(table[a.length][b.length]).toBe(naiveLcs(a, b));
      }),
      { numRuns: 30 }
    );
  });
});

describe('fibonacci', () => {
  it('computes the numbers', () => {
    const table = drain(fibonacci(10)) as number[][];

    expect(table[0][10]).toBe(55);
  });

  it('agrees with the recursive definition', () => {
    const naive = (n: number): number => (n < 2 ? n : naive(n - 1) + naive(n - 2));

    fc.assert(
      fc.property(fc.integer({ min: 0, max: 15 }), (n) => {
        const table = drain(fibonacci(n)) as number[][];
        expect(table[0][n]).toBe(naive(n));
      }),
      { numRuns: 20 }
    );
  });
});

import type { DPStep, DPView } from '@core/steps';

/** An item of the knapsack. */
export type KnapsackItem = {
  /** What the item is worth. */
  value: number;
  /** What the item weighs. */
  weight: number;
};

/**
 * Build a DP step.
 *
 * The helper keeps the object literal out of the ambiguous position
 * after `yield`.
 */
export const dpStep = (step: DPStep): DPStep => step;

/** A copy of the table, so every step carries the table as it was. */
const snapshot = (table: readonly (readonly number[])[]): number[][] =>
  table.map((row) => [...row]);

/**
 * The 0/1 knapsack problem.
 *
 * `table[i][w]` is the most value that can be carried using the first
 * `i` items and a capacity of `w`. Every cell either takes the item
 * or leaves it, and takes whichever of the two is worth more.
 */
export function* knapsack(
  items: readonly KnapsackItem[],
  capacity: number
): Generator<DPStep, number[][] | null, undefined> {
  const rows = items.length + 1;
  const cols = capacity + 1;
  const table: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  const view = (active: [number, number] | null): DPView => ({
    table: snapshot(table),
    active,
    items: items.map((item) => item.value),
    weights: items.map((item) => item.weight),
  });

  yield dpStep({
    family: 'dp',
    t: 'set-table',
    view: view(null),
  });

  for (let i = 0; i < rows; i++) {
    for (let w = 0; w < cols; w++) {
      if (i === 0 || w === 0) {
        table[i][w] = 0;
      } else {
        const item = items[i - 1];
        if (item.weight <= w) {
          table[i][w] = Math.max(item.value + table[i - 1][w - item.weight], table[i - 1][w]);
        } else {
          table[i][w] = table[i - 1][w];
        }
      }

      yield dpStep({
        family: 'dp',
        t: 'write',
        view: view([i, w]),
        row: i,
        col: w,
        value: table[i][w],
      });
    }
  }

  yield dpStep({
    family: 'dp',
    t: 'done',
    view: view(null),
  });

  return table;
}

/**
 * The longest common subsequence of two strings.
 *
 * `table[i][j]` is the length of the longest common subsequence of the
 * first `i` characters of one string and the first `j` of the other.
 */
export function* longestCommonSubsequence(
  first: string,
  second: string
): Generator<DPStep, number[][] | null, undefined> {
  const rows = first.length + 1;
  const cols = second.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  const view = (active: [number, number] | null): DPView => ({
    table: snapshot(table),
    active,
    items: [],
  });

  yield dpStep({
    family: 'dp',
    t: 'set-table',
    view: view(null),
  });

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i === 0 || j === 0) {
        table[i][j] = 0;
      } else if (first[i - 1] === second[j - 1]) {
        table[i][j] = 1 + table[i - 1][j - 1];
      } else {
        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
      }

      yield dpStep({
        family: 'dp',
        t: 'write',
        view: view([i, j]),
        row: i,
        col: j,
        value: table[i][j],
      });
    }
  }

  yield dpStep({
    family: 'dp',
    t: 'done',
    view: view(null),
  });

  return table;
}

/**
 * The Fibonacci numbers, computed bottom up.
 *
 * The table is a single row: `table[0][i]` is the `i`th Fibonacci
 * number.
 */
export function* fibonacci(n: number): Generator<DPStep, number[][] | null, undefined> {
  const table: number[][] = [Array<number>(Math.max(n, 0) + 1).fill(0)];

  const view = (active: [number, number] | null): DPView => ({
    table: snapshot(table),
    active,
    items: [],
  });

  yield dpStep({
    family: 'dp',
    t: 'set-table',
    view: view(null),
  });

  if (n >= 1) {
    table[0][1] = 1;
  }

  for (let i = 2; i <= n; i++) {
    table[0][i] = table[0][i - 1] + table[0][i - 2];

    yield dpStep({
      family: 'dp',
      t: 'write',
      view: view([0, i]),
      row: 0,
      col: i,
      value: table[0][i],
    });
  }

  yield dpStep({
    family: 'dp',
    t: 'done',
    view: view(null),
  });

  return table;
}

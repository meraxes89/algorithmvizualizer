import type { DPStep } from '@core/steps';
import { fibonacci, knapsack, longestCommonSubsequence } from './dp';

export { fibonacci, knapsack, longestCommonSubsequence } from './dp';
export type { KnapsackItem } from './dp';

/** One dynamic program, as the page knows it. */
export type DPAlgorithm = {
  /** Key into the algorithm metadata table. */
  id: string;
  /** Display name. */
  name: string;
  /**
   * The pure generator that produces the trace.
   *
   * What a generator returns is up to it — the knapsack hands back the
   * table it built — and the registry does not care.
   */
  generator: (options: DPOptions) => Generator<DPStep, unknown, undefined>;
};

/** What a dynamic program needs to run. */
export type DPOptions = {
  /** The items, for the knapsack. */
  items?: { value: number; weight: number }[];
  /** The capacity, for the knapsack. */
  capacity?: number;
  /** The two strings, for the longest common subsequence. */
  first?: string;
  second?: string;
  /** How many numbers, for Fibonacci. */
  count?: number;
};

/**
 * The dynamic programming family.
 *
 * The generator is given the options it needs and ignores the rest, so
 * the page can pass one options object to every algorithm.
 */
export const dpAlgorithms: readonly DPAlgorithm[] = [
  {
    id: 'knapsack',
    name: '0/1 Knapsack Problem',
    generator: (options) =>
      knapsack(options.items ?? [], options.capacity ?? 0) as Generator<DPStep, unknown, undefined>,
  },
  {
    id: 'lcs',
    name: 'Longest Common Subsequence (LCS)',
    generator: (options) =>
      longestCommonSubsequence(options.first ?? '', options.second ?? '') as Generator<
        DPStep,
        unknown,
        undefined
      >,
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci (bottom up)',
    generator: (options) => fibonacci(options.count ?? 0) as Generator<DPStep, unknown, undefined>,
  },
];

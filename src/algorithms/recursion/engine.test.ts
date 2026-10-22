import { describe, expect, it } from 'vitest';
import {
  runCombinationSumTrace,
  runFactorialTrace,
  runFibonacciTrace,
  runGenerateParenthesesTrace,
  runPermutationsTrace,
  runSubsetsTrace,
} from './engine';
import type { RecursionStep } from '@core/steps';

const trace = (generator: Generator<RecursionStep, void, undefined>) => [...generator];

/** The call stack must never grow without a matching return. */
function expectBalancedStack(steps: readonly RecursionStep[]): void {
  let depth = 0;

  for (const step of steps) {
    if (step.t === 'call') depth += 1;
    if (step.t === 'return' || step.t === 'base') depth -= 1;

    expect(depth).toBeGreaterThanOrEqual(0);
  }

  expect(depth).toBe(0);
}

describe('the recursion engine', () => {
  it('walks the factorial', () => {
    const steps = trace(runFactorialTrace(5));

    expect(steps[0].t).toBe('call');
    expect(steps.some((step) => step.t === 'base')).toBe(true);
    expectBalancedStack(steps);
  });

  it('records the call tree', () => {
    const steps = trace(runFactorialTrace(4));
    const last = steps[steps.length - 1];

    // A factorial of four makes four calls, one for each value down to
    // the base case.
    expect(Object.keys(last.view.nodes)).toHaveLength(4);

    // Every call but the first has a parent.
    const parents = Object.values(last.view.nodes).map((node) => node.parentId);
    expect(parents.filter((parent) => parent === null)).toHaveLength(1);
  });

  it('keeps the stack in step with the calls', () => {
    const steps = trace(runFactorialTrace(4));

    for (const step of steps) {
      if (step.t !== 'call') continue;

      // The stack holds every open frame, and the frame just called is
      // the deepest one.
      expect(step.view.stack).toHaveLength(step.frame.depth + 1);
      expect(step.view.stack[step.view.stack.length - 1].name).toBe(step.frame.name);
    }
  });

  it('walks the Fibonacci numbers', () => {
    const steps = trace(runFibonacciTrace(6));
    expectBalancedStack(steps);
  });

  it('finds the permutations', () => {
    const steps = trace(runPermutationsTrace([1, 2, 3]));
    expectBalancedStack(steps);
    expect(steps.some((step) => step.t === 'backtrack')).toBe(true);
  });

  it('finds the combinations that sum to a target', () => {
    const steps = trace(runCombinationSumTrace([1, 2, 3], 3));
    expectBalancedStack(steps);
  });

  it('generates the parenthesis pairs', () => {
    const steps = trace(runGenerateParenthesesTrace(3));
    expectBalancedStack(steps);
  });

  it('generates the subsets', () => {
    const steps = trace(runSubsetsTrace([1, 2]));
    expectBalancedStack(steps);
  });

  it('gives every step a whole-tree view', () => {
    const steps = trace(runFactorialTrace(3));

    for (const step of steps) {
      expect(step.view.nodes).toBeTypeOf('object');
      expect(step.family).toBe('recursion');
    }
  });
});

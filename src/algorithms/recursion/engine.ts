import type { RecursionNode, RecursionStep, RecursionView } from '@core/steps';

/**
 * Build a recursion step.
 *
 * The helper keeps the object literal out of the ambiguous position
 * after `yield`.
 */
export const recursionStep = (step: RecursionStep): RecursionStep => step;

// src/algorithms/recursion/engine.js
// Trace generator for Tree-based recursion algorithms.

let idCounter = 0;
const getId = () => `node-${idCounter++}`;

export function* runFactorialTrace(n: number): Generator<RecursionStep, void, undefined> {
  idCounter = 0;
  const nodes: Record<string, RecursionNode> = {};
  const stack: string[] = [];
  const results: unknown[] = [];

  const viewFor = (
    id: string,
    parentId: string | null,
    callArgs: string,
    depth: number
  ): RecursionView => {
    if (!nodes[id]) {
      nodes[id] = { id, parentId, callArgs, depth };
    }
    return {
      nodes: { ...nodes },
      stack: stack.map((name, index) => ({ name, depth: index })),
      active: id,
      output: [...results],
    };
  };

  function* recurse(
    val: number,
    depth: number,
    parentId: string | null
  ): Generator<RecursionStep, number, undefined> {
    const id = getId();
    const callArgs = `fact(${val})`;
    stack.push(callArgs);

    yield recursionStep({
      family: 'recursion',
      t: 'call',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Calling ${callArgs}`,
    });

    if (val <= 1) {
      yield recursionStep({
        family: 'recursion',
        t: 'base',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Base case reached: fact(${val}) = 1`,
      });
      stack.pop();
      return 1;
    }

    const childRes = yield* recurse(val - 1, depth + 1, id);
    const res = val * childRes;

    yield recursionStep({
      family: 'recursion',
      t: 'return',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Returning ${val} * ${childRes} = ${res}`,
    });

    stack.pop();
    return res;
  }

  yield* recurse(n, 0, null);
  return;
}

export function* runFibonacciTrace(n: number): Generator<RecursionStep, void, undefined> {
  idCounter = 0;
  const nodes: Record<string, RecursionNode> = {};
  const stack: string[] = [];
  const results: unknown[] = [];

  const viewFor = (
    id: string,
    parentId: string | null,
    callArgs: string,
    depth: number
  ): RecursionView => {
    if (!nodes[id]) {
      nodes[id] = { id, parentId, callArgs, depth };
    }
    return {
      nodes: { ...nodes },
      stack: stack.map((name, index) => ({ name, depth: index })),
      active: id,
      output: [...results],
    };
  };

  function* recurse(
    val: number,
    depth: number,
    parentId: string | null
  ): Generator<RecursionStep, number, undefined> {
    const id = getId();
    const callArgs = `fib(${val})`;
    stack.push(callArgs);

    yield recursionStep({
      family: 'recursion',
      t: 'call',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Calling ${callArgs}`,
    });

    if (val <= 1) {
      yield recursionStep({
        family: 'recursion',
        t: 'base',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Base case reached: fib(${val}) = ${val}`,
      });
      stack.pop();
      return val;
    }

    const left = yield* recurse(val - 1, depth + 1, id);
    const right = yield* recurse(val - 2, depth + 1, id);
    const res = left + right;

    yield recursionStep({
      family: 'recursion',
      t: 'return',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Returning ${left} + ${right} = ${res}`,
    });

    stack.pop();
    return res;
  }

  yield* recurse(n, 0, null);
  return;
}

export function* runPermutationsTrace(arr: number[]): Generator<RecursionStep, void, undefined> {
  idCounter = 0;
  const nodes: Record<string, RecursionNode> = {};
  const stack: string[] = [];
  const results: unknown[] = [];

  const viewFor = (
    id: string,
    parentId: string | null,
    callArgs: string,
    depth: number
  ): RecursionView => {
    if (!nodes[id]) {
      nodes[id] = { id, parentId, callArgs, depth };
    }
    return {
      nodes: { ...nodes },
      stack: stack.map((name, index) => ({ name, depth: index })),
      active: id,
      output: [...results],
    };
  };

  function* recurse(
    current: number[],
    depth: number,
    parentId: string | null
  ): Generator<RecursionStep, void, undefined> {
    const id = getId();
    const callArgs = `perm([${current.join(',')}])`;
    stack.push(callArgs);

    yield recursionStep({
      family: 'recursion',
      t: 'call',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Current permutation: [${current.join(', ')}]`,
    });

    if (current.length === arr.length) {
      results.push([...current]);
      yield recursionStep({
        family: 'recursion',
        t: 'base',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Found valid permutation!`,
      });
      stack.pop();
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      if (!current.includes(arr[i])) {
        current.push(arr[i]);
        yield* recurse(current, depth + 1, id);
        current.pop(); // backtrack

        yield recursionStep({
          family: 'recursion',
          t: 'backtrack',
          view: viewFor(id, parentId, callArgs, depth),
          frame: { name: callArgs, depth: depth },
          message: `Backtracking: removed ${arr[i]}`,
        });
      }
    }

    yield recursionStep({
      family: 'recursion',
      t: 'return',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `All branches explored for [${current.join(',')}]`,
    });
    stack.pop();
  }

  yield* recurse([], 0, null);
  return;
}

export function* runCombinationSumTrace(
  arr: number[],
  target: number
): Generator<RecursionStep, void, undefined> {
  idCounter = 0;
  const nodes: Record<string, RecursionNode> = {};
  const stack: string[] = [];
  const results: unknown[] = [];

  const viewFor = (
    id: string,
    parentId: string | null,
    callArgs: string,
    depth: number
  ): RecursionView => {
    if (!nodes[id]) {
      nodes[id] = { id, parentId, callArgs, depth };
    }
    return {
      nodes: { ...nodes },
      stack: stack.map((name, index) => ({ name, depth: index })),
      active: id,
      output: [...results],
    };
  };

  function* recurse(
    current: number[],
    currentSum: number,
    startIdx: number,
    depth: number,
    parentId: string | null
  ): Generator<RecursionStep, void, undefined> {
    const id = getId();
    const callArgs = `comb([${current.join(',')}], sum=${currentSum})`;
    stack.push(callArgs);

    yield recursionStep({
      family: 'recursion',
      t: 'call',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Current: [${current.join(', ')}], Sum: ${currentSum}`,
    });

    if (currentSum === target) {
      results.push([...current]);
      yield recursionStep({
        family: 'recursion',
        t: 'base',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Target ${target} reached!`,
      });
      stack.pop();
      return;
    }

    if (currentSum > target) {
      yield recursionStep({
        family: 'recursion',
        t: 'return',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Sum exceeded target (${currentSum} > ${target}). Returning.`,
      });
      stack.pop();
      return;
    }

    for (let i = startIdx; i < arr.length; i++) {
      current.push(arr[i]);
      yield* recurse(current, currentSum + arr[i], i, depth + 1, id);
      current.pop(); // backtrack

      yield recursionStep({
        family: 'recursion',
        t: 'backtrack',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Backtracking: removed ${arr[i]}`,
      });
    }

    yield recursionStep({
      family: 'recursion',
      t: 'return',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Explored all options from [${current.join(',')}]`,
    });
    stack.pop();
  }

  yield* recurse([], 0, 0, 0, null);
  return;
}

export function* runGenerateParenthesesTrace(n: number): Generator<RecursionStep, void, undefined> {
  idCounter = 0;
  const nodes: Record<string, RecursionNode> = {};
  const stack: string[] = [];
  const results: unknown[] = [];

  const viewFor = (
    id: string,
    parentId: string | null,
    callArgs: string,
    depth: number
  ): RecursionView => {
    if (!nodes[id]) {
      nodes[id] = { id, parentId, callArgs, depth };
    }
    return {
      nodes: { ...nodes },
      stack: stack.map((name, index) => ({ name, depth: index })),
      active: id,
      output: [...results],
    };
  };

  function* recurse(
    currentStr: string,
    openCount: number,
    closeCount: number,
    depth: number,
    parentId: string | null
  ): Generator<RecursionStep, void, undefined> {
    const id = getId();
    const callArgs = `gen("${currentStr}", o=${openCount}, c=${closeCount})`;
    stack.push(callArgs);

    yield recursionStep({
      family: 'recursion',
      t: 'call',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Str: "${currentStr}", Open: ${openCount}, Close: ${closeCount}`,
    });

    if (currentStr.length === n * 2) {
      results.push(currentStr);
      yield recursionStep({
        family: 'recursion',
        t: 'base',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Valid sequence generated!`,
      });
      stack.pop();
      return;
    }

    if (openCount < n) {
      yield* recurse(currentStr + '(', openCount + 1, closeCount, depth + 1, id);
      yield recursionStep({
        family: 'recursion',
        t: 'backtrack',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Backtracked from '(' branch`,
      });
    }

    if (closeCount < openCount) {
      yield* recurse(currentStr + ')', openCount, closeCount + 1, depth + 1, id);
      yield recursionStep({
        family: 'recursion',
        t: 'backtrack',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Backtracked from ')' branch`,
      });
    }

    yield recursionStep({
      family: 'recursion',
      t: 'return',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Finished branches for "${currentStr}"`,
    });
    stack.pop();
  }

  yield* recurse('', 0, 0, 0, null);
  return;
}

export function* runSubsetsTrace(arr: number[]): Generator<RecursionStep, void, undefined> {
  idCounter = 0;
  const nodes: Record<string, RecursionNode> = {};
  const stack: string[] = [];
  const results: unknown[] = [];

  const viewFor = (
    id: string,
    parentId: string | null,
    callArgs: string,
    depth: number
  ): RecursionView => {
    if (!nodes[id]) {
      nodes[id] = { id, parentId, callArgs, depth };
    }
    return {
      nodes: { ...nodes },
      stack: stack.map((name, index) => ({ name, depth: index })),
      active: id,
      output: [...results],
    };
  };

  function* recurse(
    current: number[],
    index: number,
    depth: number,
    parentId: string | null
  ): Generator<RecursionStep, void, undefined> {
    const id = getId();
    const callArgs = `sub([${current.join(',')}], idx=${index})`;
    stack.push(callArgs);

    yield recursionStep({
      family: 'recursion',
      t: 'call',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Subset so far: [${current.join(',')}], considering idx ${index}`,
    });

    if (index === arr.length) {
      results.push([...current]);
      yield recursionStep({
        family: 'recursion',
        t: 'base',
        view: viewFor(id, parentId, callArgs, depth),
        frame: { name: callArgs, depth: depth },
        message: `Reached end of array. Saving subset.`,
      });
      stack.pop();
      return;
    }

    // Branch 1: Include
    current.push(arr[index]);
    yield recursionStep({
      family: 'recursion',
      t: 'decide',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Decision: Include ${arr[index]}`,
    });
    yield* recurse(current, index + 1, depth + 1, id);
    current.pop(); // backtrack

    yield recursionStep({
      family: 'recursion',
      t: 'backtrack',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Backtracking: removed ${arr[index]}`,
    });

    // Branch 2: Exclude
    yield recursionStep({
      family: 'recursion',
      t: 'decide',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Decision: Exclude ${arr[index]}`,
    });
    yield* recurse(current, index + 1, depth + 1, id);

    yield recursionStep({
      family: 'recursion',
      t: 'return',
      view: viewFor(id, parentId, callArgs, depth),
      frame: { name: callArgs, depth: depth },
      message: `Done exploring both include/exclude for idx ${index}`,
    });
    stack.pop();
  }

  yield* recurse([], 0, 0, null);
  return;
}

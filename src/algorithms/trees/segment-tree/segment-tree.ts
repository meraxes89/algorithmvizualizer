import type { TreeStep } from '@core/steps';
import { TreeTrace, treeStep } from '../tree';

/** A node of a segment tree: a range of the array, and its value. */
export type SegmentNode = {
  id: number;
  /** The first index of the range this node covers. */
  l: number;
  /** The last index of the range this node covers. */
  r: number;
  /** The combined value of the range, or null while it is being built. */
  val: number | null;
  left: SegmentNode | null;
  right: SegmentNode | null;
};

/** The kinds of segment tree. */
export const SEG_TYPES = {
  SUM: 'sum',
  MIN: 'min',
  MAX: 'max',
} as const;

export type SegType = (typeof SEG_TYPES)[keyof typeof SEG_TYPES];

type SegConfig = {
  /** The value a range that contributes nothing combines to. */
  initial: number;
  combine: (a: number, b: number) => number;
  label: string;
};

const getConfig = (type: SegType): SegConfig => {
  switch (type) {
    case SEG_TYPES.MIN:
      return { initial: Infinity, combine: Math.min, label: 'Min' };
    case SEG_TYPES.MAX:
      return { initial: -Infinity, combine: Math.max, label: 'Max' };
    default:
      return { initial: 0, combine: (a, b) => a + b, label: 'Sum' };
  }
};

let nextId = 1;
const freshId = (): number => nextId++;

/** Start the ids over, so a rebuilt tree starts from one. */
export const resetSegmentTreeIdCounter = (): void => {
  nextId = 1;
};

/* ------------------------------------------------------------------ */
/*  Build                                                             */
/* ------------------------------------------------------------------ */

/**
 * Build a segment tree over an array.
 *
 * The tree is built bottom up: a leaf covers one element, and every
 * other node covers the union of its two children.
 */
export function* buildSegmentTree(
  values: readonly number[],
  type: SegType
): Generator<TreeStep, SegmentNode | null, undefined> {
  if (values.length === 0) {
    return null;
  }

  resetSegmentTreeIdCounter();

  const trace = new TreeTrace();
  const { combine, label } = getConfig(type);

  trace.say({
    type: 'start',
    text: `Building ${label} Segment Tree for array of size ${values.length}…`,
  });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(null),
    entry: trace.log[0],
  });

  function* build(l: number, r: number): Generator<TreeStep, SegmentNode, undefined> {
    const node: SegmentNode = {
      id: freshId(),
      l,
      r,
      val: null,
      left: null,
      right: null,
    };

    trace.ranges[node.id] = [l, r];

    if (l === r) {
      node.val = values[l];
      trace.say({
        type: 'success',
        text: `Created leaf node [${l}] with value ${node.val}`,
      });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(node),
        entry: trace.log[trace.log.length - 1],
      });
      return node;
    }

    const mid = Math.floor((l + r) / 2);
    node.left = yield* build(l, mid);
    node.right = yield* build(mid + 1, r);

    node.val = combine(node.left.val as number, node.right.val as number);

    trace.active = node.id;
    trace.say({
      type: 'info',
      text: `Combined range [${l}-${mid}] and [${mid + 1}-${r}] → [${l}-${r}] = ${node.val}`,
    });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(node),
      entry: trace.log[trace.log.length - 1],
    });
    yield treeStep({
      family: 'trees',
      t: 'active',
      view: trace.view(node),
      node: node.id,
    });

    return node;
  }

  const root = yield* build(0, values.length - 1);

  trace.active = null;
  trace.say({
    type: 'success',
    text: `Tree build complete. Root [0-${values.length - 1}] = ${root.val}`,
  });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  return root;
}

/* ------------------------------------------------------------------ */
/*  Query                                                             */
/* ------------------------------------------------------------------ */

/**
 * Query a range of the array.
 *
 * A node that does not overlap the range contributes nothing, a node
 * that is entirely inside it contributes its value, and a node that
 * straddles the range splits the query between its two children.
 */
export function* querySegmentTree(
  root: SegmentNode | null,
  type: SegType,
  queryLeft: number,
  queryRight: number
): Generator<TreeStep, number | null, undefined> {
  if (!root) {
    return null;
  }

  const { initial, combine } = getConfig(type);
  const trace = new TreeTrace();

  trace.say({ type: 'start', text: `Querying range [${queryLeft}-${queryRight}]…` });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  function* query(node: SegmentNode): Generator<TreeStep, number, undefined> {
    trace.active = node.id;
    trace.visited.push(node.id);
    yield treeStep({
      family: 'trees',
      t: 'active',
      view: trace.view(root),
      node: node.id,
    });

    // No overlap.
    if (queryLeft > node.r || queryRight < node.l) {
      trace.say({
        type: 'error',
        text: `Node [${node.l}-${node.r}] is outside query range. Returning ${initial}.`,
      });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      return initial;
    }

    // Full overlap.
    if (queryLeft <= node.l && node.r <= queryRight) {
      trace.say({
        type: 'success',
        text: `Node [${node.l}-${node.r}] is fully inside. Returning ${node.val}.`,
      });
      trace.contributing.push(node.id);
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      return node.val as number;
    }

    // Partial overlap: split the query.
    trace.say({
      type: 'info',
      text: `Node [${node.l}-${node.r}] partially overlaps. Splitting query.`,
    });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });

    const leftAnswer = yield* query(node.left as SegmentNode);

    trace.active = node.id;
    yield treeStep({
      family: 'trees',
      t: 'active',
      view: trace.view(root),
      node: node.id,
    });

    const rightAnswer = yield* query(node.right as SegmentNode);

    trace.active = node.id;
    const combined = combine(leftAnswer, rightAnswer);
    trace.say({
      type: 'compare',
      text: `Combined left (${leftAnswer}) and right (${rightAnswer}) for [${node.l}-${node.r}] = ${combined}`,
    });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });

    return combined;
  }

  const result = yield* query(root);

  trace.active = null;
  trace.say({
    type: 'success',
    text: `Query complete! Result for [${queryLeft}-${queryRight}] is ${result}.`,
  });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  return result;
}

/* ------------------------------------------------------------------ */
/*  Point update                                                      */
/* ------------------------------------------------------------------ */

/**
 * Change one element of the array.
 *
 * The new value goes to the leaf that covers it, and then propagates up
 * the tree, combining the value again at every level.
 */
export function* updateSegmentTree(
  root: SegmentNode | null,
  type: SegType,
  index: number,
  newValue: number
): Generator<TreeStep, SegmentNode | null, undefined> {
  if (!root || index < root.l || index > root.r) {
    return root;
  }

  const { combine } = getConfig(type);
  const trace = new TreeTrace();

  trace.say({ type: 'start', text: `Updating index ${index} to ${newValue}…` });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  function* update(node: SegmentNode): Generator<TreeStep, void, undefined> {
    trace.active = node.id;
    trace.visited.push(node.id);
    yield treeStep({
      family: 'trees',
      t: 'active',
      view: trace.view(root),
      node: node.id,
    });

    if (node.l === node.r) {
      trace.say({
        type: 'success',
        text: `Found leaf [${node.l}]. Changing ${node.val} → ${newValue}.`,
      });
      node.val = newValue;
      trace.propagating.push(node.id);
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      return;
    }

    const mid = Math.floor((node.l + node.r) / 2);

    if (index <= mid) {
      yield* update(node.left as SegmentNode);
    } else {
      yield* update(node.right as SegmentNode);
    }

    node.val = combine(node.left?.val ?? 0, node.right?.val ?? 0);

    trace.propagating.push(node.id);
    trace.say({
      type: 'info',
      text: `Recomputed node [${node.l}-${node.r}] = ${node.val}`,
    });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });
  }

  yield* update(root);

  trace.active = null;
  trace.say({
    type: 'success',
    text: `Update complete. Root [${root.l}-${root.r}] = ${root.val}`,
  });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  return root;
}

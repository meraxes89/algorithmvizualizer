import type { TreeStep } from '@core/steps';
import { TreeTrace, treeStep, type TreeNode } from '../tree';

/* ------------------------------------------------------------------ */
/*  AVL node helpers                                                  */
/* ------------------------------------------------------------------ */

/** The height of a subtree. */
export const nodeHeight = (node: TreeNode | null): number => node?.height ?? 0;

/** How much taller the left side is than the right. */
export const balanceFactor = (node: TreeNode | null): number =>
  node ? nodeHeight(node.left) - nodeHeight(node.right) : 0;

/** Recompute the height of a node from its children. */
export const updateHeight = (node: TreeNode | null): void => {
  if (node) {
    node.height = 1 + Math.max(nodeHeight(node.left), nodeHeight(node.right));
  }
};

/** The leftmost node of a subtree. */
export const minNode = (node: TreeNode | null): TreeNode | null => {
  let current = node;
  while (current && current.left) {
    current = current.left;
  }
  return current;
};

/* ------------------------------------------------------------------ */
/*  Rotations                                                         */
/* ------------------------------------------------------------------ */

/** Rotate a subtree to the right, and return its new root. */
export const rightRotate = (y: TreeNode): TreeNode => {
  const x = y.left as TreeNode;
  const middle = x.right;

  x.right = y;
  y.left = middle;

  updateHeight(y);
  updateHeight(x);

  return x;
};

/** Rotate a subtree to the left, and return its new root. */
export const leftRotate = (x: TreeNode): TreeNode => {
  const y = x.right as TreeNode;
  const middle = y.left;

  y.left = x;
  x.right = middle;

  updateHeight(x);
  updateHeight(y);

  return y;
};

/* ------------------------------------------------------------------ */
/*  AVL Insert                                                        */
/* ------------------------------------------------------------------ */

/**
 * Insert a value into an AVL tree.
 *
 * The tree is mutated in place and the new root is returned. Every
 * imbalance is logged and rotated, and the nodes taking part in a
 * rotation are marked so the visualisation can show which ones moved.
 */
export function* avlInsert(
  root: TreeNode | null,
  val: number
): Generator<TreeStep, TreeNode | null, undefined> {
  const trace = new TreeTrace();

  trace.say({ type: 'start', text: `Inserting ${val} into AVL tree…` });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  function* insert(node: TreeNode | null): Generator<TreeStep, TreeNode | null, undefined> {
    // The base case: a new leaf.
    if (!node) {
      const newNode: TreeNode = { id: freshId(), val, left: null, right: null, height: 1 };
      trace.say({ type: 'success', text: `Created new node ${val}.` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      return newNode;
    }

    trace.active = node.id;
    yield treeStep({
      family: 'trees',
      t: 'active',
      view: trace.view(root),
      node: node.id,
    });

    trace.visit(node);
    yield treeStep({
      family: 'trees',
      t: 'visit',
      view: trace.view(root),
      node: node.id,
    });

    if (val < node.val) {
      trace.say({ type: 'compare', text: `${val} < ${node.val}  →  go left` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      node.left = yield* insert(node.left);
    } else if (val > node.val) {
      trace.say({ type: 'compare', text: `${val} > ${node.val}  →  go right` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      node.right = yield* insert(node.right);
    } else {
      trace.say({ type: 'warn', text: `${val} already exists. Skipping.` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      return node;
    }

    updateHeight(node);
    const factor = balanceFactor(node);

    trace.say({
      type: 'info',
      text: `Node ${node.val}: height=${node.height}, BF=${factor}`,
    });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });

    if (factor > 1 || factor < -1) {
      trace.say({
        type: 'warn',
        text: `⚠ Imbalance at node ${node.val} (BF=${factor}). Rotation needed!`,
      });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });

      trace.active = node.id;
      trace.rotating = [node.id];
      yield treeStep({
        family: 'trees',
        t: 'active',
        view: trace.view(root),
        node: node.id,
      });

      const left = node.left;
      const right = node.right;

      // Left-left: one right rotation.
      if (factor > 1 && left && val < left.val) {
        trace.say({ type: 'rotation', text: `LL Case → Right Rotate at ${node.val}` });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [node.id, left.id];
        yield treeStep({
          family: 'trees',
          t: 'active',
          view: trace.view(root),
          node: node.id,
        });

        const result = rightRotate(node);
        trace.say({
          type: 'success',
          text: `Right rotation complete. New subtree root: ${result.val}`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [];
        return result;
      }

      // Right-right: one left rotation.
      if (factor < -1 && right && val > right.val) {
        trace.say({ type: 'rotation', text: `RR Case → Left Rotate at ${node.val}` });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [node.id, right.id];
        yield treeStep({
          family: 'trees',
          t: 'active',
          view: trace.view(root),
          node: node.id,
        });

        const result = leftRotate(node);
        trace.say({
          type: 'success',
          text: `Left rotation complete. New subtree root: ${result.val}`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [];
        return result;
      }

      // Left-right: a left rotation, then a right rotation.
      if (factor > 1 && left) {
        trace.say({
          type: 'rotation',
          text: `LR Case → Left Rotate at ${left.val}, then Right Rotate at ${node.val}`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [node.id, left.id];
        yield treeStep({
          family: 'trees',
          t: 'active',
          view: trace.view(root),
          node: node.id,
        });

        node.left = leftRotate(left);
        trace.say({ type: 'info', text: `Left rotation at ${left.val} done.` });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        const result = rightRotate(node);
        trace.say({
          type: 'success',
          text: `Right rotation complete. New subtree root: ${result.val}`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [];
        return result;
      }

      // Right-left: a right rotation, then a left rotation.
      if (factor < -1 && right) {
        trace.say({
          type: 'rotation',
          text: `RL Case → Right Rotate at ${right.val}, then Left Rotate at ${node.val}`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [node.id, right.id];
        yield treeStep({
          family: 'trees',
          t: 'active',
          view: trace.view(root),
          node: node.id,
        });

        node.right = rightRotate(right);
        trace.say({ type: 'info', text: `Right rotation at ${right.val} done.` });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        const result = leftRotate(node);
        trace.say({
          type: 'success',
          text: `Left rotation complete. New subtree root: ${result.val}`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [];
        return result;
      }

      trace.rotating = [];
    }

    return node;
  }

  const newRoot = yield* insert(root);
  trace.active = null;
  return newRoot;
}

/* ------------------------------------------------------------------ */
/*  The id counter                                                    */
/* ------------------------------------------------------------------ */

let nextId = 1;

/** A fresh node id. */
export const freshId = (): number => nextId++;

/** Start the ids over, so a regenerated tree starts from one. */
export const resetIdCounter = (): void => {
  nextId = 1;
};

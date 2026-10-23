import type { TreeStep } from '@core/steps';
import { TreeTrace, treeStep, type TreeNode } from '../tree';
import { balanceFactor, leftRotate, minNode, rightRotate, updateHeight } from './avl-insert';

/* ------------------------------------------------------------------ */
/*  AVL Search                                                        */
/* ------------------------------------------------------------------ */

/**
 * Look for a value in an AVL tree.
 *
 * An AVL tree is a binary search tree with a balance invariant, so the
 * search itself is the same walk — but the trace also shows the height
 * and the balance factor of every node it visits, which is what makes
 * an AVL tree worth looking at.
 */
export function* avlSearch(
  root: TreeNode | null,
  val: number
): Generator<TreeStep, TreeNode | null, undefined> {
  const trace = new TreeTrace();

  if (!root) {
    trace.say({ type: 'warn', text: 'Tree is empty. Nothing to search.' });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(null),
      entry: trace.log[0],
    });
    return null;
  }

  trace.say({ type: 'start', text: `Searching for ${val}…` });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  let current: TreeNode | null = root;

  while (current) {
    trace.active = current.id;
    yield treeStep({
      family: 'trees',
      t: 'active',
      view: trace.view(root),
      node: current.id,
    });

    trace.say({
      type: 'info',
      text: `At node ${current.val} (h=${current.height}, BF=${balanceFactor(current)})`,
    });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });

    if (val === current.val) {
      trace.say({ type: 'success', text: `Found ${val}!` });
      trace.mark(current, 'found');
      trace.visit(current);
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      yield treeStep({
        family: 'trees',
        t: 'mark',
        view: trace.view(root),
        node: current.id,
        state: 'found',
      });
      trace.active = null;
      return current;
    }

    if (val < current.val) {
      trace.say({ type: 'compare', text: `${val} < ${current.val}  →  go left` });
    } else {
      trace.say({ type: 'compare', text: `${val} > ${current.val}  →  go right` });
    }
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });

    trace.visit(current);
    yield treeStep({
      family: 'trees',
      t: 'visit',
      view: trace.view(root),
      node: current.id,
    });

    current = val < current.val ? current.left : current.right;
  }

  trace.say({ type: 'error', text: `Value ${val} not found in the AVL tree.` });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  trace.active = null;
  return null;
}

/* ------------------------------------------------------------------ */
/*  AVL Delete                                                        */
/* ------------------------------------------------------------------ */

/**
 * Remove a value from an AVL tree.
 *
 * The node is removed the way it is in a binary search tree, and then
 * the tree is rebalanced on the way back up, so the height stays
 * logarithmic.
 */
export function* avlDelete(
  root: TreeNode | null,
  val: number
): Generator<TreeStep, TreeNode | null, undefined> {
  const trace = new TreeTrace();

  if (!root) {
    trace.say({ type: 'warn', text: 'Tree is empty. Nothing to delete.' });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(null),
      entry: trace.log[0],
    });
    return null;
  }

  trace.say({ type: 'start', text: `Deleting ${val} from AVL tree…` });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  function* remove(
    node: TreeNode | null,
    value: number
  ): Generator<TreeStep, TreeNode | null, undefined> {
    if (!node) {
      trace.say({ type: 'error', text: `Value ${value} not found.` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      return null;
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

    if (value < node.val) {
      trace.say({ type: 'compare', text: `${value} < ${node.val}  →  go left` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      node.left = yield* remove(node.left, value);
    } else if (value > node.val) {
      trace.say({ type: 'compare', text: `${value} > ${node.val}  →  go right` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      node.right = yield* remove(node.right, value);
    } else {
      // This is the node to remove.
      trace.mark(node, 'deleting');
      yield treeStep({
        family: 'trees',
        t: 'mark',
        view: trace.view(root),
        node: node.id,
        state: 'deleting',
      });

      // A leaf.
      if (!node.left && !node.right) {
        trace.say({ type: 'info', text: `Leaf node ${value} removed.` });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });
        return null;
      }

      // One child.
      if (!node.left) {
        trace.say({
          type: 'info',
          text: `Node ${value} has right child only → replace with ${node.right?.val}.`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });
        return node.right;
      }
      if (!node.right) {
        trace.say({
          type: 'info',
          text: `Node ${value} has left child only → replace with ${node.left?.val}.`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });
        return node.left;
      }

      // Two children: take the in-order successor's value, then delete
      // the successor itself.
      const successor = minNode(node.right) as TreeNode;
      trace.say({
        type: 'info',
        text: `Two children. Inorder successor is ${successor.val}.`,
      });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });

      node.val = successor.val;
      trace.say({
        type: 'info',
        text: `Replaced ${value} with ${successor.val}. Now deleting successor…`,
      });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });

      node.right = yield* remove(node.right, successor.val);
    }

    if (!node) return null;

    // Recompute the height and rebalance.
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
      if (factor > 1 && left && balanceFactor(left) >= 0) {
        trace.say({ type: 'rotation', text: `LL Case → Right Rotate at ${node.val}` });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [node.id, left.id];
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
        node.left = leftRotate(left);
        const result = rightRotate(node);
        trace.say({
          type: 'success',
          text: `Double rotation complete. New subtree root: ${result.val}`,
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
      if (factor < -1 && right && balanceFactor(right) <= 0) {
        trace.say({ type: 'rotation', text: `RR Case → Left Rotate at ${node.val}` });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });

        trace.rotating = [node.id, right.id];
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
        node.right = rightRotate(right);
        const result = leftRotate(node);
        trace.say({
          type: 'success',
          text: `Double rotation complete. New subtree root: ${result.val}`,
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

  const newRoot = yield* remove(root, val);

  trace.active = null;
  trace.rotating = [];
  return newRoot;
}

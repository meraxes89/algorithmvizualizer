import type { TreeStep } from '@core/steps';
import { TreeTrace, treeStep, type TreeNode } from '../tree';

/**
 * The three depth-first traversals, and the breadth-first one.
 *
 * All four walk the same tree and differ only in when they visit a node:
 * pre-order visits it before its children, in-order between them, and
 * post-order after them. The trace makes the difference visible, because
 * the visit order is in it.
 */

/** Pre-order: node, then left subtree, then right subtree. */
export function* preOrderTraversal(root: TreeNode | null): Generator<TreeStep, void, undefined> {
  const trace = new TreeTrace();

  function* walk(node: TreeNode | null): Generator<TreeStep, void, undefined> {
    if (!node) return;

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

    yield* walk(node.left);
    yield* walk(node.right);
  }

  yield* walk(root);
}

/** In-order: left subtree, node, right subtree. */
export function* inOrderTraversal(root: TreeNode | null): Generator<TreeStep, void, undefined> {
  const trace = new TreeTrace();

  function* walk(node: TreeNode | null): Generator<TreeStep, void, undefined> {
    if (!node) return;

    yield* walk(node.left);

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

    yield* walk(node.right);
  }

  yield* walk(root);
}

/** Post-order: left subtree, right subtree, then the node. */
export function* postOrderTraversal(root: TreeNode | null): Generator<TreeStep, void, undefined> {
  const trace = new TreeTrace();

  function* walk(node: TreeNode | null): Generator<TreeStep, void, undefined> {
    if (!node) return;

    yield* walk(node.left);
    yield* walk(node.right);

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
  }

  yield* walk(root);
}

/** Level-order: one level at a time, left to right. */
export function* levelOrderTraversal(root: TreeNode | null): Generator<TreeStep, void, undefined> {
  const trace = new TreeTrace();

  if (!root) return;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const current = queue.shift() as TreeNode;

    trace.active = current.id;
    yield treeStep({
      family: 'trees',
      t: 'active',
      view: trace.view(root),
      node: current.id,
    });

    trace.visit(current);
    yield treeStep({
      family: 'trees',
      t: 'visit',
      view: trace.view(root),
      node: current.id,
    });

    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }
}

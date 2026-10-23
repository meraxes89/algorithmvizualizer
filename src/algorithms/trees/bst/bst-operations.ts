import type { TreeStep } from '@core/steps';
import { TreeTrace, treeStep, type TreeNode } from '../tree';

/* ------------------------------------------------------------------ */
/*  BST Insert                                                        */
/* ------------------------------------------------------------------ */

/**
 * Insert a value into a binary search tree.
 *
 * The tree is mutated in place and the new root is returned, so the
 * caller can keep the tree it already has.
 */
export function* bstInsert(
  root: TreeNode | null,
  val: number
): Generator<TreeStep, TreeNode | null, undefined> {
  const trace = new TreeTrace();

  if (!root) {
    const newNode: TreeNode = { id: freshId(), val, left: null, right: null };
    trace.say({ type: 'info', text: `Tree is empty. Created root node with value ${val}.` });
    yield treeStep({ family: 'trees', t: 'log', view: trace.view(newNode), entry: trace.log[0] });
    trace.mark(newNode, 'found');
    yield treeStep({
      family: 'trees',
      t: 'mark',
      view: trace.view(newNode),
      node: newNode.id,
      state: 'found',
    });
    return newNode;
  }

  trace.say({ type: 'start', text: `Inserting ${val} into BST…` });
  yield treeStep({ family: 'trees', t: 'log', view: trace.view(root), entry: trace.log[0] });

  let current = root;

  for (;;) {
    trace.active = current.id;
    yield treeStep({ family: 'trees', t: 'active', view: trace.view(root), node: current.id });

    if (val === current.val) {
      trace.say({ type: 'warn', text: `Value ${val} already exists. Skipping insert.` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      trace.visit(current);
      yield treeStep({ family: 'trees', t: 'visit', view: trace.view(root), node: current.id });
      break;
    }

    if (val < current.val) {
      trace.say({ type: 'compare', text: `${val} < ${current.val}  →  go left` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      trace.visit(current);
      yield treeStep({ family: 'trees', t: 'visit', view: trace.view(root), node: current.id });

      if (!current.left) {
        const newNode: TreeNode = { id: freshId(), val, left: null, right: null };
        current.left = newNode;
        trace.say({
          type: 'success',
          text: `Inserted ${val} as left child of ${current.val}.`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });
        trace.active = newNode.id;
        yield treeStep({ family: 'trees', t: 'active', view: trace.view(root), node: newNode.id });
        break;
      }

      current = current.left;
    } else {
      trace.say({ type: 'compare', text: `${val} > ${current.val}  →  go right` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      trace.visit(current);
      yield treeStep({ family: 'trees', t: 'visit', view: trace.view(root), node: current.id });

      if (!current.right) {
        const newNode: TreeNode = { id: freshId(), val, left: null, right: null };
        current.right = newNode;
        trace.say({
          type: 'success',
          text: `Inserted ${val} as right child of ${current.val}.`,
        });
        yield treeStep({
          family: 'trees',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });
        trace.active = newNode.id;
        yield treeStep({ family: 'trees', t: 'active', view: trace.view(root), node: newNode.id });
        break;
      }

      current = current.right;
    }
  }

  trace.active = null;
  return root;
}

/* ------------------------------------------------------------------ */
/*  BST Search                                                        */
/* ------------------------------------------------------------------ */

/**
 * Look for a value in a binary search tree.
 *
 * The trace says which way the search went at every node, so the
 * reason it found (or missed) the value is visible.
 */
export function* bstSearch(
  root: TreeNode | null,
  val: number
): Generator<TreeStep, TreeNode | null, undefined> {
  const trace = new TreeTrace();

  if (!root) {
    trace.say({ type: 'info', text: 'Tree is empty.' });
    yield treeStep({ family: 'trees', t: 'log', view: trace.view(null), entry: trace.log[0] });
    return null;
  }

  trace.say({ type: 'start', text: `Searching for ${val} in BST…` });
  yield treeStep({ family: 'trees', t: 'log', view: trace.view(root), entry: trace.log[0] });

  let current: TreeNode | null = root;
  let found: TreeNode | null = null;

  while (current) {
    trace.active = current.id;
    yield treeStep({ family: 'trees', t: 'active', view: trace.view(root), node: current.id });
    trace.visit(current);
    yield treeStep({ family: 'trees', t: 'visit', view: trace.view(root), node: current.id });

    if (val === current.val) {
      found = current;
      trace.say({ type: 'success', text: `Found ${val}.` });
      yield treeStep({
        family: 'trees',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      trace.mark(current, 'found');
      yield treeStep({
        family: 'trees',
        t: 'mark',
        view: trace.view(root),
        node: current.id,
        state: 'found',
      });
      break;
    }

    const goLeft: boolean = val < current.val;
    trace.say({
      type: 'compare',
      text: goLeft ? `${val} < ${current.val}  →  go left` : `${val} > ${current.val}  →  go right`,
    });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });

    current = goLeft ? current.left : current.right;
  }

  if (!found) {
    trace.say({ type: 'warn', text: `${val} is not in the tree.` });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });
  }

  trace.active = null;
  return found;
}

/* ------------------------------------------------------------------ */
/*  BST Delete                                                        */
/* ------------------------------------------------------------------ */

/**
 * Remove a value from a binary search tree.
 *
 * The three cases are the classic ones: a leaf disappears, a node with
 * one child is replaced by that child, and a node with two children is
 * replaced by its in-order successor.
 */
export function* bstDelete(
  root: TreeNode | null,
  val: number
): Generator<TreeStep, TreeNode | null, undefined> {
  const trace = new TreeTrace();

  if (!root) {
    trace.say({ type: 'info', text: 'Tree is empty.' });
    yield treeStep({ family: 'trees', t: 'log', view: trace.view(null), entry: trace.log[0] });
    return null;
  }

  trace.say({ type: 'start', text: `Deleting ${val} from BST…` });
  yield treeStep({ family: 'trees', t: 'log', view: trace.view(root), entry: trace.log[0] });

  // Find the node to remove, remembering how to get back to it.
  let parent: TreeNode | null = null;
  let current: TreeNode | null = root;
  let isLeftChild = false;

  while (current && current.val !== val) {
    trace.active = current.id;
    yield treeStep({ family: 'trees', t: 'active', view: trace.view(root), node: current.id });
    trace.visit(current);
    yield treeStep({ family: 'trees', t: 'visit', view: trace.view(root), node: current.id });

    parent = current;
    isLeftChild = val < current.val;
    current = isLeftChild ? current.left : current.right;
  }

  if (!current) {
    trace.say({ type: 'warn', text: `${val} is not in the tree.` });
    yield treeStep({
      family: 'trees',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });
    trace.active = null;
    return root;
  }

  trace.active = current.id;
  yield treeStep({ family: 'trees', t: 'active', view: trace.view(root), node: current.id });
  trace.visit(current);
  yield treeStep({ family: 'trees', t: 'visit', view: trace.view(root), node: current.id });

  const replacement = ((): { node: TreeNode | null; rootChanged: boolean } => {
    // A leaf, or a node with at most one child.
    if (!current!.left || !current!.right) {
      const child = current!.left ?? current!.right;
      if (!parent) {
        return { node: child, rootChanged: true };
      }
      if (isLeftChild) {
        parent.left = child;
      } else {
        parent.right = child;
      }
      return { node: root, rootChanged: false };
    }

    // Two children: replace it with its in-order successor.
    let successorParent = current!;
    let successor = current!.right!;

    while (successor.left) {
      successorParent = successor;
      successor = successor.left;
    }

    if (successorParent === current) {
      // The successor is the right child itself, so it keeps its own
      // right subtree. Assigning `successor.right = current.right` here
      // would point the successor at itself.
      successor.left = current!.left;
    } else {
      successorParent.left = successor.right;
      successor.right = current!.right;
      successor.left = current!.left;
    }

    if (!parent) {
      return { node: successor, rootChanged: true };
    }

    if (isLeftChild) {
      parent.left = successor;
    } else {
      parent.right = successor;
    }
    return { node: root, rootChanged: false };
  })();

  trace.say({ type: 'success', text: `Deleted ${val}.` });
  yield treeStep({
    family: 'trees',
    t: 'log',
    view: trace.view(replacement.node),
    entry: trace.log[trace.log.length - 1],
  });

  trace.active = null;
  return replacement.node;
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

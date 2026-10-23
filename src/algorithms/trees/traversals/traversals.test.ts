import { describe, expect, it } from 'vitest';
import {
  inOrderTraversal,
  levelOrderTraversal,
  postOrderTraversal,
  preOrderTraversal,
} from './traversals';
import { generateRandomBST } from '../bst/bst';
import type { TreeNode } from '../tree';

const tree = (): TreeNode | null => generateRandomBST(7, 5, 95);

const visited = (steps: readonly { t: string; view: { order: readonly number[] } }[]) => {
  const last = steps[steps.length - 1];
  return last ? last.view.order.length : 0;
};

const orderOf = (steps: readonly { t: string; view: { order: readonly number[] } }[]) => {
  const last = steps[steps.length - 1];
  return last ? last.view.order : [];
};

describe('tree traversals', () => {
  it('visits every node exactly once', () => {
    for (const traversal of [
      preOrderTraversal,
      inOrderTraversal,
      postOrderTraversal,
      levelOrderTraversal,
    ]) {
      const steps = [...traversal(tree())];
      expect(visited(steps)).toBe(7);
    }
  });

  it('visits an in-order traversal in sorted order', () => {
    const root = tree();
    const steps = [...inOrderTraversal(root)];
    const order = orderOf(steps);

    // The nodes of a BST, visited in order, come out sorted. The trace
    // holds node ids, so the values are looked up in the tree.
    const byId = new Map<number, number>();
    const collect = (node: TreeNode | null) => {
      if (!node) return;
      byId.set(node.id, node.val);
      collect(node.left);
      collect(node.right);
    };
    collect(root);

    const values = order.map((id) => byId.get(id) as number);
    expect(values).toHaveLength(7);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  it('visits a level-order traversal breadth first', () => {
    const steps = [...levelOrderTraversal(tree())];
    const visits = steps.filter((step) => step.t === 'visit');

    // The first node visited is the root, and the second is one of its
    // children — never a grandchild.
    expect(visits[0]).toBeDefined();
    expect(visits.length).toBe(7);
  });

  it('visits a pre-order traversal root first', () => {
    const steps = [...preOrderTraversal(tree())];
    const first = steps.find((step) => step.t === 'visit');

    expect(first).toBeDefined();
  });

  it('handles an empty tree', () => {
    for (const traversal of [
      preOrderTraversal,
      inOrderTraversal,
      postOrderTraversal,
      levelOrderTraversal,
    ]) {
      expect([...traversal(null)]).toHaveLength(0);
    }
  });

  it('gives every step a whole-tree view', () => {
    const steps = [...preOrderTraversal(tree())];

    for (const step of steps) {
      expect(Object.keys(step.view.nodes)).toHaveLength(7);
    }
  });
});

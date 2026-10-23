import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { balanceFactor, avlInsert, nodeHeight } from './avl-insert';
import { avlDelete, avlSearch } from './avl-operations';
import { generateRandomAVL } from './avl';
import { inorderList, type TreeNode } from '../tree';

const drain = <T>(generator: Generator<unknown, T, undefined>): T => {
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value as T;
};

const build = (values: readonly number[]): TreeNode | null => {
  let root: TreeNode | null = null;
  for (const value of values) {
    root = drain(avlInsert(root, value));
  }
  return root;
};

/** Every node of a tree, in order. */
const nodesOf = (root: TreeNode | null): TreeNode[] => (root ? inorderList(root) : []);

/** The AVL invariant: every node's children differ in height by at most one. */
const expectBalanced = (root: TreeNode | null): void => {
  for (const node of nodesOf(root)) {
    expect(Math.abs(balanceFactor(node))).toBeLessThanOrEqual(1);
    // Each node's stored height matches its subtree.
    expect(node.height).toBe(nodeHeight(node));
  }
};

const expectSorted = (root: TreeNode | null, expected: readonly number[]): void => {
  expect(nodesOf(root).map((node) => node.val)).toEqual([...expected].sort((a, b) => a - b));
};

describe('avlSearch', () => {
  it('finds every value in the tree', () => {
    const values = [50, 30, 70, 20, 40, 60, 80];
    const root = build(values);

    for (const value of values) {
      expect(drain(avlSearch(root, value))?.val).toBe(value);
    }
  });

  it('reports a value that is not there', () => {
    const root = build([50, 30, 70]);

    expect(drain(avlSearch(root, 42))).toBeNull();
  });

  it('handles an empty tree', () => {
    expect(drain(avlSearch(null, 1))).toBeNull();
  });

  it('leaves the tree as it found it', () => {
    const values = [50, 30, 70, 20, 40];
    const root = build(values);

    drain(avlSearch(root, 40));

    expectSorted(root, values);
    expectBalanced(root);
  });
});

describe('avlDelete', () => {
  it('removes a leaf', () => {
    const root = build([50, 30, 70, 20]);

    const newRoot = drain(avlDelete(root, 20));

    expectSorted(newRoot, [30, 50, 70]);
    expectBalanced(newRoot);
  });

  it('removes a node with one child', () => {
    const root = build([50, 30, 70, 60]);

    const newRoot = drain(avlDelete(root, 70));

    expectSorted(newRoot, [30, 50, 60]);
    expectBalanced(newRoot);
  });

  it('removes a node with two children', () => {
    const root = build([50, 30, 70, 20, 40, 60, 80]);

    const newRoot = drain(avlDelete(root, 30));

    expectSorted(newRoot, [20, 40, 50, 60, 70, 80]);
    expectBalanced(newRoot);
  });

  it('rebalances after a delete that unbalances the tree', () => {
    const root = build([50, 30, 70, 20, 40, 60, 80, 10, 5]);

    // Removing the subtree on one side forces rotations on the way up.
    const newRoot = drain(avlDelete(root, 80));
    const after = drain(avlDelete(newRoot, 70));

    expectBalanced(after);
    expectSorted(after, [5, 10, 20, 30, 40, 50, 60]);
  });

  it('leaves the tree alone when the value is not there', () => {
    const values = [50, 30, 70, 20, 40];
    const root = build(values);

    const newRoot = drain(avlDelete(root, 42));

    expectSorted(newRoot, values);
    expectBalanced(newRoot);
  });

  it('handles an empty tree', () => {
    expect(drain(avlDelete(null, 1))).toBeNull();
  });

  it('drains the tree back to nothing, staying balanced the whole way', () => {
    const values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85];
    let root = build(values);

    for (const value of [...values].reverse()) {
      root = drain(avlDelete(root, value));
      expectBalanced(root);
    }

    expectSorted(root, []);
  });

  it('keeps the invariant for random trees and deletes', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 200 }), { minLength: 1, maxLength: 30 }),
        fc.array(fc.integer({ min: 1, max: 200 }), { maxLength: 30 }),
        (inserted, deleted) => {
          let root = build(inserted);
          expectBalanced(root);

          const remaining = new Set(inserted);

          for (const value of deleted) {
            root = drain(avlDelete(root, value));
            remaining.delete(value);

            // The tree is always a balanced search tree holding exactly
            // the values that have not been deleted.
            expectBalanced(root);
            expect(nodesOf(root).map((node) => node.val)).toEqual(
              [...remaining].sort((a, b) => a - b)
            );
          }
        }
      ),
      { numRuns: 25 }
    );
  });

  it('starts from a generated tree', () => {
    const root = generateRandomAVL(10, 1, 99);
    const values = nodesOf(root).map((node) => node.val);

    expectBalanced(root);

    if (values.length > 0) {
      const after = drain(avlDelete(root, values[0]));
      expectBalanced(after);
      expectSorted(after, values.slice(1));
    }
  });
});

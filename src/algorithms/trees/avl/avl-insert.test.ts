import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { avlInsert, balanceFactor, nodeHeight, rightRotate, leftRotate } from './avl-insert';
import { generateRandomAVL } from './avl';
import type { TreeNode } from '../tree';

const drain = <T>(generator: Generator<unknown, T, undefined>): T => {
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value as T;
};

const inorder = (node: TreeNode | null, out: number[] = []): number[] => {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
};

const height = (node: TreeNode | null): number =>
  node ? 1 + Math.max(height(node.left), height(node.right)) : 0;

const isBalanced = (node: TreeNode | null): boolean => {
  if (!node) return true;
  if (Math.abs(balanceFactor(node)) > 1) return false;
  return isBalanced(node.left) && isBalanced(node.right);
};

describe('avlInsert', () => {
  it('inserts into an empty tree', () => {
    const result = drain(avlInsert(null, 42)) as TreeNode | null;

    expect(result?.val).toBe(42);
    expect(result?.height).toBe(1);
  });

  it('keeps the tree balanced after every insert', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 40 }), { minLength: 1, maxLength: 25 }),
        (values) => {
          let root: TreeNode | null = null;
          for (const value of values) {
            root = drain(avlInsert(root, value)) as TreeNode | null;

            expect(isBalanced(root)).toBe(true);
            expect(height(root)).toBe(nodeHeight(root));
          }
        }
      ),
      { numRuns: 40 }
    );
  });

  it('keeps the tree ordered', () => {
    let root: TreeNode | null = null;
    for (const value of [50, 30, 70, 20, 40, 60, 80]) {
      root = drain(avlInsert(root, value)) as TreeNode | null;
    }

    const sorted = inorder(root);
    expect(sorted).toEqual([...sorted].sort((a, b) => a - b));
  });

  it('rotates when a node goes out of balance', () => {
    // Three values in a row make the tree lean left, then right.
    let root: TreeNode | null = null;
    for (const value of [10, 20, 30]) {
      root = drain(avlInsert(root, value)) as TreeNode | null;
    }

    // A right rotation puts 20 at the root.
    expect(root?.val).toBe(20);
    expect(isBalanced(root)).toBe(true);
  });

  it('logs what it did', () => {
    const steps: { view: { log: { type: string }[] } }[] = [];
    const generator = avlInsert(generateRandomAVL(5, 5, 95), 50);

    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    const types = steps.flatMap((s) => s.view.log.map((entry) => entry.type));
    expect(types).toContain('start');
    expect(types).toContain('compare');
  });
});

describe('rotations', () => {
  it('rotates a subtree to the right', () => {
    //      30
    //     /  \
    //   20    -
    //  /  \
    // 10   25
    const tree: TreeNode = {
      id: 1,
      val: 30,
      left: {
        id: 2,
        val: 20,
        left: { id: 3, val: 10, left: null, right: null },
        right: { id: 4, val: 25, left: null, right: null },
      },
      right: null,
      height: 3,
    };

    const rotated = rightRotate(tree);

    // 20 becomes the root, 25 moves down to the left of 30, and 30's
    // old left subtree is what moves.
    expect(rotated.val).toBe(20);
    expect(rotated.left?.val).toBe(10);
    expect(rotated.right?.val).toBe(30);
    expect(rotated.right?.left?.val).toBe(25);
  });

  it('rotates a subtree to the left', () => {
    //      10
    //     /  \
    //    -    20
    //        /  \
    //       15   30
    const tree: TreeNode = {
      id: 1,
      val: 10,
      left: null,
      right: {
        id: 2,
        val: 20,
        left: { id: 3, val: 15, left: null, right: null },
        right: { id: 4, val: 30, left: null, right: null },
      },
      height: 3,
    };

    const rotated = leftRotate(tree);

    expect(rotated.val).toBe(20);
    expect(rotated.left?.val).toBe(10);
    expect(rotated.right?.val).toBe(30);
    expect(rotated.left?.right?.val).toBe(15);
  });
});

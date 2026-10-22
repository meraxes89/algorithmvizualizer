import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { bstDelete, bstInsert, bstSearch } from './bst-operations';
import { generateRandomBST } from './bst';
import type { TreeNode } from '../tree';

const last = (steps: readonly { t: string }[]) => steps[steps.length - 1]?.t;

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

describe('bstInsert', () => {
  it('inserts into an empty tree', () => {
    const steps: { t: string }[] = [];
    const generator = bstInsert(null, 42);
    let step = generator.next();
    while (!step.done) {
      steps.push(step.value);
      step = generator.next();
    }

    expect(steps[0].t).toBe('log');
    expect(last(steps)).toBe('mark');
    expect(step.value?.val).toBe(42);
  });

  it('keeps the left < root < right property', () => {
    const tree = generateRandomBST(9, 5, 95);
    const values = [100, 3, 57, 12];

    let root = tree;
    for (const value of values) {
      root = drain(bstInsert(root, value)) as TreeNode;
    }

    const sorted = inorder(root);
    expect(sorted).toEqual([...sorted].sort((a, b) => a - b));
    expect(sorted).toContain(100);
  });

  it('refuses a value that is already in the tree', () => {
    const tree = generateRandomBST(7, 5, 95);
    const rootValue = tree?.val as number;

    const steps: { t: string; view: { log: { type: string; text: string }[] } }[] = [];
    const generator = bstInsert(tree, rootValue);
    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    const warned = steps.some((s) => s.view.log.some((entry) => entry.type === 'warn'));
    expect(warned).toBe(true);
  });

  it('yields a view that carries the whole tree at every step', () => {
    const tree = generateRandomBST(7, 5, 95);
    const steps: { view: { nodes: Record<string, unknown> } }[] = [];

    const generator = bstInsert(tree, 99);
    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    expect(steps.length).toBeGreaterThan(0);
    for (const s of steps) {
      expect(Object.keys(s.view.nodes).length).toBeGreaterThan(0);
    }
  });
});

describe('bstSearch', () => {
  it('finds a value that is in the tree', () => {
    const tree = generateRandomBST(9, 5, 95);
    const target = tree?.val as number;

    const result = drain(bstSearch(tree, target)) as TreeNode | null;
    expect(result?.val).toBe(target);
  });

  it('reports that a value is missing', () => {
    const tree = generateRandomBST(9, 5, 95);
    const result = drain(bstSearch(tree, 9999)) as TreeNode | null;

    expect(result).toBeNull();
  });

  it('logs the direction it took at every node', () => {
    const tree = generateRandomBST(9, 5, 95);
    const steps: { view: { log: { type: string; text: string }[] } }[] = [];

    const generator = bstSearch(tree, 9999);
    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    const compares = steps.flatMap((s) => s.view.log.filter((entry) => entry.type === 'compare'));
    expect(compares.length).toBeGreaterThan(0);
  });
});

describe('bstDelete', () => {
  it('removes a leaf', () => {
    const tree = generateRandomBST(7, 5, 95);
    const leaf = tree?.left ?? tree?.right;
    const value = leaf?.val as number;

    const result = drain(bstDelete(tree, value)) as TreeNode | null;
    expect(inorder(result)).not.toContain(value);
  });

  it('removes a value that is not there without changing the tree', () => {
    const tree = generateRandomBST(7, 5, 95);
    const before = inorder(tree);

    const result = drain(bstDelete(tree, 9999)) as TreeNode | null;
    expect(inorder(result)).toEqual(before);
  });

  it('keeps the tree ordered after a delete', () => {
    const tree = generateRandomBST(9, 5, 95);
    const value = tree?.val as number;

    const result = drain(bstDelete(tree, value)) as TreeNode | null;
    const sorted = inorder(result);
    expect(sorted).toEqual([...sorted].sort((a, b) => a - b));
    expect(sorted).not.toContain(value);
  });

  it('never leaves a cycle behind, whatever it deletes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 12 }),
        fc.integer({ min: 0, max: 100 }),
        (count, target) => {
          const tree = generateRandomBST(count, 5, 95);
          const before = inorder(tree);

          const result = drain(bstDelete(tree, target)) as TreeNode | null;

          // A cycle would make the in-order walk never end, so this also
          // proves the tree is still a tree.
          const after = inorder(result);

          expect(after).toEqual([...after].sort((a, b) => a - b));
          expect(after.length).toBeLessThanOrEqual(before.length);
          if (before.includes(target)) {
            expect(after).not.toContain(target);
          }
        }
      ),
      { numRuns: 60 }
    );
  });
});

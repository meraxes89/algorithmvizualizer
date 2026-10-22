import { balanceFactor, nodeHeight, updateHeight } from './avl-insert';
import type { TreeNode } from '../tree';

/**
 * A balanced AVL tree, built from a sorted list of unique values.
 */
export const generateRandomAVL = (count = 7, minVal = 5, maxVal = 95): TreeNode | null => {
  const pool = new Set<number>();
  while (pool.size < count) {
    pool.add(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
  }

  const sorted = [...pool].sort((a, b) => a - b);

  const build = (lo: number, hi: number): TreeNode | null => {
    if (lo > hi) return null;

    const mid = Math.floor((lo + hi) / 2);
    const node: TreeNode = {
      id: nextAvlId(),
      val: sorted[mid],
      left: build(lo, mid - 1),
      right: build(mid + 1, hi),
      height: 1,
    };
    updateHeight(node);
    return node;
  };

  return build(0, sorted.length - 1);
};

let avlId = 1;
const nextAvlId = (): number => avlId++;

/** Start the ids over. */
export const resetAvlIdCounter = (): void => {
  avlId = 1;
};

/** Statistics about a tree, for the info panel. */
export const getTreeStats = (root: TreeNode | null) => {
  if (!root) return { height: 0, nodeCount: 0, min: '-', max: '-', balance: 0 };

  let count = 0;
  let minVal = Infinity;
  let maxVal = -Infinity;

  const dfs = (node: TreeNode | null): number => {
    if (!node) return 0;
    count += 1;
    if (node.val < minVal) minVal = node.val;
    if (node.val > maxVal) maxVal = node.val;
    return 1 + Math.max(dfs(node.left), dfs(node.right));
  };

  const height = dfs(root);
  return {
    height,
    nodeCount: count,
    min: minVal,
    max: maxVal,
    balance: balanceFactor(root),
  };
};

/** The height of a subtree, for the info panel. */
export const heightOf = (root: TreeNode | null): number => nodeHeight(root);

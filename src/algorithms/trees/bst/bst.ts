import type { TreeNode } from '../tree';
import { resetIdCounter, freshId } from './bst-operations';

export { bstDelete, bstInsert, bstSearch, freshId, resetIdCounter } from './bst-operations';

/**
 * Build a balanced tree from a sorted list of unique values.
 *
 * Each node gets an id; the coordinates are assigned later, by the
 * layout helper.
 */
const buildBalanced = (
  sorted: readonly number[],
  lo = 0,
  hi = sorted.length - 1
): TreeNode | null => {
  if (lo > hi) return null;

  const mid = Math.floor((lo + hi) / 2);
  return {
    id: freshId(),
    val: sorted[mid],
    left: buildBalanced(sorted, lo, mid - 1),
    right: buildBalanced(sorted, mid + 1, hi),
  };
};

/**
 * A random binary search tree with `count` unique values.
 *
 * The values are drawn from a range and then built into a balanced tree,
 * so the tree respects the left < root < right property.
 */
export const generateRandomBST = (count = 7, minVal = 5, maxVal = 95): TreeNode | null => {
  resetIdCounter();

  const pool = new Set<number>();
  while (pool.size < count) {
    pool.add(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
  }

  const sorted = [...pool].sort((a, b) => a - b);
  return buildBalanced(sorted);
};

/** Statistics about a tree, for the info panel. */
export const getTreeStats = (root: TreeNode | null) => {
  if (!root) return { height: 0, nodeCount: 0, min: '-', max: '-' };

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
  return { height, nodeCount: count, min: minVal, max: maxVal };
};

import type { TreeNode } from '../tree';

/**
 * A random set of distinct values.
 */
export const generateRandomArray = (count = 10, minVal = 5, maxVal = 95): number[] => {
  const pool = new Set<number>();
  while (pool.size < count) {
    pool.add(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
  }
  return [...pool];
};

/**
 * Rearrange an array into a heap, in place.
 *
 * The array is sifted down from the last parent, which is the standard
 * bottom-up build and takes a single pass.
 */
export const buildHeapArray = (values: number[], isMaxHeap = true): number[] => {
  const count = values.length;
  const wins = isMaxHeap ? (a: number, b: number) => a > b : (a: number, b: number) => a < b;

  for (let i = Math.floor(count / 2) - 1; i >= 0; i--) {
    let index = i;

    for (;;) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let target = index;

      if (left < count && wins(values[left], values[target])) target = left;
      if (right < count && wins(values[right], values[target])) target = right;

      if (target === index) break;

      [values[index], values[target]] = [values[target], values[index]];
      index = target;
    }
  }

  return values;
};

/** A random heap. */
export const generateRandomHeap = (count = 10, isMaxHeap = true): number[] =>
  buildHeapArray(generateRandomArray(count), isMaxHeap);

/**
 * Lay a heap out as a complete binary tree.
 *
 * The array index of a node is its place in the tree, so the layout only
 * has to work out the depth and the position within the level.
 */
export const layoutHeapTree = (
  values: readonly number[],
  svgWidth = 1100,
  svgHeight = 460
): { nodes: (TreeNode & { index: number })[]; edges: { from: TreeNode; to: TreeNode }[] } => {
  if (values.length === 0) return { nodes: [], edges: [] };

  const count = values.length;
  const maxDepth = Math.floor(Math.log2(count));

  const padY = 60;
  const usableHeight = svgHeight - padY * 2;
  const yGap = maxDepth > 0 ? usableHeight / maxDepth : 0;

  const nodes: (TreeNode & { index: number })[] = [];
  const edges: { from: TreeNode; to: TreeNode }[] = [];

  for (let i = 0; i < count; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    const levelIndex = i - (2 ** depth - 1);
    const nodesInLevel = 2 ** depth;

    const widthPerNode = svgWidth / nodesInLevel;
    const x = widthPerNode * levelIndex + widthPerNode / 2;
    const y = padY + depth * yGap;

    nodes.push({ id: i, val: values[i], x, y, index: i, left: null, right: null });
  }

  for (let i = 0; i < count; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < count) {
      edges.push({ from: nodes[i], to: nodes[left] });
    }
    if (right < count) {
      edges.push({ from: nodes[i], to: nodes[right] });
    }
  }

  return { nodes, edges };
};

import { inorderList, treeHeight, type TreeNode } from './tree';

/** A laid-out tree, ready for the visualizer to draw. */
export type TreeLayout = {
  nodes: TreeNode[];
  edges: { from: TreeNode; to: TreeNode }[];
};

/**
 * Assign coordinates to a tree for drawing.
 *
 * The horizontal position comes from the node's place in an in-order
 * walk, so a binary search tree spreads out evenly, and the vertical
 * position comes from its depth.
 */
export const layoutTree = (root: TreeNode | null, svgWidth = 1100, svgHeight = 460): TreeLayout => {
  if (!root) return { nodes: [], edges: [] };

  const ordered = inorderList(root);
  const count = ordered.length;
  const height = treeHeight(root);

  const padX = 70;
  const usableWidth = svgWidth - padX * 2;
  const xGap = count > 1 ? usableWidth / (count - 1) : 0;

  const indexOf = new Map<number, number>();
  ordered.forEach((node, index) => indexOf.set(node.id, index));

  const padY = 60;
  const usableHeight = svgHeight - padY * 2;
  const yGap = height > 1 ? usableHeight / (height - 1) : 0;

  const nodes: TreeNode[] = [];
  const edges: { from: TreeNode; to: TreeNode }[] = [];

  const walk = (node: TreeNode, depth: number) => {
    if (!node) return;

    const index = indexOf.get(node.id) ?? 0;
    node.x = padX + index * xGap;
    node.y = padY + depth * yGap;
    nodes.push(node);

    if (node.left) {
      edges.push({ from: node, to: node.left });
      walk(node.left, depth + 1);
    }
    if (node.right) {
      edges.push({ from: node, to: node.right });
      walk(node.right, depth + 1);
    }
  };

  walk(root, 0);

  return { nodes, edges };
};

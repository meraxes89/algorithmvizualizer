import type { TrieNode } from './trie';

/**
 * Lay a trie out for drawing.
 *
 * Every node is given the width of the leaves below it, and sits in the
 * middle of that width, so the branches never cross.
 */
export const layoutTrie = (
  root: TrieNode | null,
  svgWidth = 1100
): { nodes: TrieNode[]; edges: { from: TrieNode; to: TrieNode; char: string }[] } => {
  if (!root) return { nodes: [], edges: [] };

  const padY = 60;
  const yGap = 70;
  const padX = 50;

  const widthOf = (node: TrieNode): number => {
    const keys = Object.keys(node.children).sort();
    if (keys.length === 0) return 1;
    return keys.reduce((total, key) => total + widthOf(node.children[key]), 0);
  };

  const leaves = widthOf(root);
  const usableWidth = svgWidth - padX * 2;
  const unitWidth = leaves > 0 ? usableWidth / leaves : 0;

  const nodes: TrieNode[] = [];
  const edges: { from: TrieNode; to: TrieNode; char: string }[] = [];

  const assign = (node: TrieNode, depth: number, xStart: number): void => {
    node.y = padY + depth * yGap;

    const allocated = widthOf(node) * unitWidth;
    node.x = xStart + allocated / 2;
    nodes.push(node);

    let currentX = xStart;
    for (const key of Object.keys(node.children).sort()) {
      const child = node.children[key];
      edges.push({ from: node, to: child, char: key });
      assign(child, depth + 1, currentX);
      currentX += widthOf(child) * unitWidth;
    }
  };

  assign(root, 0, padX);

  return { nodes, edges };
};

/** Statistics about a trie, for the info panel. */
export const getTrieStats = (root: TrieNode | null) => {
  if (!root) return { wordCount: 0, nodeCount: 0, maxDepth: 0 };

  let wordCount = 0;
  let nodeCount = 0;
  let maxDepth = 0;

  const walk = (node: TrieNode, depth: number) => {
    nodeCount += 1;
    maxDepth = Math.max(maxDepth, depth);
    if (node.isEnd) wordCount += 1;
    Object.values(node.children).forEach((child) => walk(child, depth + 1));
  };
  walk(root, 0);

  return { wordCount, nodeCount, maxDepth };
};

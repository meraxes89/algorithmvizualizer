import {
  type SegType,
  type SegmentNode,
  freshSegmentId,
  getConfig,
  resetSegmentTreeIdCounter,
} from './segment-tree';

export { SEG_TYPES } from './segment-tree';
export type { SegType, SegmentNode } from './segment-tree';

/** A random array for a segment tree to be built over. */
export const generateRandomArrayForSegTree = (count = 8, minVal = 1, maxVal = 99): number[] =>
  Array.from({ length: count }, () => Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);

/**
 * Build a segment tree without animating it.
 *
 * The visualizer wants a tree to draw straight away, and the animated
 * build is for when the user asks to watch it happen.
 */
export const buildSegmentTreeSync = (
  values: readonly number[],
  type: SegType
): SegmentNode | null => {
  if (values.length === 0) return null;

  resetSegmentTreeIdCounter();
  const { combine } = getConfig(type);

  const build = (l: number, r: number): SegmentNode => {
    const node: SegmentNode = {
      id: freshSegmentId(),
      l,
      r,
      val: null,
      left: null,
      right: null,
    };

    if (l === r) {
      node.val = values[l];
      return node;
    }

    const mid = Math.floor((l + r) / 2);
    node.left = build(l, mid);
    node.right = build(mid + 1, r);
    node.val = combine(node.left.val as number, node.right.val as number);

    return node;
  };

  return build(0, values.length - 1);
};

/** The layout of a segment tree, ready for drawing. */
export const layoutSegmentTree = (
  root: SegmentNode | null
): {
  nodes: SegmentNode[];
  edges: { from: SegmentNode; to: SegmentNode }[];
  svgWidth: number;
  svgHeight: number;
} => {
  if (!root) return { nodes: [], edges: [], svgWidth: 1100, svgHeight: 460 };

  const nodes: SegmentNode[] = [];
  const edges: { from: SegmentNode; to: SegmentNode }[] = [];

  const depthOf = (node: SegmentNode | null): number => {
    if (!node) return 0;
    return 1 + Math.max(depthOf(node.left), depthOf(node.right));
  };
  const maxDepth = depthOf(root);

  const padY = 60;
  const padX = 60;
  const yGap = 90;
  const leafSpacing = 110;

  const numLeaves = root.r - root.l + 1;
  const treeWidth = (numLeaves > 0 ? numLeaves - 1 : 0) * leafSpacing;

  const svgWidth = Math.max(800, treeWidth + padX * 2);
  const svgHeight = Math.max(460, (maxDepth > 0 ? maxDepth - 1 : 0) * yGap + padY * 2);
  const startX = (svgWidth - treeWidth) / 2;

  const walk = (node: SegmentNode, depth: number): void => {
    node.y = padY + depth * yGap;

    if (node.l === node.r) {
      // A leaf sits at the position of the element it covers.
      node.x = startX + (node.l - root.l) * leafSpacing;
      nodes.push(node);
      return;
    }

    const left = node.left as SegmentNode;
    const right = node.right as SegmentNode;

    node.x = ((left.x ?? 0) + (right.x ?? 0)) / 2;
    nodes.push(node);

    edges.push({ from: node, to: left });
    edges.push({ from: node, to: right });

    walk(left, depth + 1);
    walk(right, depth + 1);
  };

  walk(root, 0);

  return { nodes, edges, svgWidth, svgHeight };
};

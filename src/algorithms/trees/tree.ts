import type {
  TreeLogEntry,
  TreeStep,
  TreeNodeSnapshot,
  TreeNodeState,
  TreeView,
} from '@core/steps';

/**
 * A node of a tree.
 *
 * The tree is a linked structure that the algorithms mutate as they
 * work. That is fine inside an algorithm, but a *step* cannot hold it
 * by reference: two steps would then show the same tree, and the trace
 * would not be scrubbable. So every step carries a flat snapshot
 * instead, and the snapshot is what the visualizer draws.
 */
export type TreeNode = {
  id: number;
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  /** The height of the subtree, for the balanced trees. */
  height?: number;
  /** Laid-out coordinates, assigned by the layout helpers. */
  x?: number;
  y?: number;
};

/** A flat snapshot of a whole tree. */
export type TreeSnapshot = Record<number, TreeNodeSnapshot>;

/**
 * The shape the tree helpers need from a node.
 *
 * Every tree-shaped family has a node with an id, a value and two
 * children; only the meaning of the value differs.
 */
export type ViewableNode = {
  id: number;
  val: number | null;
  left: ViewableNode | null;
  right: ViewableNode | null;
  height?: number;
};

/** Walk a tree, depth first. */
export const walkTree = (
  node: ViewableNode | null,
  visit: (node: ViewableNode, depth: number) => void,
  depth = 0
): void => {
  if (!node) return;
  visit(node, depth);
  walkTree(node.left, visit, depth + 1);
  walkTree(node.right, visit, depth + 1);
};

/** Flatten a tree into a snapshot the step can carry. */
export const snapshotTree = (root: ViewableNode | null): TreeSnapshot => {
  const snapshot: TreeSnapshot = {};

  walkTree(root, (node) => {
    snapshot[node.id] = {
      id: node.id,
      val: node.val,
      left: node.left ? node.left.id : null,
      right: node.right ? node.right.id : null,
      ...(node.height === undefined ? {} : { height: node.height }),
    };
  });

  return snapshot;
};

/** The height of a subtree. */
export const treeHeight = (node: TreeNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
};

/** The nodes of a tree, in order. */
export const inorderList = (node: TreeNode | null, out: TreeNode[] = []): TreeNode[] => {
  if (!node) return out;
  inorderList(node.left, out);
  out.push(node);
  inorderList(node.right, out);
  return out;
};

/**
 * Build a tree step.
 *
 * The helper exists for a parsing reason: `yield { ... }` is ambiguous
 * in TypeScript, because the brace after `yield` can be read as the
 * start of a block rather than an object literal. Building the step
 * here and yielding it as a name removes the ambiguity for good.
 */
export const treeStep = (step: TreeStep): TreeStep => step;

/**
 * The state an operation accumulates while it works.
 *
 * The algorithms used to push this into React state one callback at a
 * time. It is a plain object now, and the operation yields a step
 * whenever it changes.
 */
export class TreeTrace {
  active: number | null = null;
  visited: number[] = [];
  log: TreeLogEntry[] = [];
  states: Record<number, TreeNodeState> = {};
  rotating: number[] = [];
  ranges: Record<number, [number, number]> = {};
  contributing: number[] = [];
  propagating: number[] = [];

  /** The current view of the tree. */
  view(root: ViewableNode | null): TreeView {
    return {
      nodes: snapshotTree(root),
      states: { ...this.states },
      active: this.active,
      order: [...this.visited],
      rotating: [...this.rotating],
      ranges: { ...this.ranges },
      contributing: [...this.contributing],
      propagating: [...this.propagating],
      log: [...this.log],
    };
  }

  /** Mark a node as visited. */
  visit(node: TreeNode): void {
    if (!this.visited.includes(node.id)) {
      this.visited.push(node.id);
    }
    this.states[node.id] = 'visited';
  }

  /** Mark a node with a state. */
  mark(node: TreeNode, state: TreeNodeState): void {
    this.states[node.id] = state;
  }

  /** Add a line to the log. */
  say(entry: TreeLogEntry): void {
    this.log.push(entry);
  }
}

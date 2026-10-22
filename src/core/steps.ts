/**
 * The Step Trace Contract.
 *
 * Every algorithm in this repo is a pure generator that yields *steps*.
 * A step is the only thing an algorithm is allowed to say about itself,
 * and it says two things at once:
 *
 *   1. `t` — what just happened. This is the semantic payload: what the
 *      sound engine listens for, what the event bus publishes, what the
 *      "now doing..." line reads.
 *   2. `view` — the complete visual state after that event. This is the
 *      render payload.
 *
 * Carrying the whole view in every step is deliberate. It means a
 * visualizer is a pure function of `(input, currentStep)` — it never
 * has to fold a delta, never has to know what came before, and can
 * render any step of a trace in isolation. That is what makes scrubbing
 * work: seeking to step N is just "render step N".
 *
 * The cost is that a step repeats the state. That is acceptable here
 * because the states are small (an array of numbers, a list of cell
 * references, a map of vertex states) and because the alternative — delta
 * steps plus a per-family reducer — would put the folding logic in the
 * engine, where it would have to be re-implemented for every family.
 *
 * Every step also carries its `family`. That makes a trace
 * self-describing (a golden-trace file says what each step is without
 * needing the registry to interpret it) and it makes `AnyStep` a
 * properly discriminated union, so `switch (step.family)` narrows
 * soundly. The alternative — sharing one `t` namespace across families
 * — cannot work, because several families legitimately use the same
 * words ('done', 'visit', 'path').
 *
 * See docs/adr/0001-step-trace-contract.md for the reasoning.
 */

/** Every family the contract covers. */
export type StepFamily =
  'sorting' | 'searching' | 'pathfinding' | 'graph' | 'trees' | 'recursion' | 'dp';

/** Tags every step of a family with that family, so `AnyStep` narrows. */
type OfFamily<F extends StepFamily> = { readonly family: F };

// ─────────────────────────────────────────────────────────────────────────────
// Sorting
// ─────────────────────────────────────────────────────────────────────────────

/** How an element of a sorted array is highlighted. */
export type SortMark = 'sorted' | 'pivot';

/** The complete visual state of a sorting run. */
export type SortView = {
  /** The array as it currently stands. */
  readonly array: readonly number[];
  /** Indices being compared right now. Empty on any other step. */
  readonly comparing: readonly number[];
  /** Indices being swapped right now. Empty on any other step. */
  readonly swapping: readonly number[];
  /** Indices known to be in their final position. */
  readonly sorted: readonly number[];
};

export type SortStep = OfFamily<'sorting'> &
  (
    | { t: 'set-array'; view: SortView; note?: string }
    | { t: 'compare'; view: SortView }
    | { t: 'swap'; view: SortView }
    | { t: 'mark'; view: SortView; state: SortMark }
    | { t: 'done'; view: SortView }
  );

export type SortGenerator = Generator<SortStep, void, undefined>;

// ─────────────────────────────────────────────────────────────────────────────
// Searching
// ─────────────────────────────────────────────────────────────────────────────

/** The complete visual state of a search. */
export type SearchView = {
  readonly array: readonly number[];
  /** Index currently being examined, or -1 when nothing is in flight. */
  readonly current: number;
  /** Index the target was found at, or -1 when it has not been found. */
  readonly found: number;
  /** The window still under consideration, or null when there is none. */
  readonly range: readonly [number, number] | null;
};

export type SearchStep = OfFamily<'searching'> &
  (
    | { t: 'set-array'; view: SearchView; note?: string }
    | { t: 'probe'; view: SearchView; index: number }
    | { t: 'found'; view: SearchView; index: number }
    | { t: 'not-found'; view: SearchView }
    | { t: 'done'; view: SearchView }
  );

export type SearchGenerator = Generator<SearchStep, void, undefined>;

// ─────────────────────────────────────────────────────────────────────────────
// Pathfinding
// ─────────────────────────────────────────────────────────────────────────────

/** A cell in the pathfinding grid. */
export type CellRef = {
  readonly row: number;
  readonly col: number;
};

/**
 * The complete visual state of a pathfinding run.
 *
 * The grid itself is not part of the view: the walls are part of the
 * *input* and never change during a search. Only what the search did to
 * the grid is in the view.
 */
export type PathView = {
  /** Every cell the search has expanded, in the order it expanded them. */
  readonly visited: readonly CellRef[];
  /** The route from start to end, once one is found. */
  readonly path: readonly CellRef[];
  /** The open set, for algorithms that show it. */
  readonly frontier: readonly CellRef[];
};

export type PathStep = OfFamily<'pathfinding'> &
  (
    | { t: 'visit'; view: PathView; cell: CellRef }
    | { t: 'frontier'; view: PathView; cell: CellRef }
    | { t: 'path'; view: PathView; path: readonly CellRef[] }
    | { t: 'not-found'; view: PathView }
    | { t: 'done'; view: PathView }
  );

export type PathGenerator = Generator<PathStep, void, undefined>;

// ─────────────────────────────────────────────────────────────────────────────
// Graphs
// ─────────────────────────────────────────────────────────────────────────────

export type VertexState = 'idle' | 'default' | 'frontier' | 'visiting' | 'visited' | 'in-path';

export type EdgeState =
  'idle' | 'default' | 'exploring' | 'considering' | 'active' | 'accepted' | 'rejected';

/** The complete visual state of a graph traversal. */
export type GraphView = {
  /** State of every vertex the algorithm has touched, by vertex id. */
  readonly vertices: Readonly<Record<number, VertexState>>;
  /** State of every edge the algorithm has considered, by edge key. */
  readonly edges: Readonly<Record<string, EdgeState>>;
  /** The route from source to target, once one is found. */
  readonly path: readonly number[];
  /** The worklist, for the algorithms that show one. */
  readonly queue: readonly number[];
  /** The stack, for the algorithms that show one. */
  readonly stack: readonly number[];
  /** The distance table, for the weighted algorithms. */
  readonly distances?: Readonly<Record<number, number>>;
  /** The all-pairs matrix, for Floyd-Warshall. */
  readonly matrix?: Readonly<Record<number, Readonly<Record<number, number>>>>;
  /** The in-degree table, for the topological sort. */
  readonly indegrees?: Readonly<Record<number, number>>;
  /** The order the vertices were emitted in. */
  readonly order?: readonly number[];
  /** The edges of the tree that was built, for the spanning tree algorithms. */
  readonly resultEdges?: readonly { from: number; to: number; weight: number }[];
};

export type GraphStep = OfFamily<'graph'> &
  (
    | { t: 'visit'; view: GraphView; description?: string }
    | { t: 'edge'; view: GraphView; description?: string }
    | { t: 'path'; view: GraphView; description?: string }
    | { t: 'done'; view: GraphView; description?: string }
  );

export type GraphGenerator = Generator<GraphStep, void, undefined>;

// ─────────────────────────────────────────────────────────────────────────────
// Trees
// ─────────────────────────────────────────────────────────────────────────────

export type TreeNodeState = 'idle' | 'active' | 'visited' | 'found';

/** A line the algorithm logged. */
export type TreeLogEntry = {
  readonly type: 'info' | 'start' | 'compare' | 'success' | 'warn' | 'error';
  readonly text: string;
};

/**
 * One node of a tree, flattened.
 *
 * The tree itself is a linked structure that the algorithms mutate as
 * they work, so a step cannot hold it by reference — two steps would
 * then show the same tree. Every step carries this flat snapshot
 * instead, which is what makes a trace scrubbable.
 */
export type TreeNodeSnapshot = {
  readonly id: number;
  readonly val: number;
  readonly left: number | null;
  readonly right: number | null;
  /** The height of the subtree, for the balanced trees. */
  readonly height?: number;
};

/** The complete visual state of a tree operation. */
export type TreeView = {
  /** Every node in the tree, by id. */
  readonly nodes: Readonly<Record<number, TreeNodeSnapshot>>;
  /** The state of every node the algorithm has touched, by id. */
  readonly states: Readonly<Record<number, TreeNodeState>>;
  /** The node currently being worked on, or null. */
  readonly active: number | null;
  /** The order the nodes were visited in. */
  readonly order: readonly number[];
  /** Everything the algorithm has logged so far. */
  readonly log: readonly TreeLogEntry[];
};

export type TreeStep = OfFamily<'trees'> &
  (
    | { t: 'visit'; view: TreeView; node: number }
    | { t: 'active'; view: TreeView; node: number | null }
    | { t: 'mark'; view: TreeView; node: number; state: TreeNodeState }
    | { t: 'log'; view: TreeView; entry: TreeLogEntry }
    | { t: 'done'; view: TreeView }
  );

export type TreeGenerator = Generator<TreeStep, void, undefined>;

// ─────────────────────────────────────────────────────────────────────────────
// Recursion
// ─────────────────────────────────────────────────────────────────────────────

export type RecursionFrame = {
  readonly name: string;
  readonly depth: number;
};

/** The complete visual state of a recursion. */
export type RecursionView = {
  /** The call stack, innermost frame last. */
  readonly stack: readonly RecursionFrame[];
  /** The line currently being executed, or null. */
  readonly active: number | null;
  /** Everything the algorithm has printed so far. */
  readonly output: readonly string[];
};

export type RecursionStep = OfFamily<'recursion'> &
  (
    | { t: 'call'; view: RecursionView; frame: RecursionFrame }
    | { t: 'return'; view: RecursionView; frame: RecursionFrame }
    | { t: 'write'; view: RecursionView; text: string }
    | { t: 'done'; view: RecursionView }
  );

export type RecursionGenerator = Generator<RecursionStep, void, undefined>;

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic programming
// ─────────────────────────────────────────────────────────────────────────────

/** The complete visual state of a dynamic program. */
export type DPView = {
  /** The DP table, filled in so far. */
  readonly table: readonly (readonly number[])[];
  /** The cell currently being computed, or null. */
  readonly active: readonly [number, number] | null;
  /** The items being considered, for problems that have them. */
  readonly items: readonly number[];
};

export type DPStep = OfFamily<'dp'> &
  (
    | { t: 'set-table'; view: DPView }
    | { t: 'cell'; view: DPView; row: number; col: number }
    | { t: 'write'; view: DPView; row: number; col: number; value: number }
    | { t: 'done'; view: DPView }
  );

export type DPGenerator = Generator<DPStep, void, undefined>;

// ─────────────────────────────────────────────────────────────────────────────
// The registry-facing union
// ─────────────────────────────────────────────────────────────────────────────

/** Maps a family to the step type it produces. */
export type StepByFamily = {
  sorting: SortStep;
  searching: SearchStep;
  pathfinding: PathStep;
  graph: GraphStep;
  trees: TreeStep;
  recursion: RecursionStep;
  dp: DPStep;
};

/** Maps a family to the generator that produces its steps. */
export type GeneratorByFamily = {
  sorting: SortGenerator;
  searching: SearchGenerator;
  pathfinding: PathGenerator;
  graph: GraphGenerator;
  trees: TreeGenerator;
  recursion: RecursionGenerator;
  dp: DPGenerator;
};

/** A step of any family. */
export type AnyStep = StepByFamily[StepFamily];

/** A generator of any family's steps. */
export type AnyGenerator = GeneratorByFamily[StepFamily];

/**
 * Narrow a step to a specific family.
 *
 * Sound, because every step carries its own family.
 */
export const isStepOfFamily = <F extends StepFamily>(
  family: F,
  step: AnyStep
): step is StepByFamily[F] => step.family === family;

/**
 * Recognise a value as a step of some family.
 *
 * Used by the playback engine, which is generic over the step type and
 * only publishes to the bus when it is actually looking at a step.
 */
export const isAnyStep = (value: unknown): value is AnyStep =>
  typeof value === 'object' &&
  value !== null &&
  'family' in value &&
  't' in value &&
  'view' in value;

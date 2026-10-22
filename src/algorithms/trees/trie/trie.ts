import type { TreeLogEntry, TreeNodeState, TrieStep, TrieView } from '@core/steps';

/** A node of a trie. */
export type TrieNode = {
  id: number;
  /** The character the node stands for. */
  char: string;
  /** The children, keyed by the character they continue with. */
  children: Record<string, TrieNode>;
  /** Whether a word ends at this node. */
  isEnd: boolean;
  /** Laid-out coordinates, assigned by the layout helper. */
  x?: number;
  y?: number;
};

let nextId = 1;
const freshId = (): number => nextId++;

/** Start the ids over, so a rebuilt trie starts from one. */
export const resetTrieIdCounter = (): void => {
  nextId = 1;
};

/** A new trie node. */
export const createTrieNode = (char = ''): TrieNode => ({
  id: freshId(),
  char,
  children: {},
  isEnd: false,
  x: 0,
  y: 0,
});

/**
 * The state an operation accumulates while it works.
 */
export class TrieTrace {
  active: number | null = null;
  visited: number[] = [];
  found: number[] = [];
  deleting: number[] = [];
  log: TreeLogEntry[] = [];
  states: Record<number, TreeNodeState> = {};

  view(root: TrieNode | null): TrieView {
    const nodes: Record<number, TrieView['nodes'][number]> = {};

    const walk = (node: TrieNode | null) => {
      if (!node) return;
      nodes[node.id] = {
        id: node.id,
        char: node.char,
        isEnd: node.isEnd,
        children: Object.values(node.children).map((child) => child.id),
      };
      Object.values(node.children).forEach(walk);
    };
    walk(root);

    return {
      nodes,
      states: { ...this.states },
      active: this.active,
      order: [...this.visited],
      found: [...this.found],
      deleting: [...this.deleting],
      log: [...this.log],
    };
  }

  say(entry: TreeLogEntry): void {
    this.log.push(entry);
  }
}

/** Build a trie step. The helper keeps the object literal out of the
 * ambiguous position after `yield`. */
export const trieStep = (step: TrieStep): TrieStep => step;

/* ------------------------------------------------------------------ */
/*  Insert                                                            */
/* ------------------------------------------------------------------ */

/**
 * Insert a word into a trie.
 *
 * The word walks down the trie one character at a time, and any
 * character that is missing becomes a new node.
 */
export function* trieInsert(
  root: TrieNode | null,
  word: string
): Generator<TrieStep, TrieNode | null, undefined> {
  if (!word || word.trim() === '') {
    return root;
  }

  const target = word.toLowerCase().trim();
  const trace = new TrieTrace();

  trace.say({ type: 'start', text: `Inserting word '${target}'…` });
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  if (!root) {
    return root;
  }

  let current = root;

  trace.active = current.id;
  trace.visited.push(current.id);
  yield trieStep({
    family: 'trie',
    t: 'active',
    view: trace.view(root),
    node: current.id,
  });

  for (const char of target) {
    trace.say({ type: 'info', text: `Processing char '${char}'…` });
    yield trieStep({
      family: 'trie',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });

    if (!current.children[char]) {
      trace.say({ type: 'success', text: `Creating new node for '${char}'.` });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      current.children[char] = createTrieNode(char);
    } else {
      trace.say({ type: 'compare', text: `Node '${char}' already exists. Moving down.` });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
    }

    current = current.children[char];

    trace.active = current.id;
    trace.visited.push(current.id);
    yield trieStep({
      family: 'trie',
      t: 'active',
      view: trace.view(root),
      node: current.id,
    });
  }

  if (!current.isEnd) {
    current.isEnd = true;
    trace.say({
      type: 'success',
      text: `Marked '${target[target.length - 1]}' as end of word.`,
    });
    yield trieStep({
      family: 'trie',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });
  } else {
    trace.say({ type: 'warn', text: `Word '${target}' is already in the Trie.` });
    yield trieStep({
      family: 'trie',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });
  }

  trace.active = null;
  return root;
}

/* ------------------------------------------------------------------ */
/*  Search                                                            */
/* ------------------------------------------------------------------ */

/**
 * Look for a word in a trie.
 *
 * The word walks down the trie; if a character is missing on the way,
 * the word is not there.
 */
export function* trieSearch(
  root: TrieNode | null,
  word: string
): Generator<TrieStep, TrieNode | null, undefined> {
  if (!word || word.trim() === '' || !root) {
    return null;
  }

  const target = word.toLowerCase().trim();
  const trace = new TrieTrace();

  trace.say({ type: 'start', text: `Searching for word '${target}'…` });
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  let current: TrieNode | null = root;

  for (const char of target) {
    if (!current.children[char]) {
      trace.say({
        type: 'error',
        text: `Path for '${char}' not found. Word does not exist.`,
      });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      trace.active = null;
      return null;
    }

    current = current.children[char];
    trace.active = current.id;
    trace.visited.push(current.id);
    yield trieStep({
      family: 'trie',
      t: 'active',
      view: trace.view(root),
      node: current.id,
    });
  }

  if (current.isEnd) {
    trace.say({ type: 'success', text: `Found '${target}'.` });
    trace.found.push(current.id);
    yield trieStep({
      family: 'trie',
      t: 'log',
      view: trace.view(root),
      entry: trace.log[trace.log.length - 1],
    });
    yield trieStep({
      family: 'trie',
      t: 'found',
      view: trace.view(root),
      node: current.id,
    });
    trace.active = null;
    return current;
  }

  trace.say({
    type: 'warn',
    text: `'${target}' is a prefix but not a complete word.`,
  });
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  trace.active = null;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Autocomplete                                                      */
/* ------------------------------------------------------------------ */

/**
 * Every word that starts with a prefix.
 *
 * The prefix is walked down to its node, and then the whole subtree
 * below it is collected.
 */
export function* trieAutocomplete(
  root: TrieNode | null,
  prefix: string
): Generator<TrieStep, string[], undefined> {
  if (!prefix || prefix.trim() === '' || !root) {
    return [];
  }

  const target = prefix.toLowerCase().trim();
  const trace = new TrieTrace();

  trace.say({ type: 'start', text: `Searching for prefix '${target}'…` });
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  let current: TrieNode = root;

  trace.active = current.id;
  trace.visited.push(current.id);
  yield trieStep({
    family: 'trie',
    t: 'active',
    view: trace.view(root),
    node: current.id,
  });

  for (const char of target) {
    if (!current.children[char]) {
      trace.say({ type: 'error', text: `Prefix '${target}' not found.` });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      trace.active = null;
      return [];
    }

    current = current.children[char];
    trace.active = current.id;
    trace.visited.push(current.id);
    yield trieStep({
      family: 'trie',
      t: 'active',
      view: trace.view(root),
      node: current.id,
    });
  }

  trace.say({
    type: 'success',
    text: `Prefix '${target}' found! Collecting all words below…`,
  });
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  const words: string[] = [];

  function* collect(node: TrieNode, soFar: string): Generator<TrieStep, void, undefined> {
    trace.active = node.id;
    trace.visited.push(node.id);
    yield trieStep({
      family: 'trie',
      t: 'active',
      view: trace.view(root),
      node: node.id,
    });

    if (node.isEnd) {
      words.push(soFar);
      trace.found.push(node.id);
      trace.say({ type: 'info', text: `Found word: '${soFar}'` });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
    }

    for (const key of Object.keys(node.children).sort()) {
      yield* collect(node.children[key], soFar + key);
    }
  }

  yield* collect(current, target);

  if (words.length > 0) {
    trace.say({ type: 'success', text: `Autocomplete results: ${words.join(', ')}` });
  } else {
    trace.say({ type: 'warn', text: `No complete words found for prefix '${target}'.` });
  }
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  trace.active = null;
  return words;
}

/* ------------------------------------------------------------------ */
/*  Delete                                                            */
/* ------------------------------------------------------------------ */

/**
 * Remove a word from a trie.
 *
 * The word is unmarked first, and then the nodes that no longer lead
 * anywhere are pruned on the way back up.
 */
export function* trieDelete(
  root: TrieNode | null,
  word: string
): Generator<TrieStep, TrieNode | null, undefined> {
  if (!word || word.trim() === '' || !root) {
    return root;
  }

  const target = word.toLowerCase().trim();
  const trace = new TrieTrace();

  trace.say({ type: 'start', text: `Deleting word '${target}'…` });
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[0],
  });

  function* remove(node: TrieNode, depth: number): Generator<TrieStep, boolean, undefined> {
    trace.active = node.id;
    trace.visited.push(node.id);
    yield trieStep({
      family: 'trie',
      t: 'active',
      view: trace.view(root),
      node: node.id,
    });

    if (depth === target.length) {
      if (!node.isEnd) {
        trace.say({ type: 'warn', text: `Word '${target}' not present in Trie.` });
        yield trieStep({
          family: 'trie',
          t: 'log',
          view: trace.view(root),
          entry: trace.log[trace.log.length - 1],
        });
        return false;
      }

      node.isEnd = false;
      trace.say({ type: 'info', text: `Unmarked end-of-word for '${target}'.` });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });

      return Object.keys(node.children).length === 0;
    }

    const char = target[depth];
    const child = node.children[char];

    if (!child) {
      trace.say({ type: 'warn', text: `Path broken at '${char}'. Word not found.` });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      return false;
    }

    const shouldDeleteChild = yield* remove(child, depth + 1);

    trace.active = node.id;
    yield trieStep({
      family: 'trie',
      t: 'active',
      view: trace.view(root),
      node: node.id,
    });

    if (shouldDeleteChild) {
      trace.deleting.push(child.id);
      trace.say({ type: 'info', text: `Pruning node '${char}'.` });
      yield trieStep({
        family: 'trie',
        t: 'log',
        view: trace.view(root),
        entry: trace.log[trace.log.length - 1],
      });
      delete node.children[char];
    }

    return !node.isEnd && Object.keys(node.children).length === 0;
  }

  yield* remove(root, 0);

  trace.active = null;
  trace.say({ type: 'success', text: `Deletion complete.` });
  yield trieStep({
    family: 'trie',
    t: 'log',
    view: trace.view(root),
    entry: trace.log[trace.log.length - 1],
  });

  return root;
}

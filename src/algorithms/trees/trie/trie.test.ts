import { describe, expect, it } from 'vitest';
import {
  createTrieNode,
  resetTrieIdCounter,
  trieAutocomplete,
  trieDelete,
  trieInsert,
  trieSearch,
  type TrieNode,
} from './trie';

const drain = <T>(generator: Generator<unknown, T, undefined>): T => {
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value as T;
};

const emptyTrie = (): TrieNode => {
  resetTrieIdCounter();
  return createTrieNode('ROOT');
};

const wordsIn = (node: TrieNode, soFar = ''): string[] => {
  const out: string[] = [];
  const walk = (current: TrieNode, prefix: string) => {
    if (current.isEnd) out.push(prefix);
    Object.values(current.children).forEach((child) => walk(child, prefix + child.char));
  };
  walk(node, soFar);
  return out;
};

describe('trieInsert', () => {
  it('inserts a word', () => {
    const root = drain(trieInsert(emptyTrie(), 'cat')) as TrieNode;

    expect(wordsIn(root)).toEqual(['cat']);
  });

  it('inserts several words', () => {
    let root = emptyTrie();
    for (const word of ['cat', 'car', 'cart']) {
      root = drain(trieInsert(root, word)) as TrieNode;
    }

    expect(wordsIn(root).sort()).toEqual(['car', 'cart', 'cat']);
  });

  it('says so when a word is already there', () => {
    let root = emptyTrie();
    root = drain(trieInsert(root, 'cat')) as TrieNode;

    const steps: { view: { log: { type: string }[] } }[] = [];
    const generator = trieInsert(root, 'cat');
    let step = generator.next();
    while (!step.done) {
      steps.push(step.value as never);
      step = generator.next();
    }

    const types = steps.flatMap((s) => s.view.log.map((entry) => entry.type));
    expect(types).toContain('warn');
  });

  it('ignores an empty word', () => {
    const root = emptyTrie();
    expect(drain(trieInsert(root, '  ')) as TrieNode).toBe(root);
  });
});

describe('trieSearch', () => {
  it('finds a word that is there', () => {
    let root = emptyTrie();
    for (const word of ['cat', 'car']) {
      root = drain(trieInsert(root, word)) as TrieNode;
    }

    const found = drain(trieSearch(root, 'cat')) as TrieNode | null;
    expect(found?.isEnd).toBe(true);
  });

  it('does not find a word that is not there', () => {
    let root = emptyTrie();
    root = drain(trieInsert(root, 'cat')) as TrieNode;

    expect(drain(trieSearch(root, 'dog')) as TrieNode | null).toBeNull();
  });

  it('does not find a prefix that is not a word', () => {
    let root = emptyTrie();
    root = drain(trieInsert(root, 'cart')) as TrieNode;

    expect(drain(trieSearch(root, 'car')) as TrieNode | null).toBeNull();
  });
});

describe('trieAutocomplete', () => {
  it('finds every word with a prefix', () => {
    let root = emptyTrie();
    for (const word of ['cat', 'car', 'cart', 'dog']) {
      root = drain(trieInsert(root, word)) as TrieNode;
    }

    const results = drain(trieAutocomplete(root, 'ca')) as string[];

    expect(results.sort()).toEqual(['car', 'cart', 'cat']);
  });

  it('finds nothing for a prefix that is not there', () => {
    let root = emptyTrie();
    root = drain(trieInsert(root, 'cat')) as TrieNode;

    expect(drain(trieAutocomplete(root, 'zz')) as string[]).toEqual([]);
  });
});

describe('trieDelete', () => {
  it('removes a word', () => {
    let root = emptyTrie();
    for (const word of ['cat', 'car']) {
      root = drain(trieInsert(root, word)) as TrieNode;
    }

    root = drain(trieDelete(root, 'cat')) as TrieNode;

    expect(wordsIn(root)).toEqual(['car']);
  });

  it('prunes the nodes that no longer lead anywhere', () => {
    let root = emptyTrie();
    root = drain(trieInsert(root, 'cat')) as TrieNode;

    root = drain(trieDelete(root, 'cat')) as TrieNode;

    // The whole branch is gone, because nothing else used it.
    expect(Object.keys(root.children)).toEqual([]);
  });

  it('keeps the branch that another word still uses', () => {
    let root = emptyTrie();
    for (const word of ['cat', 'car']) {
      root = drain(trieInsert(root, word)) as TrieNode;
    }

    root = drain(trieDelete(root, 'cat')) as TrieNode;

    expect(Object.keys(root.children)).toContain('c');
    expect(wordsIn(root)).toEqual(['car']);
  });

  it('does nothing for a word that is not there', () => {
    let root = emptyTrie();
    root = drain(trieInsert(root, 'cat')) as TrieNode;

    root = drain(trieDelete(root, 'dog')) as TrieNode;

    expect(wordsIn(root)).toEqual(['cat']);
  });
});

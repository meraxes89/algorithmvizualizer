import { describe, expect, it } from 'vitest';
import { sortingAlgorithms } from './sorting';
import { searchingAlgorithms } from './searching';
import { pathfindingAlgorithms } from './pathfinding';
import { sortingMeta } from './sorting/meta';
import { searchingMeta } from './searching/meta';
import { pathfindingMeta } from './pathfinding/meta';

/**
 * Drift-proofing for the family metadata.
 *
 * The metadata used to live in a parallel hand-keyed table
 * (`src/data/algorithmData.js`) that was only tied to the registries by
 * stringly-typed lookups — which is how BFS, DFS and Dijkstra ended up
 * with no explanation at all. It now lives on each registry entry as a
 * required `meta` field, and these tests keep that guarantee honest:
 * every entry carries complete metadata, and the meta tables hold
 * nothing that the registries do not point at.
 */

const LANGUAGES = ['cpp', 'java', 'python', 'javascript'] as const;

/** The shape every family entry must carry on its `meta` field. */
interface FamilyEntry {
  id: string;
  name: string;
  meta: {
    name: string;
    description: string;
    purpose: string;
    workingPrinciple: string;
    bestCase: string;
    averageCase: string;
    worstCase: string;
    spaceComplexity: string;
    applications: string[];
    advantages: string[];
    disadvantages: string[];
    pseudocode: string[];
    codeSnippets: Record<(typeof LANGUAGES)[number], string>;
  };
}

const families: ReadonlyArray<readonly [string, readonly FamilyEntry[]]> = [
  ['sorting', sortingAlgorithms],
  ['searching', searchingAlgorithms],
  ['pathfinding', pathfindingAlgorithms],
];

const metaTables: ReadonlyArray<
  readonly [string, Record<string, unknown>, readonly FamilyEntry[]]
> = [
  ['sorting', sortingMeta, sortingAlgorithms],
  ['searching', searchingMeta, searchingAlgorithms],
  ['pathfinding', pathfindingMeta, pathfindingAlgorithms],
];

const ids = (entries: readonly FamilyEntry[]): string[] => entries.map((entry) => entry.id);

/** Asserts one entry's metadata is complete and matches the entry itself. */
function expectCompleteMeta(family: string, entry: FamilyEntry): void {
  const where = `${family}/${entry.id}`;

  // The metadata names the algorithm the registry names.
  expect(entry.meta, `${where} meta exists`).toBeTruthy();
  expect(entry.meta.name, `${where} meta name matches the registry`).toBe(entry.name);

  for (const field of [
    'description',
    'purpose',
    'workingPrinciple',
    'bestCase',
    'averageCase',
    'worstCase',
    'spaceComplexity',
  ] as const) {
    expect(entry.meta[field].length, `${where} ${field}`).toBeGreaterThan(0);
  }

  expect(entry.meta.pseudocode.length, `${where} pseudocode`).toBeGreaterThan(0);

  expect(Object.keys(entry.meta.codeSnippets).sort(), `${where} snippet languages`).toEqual(
    [...LANGUAGES].sort()
  );
  for (const language of LANGUAGES) {
    expect(
      entry.meta.codeSnippets[language].trim().length,
      `${where} ${language} snippet`
    ).toBeGreaterThan(0);
  }

  for (const list of ['applications', 'advantages', 'disadvantages'] as const) {
    expect(Array.isArray(entry.meta[list]), `${where} ${list} is an array`).toBe(true);
    expect(entry.meta[list].length, `${where} ${list}`).toBeGreaterThan(0);
    for (const item of entry.meta[list]) {
      expect(item.length, `${where} ${list} entry`).toBeGreaterThan(0);
    }
  }
}

describe('family metadata', () => {
  for (const [family, entries] of families) {
    describe(family, () => {
      it('gives every entry complete, matching metadata', () => {
        expect(entries.length, `${family} is not empty`).toBeGreaterThan(0);
        for (const entry of entries) {
          expectCompleteMeta(family, entry);
        }
      });
    });
  }

  it('keeps the meta tables in step with the registries', () => {
    for (const [family, table, entries] of metaTables) {
      expect(Object.keys(table).sort(), `${family} meta table keys`).toEqual(ids(entries).sort());
    }
  });

  it('gives the once-missing entries real metadata', () => {
    // These are the entries that used to fall through to an empty (or
    // wrong-algorithm) explanation because the old database never had
    // them, or the lookup key did not reach them.
    const byId = (entries: readonly FamilyEntry[], id: string): FamilyEntry => {
      const entry = entries.find((candidate) => candidate.id === id);
      expect(entry, `${id} exists`).toBeDefined();
      return entry as FamilyEntry;
    };

    const jumpSearch = byId(searchingAlgorithms, 'jumpSearch');
    expectCompleteMeta('searching', jumpSearch);
    expect(jumpSearch.meta.bestCase).toBe('O(1)');
    expect(jumpSearch.meta.worstCase).toBe('O(√n)');

    for (const [id, worstCase] of [
      ['bfs', 'O(V+E)'],
      ['dfs', 'O(V+E)'],
      ['dijkstra', 'O((V+E) log V)'],
    ] as const) {
      const entry = byId(pathfindingAlgorithms, id);
      expectCompleteMeta('pathfinding', entry);
      expect(entry.meta.worstCase).toBe(worstCase);
    }
  });
});

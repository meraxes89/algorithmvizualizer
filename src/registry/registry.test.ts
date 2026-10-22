import { describe, expect, it } from 'vitest';
import {
  algorithmFamilies,
  algorithmHref,
  allAlgorithms,
  familyById,
  familyByPath,
  tools,
  type AlgorithmEntry,
  type AlgorithmFamily,
} from './index';
import { sortingAlgorithms } from '../algorithms/sorting';
import { searchingAlgorithms } from '../algorithms/searching';
import { pathfindingAlgorithms } from '../algorithms/pathfinding';
import { graphAlgorithms } from '../algorithms/graph';
import { dpAlgorithms } from '../algorithms/dp';
import { recursionAlgorithmsData } from '../data/recursionAlgorithms';

/**
 * The registry is display-only, so it names ids and names a second time
 * instead of importing the generators. These tests are what keeps the
 * second copy honest: they compare it against the family registries,
 * which remain the source of truth.
 */
const familyOf = (id: AlgorithmFamily['id']) => familyById(id);

const ids = (entries: readonly { id: string }[]) => entries.map((entry) => entry.id);
const names = (entries: readonly { name: string }[]) => entries.map((entry) => entry.name);

describe('registry', () => {
  it('mirrors the sorting family', () => {
    const family = familyOf('sorting');
    expect(ids(family.algorithms)).toEqual(ids(sortingAlgorithms));
    expect(names(family.algorithms)).toEqual(names(sortingAlgorithms));
  });

  it('mirrors the searching family', () => {
    const family = familyOf('searching');
    expect(ids(family.algorithms)).toEqual(ids(searchingAlgorithms));
    expect(names(family.algorithms)).toEqual(names(searchingAlgorithms));
  });

  it('mirrors the pathfinding family', () => {
    const family = familyOf('pathfinding');
    expect(ids(family.algorithms)).toEqual(ids(pathfindingAlgorithms));
    expect(names(family.algorithms)).toEqual(names(pathfindingAlgorithms));
  });

  it('mirrors the graph family', () => {
    const family = familyOf('graph');
    expect(ids(family.algorithms)).toEqual(ids(graphAlgorithms));
    expect(names(family.algorithms)).toEqual(names(graphAlgorithms));
  });

  it('mirrors the dynamic programming family', () => {
    const family = familyOf('dp');
    expect(ids(family.algorithms)).toEqual(ids(dpAlgorithms));
    expect(names(family.algorithms)).toEqual(names(dpAlgorithms));
  });

  it('is what the shell uses to reach an algorithm', () => {
    // `?algo=` rides on the family's own path, url-encoded.
    expect(algorithmHref('sorting', 'heapSort')).toBe('/sorting?algo=heapSort');
    expect(algorithmHref('graph', "Prim's MST")).toBe("/graph?algo=Prim's%20MST");
  });

  describe('family integrity', () => {
    it('gives every family a path, a tag, a description and algorithms', () => {
      for (const family of algorithmFamilies) {
        expect(family.path.startsWith('/'), `${family.id} path`).toBe(true);
        expect(family.tag.length, `${family.id} tag`).toBeGreaterThan(0);
        expect(family.shortName.length, `${family.id} shortName`).toBeGreaterThan(0);
        expect(family.description.length, `${family.id} description`).toBeGreaterThan(0);
        expect(family.algorithms.length, `${family.id} algorithms`).toBeGreaterThan(0);
      }
    });

    it('keeps every algorithm on its family path, with ids unique inside the family', () => {
      for (const family of algorithmFamilies) {
        for (const algorithm of family.algorithms) {
          expect(algorithm.path, `${family.id}/${algorithm.id} path`).toBe(family.path);
          expect(algorithm.family, `${family.id}/${algorithm.id} family`).toBe(family.id);
          expect(algorithm.id.length, `${family.id} id`).toBeGreaterThan(0);
          expect(algorithm.name.length, `${family.id}/${algorithm.id} name`).toBeGreaterThan(0);
        }
        expect(new Set(ids(family.algorithms)).size, `${family.id} unique ids`).toBe(
          family.algorithms.length
        );
      }
    });

    it('finds families by id and by path', () => {
      expect(familyById('sorting').id).toBe('sorting');
      expect(familyByPath('/trees')?.id).toBe('trees');
      expect(familyByPath('/nowhere')).toBeUndefined();
    });
  });

  describe('tree operations', () => {
    const traversals = familyOf('trees').algorithms.find((entry) => entry.id === 'traversals');

    it('lists the four traversals, uniquely', () => {
      expect(traversals?.operations?.map((operation) => operation.id)).toEqual([
        'preOrder',
        'inOrder',
        'postOrder',
        'levelOrder',
      ]);
    });

    it('does not claim operations for the single-view categories', () => {
      const single = familyOf('trees').algorithms.filter((entry) => !entry.operations);
      expect(ids(single)).toEqual(['bst', 'avl', 'heap', 'trie', 'segmentTree']);
    });
  });

  describe('recursion groups', () => {
    const recursion = familyOf('recursion');

    it('carries every recursion algorithm', () => {
      expect(ids(recursion.algorithms)).toEqual([
        'factorial',
        'fibonacci',
        'permutations',
        'combinationSum',
        'generateParentheses',
        'subsets',
        'nQueens',
        'sudoku',
        'ratInMaze',
        'knightsTour',
        'towerOfHanoi',
      ]);
    });

    it('names each entry the way the content table does', () => {
      const data = recursionAlgorithmsData as Record<string, { name: string }>;
      expect(ids(recursion.algorithms)).toEqual(Object.keys(data));
      for (const entry of recursion.algorithms) {
        expect(entry.name, entry.id).toBe(data[entry.id].name);
      }
    });

    it('gives every entry a group and a visualizer kind', () => {
      for (const entry of recursion.algorithms) {
        expect(entry.group, `${entry.id} group`).toBeTruthy();
        expect(['tree', 'grid', 'puzzle'], `${entry.id} kind`).toContain(entry.kind);
      }
    });

    it('keeps the groups in the order the page shows them', () => {
      const groups = [...new Set(recursion.algorithms.map((entry) => entry.group))];
      expect(groups).toEqual(['Tree Recursion', 'Grid Backtracking', 'Classic Puzzles']);
    });

    it('sends each group to the visualizer that can play it', () => {
      const kinds = Object.fromEntries(
        recursion.algorithms.map((entry) => [entry.group, entry.kind])
      );
      expect(kinds).toEqual({
        'Tree Recursion': 'tree',
        'Grid Backtracking': 'grid',
        'Classic Puzzles': 'puzzle',
      });
    });
  });

  describe('tools', () => {
    it('lists playground, arena and quiz once each', () => {
      expect(ids(tools)).toEqual(['arena', 'playground', 'quiz']);
      expect(new Set(ids(tools)).size).toBe(tools.length);
      expect(new Set(tools.map((tool) => tool.path)).size).toBe(tools.length);
    });

    it('gives every tool copy for its card', () => {
      for (const tool of tools) {
        expect(tool.description.length, `${tool.id} description`).toBeGreaterThan(0);
        expect(tool.features.length, `${tool.id} features`).toBeGreaterThan(0);
      }
    });
  });

  describe('dogfood', () => {
    // The point of the registry: these three live in three different
    // families and one test proves they reached every listing.
    const dogfood: [string, AlgorithmEntry | undefined][] = [
      ['sorting', allAlgorithms.find((entry) => entry.id === 'heapSort')],
      ['searching', allAlgorithms.find((entry) => entry.id === 'jumpSearch')],
      ['dp', allAlgorithms.find((entry) => entry.id === 'fibonacci')],
    ];

    it.each(dogfood)('carries %s', (_family, entry) => {
      expect(entry).toBeDefined();
      expect(entry?.name).toBeTruthy();
    });

    it('has a home for every family in the flattened view', () => {
      expect(new Set(allAlgorithms.map((entry) => entry.family)).size).toBe(
        algorithmFamilies.length
      );
    });
  });
});

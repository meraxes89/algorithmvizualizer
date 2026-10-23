import { lazy, Suspense } from 'react';
import { Trees } from 'lucide-react';
const TreeVisualizer = lazy(() => import('../components/TreeVisualizer'));
const BSTVisualizer = lazy(() => import('../components/BSTVisualizer'));
const AVLVisualizer = lazy(() => import('../components/AVLVisualizer'));
const HeapVisualizer = lazy(() => import('../components/HeapVisualizer'));
const TrieVisualizer = lazy(() => import('../components/TrieVisualizer'));
const SegmentTreeVisualizer = lazy(() => import('../components/SegmentTreeVisualizer'));
import {
  inOrderTraversal,
  levelOrderTraversal,
  postOrderTraversal,
  preOrderTraversal,
} from '../algorithms/trees/traversals/traversals';
import { treeAlgorithmData } from '../data/treeAlgorithms';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { familyById } from '../registry';
import { useParamSelection } from '../hooks/useParamSelection';

// Traversal operations bind the registry's operation ids to the
// generators and the metadata panels. The list itself lives in the
// registry, so a new operation is one line there plus one line here.
const TRAVERSALS = {
  preOrder: { fn: preOrderTraversal, info: treeAlgorithmData.traversals.preOrder },
  inOrder: { fn: inOrderTraversal, info: treeAlgorithmData.traversals.inOrder },
  postOrder: { fn: postOrderTraversal, info: treeAlgorithmData.traversals.postOrder },
  levelOrder: { fn: levelOrderTraversal, info: treeAlgorithmData.traversals.levelOrder },
};

// Visualizers that are a whole category rather than an operation.
const VISUALIZERS = {
  bst: BSTVisualizer,
  avl: AVLVisualizer,
  heap: HeapVisualizer,
  trie: TrieVisualizer,
  segmentTree: SegmentTreeVisualizer,
};

const TreeAlgorithms = () => {
  const categories = familyById('trees').algorithms.map((entry) => ({
    ...entry,
    operations: (entry.operations ?? []).map((operation) => ({
      ...operation,
      ...TRAVERSALS[operation.id],
    })),
  }));

  const { selected: selectedCategory, select: selectCategory } = useParamSelection(
    categories,
    'algo',
    { clear: ['op'] }
  );
  const { selected: selectedOperation, select: selectOperation } = useParamSelection(
    selectedCategory.operations,
    'op'
  );

  const CategoryVisualizer = VISUALIZERS[selectedCategory.id];

  return (
    <PageShell
      kicker={<span>Tree Data Structures</span>}
      title="Tree Algorithms"
      subtitle="Traversals, rotations, heaps, tries and segment trees — grown before your eyes."
      icon={Trees}
      layoutKey="TREES"
      tabs={
        <div className="flex flex-col items-center gap-3">
          <SegmentedTabs
            items={categories}
            value={selectedCategory.id}
            onChange={selectCategory}
            label="Tree categories"
          />
          {selectedCategory.operations.length > 0 && selectedOperation && (
            <SegmentedTabs
              items={selectedCategory.operations}
              value={selectedOperation.id}
              onChange={selectOperation}
              size="sm"
              label="Tree algorithms"
            />
          )}
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="flex min-h-[420px] items-center justify-center text-xs font-semibold text-ink-3">
            Growing tree…
          </div>
        }
      >
        {CategoryVisualizer ? (
          <CategoryVisualizer />
        ) : (
          <TreeVisualizer
            algorithm={selectedOperation?.fn}
            algorithmInfo={selectedOperation?.info}
          />
        )}
      </Suspense>
    </PageShell>
  );
};

export default TreeAlgorithms;

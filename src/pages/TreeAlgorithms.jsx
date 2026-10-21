import { useState, lazy, Suspense } from 'react';
import { Trees } from 'lucide-react';
const TreeVisualizer = lazy(() => import('../components/TreeVisualizer'));
const BSTVisualizer = lazy(() => import('../components/BSTVisualizer'));
const AVLVisualizer = lazy(() => import('../components/AVLVisualizer'));
const HeapVisualizer = lazy(() => import('../components/HeapVisualizer'));
const TrieVisualizer = lazy(() => import('../components/TrieVisualizer'));
const SegmentTreeVisualizer = lazy(() => import('../components/SegmentTreeVisualizer'));
import { preOrderTraversal, inOrderTraversal, postOrderTraversal, levelOrderTraversal } from '../algorithms/trees/traversals';
import { algorithmData } from '../data/treeAlgorithms';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';

const TreeAlgorithms = () => {
  const categories = [
    {
      name: 'Traversals',
      list: [
        { name: 'Pre-order', fn: preOrderTraversal, info: algorithmData.traversals.preOrder },
        { name: 'In-order', fn: inOrderTraversal, info: algorithmData.traversals.inOrder },
        { name: 'Post-order', fn: postOrderTraversal, info: algorithmData.traversals.postOrder },
        { name: 'Level-order', fn: levelOrderTraversal, info: algorithmData.traversals.levelOrder },
      ],
    },
    { name: 'BST Operations', isBST: true, list: [] },
    { name: 'AVL Rotations', isAVL: true, list: [] },
    { name: 'Heap Operations', isHeap: true, list: [] },
    { name: 'Trie', isTrie: true, list: [] },
    { name: 'Segment Tree', isSegmentTree: true, list: [] },
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(categories[0].list[0]);

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedAlgorithm(category.list[0]);
  };

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
            value={selectedCategory.name}
            onChange={selectCategory}
            label="Tree categories"
          />
          {selectedCategory.list.length > 0 && (
            <SegmentedTabs
              items={selectedCategory.list}
              value={selectedAlgorithm?.name}
              onChange={setSelectedAlgorithm}
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
        {selectedCategory.isBST ? (
          <BSTVisualizer />
        ) : selectedCategory.isAVL ? (
          <AVLVisualizer />
        ) : selectedCategory.isHeap ? (
          <HeapVisualizer />
        ) : selectedCategory.isTrie ? (
          <TrieVisualizer />
        ) : selectedCategory.isSegmentTree ? (
          <SegmentTreeVisualizer />
        ) : (
          <TreeVisualizer
            algorithm={selectedAlgorithm?.fn}
            algorithmInfo={selectedAlgorithm?.info}
          />
        )}
      </Suspense>
    </PageShell>
  );
};

export default TreeAlgorithms;

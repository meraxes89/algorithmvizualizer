import { useState } from 'react';
import { Boxes } from 'lucide-react';
import TreeRecursionVisualizer from '../components/TreeRecursionVisualizer';
import GridBacktrackingVisualizer from '../components/GridBacktrackingVisualizer';
import TowerOfHanoiVisualizer from '../components/TowerOfHanoiVisualizer';
import { recursionAlgorithmsData } from '../data/recursionAlgorithms';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';

const RecursionAlgorithms = () => {
  const categories = [
    {
      name: 'Tree Recursion',
      type: 'tree',
      list: [
        { id: 'factorial', ...recursionAlgorithmsData.factorial },
        { id: 'fibonacci', ...recursionAlgorithmsData.fibonacci },
        { id: 'permutations', ...recursionAlgorithmsData.permutations },
        { id: 'combinationSum', ...recursionAlgorithmsData.combinationSum },
        { id: 'generateParentheses', ...recursionAlgorithmsData.generateParentheses },
        { id: 'subsets', ...recursionAlgorithmsData.subsets },
      ],
    },
    {
      name: 'Grid Backtracking',
      type: 'grid',
      list: [
        { id: 'nQueens', ...recursionAlgorithmsData.nQueens },
        { id: 'sudoku', ...recursionAlgorithmsData.sudoku },
        { id: 'ratInMaze', ...recursionAlgorithmsData.ratInMaze },
        { id: 'knightsTour', ...recursionAlgorithmsData.knightsTour },
      ],
    },
    {
      name: 'Classic Puzzles',
      type: 'puzzle',
      list: [{ id: 'towerOfHanoi', ...recursionAlgorithmsData.towerOfHanoi }],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(categories[0].list[0]);

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedAlgorithm(category.list[0]);
  };

  return (
    <PageShell
      kicker={<span>Recursion & Backtracking</span>}
      title="Recursion Algorithms"
      subtitle="Call stacks, board states and classic puzzles unfolding frame by frame."
      icon={Boxes}
      layoutKey="RECURSION"
      tabs={
        <div className="flex flex-col items-center gap-3">
          <SegmentedTabs
            items={categories}
            value={selectedCategory.name}
            onChange={selectCategory}
            label="Recursion categories"
          />
          <SegmentedTabs
            items={selectedCategory.list}
            value={selectedAlgorithm.id}
            onChange={setSelectedAlgorithm}
            size="sm"
            label="Recursion algorithms"
          />
        </div>
      }
    >
      {selectedCategory.type === 'tree' && (
        <TreeRecursionVisualizer algorithmId={selectedAlgorithm.id} />
      )}
      {selectedCategory.type === 'grid' && (
        <GridBacktrackingVisualizer algorithmId={selectedAlgorithm.id} />
      )}
      {selectedCategory.type === 'puzzle' && (
        <TowerOfHanoiVisualizer algorithmId={selectedAlgorithm.id} />
      )}
    </PageShell>
  );
};

export default RecursionAlgorithms;

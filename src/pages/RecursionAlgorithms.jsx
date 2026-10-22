import { Boxes } from 'lucide-react';
import TreeRecursionVisualizer from '../components/TreeRecursionVisualizer';
import GridBacktrackingVisualizer from '../components/GridBacktrackingVisualizer';
import TowerOfHanoiVisualizer from '../components/TowerOfHanoiVisualizer';
import { recursionAlgorithmsData } from '../data/recursionAlgorithms';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { familyById } from '../registry';
import { useParamSelection } from '../hooks/useParamSelection';

// The list and the grouping come from the registry; the panels' copy
// comes from the content table. One id joins the two.
const ALGORITHMS = familyById('recursion').algorithms.map((entry) => ({
  ...recursionAlgorithmsData[entry.id],
  ...entry,
}));

const CATEGORIES = [...new Set(ALGORITHMS.map((entry) => entry.group))].map((name) => ({
  id: name,
  name,
  list: ALGORITHMS.filter((entry) => entry.group === name),
}));

const RecursionAlgorithms = () => {
  const { selected: selectedAlgorithm, select: selectAlgorithm } =
    useParamSelection(ALGORITHMS);

  const selectedCategory =
    CATEGORIES.find((category) => category.list.includes(selectedAlgorithm)) ?? CATEGORIES[0];

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
            items={CATEGORIES}
            value={selectedCategory.id}
            onChange={(category) => selectAlgorithm(category.list[0])}
            label="Recursion categories"
          />
          <SegmentedTabs
            items={selectedCategory.list}
            value={selectedAlgorithm.id}
            onChange={selectAlgorithm}
            size="sm"
            label="Recursion algorithms"
          />
        </div>
      }
    >
      {selectedAlgorithm.kind === 'tree' && (
        <TreeRecursionVisualizer algorithmId={selectedAlgorithm.id} />
      )}
      {selectedAlgorithm.kind === 'grid' && (
        <GridBacktrackingVisualizer algorithmId={selectedAlgorithm.id} />
      )}
      {selectedAlgorithm.kind === 'puzzle' && (
        <TowerOfHanoiVisualizer algorithmId={selectedAlgorithm.id} />
      )}
    </PageShell>
  );
};

export default RecursionAlgorithms;

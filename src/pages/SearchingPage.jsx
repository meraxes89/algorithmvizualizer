import { Search } from 'lucide-react';
import SearchingVisualizer from '../components/SearchingVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { searchingAlgorithms } from '../algorithms/searching';
import { algorithmDatabase } from '../data/algorithmData';
import { useParamSelection } from '../hooks/useParamSelection';

const SearchingPage = () => {
  const algorithms = searchingAlgorithms.map((entry) => ({
    id: entry.id,
    name: entry.name,
    algorithm: entry.generator,
    info: algorithmDatabase.searching[entry.id] ?? { name: entry.name },
  }));

  const { selected: selectedAlgorithm, select: selectAlgorithm } =
    useParamSelection(algorithms);

  return (
    <PageShell
      kicker={<span>Searching</span>}
      title="Searching Algorithms"
      subtitle="Watch the search space shrink, one comparison at a time."
      icon={Search}
      layoutKey="SEARCHING"
      tabs={
        <SegmentedTabs
          items={algorithms}
          value={selectedAlgorithm.id}
          onChange={selectAlgorithm}
          label="Searching algorithms"
        />
      }
    >
      <SearchingVisualizer
        algorithm={selectedAlgorithm.algorithm}
        algorithmInfo={selectedAlgorithm.info}
      />
    </PageShell>
  );
};

export default SearchingPage;

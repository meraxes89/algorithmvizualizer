import { useState } from 'react';
import { Search } from 'lucide-react';
import SearchingVisualizer from '../components/SearchingVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { searchingAlgorithms } from '../algorithms/searching';
import { algorithmDatabase } from '../data/algorithmData';

const SearchingPage = () => {
  const algorithms = searchingAlgorithms.map((entry) => ({
    name: entry.name,
    algorithm: entry.generator,
    info: algorithmDatabase.searching[entry.id] ?? { name: entry.name },
  }));

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);

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
          value={selectedAlgorithm.name}
          onChange={setSelectedAlgorithm}
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

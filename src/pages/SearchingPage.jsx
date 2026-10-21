import React, { useState } from 'react';
import { Search } from 'lucide-react';
import SearchingVisualizer from '../components/SearchingVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { linearSearch, linearSearchInfo } from '../algorithms/searching/linearSearch';
import { binarySearch, binarySearchInfo } from '../algorithms/searching/binarySearch';

const SearchingPage = () => {
  const algorithms = [
    { name: 'Linear Search', algorithm: linearSearch, info: linearSearchInfo },
    { name: 'Binary Search', algorithm: binarySearch, info: binarySearchInfo },
  ];

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

import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import DPVisualizer from '../components/DPVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';

const ALGORITHMS = [
  { key: 'knapsack', label: '0/1 Knapsack' },
  { key: 'lcs', label: 'Longest Common Subsequence' },
];

const DPPage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('knapsack');

  return (
    <PageShell
      kicker={<span>Dynamic Programming</span>}
      title="Dynamic Programming"
      subtitle="Tables filled cell by cell — watch subproblems become answers."
      icon={Brain}
      layoutKey="DP"
      tabs={
        <SegmentedTabs
          items={ALGORITHMS}
          value={selectedAlgo}
          onChange={(item) => setSelectedAlgo(item.key)}
          label="Dynamic programming problems"
        />
      }
    >
      <DPVisualizer algorithmType={selectedAlgo} />
    </PageShell>
  );
};

export default DPPage;

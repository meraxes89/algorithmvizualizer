import { useState } from 'react';
import { Brain } from 'lucide-react';
import DPVisualizer from '../components/DPVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { dpAlgorithms } from '../algorithms/dp';

// The tabs come from the family registry, so a new dynamic program
// appears here without touching the page.
const ALGORITHMS = dpAlgorithms.map((entry) => ({ key: entry.id, label: entry.name }));

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

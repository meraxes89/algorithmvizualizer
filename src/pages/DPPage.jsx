import { Brain } from 'lucide-react';
import DPVisualizer from '../components/DPVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { dpAlgorithms } from '../algorithms/dp';
import { useParamSelection } from '../hooks/useParamSelection';

// The tabs come from the family registry, so a new dynamic program
// appears here without touching the page.
const ALGORITHMS = dpAlgorithms.map((entry) => ({ id: entry.id, name: entry.name }));

const DPPage = () => {
  const { selected: selectedAlgo, select: selectAlgo } = useParamSelection(ALGORITHMS);

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
          value={selectedAlgo.id}
          onChange={selectAlgo}
          label="Dynamic programming problems"
        />
      }
    >
      <DPVisualizer algorithmType={selectedAlgo.id} />
    </PageShell>
  );
};

export default DPPage;

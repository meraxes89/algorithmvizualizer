import { Network } from 'lucide-react';
import GraphVisualizer from '../components/GraphVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { graphAlgorithms } from '../algorithms/graph';
import { useParamSelection } from '../hooks/useParamSelection';

// The tabs come from the family registry, so a new graph algorithm
// appears here without touching the page.
const ALGORITHMS = graphAlgorithms.map((entry) => ({
  id: entry.id,
  name: entry.name,
  info: { id: entry.id, name: entry.name },
}));

const GraphPage = () => {
  const { selected: selectedAlgorithm, select: selectAlgorithm } =
    useParamSelection(ALGORITHMS);

  return (
    <PageShell
      kicker={<span>Graph Theory</span>}
      title="Graph Algorithms"
      subtitle="Traversals and minimum spanning trees on graphs you build yourself."
      icon={Network}
      layoutKey="GRAPHS"
      tabs={
        <SegmentedTabs
          items={ALGORITHMS}
          value={selectedAlgorithm.id}
          onChange={selectAlgorithm}
          label="Graph algorithms"
        />
      }
    >
      <GraphVisualizer algorithmInfo={selectedAlgorithm.info} />
    </PageShell>
  );
};

export default GraphPage;

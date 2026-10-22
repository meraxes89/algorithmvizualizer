import { MapPin } from 'lucide-react';
import PathFindingVisualizer from '../components/PathFindingVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { pathfindingAlgorithms } from '../algorithms/pathfinding';
import { algorithmDatabase } from '../data/algorithmData';
import { useParamSelection } from '../hooks/useParamSelection';

const PathFindingPage = () => {
  const algorithms = pathfindingAlgorithms.map((entry) => ({
    id: entry.id,
    name: entry.name,
    algorithm: entry.generator,
    info: algorithmDatabase.pathfinding?.[entry.id] ?? { name: entry.name },
  }));

  const { selected: selectedAlgorithm, select: selectAlgorithm } =
    useParamSelection(algorithms);

  return (
    <PageShell
      kicker={<span>Pathfinding</span>}
      title="Pathfinding Algorithms"
      subtitle="Mazes, weighted grids and a 3D drone camera over the same search."
      icon={MapPin}
      layoutKey="PATHFINDING"
      tabs={
        <SegmentedTabs
          items={algorithms}
          value={selectedAlgorithm.id}
          onChange={selectAlgorithm}
          label="Pathfinding algorithms"
        />
      }
    >
      <PathFindingVisualizer
        algorithm={selectedAlgorithm.algorithm}
        algorithmKey={selectedAlgorithm.id}
        algorithmInfo={selectedAlgorithm.info}
      />
    </PageShell>
  );
};

export default PathFindingPage;

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import PathFindingVisualizer from '../components/PathFindingVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { pathfindingAlgorithms } from '../algorithms/pathfinding';
import { algorithmDatabase } from '../data/algorithmData';

const PathFindingPage = () => {
  const algorithms = pathfindingAlgorithms.map((entry) => ({
    name: entry.name,
    key: entry.id,
    algorithm: entry.generator,
    info: algorithmDatabase.pathfinding?.[entry.id] ?? { name: entry.name },
  }));

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);

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
          value={selectedAlgorithm.name}
          onChange={setSelectedAlgorithm}
          label="Pathfinding algorithms"
        />
      }
    >
      <PathFindingVisualizer
        algorithm={selectedAlgorithm.algorithm}
        algorithmKey={selectedAlgorithm.key}
        algorithmInfo={selectedAlgorithm.info}
      />
    </PageShell>
  );
};

export default PathFindingPage;

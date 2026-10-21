import { useState } from 'react';
import { MapPin } from 'lucide-react';
import PathFindingVisualizer from '../components/PathFindingVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { astar, astarInfo } from '../algorithms/pathfinding/astar';
import { dijkstra, dijkstraInfo } from '../algorithms/pathfinding/dijkstra';
import { bfs, bfsInfo } from '../algorithms/pathfinding/bfs';
import { dfs, dfsInfo } from '../algorithms/pathfinding/dfs';

const PathFindingPage = () => {
  const algorithms = [
    { name: 'A* Search', key: 'astar', algorithm: astar, info: astarInfo },
    { name: "Dijkstra's Algorithm", key: 'dijkstra', algorithm: dijkstra, info: dijkstraInfo },
    { name: 'Breadth-First Search', key: 'bfs', algorithm: bfs, info: bfsInfo },
    { name: 'Depth-First Search', key: 'dfs', algorithm: dfs, info: dfsInfo },
  ];

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

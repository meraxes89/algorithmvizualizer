import { useState } from 'react';
import { Network } from 'lucide-react';
import GraphVisualizer from '../components/GraphVisualizer';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';

const GraphPage = () => {
  const algorithms = [
    { name: 'BFS', info: { name: 'BFS' } },
    { name: 'DFS', info: { name: 'DFS' } },
    { name: 'Dijkstra', info: { name: 'Dijkstra' } },
    { name: 'Bellman-Ford', info: { name: 'Bellman-Ford' } },
    { name: 'Floyd-Warshall', info: { name: 'Floyd-Warshall' } },
    { name: "Prim's MST", info: { name: "Prim's MST" } },
    { name: "Kruskal's MST", info: { name: "Kruskal's MST" } },
    { name: 'Topological Sort', info: { name: 'Topological Sort' } },
  ];

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);

  return (
    <PageShell
      kicker={<span>Graph Theory</span>}
      title="Graph Algorithms"
      subtitle="Traversals and minimum spanning trees on graphs you build yourself."
      icon={Network}
      layoutKey="GRAPHS"
      tabs={
        <SegmentedTabs
          items={algorithms}
          value={selectedAlgorithm.name}
          onChange={setSelectedAlgorithm}
          label="Graph algorithms"
        />
      }
    >
      <GraphVisualizer algorithmInfo={selectedAlgorithm.info} />
    </PageShell>
  );
};

export default GraphPage;

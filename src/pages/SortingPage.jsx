import { useState } from 'react';
import { Scale, Sparkles, Layers } from 'lucide-react';
import SortingVisualizer from '../components/SortingVisualizer';
import ComparisonMode from '../components/educational/ComparisonMode';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { sortingAlgorithms } from '../algorithms/sorting';
import { useParamSelection } from '../hooks/useParamSelection';

const SortingPage = () => {
  const algorithms = sortingAlgorithms.map((entry) => ({
    id: entry.id,
    name: entry.name,
    algorithm: entry.generator,
    info: entry.meta,
  }));

  const { selected: selectedAlgorithm, select: selectAlgorithm } =
    useParamSelection(algorithms);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareAlgos, setCompareAlgos] = useState(null);

  const handleCompare = (algo1Name, algo2Name) => {
    const a1 = algorithms.find((a) => a.name === algo1Name);
    const a2 = algorithms.find((a) => a.name === algo2Name);
    if (a1 && a2) {
      setCompareAlgos([a1, a2]);
    }
  };

  const compareButton = (
    <button
      onClick={() => {
        setIsCompareOpen(!isCompareOpen);
        if (isCompareOpen) setCompareAlgos(null);
      }}
      className={`text-xs ${isCompareOpen ? 'btn-premium' : 'btn-secondary'}`}
    >
      <Scale className="w-4 h-4" />
      <span>{isCompareOpen ? 'Exit Compare' : 'Compare Mode'}</span>
    </button>
  );

  return (
    <PageShell
      kicker={
        <>
          <Sparkles className="w-3 h-3" />
          <span>Sorting</span>
        </>
      }
      title="Sorting Algorithms"
      subtitle="Bars, swaps and comparisons — with optional side-by-side races."
      icon={Layers}
      layoutKey="SORTING"
      actions={compareButton}
      tabs={
        !compareAlgos && (
          <SegmentedTabs
            items={algorithms}
            value={selectedAlgorithm.id}
            onChange={selectAlgorithm}
            label="Sorting algorithms"
          />
        )
      }
      stage={false}
    >
      {isCompareOpen && (
        <div className="glass-card mb-8 p-4">
          <ComparisonMode
            algorithms={algorithms}
            onCompare={handleCompare}
            isOpen={isCompareOpen}
          />
        </div>
      )}

      {compareAlgos ? (
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
          {compareAlgos.map((algo, index) => (
            <div
              key={algo.name}
              className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-line-subtle bg-paper-1/80 shadow-paper"
            >
              <SortingVisualizer
                algorithm={algo.algorithm}
                algorithmInfo={algo.info}
                playbackSource={index === 0 ? 'sorting' : `sorting:${algo.name}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[600px] w-full flex-1 flex-col overflow-hidden rounded-3xl border border-line-subtle bg-paper-1/80 shadow-paper">
          <SortingVisualizer
            algorithm={selectedAlgorithm.algorithm}
            algorithmInfo={selectedAlgorithm.info}
          />
        </div>
      )}
    </PageShell>
  );
};

export default SortingPage;

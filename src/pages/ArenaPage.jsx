import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Swords, Trophy, CheckCircle2, Search as SearchIcon, Network, BarChart2 } from 'lucide-react';
import SoundControls from '../components/SoundControls';
import { soundEngine } from '../utils/soundEngine';
import { triggerVictoryConfetti, getColorsFromTailwind } from '../utils/confettiHelper';
import { useTheme } from '../context/ThemeContext';
import RaceChart from '../components/RaceChart';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../components/Toast';
import PageShell from '../components/ui/PageShell';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import { SORTING_ALGORITHMS, SEARCHING_ALGORITHMS, PATHFINDING_ALGORITHMS } from '../algorithms/raceTraces';

const RACE_HISTORY_CAP = 300;
const GRID_ROWS = 8;
const GRID_COLS = 12;

const strokeColorFor = (color = '') =>
  color.includes('blue') || color.includes('indigo') ? '#6366f1' :
  color.includes('purple') ? '#a855f7' :
  color.includes('emerald') ? '#10b981' :
  color.includes('amber') || color.includes('orange') ? '#f59e0b' :
  color.includes('cyan') ? '#06b6d4' :
  color.includes('rose') ? '#f43f5e' : '#94a3b8';

const ArenaPage = () => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('sorting'); // 'sorting' | 'searching' | 'pathfinding'
  const [arraySize, setArraySize] = useState(30);
  const [speed, setSpeed] = useState(40);
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [raceHistory, setRaceHistory] = useState([]);
  const [commentary, setCommentary] = useState("Waiting for the race to begin...");

  const runnersRef = useRef({});
  const [runners, setRunners] = useState({});
  const winnerRef = useRef(null);
  const [searchTarget, setSearchTarget] = useState(45);

  const initCategory = (cat = activeCategory) => {
    setIsRunning(false);
    setWinner(null);
    winnerRef.current = null;
    setRaceHistory([]);
    setCommentary(`Welcome to the ${cat} arena! Select your settings and start the race.`);

    let initial = {};

    if (cat === 'sorting') {
      const arr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 85) + 15);
      Object.keys(SORTING_ALGORITHMS).forEach(key => {
        initial[key] = {
          array: [...arr],
          comparing: [],
          swapped: [],
          comps: 0,
          swaps: 0,
          finished: false,
          generator: SORTING_ALGORITHMS[key].generator(arr)
        };
      });
    } else if (cat === 'searching') {
      const arr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10).sort((a, b) => a - b);
      const target = arr[Math.floor(Math.random() * arr.length)];
      setSearchTarget(target);

      Object.keys(SEARCHING_ALGORITHMS).forEach(key => {
        initial[key] = {
          array: [...arr],
          comparing: [],
          comps: 0,
          finished: false,
          foundIndex: null,
          generator: SEARCHING_ALGORITHMS[key].generator(arr, target)
        };
      });
    } else if (cat === 'pathfinding') {
      Object.keys(PATHFINDING_ALGORITHMS).forEach(key => {
        initial[key] = {
          visitedCount: 0,
          activeNode: null,
          steps: 0,
          finished: false,
          generator: PATHFINDING_ALGORITHMS[key].generator(GRID_ROWS, GRID_COLS)
        };
      });
    }

    runnersRef.current = initial;
    setRunners({ ...initial });
  };

  useEffect(() => {
    initCategory(activeCategory);
  }, [activeCategory, arraySize]);

  useEffect(() => {
    let intervalId = null;
    if (isRunning) {
      intervalId = setInterval(() => {
        const current = runnersRef.current;
        let activeCount = 0;
        let newlyFinished = [];

        Object.keys(current).forEach(key => {
          const runner = current[key];
          if (runner.finished) return;

          const res = runner.generator.next();
          if (res.done || res.value.finished) {
            current[key] = {
              ...runner,
              ...res.value,
              finished: true
            };
            newlyFinished.push(key);
          } else {
            activeCount++;
            current[key] = {
              ...runner,
              ...res.value
            };

            const val1 = res.value.array ? res.value.array[res.value.comparing?.[0] || 0] : (res.value.visitedCount || res.value.comps || 50);
            const idx = res.value.comparing?.[0] || 0;
            const len = res.value.array?.length || 100;
            const algoName = SORTING_ALGORITHMS[key]?.name || SEARCHING_ALGORITHMS[key]?.name || PATHFINDING_ALGORITHMS[key]?.name || '';

            soundEngine.playCompare(val1 || 50, 10, 100, {
              algorithm: algoName,
              index: idx,
              arrayLength: len
            });
          }
        });

        setRaceHistory(history => {
          const newPoint = { time: history.length };
          Object.keys(current).forEach(key => {
            newPoint[key] = current[key].comps || current[key].steps || 0;
          });
          const next = [...history, newPoint];
          return next.length > RACE_HISTORY_CAP ? next.slice(next.length - RACE_HISTORY_CAP) : next;
        });

        if (activeCount > 0 && Math.random() > 0.8) {
          const activeKeys = Object.keys(current).filter(k => !current[k].finished);
          if (activeKeys.length > 0) {
            const leader = activeKeys.reduce((min, curr) =>
              (current[curr].comps || current[curr].steps || 0) < (current[min].comps || current[min].steps || 0) ? curr : min
            );
            const leaderName = getActiveDict()[leader]?.name;

            const phrases = [
              `${leaderName} is making quick work of this!`,
              `${leaderName} takes an early lead!`,
              `Look at ${leaderName} go! Very efficient.`,
              `${leaderName} is pulling ahead in operations!`,
              `It's a tight race, but ${leaderName} seems to be optimizing well!`
            ];
            setCommentary(phrases[Math.floor(Math.random() * phrases.length)]);
          }
        }

        if (newlyFinished.length > 0 && !winnerRef.current) {
          winnerRef.current = newlyFinished[0];
          const champ = getActiveDict()[winnerRef.current];
          triggerVictoryConfetti(getColorsFromTailwind(champ?.color));
          setCommentary(`🎉 ${champ?.name} wins the race! What an incredible performance!`);
          toast.success(`${champ?.name} wins the race!`);
          setWinner(champ?.name);
        }

        if (activeCount === 0) {
          setIsRunning(false);
        }

        setRunners({ ...current });
      }, Math.max(33, 100 - speed));
    }
    return () => clearInterval(intervalId);
  }, [isRunning, speed]);

  const toggleRun = () => {
    if (Object.values(runnersRef.current).every(r => r.finished)) {
      initCategory(activeCategory);
    }
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, runners, activeCategory, toggleRun]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') setIsRunning(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const getActiveDict = () => {
    if (activeCategory === 'sorting') return SORTING_ALGORITHMS;
    if (activeCategory === 'searching') return SEARCHING_ALGORITHMS;
    return PATHFINDING_ALGORITHMS;
  };

  const CATEGORY_TABS = [
    { id: 'sorting', label: 'Sorting Race', icon: BarChart2 },
    { id: 'searching', label: 'Search Race', icon: SearchIcon },
    { id: 'pathfinding', label: 'Pathfinding Race', icon: Network },
  ];

  return (
    <PageShell
      kicker={
        <>
          <Swords className="w-3 h-3" />
          <span>Battle Arena</span>
        </>
      }
      title="Algorithm Battle Arena"
      subtitle="Race algorithms side-by-side across sorting, searching and pathfinding."
      icon={Swords}
      layoutKey="ARENA"
      stage={false}
      actions={
        <>
          <SoundControls />
          <button
            onClick={() => initCategory(activeCategory)}
            disabled={isRunning}
            className="btn-secondary px-4 py-2 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Battle</span>
          </button>
          <button
            onClick={toggleRun}
            title="Start or pause the race [Space]"
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-paper ${
              isRunning
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-ink text-paper-1 hover:bg-accent'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'PAUSE [SPACE]' : 'START [SPACE]'}</span>
          </button>
        </>
      }
      tabs={
        <SegmentedTabs
          items={CATEGORY_TABS.map((tab) => ({ ...tab, disabled: isRunning }))}
          value={activeCategory}
          onChange={(item) => setActiveCategory(item.id)}
          label="Race category"
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-line-subtle bg-paper-2/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeCategory !== 'pathfinding' && (
            <div className="flex items-center gap-3">
              <span className="w-24 text-xs font-semibold text-ink-2">Data Size: {arraySize}</span>
              <input
                type="range"
                min="15"
                max="50"
                value={arraySize}
                disabled={isRunning}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="flex-1 cursor-pointer accent-accent"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="w-24 text-xs font-semibold text-ink-2">Speed: {speed}%</span>
            <input
              type="range"
              min="1"
              max="95"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1 cursor-pointer accent-accent"
            />
          </div>

          {activeCategory === 'searching' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
              <span>Target Value: {searchTarget}</span>
            </div>
          )}

          {winner && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Trophy className="w-4 h-4 text-amber-500" /> Winner: {winner}
            </div>
          )}
        </div>

        <AnimatePresence>
          <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Object.keys(getActiveDict()).map((key, index) => {
              const runner = runners[key] || {};
              const algInfo = getActiveDict()[key];
              const maxVal = Math.max(...(runner.array?.length ? runner.array : [0]), 100);

              return (
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 100, delay: index * 0.1 }}
                  key={key}
                  className={`relative flex flex-col rounded-3xl border p-5 transition-all ${
                    runner.finished && winner === algInfo.name
                      ? 'border-amber-500/60 bg-paper-2/70 ring-2 ring-amber-500/20'
                      : 'border-line-subtle bg-paper-2/60'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${algInfo.color}`} />
                      <h3 className="text-sm font-bold text-ink">{algInfo.name}</h3>
                      <span className="rounded-full border border-line-subtle bg-paper-1 px-2 py-0.5 font-mono text-[10px] text-ink-3">
                        {algInfo.complexity}
                      </span>
                    </div>

                    {runner.finished && (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Finished
                      </span>
                    )}
                  </div>

                  {activeCategory === 'sorting' && (
                    <div className="mb-4 flex h-44 items-end justify-center gap-1 overflow-hidden rounded-2xl border border-line-subtle bg-paper-1/70 p-3">
                      {runner.array?.map((val, idx) => {
                        const isComparing = runner.comparing?.includes(idx);
                        const isSwapped = runner.swapped?.includes(idx);

                        let barColor = `bg-gradient-to-t ${algInfo.color}`;
                        if (isSwapped) barColor = 'bg-rose-500';
                        else if (isComparing) barColor = 'bg-amber-400';

                        const scaleY = val / maxVal;

                        return (
                          <div
                            key={idx}
                            style={{ transform: `scaleY(${scaleY})`, transformOrigin: 'bottom' }}
                            className={`h-full flex-1 rounded-t-sm transition-all duration-75 ${barColor}`}
                          />
                        );
                      })}
                    </div>
                  )}

                  {activeCategory === 'searching' && (
                    <div className="mb-4 flex h-44 items-end justify-center gap-1 overflow-hidden rounded-2xl border border-line-subtle bg-paper-1/70 p-3">
                      {runner.array?.map((val, idx) => {
                        const isComparing = runner.comparing?.includes(idx);
                        const isFound = runner.foundIndex === idx;

                        let barColor = 'bg-ink-3/40';
                        if (isFound) barColor = 'bg-emerald-500 ring-2 ring-emerald-400';
                        else if (isComparing) barColor = 'bg-amber-400';

                        const scaleY = val / maxVal;

                        return (
                          <div
                            key={idx}
                            style={{ transform: `scaleY(${scaleY})`, transformOrigin: 'bottom' }}
                            className={`h-full flex-1 rounded-t-sm transition-all duration-75 ${barColor}`}
                          />
                        );
                      })}
                    </div>
                  )}

                  {activeCategory === 'pathfinding' && (
                    <div className="mb-4 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-line-subtle bg-paper-1/70 p-2.5">
                      <div
                        className="grid h-full w-full gap-1"
                        style={{
                          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
                          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                        }}
                      >
                        {Array.from({ length: GRID_ROWS }).map((_, r) =>
                          Array.from({ length: GRID_COLS }).map((_, c) => {
                            const cellKey = `${r},${c}`;
                            const isStart = r === 1 && c === 1;
                            const isTarget = r === GRID_ROWS - 2 && c === GRID_COLS - 2;
                            const isVisited = runner.visitedSet ? runner.visitedSet.has(cellKey) : runner.visitedList?.includes(cellKey);
                            const isPath = runner.pathSet ? runner.pathSet.has(cellKey) : runner.pathList?.includes(cellKey);
                            const isActive = runner.activeNode && runner.activeNode[0] === r && runner.activeNode[1] === c;

                            let cellStyle = 'border-line-subtle bg-line-subtle';
                            if (isStart) cellStyle = 'bg-emerald-500 ring-2 ring-emerald-400';
                            else if (isTarget) cellStyle = 'bg-rose-500 ring-2 ring-rose-400';
                            else if (isPath) cellStyle = 'bg-amber-400 dark:bg-amber-500';
                            else if (isActive) cellStyle = 'animate-pulse bg-amber-300 dark:bg-amber-400';
                            else if (isVisited) cellStyle = 'bg-accent/30';

                            return (
                              <div
                                key={cellKey}
                                className={`flex items-center justify-center rounded-sm border text-[9px] transition-all duration-100 ${cellStyle}`}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 rounded-xl border border-line-subtle bg-paper-1/70 p-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                        {activeCategory === 'pathfinding' ? 'Total Operations' : 'Comparisons'}
                      </span>
                      <span className="font-mono text-sm font-bold text-ink">
                        {runner.steps || runner.comps || 0}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                        {activeCategory === 'sorting' ? 'Array Swaps' : activeCategory === 'searching' ? 'Status' : 'Exploration'}
                      </span>
                      <span className="font-mono text-sm font-bold text-ink">
                        {activeCategory === 'sorting'
                          ? runner.swaps || 0
                          : runner.foundIndex !== undefined && runner.foundIndex !== null
                            ? 'TARGET FOUND'
                            : runner.finished
                              ? 'DONE'
                              : 'RUNNING'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="glass-card flex h-[300px] flex-col p-5 lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <BarChart2 className="w-4 h-4 text-accent" />
              Live Operations Race
            </h3>
            <div className="min-h-0 w-full flex-1">
              <RaceChart
                history={raceHistory}
                gridColor={isDark ? '#4a4238' : '#e6ddcf'}
                series={Object.entries(getActiveDict()).map(([key, algInfo]) => ({
                  key,
                  name: algInfo.name,
                  color: strokeColorFor(algInfo.color),
                }))}
              />
            </div>
          </div>

          <div className="glass-card flex h-[300px] flex-col bg-accent-soft p-5">
            <h3 className="mb-2 text-sm font-bold text-ink">Live Commentary</h3>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.p
                key={commentary}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-lg font-bold italic leading-relaxed text-ink-2 md:text-xl"
              >
                "{commentary}"
              </motion.p>
              {isRunning && (
                <div className="mt-6 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};
export default ArenaPage;

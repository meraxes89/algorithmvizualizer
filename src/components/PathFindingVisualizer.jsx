import React, { useState, useEffect, useMemo, useCallback, lazy } from 'react';
import { Play, RotateCcw, Eraser, Box, Sparkles, Activity, ZoomIn, ZoomOut } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { createInitialGrid, SPEED_PRESETS } from '../utils/animationHelpers';
import { generateComplexMaze } from '../algorithms/pathfinding/mazeGenerator';
const PathFinding3DVisualizer = lazy(() => import('./3D/PathFinding3DVisualizer'));
import SoundControls from './SoundControls';
import OdometerCounter from './OdometerCounter';
import GridCanvas from './pathfinding/GridCanvas';
import StepControls from './educational/StepControls';
import { usePlayback } from '../hooks/usePlayback';
import { collectSteps } from '../core/playback';
import { pathfindingAlgorithmByKey } from '../algorithms/pathfinding';
import { cellKey } from '../algorithms/pathfinding/grid';

// ─── Synchronous algorithm runners (no delays) ────────────────────────────────

// The grid, reduced to what a pathfinding algorithm needs: where the
// walls are.
const toGridModel = (grid) =>
  grid.map((row) => row.map((node) => ({ row: node.row, col: node.col, isWall: node.isWall })));

// The route from one cell to another, computed without animating it.
// This is the same generator the animated run uses, so the preview and
// the run can never disagree.
const computePreviewPath = (generator, grid, from, to) => {
  if (!generator || grid.length === 0) return [];

  const steps = collectSteps(generator(toGridModel(grid), from, to));
  const last = steps[steps.length - 1];
  return last?.view.path ?? [];
};

// ─── Component ────────────────────────────────────────────────────────────────

const ROWS = 20;
const COLS = 48;

const PathFindingVisualizer = React.memo(({ algorithmInfo, algorithmKey: algorithmKeyProp }) => {
  const [grid, setGrid] = useState([]);
  const [startPos, setStartPos] = useState({ row: 10, col: 4 });
  const [endPos, setEndPos] = useState({ row: 10, col: 43 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(null); // 'start' | 'end' | null
  const [is3DMode, setIs3DMode] = useState(false);
  const [liveMode] = useState(false);
  const [selectedMazeType, setSelectedMazeType] = useState('dfs'); // 'dfs' | 'recursive_division' | 'prims'
  // The route shown while dragging in live mode. It is not part of the
  // trace, so it lives in its own state.
  const [previewPath, setPreviewPath] = useState(null);
  const algorithmKey = algorithmKeyProp
    || (algorithmInfo?.name?.toLowerCase().includes('a*') ? 'astar'
    : ['bfs', 'breadth'].some((s) => algorithmInfo?.name?.toLowerCase().includes(s)) ? 'bfs'
    : ['dfs', 'depth'].some((s) => algorithmInfo?.name?.toLowerCase().includes(s)) ? 'dfs' : 'dijkstra');

  const algorithm = useMemo(() => pathfindingAlgorithmByKey(algorithmKey).generator, [algorithmKey]);

  // The trace. Computed up front and purely, so scrubbing is instant.
  const steps = useMemo(() => {
    if (!algorithm || grid.length === 0) return [];
    return collectSteps(algorithm(toGridModel(grid), startPos, endPos));
  }, [algorithm, grid, startPos, endPos]);

  const {
    index,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    next,
    previous,
    seek,
    reset,
  } = usePlayback(steps, {
    speed: SPEED_PRESETS.FAST,
    source: 'pathfinding',
    meta: { algorithm: algorithmInfo?.name ?? '' },
  });

  const view = steps[index]?.view;

  // How much work the run did, as far as the current step shows it.
  const stats = useMemo(() => {
    if (!view) return null;
    return { visited: view.visited.length, path: view.path.length };
  }, [view]);

  // The grid as it is drawn: the walls from the state, the visited cells
  // and the route from the current step.
  const displayGrid = useMemo(() => {
    const visited = new Set((view?.visited ?? []).map(cellKey));
    const path = new Set((view?.path ?? []).map(cellKey));
    const preview = new Set(previewPath ?? []);

    return grid.map((row) =>
      row.map((node) => {
        const key = cellKey(node);
        return {
          ...node,
          isVisited: visited.has(key),
          isPath: path.has(key) || preview.has(key),
        };
      })
    );
  }, [grid, view, previewPath]);

  // Build fresh base grid (walls only, no path/visited)
  const buildBaseGrid = useCallback(() => {
    const initial = createInitialGrid(ROWS, COLS);
    initial[startPos.row][startPos.col].isStart = true;
    initial[endPos.row][endPos.col].isEnd = true;
    return initial;
  }, [startPos, endPos]);

  useEffect(() => {
    const baseGrid = buildBaseGrid();
    // Default to a pre-generated maze for immediate visual appeal in 3D mode
    const initialGrid = generateComplexMaze(baseGrid, startPos, endPos, 'recursive_division');
    setGrid(initialGrid);
  }, []);

  // Live-mode: re-run instantly whenever positions change
  useEffect(() => {
    if (!liveMode || isPlaying || grid.length === 0) return;
    setPreviewPath(computePreviewPath(algorithm, grid, startPos, endPos).map(cellKey));
  }, [liveMode, algorithm, grid, startPos, endPos]);

  // ── Reset
  const handleReset = () => {
    if (isPlaying) return;
    const g = grid.map(row =>
      row.map(node => ({ ...node, isVisited: false, isPath: false, distance: Infinity, previousNode: null }))
    );
    setGrid(g);
  };

  const handleClearWalls = () => {
    if (isPlaying) return;
    const g = grid.map(row =>
      row.map(node => ({ ...node, isWall: false, isVisited: false, isPath: false, distance: Infinity, previousNode: null }))
    );
    setGrid(g);
  };

  const handleGenerateMaze = (overrideType) => {
    if (isPlaying || grid.length === 0) return;
    const typeToUse = typeof overrideType === 'string' ? overrideType : selectedMazeType;
    const newGrid = generateComplexMaze(grid, startPos, endPos, typeToUse);
    setGrid(newGrid);
  };

  // ── Animated visualize
  const visualize = () => {
    if (isPlaying) return;
    play();
  };

  const handleStepPlay = () => play();
  const handleStepPause = () => pause();
  const handleStepNext = () => {
    pause();
    next();
  };
  const handleStepPrevious = () => {
    pause();
    previous();
  };
  const handleStepReset = () => reset();

  // ── Mouse handlers
  const handleMouseDown = (row, col) => {
    if (isPlaying) return;
    if (row === startPos.row && col === startPos.col) { setIsDragging('start'); return; }
    if (row === endPos.row && col === endPos.col) { setIsDragging('end'); return; }
    setIsDrawing(true);
    toggleWall(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isPlaying) return;
    if (isDragging === 'start') {
      if (row === endPos.row && col === endPos.col) return;
      const newStart = { row, col };
      setStartPos(newStart);
      // Update grid immediately
      setGrid(prev => {
        const g = prev.map(r => r.map(n => ({ ...n, isStart: false })));
        g[row][col] = { ...g[row][col], isStart: true, isWall: false, isVisited: false, isPath: false };
        if (liveMode) {
          setPreviewPath(
            computePreviewPath(algorithm, g, { row, col }, endPos).map(cellKey)
          );
        }
        return g.map(r => r.map(n => ({ ...n, isVisited: false, isPath: false, distance: Infinity, previousNode: null })));
      });
      return;
    }
    if (isDragging === 'end') {
      if (row === startPos.row && col === startPos.col) return;
      const newEnd = { row, col };
      setEndPos(newEnd);
      setGrid(prev => {
        const g = prev.map(r => r.map(n => ({ ...n, isEnd: false })));
        g[row][col] = { ...g[row][col], isEnd: true, isWall: false, isVisited: false, isPath: false };
        if (liveMode) {
          setPreviewPath(
            computePreviewPath(algorithm, g, startPos, { row, col }).map(cellKey)
          );
        }
        return g.map(r => r.map(n => ({ ...n, isVisited: false, isPath: false, distance: Infinity, previousNode: null })));
      });
      return;
    }
    if (!isDrawing) return;
    if (row === startPos.row && col === startPos.col) return;
    if (row === endPos.row && col === endPos.col) return;
    toggleWall(row, col);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setIsDrawing(false);
  };

  const toggleWall = (row, col) => {
    setGrid(prev =>
      prev.map(r =>
        r.map(n => {
          if (n.row === row && n.col === col) {
            return { ...n, isWall: !n.isWall, isVisited: false, isPath: false };
          }
          return { ...n, isVisited: false, isPath: false };
        })
      )
    );
  };

  return (
    <div className="w-full flex-1 min-h-[600px] relative flex flex-col bg-slate-50 dark:bg-black rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800/80">
      
      {/* Top Header & Telemetry Bar */}
      <div className="w-full z-10 p-4 sm:p-6 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/80">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            {algorithmInfo?.name || 'Pathfinding Algorithm'}
          </h2>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            {algorithmInfo?.description || 'Finds the shortest path between the start and end nodes.'}
          </p>
        </div>

        {/* Telemetry & Info Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-800/80 shadow-sm">
            <span className="opacity-60 mr-1">Time:</span> <span className="font-mono font-bold">{algorithmInfo?.timeComplexity || 'O(V+E)'}</span>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-800/80 shadow-sm">
            <span className="opacity-60 mr-1">Space:</span> <span className="font-mono font-bold">{algorithmInfo?.spaceComplexity || 'O(V)'}</span>
          </div>
          {stats && (
            <>
              <div className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20 shadow-sm flex items-center gap-1">
                <span className="opacity-70">Visited:</span> <OdometerCounter value={stats.visited} />
              </div>
              <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-sm flex items-center gap-1">
                <span className="opacity-70">Path:</span> <OdometerCounter value={stats.path} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Grid View / 3D Canvas Viewport */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden p-4 pb-32 select-none">
        {is3DMode ? (
          <div className="w-full h-full min-h-[450px]">
            <PathFinding3DVisualizer grid={displayGrid} startPos={startPos} endPos={endPos} />
          </div>
        ) : (
          <TransformWrapper initialScale={1} minScale={0.5} maxScale={3} centerOnInit={true} panning={{ excluded: ['canvas'] }}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Floating 2D Grid Zoom Widget */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/80 p-1 rounded-xl shadow-md">
                  <button
                    onClick={() => zoomIn()}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <TransformComponent wrapperClassName="w-full h-full" contentClassName="w-full h-full flex items-center justify-center">
                  <div className="w-full max-w-[960px] rounded-2xl border border-line-subtle bg-paper-1 p-1 shadow-paper">
                    <GridCanvas
                      grid={displayGrid}
                      rows={ROWS}
                      cols={COLS}
                      onCellDown={handleMouseDown}
                      onCellEnter={handleMouseEnter}
                      onPointerUp={handleMouseUp}
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </div>

      {/* Legend & HUD Floating Control Dock */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-0 mx-auto z-20 flex flex-col items-center gap-2 w-full max-w-full px-2 pointer-events-none">
        
        {/* Compact Horizontal Legend Dock */}
        <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 bg-white/75 dark:bg-zinc-950/85 backdrop-blur-xl border border-slate-200/50 dark:border-zinc-800/80 px-3 sm:px-4 py-1 rounded-full shadow-lg text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 overflow-x-auto max-w-full scrollbar-hide">
          {[
            ['bg-emerald-500', 'Start'],
            ['bg-rose-500', 'End'],
            ['bg-slate-700', 'Wall'],
            ['bg-blue-400', 'Visited'],
            ['bg-yellow-400', 'Path'],
          ].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-1.5 whitespace-nowrap">
              <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
              <span className="uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Step Controls (Floating above HUD) */}
        {steps.length > 0 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 scale-90 origin-bottom shadow-2xl rounded-2xl">
            <StepControls
              currentStep={index + 1}
              totalSteps={steps.length}
              isPlaying={isPlaying}
              onPlay={handleStepPlay}
              onPause={handleStepPause}
              onResume={handleStepPlay}
              onNext={handleStepNext}
              onPrevious={handleStepPrevious}
              onReset={handleStepReset}
              onSeek={seek}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          </div>
        )}

        {/* Floating HUD Controls Pill Container */}
        <div className="pointer-events-auto w-full max-w-full overflow-x-auto scrollbar-hide flex justify-start sm:justify-center px-1">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-slate-200/60 dark:border-zinc-800/80 p-1.5 sm:p-2 rounded-2xl shadow-2xl shadow-indigo-500/10 min-w-max mx-auto">
            
            <button
              onClick={visualize}
              disabled={isPlaying}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Play size={15} fill="currentColor" /> Visualize
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>

            {/* Generator Group */}
            <div className="flex items-center bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors">
              <button
                onClick={() => handleGenerateMaze()}
                disabled={isPlaying}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-[12px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <Sparkles size={14} className="text-indigo-500" /> Generate Maze
              </button>
              <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-800"></div>
              <select
                value={selectedMazeType}
                onChange={(e) => {
                  setSelectedMazeType(e.target.value);
                  handleGenerateMaze(e.target.value);
                }}
                disabled={isPlaying}
                className="bg-transparent text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1.5 focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="dfs" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">DFS</option>
                <option value="recursive_division" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Div</option>
                <option value="prims" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Prim</option>
              </select>
            </div>

            <button
              onClick={handleReset}
              disabled={isPlaying}
              title="Reset Board"
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={handleClearWalls}
              disabled={isPlaying}
              title="Clear Walls"
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
            >
              <Eraser size={16} />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>

            <button
              onClick={() => setIs3DMode(!is3DMode)}
              title="Toggle 3D Mode"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all border whitespace-nowrap ${
                is3DMode
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-sm shadow-cyan-500/10'
                  : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Box size={15} className={is3DMode ? "text-cyan-500" : ""} /> {is3DMode ? '3D' : '2D'}
            </button>

            <SoundControls className="scale-90" />

            {/* Speed Group */}
            <div className="flex bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-0.5">
              {[['1x', 100], ['2x', 30], ['MAX', 8]].map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => setSpeed(val)}
                  disabled={isPlaying}
                  className={`px-2 py-1 rounded text-[10px] font-black tracking-wider transition-all ${
                    speed === val ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
});

export default PathFindingVisualizer;

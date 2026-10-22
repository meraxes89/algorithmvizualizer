import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plus, Trash2, Search, Shuffle, RotateCcw, Settings, BarChart3, MessageSquare } from 'lucide-react';
import { SPEED_PRESETS } from '../utils/animationHelpers';
import { generateRandomAVL, getTreeStats } from '../algorithms/trees/avl/avl';
import { avlInsert } from '../algorithms/trees/avl/avl-insert';
import { avlDelete, avlSearch } from '../algorithms/trees/avl/avl-operations';
import { layoutTree } from '../algorithms/trees/layout';
import { treeFromSnapshot } from '../algorithms/trees/tree';
import { usePlayback } from '../hooks/usePlayback';
import { collectSteps } from '../core/playback';

/* ------------------------------------------------------------------ */
/*  AVLVisualizer – fully interactive AVL tree playground             */
/* ------------------------------------------------------------------ */

const AVLVisualizer = React.memo(() => {
  // Tree state
  const [avlRoot, setAvlRoot] = useState(null);
  const [stats, setStats] = useState({ height: 0, nodeCount: 0, min: '-', max: '-' });

  // Animation state
  // The trace of the operation being played, and the engine playing it.
  const [trace, setTrace] = useState([]);
  const { index, isPlaying } = usePlayback(trace, {
    autoplay: true,
    speed: SPEED_PRESETS.MEDIUM,
    source: 'trees',
    meta: { algorithm: 'AVL' },
  });

  // Everything on screen comes from the current step's view.
  const view = trace[index]?.view;
  const activeNode = view?.active ?? null;
  const visitedNodes = view?.order ?? [];
  const rotatingNodes = view?.rotating ?? [];
  const nodeWithState = (state) =>
    Object.entries(view?.states ?? {}).find(([, value]) => value === state)?.[0] ?? null;
  const foundNode = nodeWithState('found');
  const deletingNode = nodeWithState('deleting');
  const isRunning = isPlaying;

  // We need a ref for the root so the refreshLayout callback always
  // sees the latest root during recursive animated operations.
  const rootRef = useRef(null);

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [speed, setSpeed] = useState(SPEED_PRESETS.MEDIUM);
  const [showSettings, setShowSettings] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showStats, setShowStats] = useState(true);


  const logEndRef = useRef(null);

  // Refresh the stats. The layout comes from the current step.
  const refreshTree = useCallback((root) => {
    setStats(getTreeStats(root));
  }, []);

  // The tree on screen is the one the current step carries, so a
  // rotation is visible the moment it happens.
  const treeData = useMemo(() => {
    const root = treeFromSnapshot(view?.nodes ?? {});
    return root ? layoutTree(root) : { nodes: [], edges: [] };
  }, [view]);

  // Init
  useEffect(() => {
    handleRandomTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /* ---------- helpers ---------- */

  const logs = useMemo(
    () => (view?.log ?? []).map((entry) => ({ ...entry, ts: 0 })),
    [view]
  );

  const clearAnimation = () => {
    setTrace([]);
  };

  const parsedValue = () => {
    const v = parseInt(inputValue, 10);
    if (isNaN(v) || v < 1 || v > 999) return null;
    return v;
  };

  /* ---------- operations ---------- */

  const handleRandomTree = () => {
    if (isRunning) return;
    clearAnimation();
    const root = generateRandomAVL(7, 5, 95);
    setAvlRoot(root);
    rootRef.current = root;
    refreshTree(root);
  };

  const handleReset = () => {
    if (isRunning) return;
    clearAnimation();
    setAvlRoot(null);
    rootRef.current = null;
    setStats({ height: 0, nodeCount: 0, min: '-', max: '-' });
  };

  const handleInsert = () => {
    const val = parsedValue();
    if (val === null || isRunning) return;

    const steps = collectSteps(avlInsert(avlRoot, val));
    const newRoot = avlRoot;

    setAvlRoot(newRoot);
    rootRef.current = newRoot;
    refreshTree(newRoot);
    setTrace(steps);
    setInputValue('');
  };

  const handleSearch = () => {
    const val = parsedValue();
    if (val === null || isRunning) return;

    setTrace(collectSteps(avlSearch(avlRoot, val)));
  };

  const handleDelete = () => {
    const val = parsedValue();
    if (val === null || isRunning) return;

    const steps = collectSteps(avlDelete(avlRoot, val));
    const newRoot = avlRoot;

    setAvlRoot(newRoot);
    rootRef.current = newRoot;
    refreshTree(newRoot);
    setTrace(steps);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isRunning) handleInsert();
  };

  /* ---------- node colour logic ---------- */

  const getGradId = (id) => {
    if (rotatingNodes.includes(id)) return 'avl-grad-rotating';
    if (deletingNode === id) return 'avl-grad-deleting';
    if (foundNode === id) return 'avl-grad-found';
    if (activeNode === id) return 'avl-grad-active';
    if (visitedNodes.includes(id)) return 'avl-grad-visited';
    return 'avl-grad-default';
  };

  const getStrokeColor = (id) => {
    if (rotatingNodes.includes(id)) return 'var(--viz-node-active-soft)';
    if (deletingNode === id) return 'var(--viz-node-delete-soft)';
    if (foundNode === id) return 'var(--viz-node-found-soft)';
    if (activeNode === id) return 'var(--viz-node-active-soft)';
    if (visitedNodes.includes(id)) return 'var(--viz-node-visited-soft)';
    return 'var(--viz-node-default-soft)';
  };

  /* ---------- log styling ---------- */

  const logColor = (type) => {
    switch (type) {
      case 'start':    return 'text-blue-600 dark:text-blue-300';
      case 'compare':    return 'text-amber-800 dark:text-amber-300';
      case 'success':    return 'text-emerald-800 dark:text-emerald-300';
      case 'error':    return 'text-red-700 dark:text-red-400';
      case 'warn':    return 'text-yellow-700 dark:text-yellow-300';
      case 'delete':    return 'text-rose-700 dark:text-rose-300';
      case 'rotation': return 'text-orange-700 dark:text-orange-300';
      case 'info':
      default:         return 'text-slate-600 dark:text-slate-300';
    }
  };

  const logIcon = (type) => {
    switch (type) {
      case 'start':    return '▶';
      case 'compare':  return '⇄';
      case 'success':  return '✓';
      case 'error':    return '✗';
      case 'warn':     return '⚠';
      case 'delete':   return '🗑';
      case 'rotation': return '↻';
      case 'info':
      default:         return 'ℹ';
    }
  };

  /* ---------- helper: balance factor colour ---------- */

  const bfColor = (bf) => {
    if (bf === 0) return 'var(--viz-ink-muted)';        // slate-500
    if (bf === 1 || bf === -1) return 'var(--viz-info-text)';  // blue-700/300
    return 'var(--viz-danger-strong)';                       // red-600 – imbalanced
  };

  /* ---------- render ---------- */

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-t-lg shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">AVL Tree Operations</h2>
          <p className="text-xs mt-0.5">
            Insert, Delete &amp; Search with rotation animations
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-black/20 px-2.5 py-1 rounded-full">
            <span className="font-semibold">Time:</span> O(log n)
          </div>
          <div className="bg-black/20 px-2.5 py-1 rounded-full">
            <span className="font-semibold">Space:</span> O(n)
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-center gap-3">
        {/* Value input */}
        <input aria-label="Value to insert, search, or delete"
          type="number"
          min={1}
          max={999}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Value (1–999)"
          disabled={isRunning}
          className="w-32 px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm focus:border-blue-400 focus:outline-none text-sm placeholder-slate-500 disabled:opacity-50"
        />

        {/* Operation buttons */}
        <button
          onClick={handleInsert}
          disabled={isRunning || !parsedValue()}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Plus size={16} />
          Insert
        </button>

        <button
          onClick={handleSearch}
          disabled={isRunning || !parsedValue() || !avlRoot}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Search size={16} />
          Search
        </button>

        <button
          onClick={handleDelete}
          disabled={isRunning || !parsedValue() || !avlRoot}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Trash2 size={16} />
          Delete
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          onClick={handleRandomTree}
          disabled={isRunning}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Shuffle size={16} />
          Random Tree
        </button>

        <button
          onClick={handleReset}
          disabled={isRunning}
          className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors text-sm border shadow-sm ${
            showSettings ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Settings size={16} />
          Speed
        </button>

        <button
          onClick={() => setShowStats(!showStats)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors text-sm border shadow-sm ${
            showStats ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <BarChart3 size={16} />
          Stats
        </button>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors text-sm border shadow-sm ${
            showExplanation ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <MessageSquare size={16} />
          Log
        </button>
      </div>

      {/* Speed settings */}
      {showSettings && (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
          <span className="text-slate-700 dark:text-slate-200 text-sm font-semibold">Animation Speed</span>
          <div className="flex gap-2">
            {Object.entries(SPEED_PRESETS).map(([name, value]) => (
              <button
                key={name}
                onClick={() => setSpeed(value)}
                className={`px-3 py-1 rounded border text-sm transition-colors ${
                  speed === value ? 'bg-blue-600 text-white shadow-sm border-blue-600' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {name.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats bar */}
      {showStats && (
        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-2 flex flex-wrap gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Nodes:</span>
            <span className="text-slate-700 dark:text-slate-200 font-bold">{stats.nodeCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Height:</span>
            <span className="text-slate-700 dark:text-slate-200 font-bold">{stats.height}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Min:</span>
            <span className="text-emerald-800 dark:text-emerald-400 font-bold">{stats.min}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">Max:</span>
            <span className="text-rose-700 dark:text-rose-400 font-bold">{stats.max}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* SVG Tree */}
        <div 
          className="flex-1 flex items-center justify-center p-2 overflow-hidden relative dark:bg-slate-900"
          style={{ backgroundColor: 'var(--viz-canvas)', backgroundImage: 'radial-gradient(var(--viz-canvas-dot) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          {treeData.nodes.length === 0 ? (
            <div className="text-slate-600 dark:text-slate-400 text-lg font-medium select-none">
              Enter a value and click <span className="text-violet-700 dark:text-violet-300">Insert</span> or press{' '}
              <span className="text-violet-400">Random Tree</span>
            </div>
          ) : (
            <svg viewBox="0 0 1100 460" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
              <defs>
                <filter id="avl-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="var(--viz-shadow)" floodOpacity="0.45" />
                </filter>
                {/* Gradients */}
                <radialGradient id="avl-grad-default" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="var(--viz-node-default-from)" />
                  <stop offset="100%" stopColor="var(--viz-node-default-to)" />
                </radialGradient>
                <radialGradient id="avl-grad-visited" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="var(--viz-node-visited-from)" />
                  <stop offset="100%" stopColor="var(--viz-node-visited-to)" />
                </radialGradient>
                <radialGradient id="avl-grad-active" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="var(--viz-node-active-from)" />
                  <stop offset="100%" stopColor="var(--viz-node-active-to)" />
                </radialGradient>
                <radialGradient id="avl-grad-found" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="var(--viz-node-found-from)" />
                  <stop offset="100%" stopColor="var(--viz-sorted)" />
                </radialGradient>
                <radialGradient id="avl-grad-deleting" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="var(--viz-node-delete-from)" />
                  <stop offset="100%" stopColor="var(--viz-node-delete-to)" />
                </radialGradient>
                <radialGradient id="avl-grad-rotating" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="var(--viz-node-warn-from)" />
                  <stop offset="100%" stopColor="var(--viz-node-warn-to)" />
                </radialGradient>
              </defs>

              {/* Edges */}
              {treeData.edges.map((edge, i) => {
                const fromActive = activeNode === edge.from.id || visitedNodes.includes(edge.from.id);
                const toActive = activeNode === edge.to.id;
                const isRotating = rotatingNodes.includes(edge.from.id) && rotatingNodes.includes(edge.to.id);
                return (
                  <line
                    key={`edge-${i}`}
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    stroke={isRotating ? 'var(--viz-warning)' : fromActive && toActive ? 'var(--viz-compare)' : 'var(--viz-edge)'}
                    strokeWidth={isRotating ? 5 : fromActive && toActive ? 4 : 3}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Nodes */}
              {treeData.nodes.map((node) => {
                const gradId = getGradId(node.id);
                const strokeClr = getStrokeColor(node.id);
                const isHighlighted =
                  activeNode === node.id ||
                  foundNode === node.id ||
                  deletingNode === node.id ||
                  rotatingNodes.includes(node.id);

                const h = node.height || 1;
                const bf = (node.left ? node.left.height || 1 : 0) - (node.right ? node.right.height || 1 : 0);

                return (
                  <g
                    key={`node-${node.id}`}
                    className="cursor-pointer"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  >
                    {/* Ambient glow ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={48}
                      fill="none"
                      stroke={strokeClr}
                      strokeWidth={isHighlighted ? 3 : 1.5}
                      opacity={isHighlighted ? 0.6 : 0.25}
                      className="transition-all duration-300"
                    />

                    {/* Main circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={38}
                      fill={`url(#${gradId})`}
                      stroke={strokeClr}
                      strokeWidth={isHighlighted ? 3.5 : 2}
                      filter="url(#avl-shadow)"
                      className="transition-all duration-300"
                    />

                    {/* Value */}
                    <text
                      x={node.x}
                      y={node.y - 4}
                      textAnchor="middle"
                      dy=".38em"
                      fill="var(--viz-node-text)"
                      fontSize="20"
                      fontWeight="800"
                      fontFamily="monospace"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                    >
                      {node.val}
                    </text>

                    {/* Height label (top-right) */}
                    <text
                      x={node.x + 30}
                      y={node.y - 30}
                      textAnchor="middle"
                      fill="var(--viz-active)"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      h={h}
                    </text>

                    {/* Balance factor label (bottom) */}
                    <text
                      x={node.x}
                      y={node.y + 18}
                      textAnchor="middle"
                      fill={bfColor(bf)}
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      BF={bf}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Log Panel */}
        {showExplanation && (
          <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-500" />
              <span className="text-slate-800 dark:text-slate-100 font-semibold text-sm">Algorithm Log</span>
              <button
                onClick={() => setTrace([])}
                className="ml-auto text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs font-mono">
              {logs.length === 0 && (
                <p className="text-slate-600 dark:text-slate-400 text-center mt-6">
                  Perform an operation to see step‑by‑step logs here.
                </p>
              )}
              {logs.map((entry, i) => (
                <div key={i} className={`flex gap-2 ${logColor(entry.type)}`}>
                  <span className="shrink-0 w-4 text-center">{logIcon(entry.type)}</span>
                  <span className="leading-relaxed">{entry.text}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 dark:bg-slate-800 p-3 flex flex-wrap gap-4 justify-center text-sm rounded-b-lg border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-active)' }} />
          <span className="text-slate-600 dark:text-slate-300">Unvisited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-compare)' }} />
          <span className="text-slate-600 dark:text-slate-300">Visiting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-sorted)' }} />
          <span className="text-slate-600 dark:text-slate-300">Visited / Found</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-node-warn-to)' }} />
          <span className="text-slate-600 dark:text-slate-300">Rotating</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-node-delete-to)' }} />
          <span className="text-slate-600 dark:text-slate-300">Deleting</span>
        </div>
      </div>
    </div>
  );
});

export default AVLVisualizer;

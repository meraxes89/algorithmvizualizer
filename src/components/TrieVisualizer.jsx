import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plus, Trash2, Search, Shuffle, RotateCcw, Settings, BarChart3, MessageSquare, TextCursorInput } from 'lucide-react';
import { SPEED_PRESETS } from '../utils/animationHelpers';
import {
  buildTrieFromWords,
  generateRandomWords,
} from '../algorithms/trees/trie/trie';
import {
  trieAutocomplete,
  trieDelete,
  trieInsert,
  trieSearch,
} from '../algorithms/trees/trie/trie';
import { getTrieStats, layoutTrie } from '../algorithms/trees/trie/trie-layout';
import { usePlayback } from '../hooks/usePlayback';
import { collectSteps } from '../core/playback';

/* ------------------------------------------------------------------ */
/*  TrieVisualizer – interactive Prefix Tree playground               */
/* ------------------------------------------------------------------ */

const TrieVisualizer = React.memo(() => {
  // Tree state
  const [trieRoot, setTrieRoot] = useState(null);
  const [treeData, setTreeData] = useState({ nodes: [], edges: [] });
  const [stats, setStats] = useState({ wordCount: 0, nodeCount: 0, maxDepth: 0 });

  // Animation state
  // The trace of the operation being played, and the engine playing it.
  const [trace, setTrace] = useState([]);
  const { index, isPlaying } = usePlayback(trace, {
    autoplay: true,
    speed: SPEED_PRESETS.MEDIUM,
    source: 'trie',
    meta: { algorithm: 'Trie' },
  });

  // Everything on screen comes from the current step's view.
  const view = trace[index]?.view;
  const activeNode = view?.active ?? null;
  const visitedNodes = view?.order ?? [];
  const foundNodes = view?.found ?? [];
  const deletingNode = useMemo(
    () =>
      Object.entries(view?.states ?? {}).find(([, state]) => state === 'deleting')?.[0] ??
      null,
    [view]
  );
  const isRunning = isPlaying;

  const logs = useMemo(
    () => (view?.log ?? []).map((entry) => ({ ...entry, ts: 0 })),
    [view]
  );

  // UI state
  const [inputValue, setInputValue] = useState('');
  const [speed, setSpeed] = useState(SPEED_PRESETS.MEDIUM);
  const [showSettings, setShowSettings] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showStats, setShowStats] = useState(true);


  const logEndRef = useRef(null);

  // Layout callback
  const refreshLayout = useCallback((root = trieRoot) => {
    if (!root) return;
    setTreeData(layoutTrie(root));
    setStats(getTrieStats(root));
  }, [trieRoot]);

  // Init
  useEffect(() => {
    handleRandomWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /* ---------- helpers ---------- */

  const clearAnimation = () => {
    setTrace([]);
  };

  const parsedValue = () => {
    const val = inputValue.trim().toLowerCase();
    return val.length > 0 ? val : null;
  };

  /* ---------- operations ---------- */

  const handleRandomWords = () => {
    if (isRunning) return;
    clearAnimation();
    const words = generateRandomWords(5);
    const root = buildTrieFromWords(words);
    setTrieRoot(root);
    refreshLayout(root);
    setTrace([]);
  };

  const handleReset = () => {
    if (isRunning) return;
    clearAnimation();
    const emptyRoot = buildTrieFromWords([]);
    setTrieRoot(emptyRoot);
    refreshLayout(emptyRoot);
  };

  const handleInsert = () => {
    const val = parsedValue();
    if (!val || isRunning) return;

    setTrace(collectSteps(trieInsert(trieRoot, val)));
    setInputValue('');
  };

  const handleSearch = () => {
    const val = parsedValue();
    if (!val || isRunning) return;

    setTrace(collectSteps(trieSearch(trieRoot, val)));
  };

  const handleAutocomplete = () => {
    const val = parsedValue();
    if (!val || isRunning) return;

    setTrace(collectSteps(trieAutocomplete(trieRoot, val)));
  };

  const handleDelete = () => {
    const val = parsedValue();
    if (!val || isRunning) return;

    setTrace(collectSteps(trieDelete(trieRoot, val)));
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isRunning) handleInsert();
  };

  /* ---------- UI rendering helpers ---------- */

  const getGradId = (node) => {
    if (deletingNode === node.id) return 'trie-grad-deleting';
    if (foundNodes.includes(node.id)) return 'trie-grad-found';
    if (activeNode === node.id) return 'trie-grad-active';
    if (visitedNodes.includes(node.id)) return 'trie-grad-visited';
    if (node.char === 'ROOT') return 'trie-grad-root';
    return 'trie-grad-default';
  };

  const getStrokeColor = (node) => {
    if (deletingNode === node.id) return 'var(--viz-node-delete-soft)';
    if (foundNodes.includes(node.id)) return 'var(--viz-node-found-soft)';
    if (activeNode === node.id) return 'var(--viz-node-active-soft)';
    if (visitedNodes.includes(node.id)) return 'var(--viz-node-visited-soft)';
    if (node.char === 'ROOT') return 'var(--viz-node-pivot-soft)';
    return 'var(--viz-node-default-soft)';
  };

  /* ---------- Log Styling ---------- */

  const logColor = (type) => {
    switch (type) {
      case 'start': return 'text-blue-600 dark:text-blue-300';
      case 'compare': return 'text-amber-800 dark:text-amber-300';
      case 'success': return 'text-emerald-800 dark:text-emerald-300';
      case 'error': return 'text-red-700 dark:text-red-400';
      case 'warn': return 'text-yellow-700 dark:text-yellow-300';
      case 'delete': return 'text-rose-700 dark:text-rose-300';
      case 'info':
      default: return 'text-slate-600 dark:text-slate-300';
    }
  };

  const logIcon = (type) => {
    switch (type) {
      case 'start': return '▶';
      case 'compare': return '⇄';
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warn': return '⚠';
      case 'delete': return '🗑';
      case 'info':
      default: return 'ℹ';
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-3 rounded-t-lg shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Trie (Prefix Tree)</h2>
          <p className="text-xs mt-0.5">
            Insert, Search, Autocomplete &amp; Delete
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-black/20 px-2.5 py-1 rounded-full">
            <span className="font-semibold">Time:</span> O(L) <span className="opacity-75 italic ml-1">L=length</span>
          </div>
          <div className="bg-black/20 px-2.5 py-1 rounded-full">
            <span className="font-semibold">Space:</span> O(N*L)
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <input aria-label="Word to insert, search, or delete"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/[^a-zA-Z]/g, ''))} // only alphabet
          onKeyDown={handleKeyDown}
          placeholder="Enter word..."
          disabled={isRunning}
          className="w-36 px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 shadow-sm focus:border-blue-400 focus:outline-none text-sm placeholder-slate-500 disabled:opacity-50"
        />

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
          disabled={isRunning || !parsedValue()}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Search size={16} />
          Search
        </button>

        <button
          onClick={handleAutocomplete}
          disabled={isRunning || !parsedValue()}
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <TextCursorInput size={16} />
          Autocomplete
        </button>

        <button
          onClick={handleDelete}
          disabled={isRunning || !parsedValue()}
          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Trash2 size={16} />
          Delete
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          onClick={handleRandomWords}
          disabled={isRunning}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
        >
          <Shuffle size={16} />
          Random Words
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
            showSettings ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Settings size={16} />
          Speed
        </button>

        <button
          onClick={() => setShowStats(!showStats)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors text-sm border shadow-sm ${
            showStats ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
          }`}
        >
          <BarChart3 size={16} />
          Stats
        </button>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-colors text-sm border shadow-sm ${
            showExplanation ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
          }`}
        >
          <MessageSquare size={16} />
          Log
        </button>
      </div>

      {/* Speed settings */}
      {showSettings && (
        <div className="bg-slate-100 p-3 flex items-center gap-3 border-b border-slate-200">
          <span className="text-slate-700 text-sm font-semibold">Animation Speed</span>
          <div className="flex gap-2">
            {Object.entries(SPEED_PRESETS).map(([name, value]) => (
              <button
                key={name}
                onClick={() => setSpeed(value)}
                className={`px-3 py-1 rounded border text-sm transition-colors ${
                  speed === value ? 'bg-blue-600 text-white shadow-sm border-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2 flex flex-wrap gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Total Words:</span>
            <span className="text-emerald-800 font-bold">{stats.wordCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Total Nodes:</span>
            <span className="text-slate-700 font-bold">{stats.nodeCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Max Depth:</span>
            <span className="text-cyan-700 font-bold">{stats.maxDepth}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* SVG Tree */}
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden relative"
          style={{ backgroundColor: 'var(--viz-canvas)', backgroundImage: 'radial-gradient(var(--viz-canvas-dot) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          <svg viewBox="0 0 1100 500" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
            <defs>
              <filter id="trie-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--viz-shadow)" floodOpacity="0.5" />
              </filter>
              {/* Gradients */}
              <radialGradient id="trie-grad-default" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="var(--viz-node-default-from)" />
                <stop offset="100%" stopColor="var(--viz-node-default-to)" />
              </radialGradient>
              <radialGradient id="trie-grad-root" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="var(--viz-node-pivot-from)" />
                <stop offset="100%" stopColor="var(--viz-node-pivot-to)" />
              </radialGradient>
              <radialGradient id="trie-grad-visited" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="var(--viz-node-visited-from)" />
                <stop offset="100%" stopColor="var(--viz-node-visited-to)" />
              </radialGradient>
              <radialGradient id="trie-grad-active" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="var(--viz-node-active-from)" />
                <stop offset="100%" stopColor="var(--viz-node-active-to)" />
              </radialGradient>
              <radialGradient id="trie-grad-found" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="var(--viz-node-found-from)" />
                <stop offset="100%" stopColor="var(--viz-sorted)" />
              </radialGradient>
              <radialGradient id="trie-grad-deleting" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="var(--viz-node-delete-from)" />
                <stop offset="100%" stopColor="var(--viz-node-delete-to)" />
              </radialGradient>
            </defs>

            {/* Edges */}
            {treeData.edges.map((edge, i) => {
              const fromActive = activeNode === edge.from.id || visitedNodes.includes(edge.from.id);
              const toActive = activeNode === edge.to.id || visitedNodes.includes(edge.to.id);
              const isFound = foundNodes.includes(edge.from.id) && foundNodes.includes(edge.to.id);
              const isDeleting = deletingNode === edge.to.id;

              let stroke = 'var(--viz-edge)';
              if (isDeleting) stroke = 'var(--viz-node-delete-to)';
              else if (isFound) stroke = 'var(--viz-sorted)';
              else if (fromActive && toActive) stroke = 'var(--viz-compare)';

              return (
                <g key={`edge-${i}`}>
                  <line
                    x1={edge.from.x}
                    y1={edge.from.y}
                    x2={edge.to.x}
                    y2={edge.to.y}
                    stroke={stroke}
                    strokeWidth={isFound || (fromActive && toActive) ? 3 : 2}
                    className="transition-all duration-300"
                  />
                  {/* Character on edge (optional, but nice for Trie) */}
                  <rect
                    x={(edge.from.x + edge.to.x) / 2 - 8}
                    y={(edge.from.y + edge.to.y) / 2 - 8}
                    width="16"
                    height="16"
                    fill="var(--viz-surface-2)"
                    rx="4"
                  />
                  <text
                    x={(edge.from.x + edge.to.x) / 2}
                    y={(edge.from.y + edge.to.y) / 2}
                    textAnchor="middle"
                    dy=".32em"
                    fill="var(--viz-ink)"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {edge.char}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {treeData.nodes.map((node) => {
              const gradId = getGradId(node);
              const strokeClr = getStrokeColor(node);
              const isHighlighted =
                activeNode === node.id ||
                foundNodes.includes(node.id) ||
                deletingNode === node.id;

              const isRoot = node.char === 'ROOT';
              const radius = isRoot ? 25 : 22;

              return (
                <g
                  key={`node-${node.id}`}
                  className="cursor-pointer"
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                >
                  {/* End-of-word indicator ring */}
                  {node.isEnd && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 6}
                      fill="none"
                      stroke="var(--viz-sorted)"
                      strokeWidth={3}
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Highlight ring */}
                  {isHighlighted && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 8}
                      fill="none"
                      stroke={strokeClr}
                      strokeWidth={2}
                      opacity={0.6}
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Main circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={`url(#${gradId})`}
                    stroke={node.isEnd ? 'var(--viz-sorted)' : strokeClr}
                    strokeWidth={node.isEnd ? 3 : 2}
                    filter="url(#trie-shadow)"
                    className="transition-all duration-300"
                  />

                  {/* Value */}
                  <text
                    x={node.x}
                    y={node.y + 1}
                    textAnchor="middle"
                    dy=".38em"
                    fill="var(--viz-node-text)"
                    fontSize={isRoot ? "12" : "18"}
                    fontWeight="800"
                    fontFamily="monospace"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                  >
                    {isRoot ? '*' : node.char}
                  </text>
                  
                  {/* End label text */}
                  {node.isEnd && (
                    <text
                       x={node.x + radius + 10}
                       y={node.y}
                       textAnchor="start"
                       dy=".3em"
                       fill="var(--viz-node-visited-from)"
                       fontSize="10"
                       fontWeight="bold"
                    >
                      [End]
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Log Panel */}
        {showExplanation && (
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-500" />
              <span className="text-slate-800 font-semibold text-sm">Algorithm Log</span>
              <button
                onClick={() => setTrace([])}
                className="ml-auto text-xs text-slate-600 hover:text-slate-800 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs font-mono">
              {logs.length === 0 && (
                <p className="text-slate-600 text-center mt-6">
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
      <div className="bg-slate-50 p-3 flex flex-wrap gap-4 justify-center text-sm rounded-b-lg border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-active)' }} />
          <span className="text-slate-600">Idle Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[var(--viz-sorted)] border-dashed rounded-full" />
          <span className="text-slate-600">End of Word</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-compare)' }} />
          <span className="text-slate-600">Active Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--viz-sorted)' }} />
          <span className="text-slate-600">Found</span>
        </div>
      </div>
    </div>
  );
});

export default TrieVisualizer;

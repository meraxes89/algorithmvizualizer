import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Eraser, Zap, Box, Grid, Sparkles, ChevronDown, Activity } from 'lucide-react';
import { createInitialGrid, resetGrid, SPEED_PRESETS } from '../utils/animationHelpers';
import { getNodesInShortestPathOrder } from '../algorithms/pathfinding/dijkstra';
import { generateComplexMaze } from '../algorithms/pathfinding/mazeGenerator';
import PathFinding3DVisualizer from './3D/PathFinding3DVisualizer';
import SoundControls from './SoundControls';
import soundEngine from '../utils/soundEngine';

// ─── Synchronous algorithm runners (no delays) ────────────────────────────────

function runAstarSync(grid, startNode, endNode) {
  const visited = [];
  startNode.distance = 0;
  startNode.fDistance = Math.abs(startNode.row - endNode.row) + Math.abs(startNode.col - endNode.col);
  const openSet = [startNode];
  while (openSet.length) {
    openSet.sort((a, b) => (a.fDistance || Infinity) - (b.fDistance || Infinity));
    const curr = openSet.shift();
    if (curr.isWall) continue;
    if (curr.distance === Infinity) return visited;
    curr.isVisited = true;
    visited.push(curr);
    if (curr === endNode) return visited;
    for (const nb of getNeighbors(curr, grid)) {
      const g = curr.distance + 1;
      if (g < nb.distance) {
        nb.distance = g;
        nb.fDistance = g + Math.abs(nb.row - endNode.row) + Math.abs(nb.col - endNode.col);
        nb.previousNode = curr;
        if (!openSet.includes(nb)) openSet.push(nb);
      }
    }
  }
  return visited;
}

function runDijkstraSync(grid, startNode, endNode) {
  const visited = [];
  startNode.distance = 0;
  const unvisited = getAllNodes(grid);
  while (unvisited.length) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const closest = unvisited.shift();
    if (closest.isWall) continue;
    if (closest.distance === Infinity) return visited;
    closest.isVisited = true;
    visited.push(closest);
    if (closest === endNode) return visited;
    for (const nb of getNeighbors(closest, grid)) {
      nb.distance = closest.distance + 1;
      nb.previousNode = closest;
    }
  }
  return visited;
}

function runBfsSync(grid, startNode, endNode) {
  const visited = [];
  const queue = [startNode];
  startNode.isVisited = true;
  while (queue.length) {
    const cur = queue.shift();
    if (cur.isWall) continue;
    visited.push(cur);
    if (cur === endNode) return visited;
    for (const nb of getNeighbors(cur, grid)) {
      nb.isVisited = true;
      nb.previousNode = cur;
      queue.push(nb);
    }
  }
  return visited;
}

function runDfsSync(grid, startNode, endNode) {
  const visited = [];
  const stack = [startNode];
  startNode.isVisited = true;
  while (stack.length) {
    const cur = stack.pop();
    if (cur.isWall) continue;
    visited.push(cur);
    if (cur === endNode) return visited;
    for (const nb of getNeighbors(cur, grid)) {
      nb.isVisited = true;
      nb.previousNode = cur;
      stack.push(nb);
    }
  }
  return visited;
}

function getAllNodes(grid) {
  return grid.flatMap(row => row);
}

function getNeighbors(node, grid) {
  const { row, col } = node;
  const nbs = [];
  if (row > 0) nbs.push(grid[row - 1][col]);
  if (row < grid.length - 1) nbs.push(grid[row + 1][col]);
  if (col > 0) nbs.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) nbs.push(grid[row][col + 1]);
  return nbs.filter(n => !n.isVisited && !n.isWall);
}

function deepCloneGrid(grid) {
  return grid.map(row =>
    row.map(node => ({ ...node, isVisited: false, isPath: false, distance: Infinity, previousNode: null }))
  );
}

function computeInstant(algorithmKey, grid, startRow, startCol, endRow, endCol) {
  const g = grid.map(row => row.map(node => ({ ...node, isVisited: false, isPath: false, distance: Infinity, previousNode: null })));
  const s = g[startRow][startCol];
  const e = g[endRow][endCol];
  s.isStart = true;
  e.isEnd = true;
  let runner;
  if (algorithmKey === 'astar') runner = runAstarSync;
  else if (algorithmKey === 'bfs') runner = runBfsSync;
  else if (algorithmKey === 'dfs') runner = runDfsSync;
  else runner = runDijkstraSync;

  runner(g, s, e);
  let cur = e;
  while (cur && cur.previousNode) {
    cur.isPath = true;
    cur = cur.previousNode;
  }
  if (s) s.isPath = true;
  return g;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ROWS = 20;
const COLS = 48;

const PathFindingVisualizer = ({ algorithm, algorithmInfo }) => {
  const [grid, setGrid] = useState([]);
  const [startPos, setStartPos] = useState({ row: 10, col: 4 });
  const [endPos, setEndPos] = useState({ row: 10, col: 43 });
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(null); // 'start' | 'end' | null
  const [is3DMode, setIs3DMode] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [speed, setSpeed] = useState(SPEED_PRESETS.FAST);
  const [selectedMazeType, setSelectedMazeType] = useState('dfs'); // 'dfs' | 'recursive_division' | 'prims'
  const [stats, setStats] = useState(null);
  const animationRef = useRef(null);
  const algorithmKey = algorithmInfo?.name?.toLowerCase().includes('a*') ? 'astar'
    : algorithmInfo?.name?.toLowerCase().includes('bfs') ? 'bfs'
    : algorithmInfo?.name?.toLowerCase().includes('dfs') ? 'dfs' : 'dijkstra';

  // Build fresh base grid (walls only, no path/visited)
  const buildBaseGrid = useCallback(() => {
    const initial = createInitialGrid(ROWS, COLS);
    initial[startPos.row][startPos.col].isStart = true;
    initial[endPos.row][endPos.col].isEnd = true;
    return initial;
  }, [startPos, endPos]);

  useEffect(() => {
    const g = buildBaseGrid();
    setGrid(g);
    setStats(null);
  }, []);

  // Live-mode: re-run instantly whenever positions change
  useEffect(() => {
    if (!liveMode || isVisualizing || grid.length === 0) return;
    const computed = computeInstant(
      algorithmKey, grid, startPos.row, startPos.col, endPos.row, endPos.col
    );
    setGrid(computed);
  }, [liveMode, startPos, endPos, algorithmKey]);

  // ── Reset
  const handleReset = () => {
    if (isVisualizing) return;
    if (animationRef.current) clearTimeout(animationRef.current);
    const g = grid.map(row =>
      row.map(node => ({ ...node, isVisited: false, isPath: false, distance: Infinity, previousNode: null }))
    );
    setGrid(g);
    setStats(null);
  };

  const handleClearWalls = () => {
    if (isVisualizing) return;
    const g = grid.map(row =>
      row.map(node => ({ ...node, isWall: false, isVisited: false, isPath: false, distance: Infinity, previousNode: null }))
    );
    setGrid(g);
    setStats(null);
  };

  const handleGenerateMaze = (overrideType) => {
    if (isVisualizing || grid.length === 0) return;
    const typeToUse = typeof overrideType === 'string' ? overrideType : selectedMazeType;
    const newGrid = generateComplexMaze(grid, startPos, endPos, typeToUse);
    setGrid(newGrid);
    setStats(null);
  };

  // ── Animated visualize
  const visualize = async () => {
    if (isVisualizing) return;
    setIsVisualizing(true);
    setStats(null);

    // Reset visited/path
    const baseGrid = grid.map(row =>
      row.map(node => ({ ...node, isVisited: false, isPath: false, distance: Infinity, previousNode: null }))
    );
    const sNode = baseGrid[startPos.row][startPos.col];
    const eNode = baseGrid[endPos.row][endPos.col];
    sNode.isStart = true; eNode.isEnd = true;

    // Choose runner
    let runner;
    if (algorithmKey === 'bfs') runner = runBfsSync;
    else if (algorithmKey === 'dfs') runner = runDfsSync;
    else runner = runDijkstraSync;

    // Compute all at once
    runner(baseGrid, sNode, eNode);

    // Collect visited order (re-run for order tracking)
    const gForAnim = grid.map(row =>
      row.map(node => ({ ...node, isVisited: false, isPath: false, distance: Infinity, previousNode: null }))
    );
    const s2 = gForAnim[startPos.row][startPos.col];
    const e2 = gForAnim[endPos.row][endPos.col];
    s2.isStart = true; e2.isEnd = true;

    const visitedOrder = [];
    // Collect with wrapper
    if (algorithmKey === 'astar') {
      s2.distance = 0;
      s2.fDistance = Math.abs(s2.row - e2.row) + Math.abs(s2.col - e2.col);
      const openSet = [s2];
      while (openSet.length) {
        openSet.sort((a, b) => (a.fDistance || Infinity) - (b.fDistance || Infinity));
        const curr = openSet.shift();
        if (curr.isWall) continue;
        if (curr.distance === Infinity) break;
        curr.isVisited = true;
        visitedOrder.push(curr);
        if (curr === e2) break;
        for (const nb of getNeighbors(curr, gForAnim)) {
          const g = curr.distance + 1;
          if (g < nb.distance) {
            nb.distance = g;
            nb.fDistance = g + Math.abs(nb.row - e2.row) + Math.abs(nb.col - e2.col);
            nb.previousNode = curr;
            if (!openSet.includes(nb)) openSet.push(nb);
          }
        }
      }
    } else if (algorithmKey === 'dijkstra') {
      s2.distance = 0;
      const unvisited = getAllNodes(gForAnim);
      while (unvisited.length) {
        unvisited.sort((a, b) => a.distance - b.distance);
        const closest = unvisited.shift();
        if (closest.isWall) continue;
        if (closest.distance === Infinity) break;
        closest.isVisited = true;
        visitedOrder.push(closest);
        if (closest === e2) break;
        for (const nb of getNeighbors(closest, gForAnim)) {
          nb.distance = closest.distance + 1;
          nb.previousNode = closest;
        }
      }
    } else if (algorithmKey === 'bfs') {
      const q = [s2]; s2.isVisited = true;
      while (q.length) {
        const cur = q.shift();
        if (cur.isWall) continue;
        visitedOrder.push(cur);
        if (cur === e2) break;
        for (const nb of getNeighbors(cur, gForAnim)) {
          nb.isVisited = true; nb.previousNode = cur; q.push(nb);
        }
      }
    } else {
      const stk = [s2]; s2.isVisited = true;
      while (stk.length) {
        const cur = stk.pop();
        if (cur.isWall) continue;
        visitedOrder.push(cur);
        if (cur === e2) break;
        for (const nb of getNeighbors(cur, gForAnim)) {
          nb.isVisited = true; nb.previousNode = cur; stk.push(nb);
        }
      }
    }

    // Animate visited nodes
    setGrid(gForAnim.map(row => row.map(n => ({ ...n, isVisited: false, isPath: false }))));
    await new Promise(resolve => {
      let i = 0;
      const step = () => {
        if (i >= visitedOrder.length) { resolve(); return; }
        const node = visitedOrder[i++];
        setGrid(prev => prev.map(row =>
          row.map(n => n.row === node.row && n.col === node.col ? { ...n, isVisited: true } : n)
        ));
        animationRef.current = setTimeout(step, speed);
      };
      step();
    });

    // Animate path
    let pathLen = 0;
    let cur = e2;
    const pathNodes = [];
    while (cur && cur.previousNode) { pathNodes.unshift(cur); cur = cur.previousNode; }
    if (s2) pathNodes.unshift(s2);
    pathLen = pathNodes.length;

    await new Promise(resolve => {
      let i = 0;
      const step = () => {
        if (i >= pathNodes.length) { resolve(); return; }
        const node = pathNodes[i++];
        setGrid(prev => prev.map(row =>
          row.map(n => n.row === node.row && n.col === node.col ? { ...n, isPath: true } : n)
        ));
        animationRef.current = setTimeout(step, speed * 2);
      };
      step();
    });

    setStats({ visited: visitedOrder.length, path: pathLen });
    setIsVisualizing(false);
  };

  // ── Mouse handlers
  const handleMouseDown = (row, col) => {
    if (isVisualizing) return;
    if (row === startPos.row && col === startPos.col) { setIsDragging('start'); return; }
    if (row === endPos.row && col === endPos.col) { setIsDragging('end'); return; }
    setIsDrawing(true);
    toggleWall(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isVisualizing) return;
    if (isDragging === 'start') {
      if (row === endPos.row && col === endPos.col) return;
      const newStart = { row, col };
      setStartPos(newStart);
      // Update grid immediately
      setGrid(prev => {
        const g = prev.map(r => r.map(n => ({ ...n, isStart: false })));
        g[row][col] = { ...g[row][col], isStart: true, isWall: false, isVisited: false, isPath: false };
        if (liveMode) {
          const computed = computeInstant(algorithmKey, g, row, col, endPos.row, endPos.col);
          return computed;
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
          const computed = computeInstant(algorithmKey, g, startPos.row, startPos.col, row, col);
          return computed;
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
    setStats(null);
  };

  // ── Cell appearance
  // ── Cell appearance
  const getCellStyle = (node) => {
    if (node.isStart) return 'bg-emerald-500 shadow-[0_0_12px_2px_rgba(16,185,129,0.4)] z-10 scale-110 border-emerald-600';
    if (node.isEnd) return 'bg-rose-500 shadow-[0_0_12px_2px_rgba(244,63,94,0.4)] z-10 scale-110 border-rose-600';
    if (node.isWall) return 'bg-slate-700 border-slate-800 wall-cell';
    if (node.isPath) return 'path-cell bg-yellow-400 border-yellow-500';
    if (node.isVisited) return 'visited-cell bg-blue-400 border-blue-500';
    return 'bg-white hover:bg-slate-50 border-slate-200';
  };

  const getCursor = (node) => {
    if (node.isStart || node.isEnd) return 'cursor-grab active:cursor-grabbing';
    return 'cursor-crosshair';
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-slate-50 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/50">
      
      {/* Main Render View (Background) */}
      <div className="absolute inset-0 flex">
        {is3DMode ? (
          <div className="flex-1 w-full h-full p-2">
            <PathFinding3DVisualizer grid={grid} startPos={startPos} endPos={endPos} />
          </div>
        ) : (
          <div
            className="flex-1 w-full h-full flex items-center justify-center overflow-auto select-none p-6"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="inline-block rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/5 bg-white dark:bg-slate-900 p-1">
              {grid.map((row, rIdx) => (
                <div key={rIdx} className="flex">
                  {row.map((node, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-5 h-5 border-r border-b border-slate-100/50 dark:border-slate-800/50 transition-all duration-100 ${getCellStyle(node)} ${getCursor(node)}`}
                      onMouseDown={() => handleMouseDown(node.row, node.col)}
                      onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Telemetry & Info Header (Top Left) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="pointer-events-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 px-5 py-4 rounded-2xl shadow-xl shadow-indigo-500/5 max-w-sm">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            {algorithmInfo?.name || 'Pathfinding Algorithm'}
          </h2>
          
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <div className="bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50">
              <span className="opacity-60 mr-1">Time:</span> <span className="font-mono font-bold">{algorithmInfo?.timeComplexity || 'O(V+E)'}</span>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50">
              <span className="opacity-60 mr-1">Space:</span> <span className="font-mono font-bold">{algorithmInfo?.spaceComplexity || 'O(V)'}</span>
            </div>
            {stats && (
              <>
                <div className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">
                  <span className="opacity-70 mr-1">Visited:</span> <span className="font-mono font-bold">{stats.visited}</span>
                </div>
                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                  <span className="opacity-70 mr-1">Path:</span> <span className="font-mono font-bold">{stats.path}</span>
                </div>
              </>
            )}
          </div>
          
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            {algorithmInfo?.description || 'Finds the shortest path between the start and end nodes.'}
          </p>
        </div>
      </div>

      {/* Floating HUD Controls (Bottom Center) */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-[95%] sm:w-auto overflow-x-auto scrollbar-hide rounded-2xl">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/60 p-2 rounded-2xl shadow-2xl shadow-indigo-500/10 min-w-max">
          
          <button
            onClick={visualize}
            disabled={isVisualizing}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95"
          >
            <Play size={16} fill="currentColor" /> Visualize
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          {/* Generator Group */}
          <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-colors">
            <button
              onClick={() => handleGenerateMaze()}
              disabled={isVisualizing}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} className="text-indigo-500" /> Maze
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <select
              value={selectedMazeType}
              onChange={(e) => {
                setSelectedMazeType(e.target.value);
                handleGenerateMaze(e.target.value);
              }}
              disabled={isVisualizing}
              className="bg-transparent text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-2 focus:outline-none cursor-pointer disabled:opacity-50 appearance-none"
            >
              <option value="dfs">DFS</option>
              <option value="recursive_division">Div</option>
              <option value="prims">Prim</option>
            </select>
          </div>

          <button
            onClick={handleReset}
            disabled={isVisualizing}
            title="Reset Board"
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleClearWalls}
            disabled={isVisualizing}
            title="Clear Walls"
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
          >
            <Eraser size={18} />
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          <button
            onClick={() => setIs3DMode(!is3DMode)}
            title="Toggle 3D Mode"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold transition-all border ${
              is3DMode
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-sm shadow-cyan-500/10'
                : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Box size={16} className={is3DMode ? "text-cyan-500" : ""} /> {is3DMode ? '3D' : '2D'}
          </button>

          <SoundControls className="scale-90" />

          {/* Speed Group */}
          <div className="flex bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-1 ml-1">
            {[['1x', 100], ['2x', 30], ['MAX', 8]].map(([label, val]) => (
              <button
                key={label}
                onClick={() => setSpeed(val)}
                disabled={isVisualizing}
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

      {/* Floating Legend (Top Right on Mobile, Bottom Right on Desktop) */}
      <div className="absolute top-4 right-4 sm:top-auto sm:bottom-6 sm:right-6 z-10 pointer-events-none scale-75 sm:scale-100 origin-top-right sm:origin-bottom-right">
        <div className="flex flex-col gap-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-lg shadow-indigo-500/5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          {[
            ['bg-emerald-500', 'Start Node'],
            ['bg-rose-500', 'Target Node'],
            ['bg-slate-700', 'Wall / Obstacle'],
            ['bg-blue-400', 'Explored / Visited'],
            ['bg-yellow-400', 'Shortest Path'],
          ].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shadow-sm ${cls}`} />
              <span className="uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes visitedPop {
          0%   { transform: scale(0.3); opacity: 0; background-color: #3b82f6; }
          50%  { transform: scale(1.15); background-color: #60a5fa; }
          100% { transform: scale(1);   opacity: 1; background-color: #60a5fa; }
        }
        @keyframes pathPop {
          0%   { transform: scale(0.5); background-color: #facc15; }
          60%  { transform: scale(1.3); background-color: #fef08a; }
          100% { transform: scale(1);   background-color: #facc15; }
        }
        .visited-cell { animation: visitedPop 0.35s ease forwards; }
        .path-cell    { animation: pathPop 0.3s ease forwards; }
      `}</style>
    </div>
  );
};

export default PathFindingVisualizer;

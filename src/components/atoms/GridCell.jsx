import React from 'react';

const GridCell = React.memo(({ row, col, isStart, isEnd, isWall, isVisited, isPath, onMouseDown, onMouseEnter, onMouseUp }) => {
  let cellClass = 'w-6 h-6 border border-slate-200/20 dark:border-slate-800/30 inline-block transition-colors duration-150 ';

  if (isStart) {
    cellClass += 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] z-10 scale-105';
  } else if (isEnd) {
    cellClass += 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)] z-10 scale-105';
  } else if (isPath) {
    cellClass += 'bg-amber-400 dark:bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse';
  } else if (isVisited) {
    cellClass += 'bg-indigo-500/60 dark:bg-indigo-600/70 border-indigo-400/30';
  } else if (isWall) {
    cellClass += 'bg-slate-800 dark:bg-slate-100 border-slate-700 dark:border-slate-200';
  } else {
    cellClass += 'bg-white/40 dark:bg-slate-900/40 hover:bg-indigo-500/20';
  }

  return (
    <div
      onMouseDown={() => onMouseDown && onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter && onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp && onMouseUp()}
      className={cellClass}
    />
  );
});

export default GridCell;

import React from 'react';

const DPTableCell = React.memo(({ value, isCurrent, isComparing, isFilled }) => {
  let cellClass = 'w-12 h-12 text-center font-mono font-bold text-sm border border-slate-200 dark:border-slate-800 transition-all duration-200 ';

  if (isCurrent) {
    cellClass += 'bg-indigo-600 text-white shadow-lg scale-105 z-10';
  } else if (isComparing) {
    cellClass += 'bg-amber-400 dark:bg-amber-500 text-slate-900 shadow-md';
  } else if (isFilled) {
    cellClass += 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  } else {
    cellClass += 'bg-white/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600';
  }

  return (
    <td className={cellClass}>
      {value !== undefined && value !== null ? value : ''}
    </td>
  );
});

export default DPTableCell;

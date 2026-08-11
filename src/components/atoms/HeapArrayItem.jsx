import React from 'react';

const HeapArrayItem = React.memo(({ value, index, isComparing, isSwapping, isActive }) => {
  let bgColor = 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200';
  if (isSwapping) {
    bgColor = 'bg-rose-500 text-white border-rose-400 shadow-lg scale-105';
  } else if (isComparing) {
    bgColor = 'bg-amber-500 text-white border-amber-400 shadow-md';
  } else if (isActive) {
    bgColor = 'bg-indigo-600 text-white border-indigo-400 shadow-md';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm border transition-all duration-200 ${bgColor}`}>
        {value}
      </div>
      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">[{index}]</span>
    </div>
  );
});

export default HeapArrayItem;

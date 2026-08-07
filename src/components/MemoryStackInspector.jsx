import React from 'react';
import { Layers, CornerDownRight, MemoryStick as Memory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoryStackInspector = ({ stack = [], currentFunction = 'fn()' }) => {
  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Call Stack Inspector
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Live memory stack frames</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold border border-slate-200 dark:border-slate-700">
          Depth: {stack.length}
        </span>
      </div>

      {/* Stack Frames Container */}
      <div className="flex flex-col-reverse gap-2 min-h-[180px] max-h-[260px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
        {stack.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-xs gap-2">
            <Memory className="w-6 h-6 opacity-40 animate-pulse" />
            <span>Call stack is idle</span>
          </div>
        ) : (
          <AnimatePresence>
            {stack.map((frame, idx) => {
              const isTop = idx === stack.length - 1;
              return (
                <motion.div
                  key={frame.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={`flex flex-col p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    isTop
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <CornerDownRight className="w-3 h-3" />
                      {frame.name || 'fn'}({frame.args ? Object.values(frame.args).join(', ') : ''})
                    </span>
                    {isTop && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {frame.params && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      {Object.entries(frame.params).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span>{k}:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{JSON.stringify(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MemoryStackInspector;

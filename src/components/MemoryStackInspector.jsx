import React from 'react';
import { Layers, ArrowRight, CornerDownRight, Cpu, MemoryStick as Memory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoryStackInspector = ({ stack = [], maxDepth = 10, currentFunction = 'fn()' }) => {
  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              Call Stack & Memory Inspector
            </h3>
            <p className="text-[11px] text-slate-400">Live Stack Frame Push/Pop tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-mono text-purple-300 font-bold border border-slate-700">
            Depth: {stack.length} frames
          </span>
        </div>
      </div>

      {/* Stack Frames Container */}
      <div className="flex flex-col-reverse gap-2.5 min-h-[220px] max-h-[300px] overflow-y-auto p-2 bg-slate-950/70 rounded-2xl border border-slate-800/80">
        {stack.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600 text-xs gap-2">
            <Memory className="w-8 h-8 opacity-40 animate-pulse" />
            <span>Call stack is currently idle / empty</span>
          </div>
        ) : (
          <AnimatePresence>
            {stack.map((frame, idx) => {
              const isTop = idx === stack.length - 1;
              return (
                <motion.div
                  key={frame.id || idx}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col p-3 rounded-xl border text-xs font-mono transition-all ${
                    isTop
                      ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-purple-300 flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-purple-400" />
                      {frame.name || 'fn'}({frame.args ? Object.values(frame.args).join(', ') : ''})
                    </span>
                    {isTop && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                        ACTIVE FRAME
                      </span>
                    )}
                  </div>

                  {frame.params && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      {Object.entries(frame.params).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-emerald-400 font-bold">{JSON.stringify(v)}</span>
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

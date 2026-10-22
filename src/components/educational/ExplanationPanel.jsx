import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Clock, Cpu, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const ExplanationPanel = React.memo(({ algorithmInfo, isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isOpen || !algorithmInfo) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-paper-1 dark:bg-paper-0 shadow-2xl z-50 transition-all duration-300 border-l border-line-subtle ${
        isExpanded ? 'w-96' : 'w-12'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse explanation' : 'Expand explanation'}
        className="absolute -left-12 top-1/2 -translate-y-1/2 bg-paper-1 dark:bg-paper-1 text-ink p-2 rounded-l-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:bg-paper-0/60 dark:hover:bg-paper-2/60 transition-colors border-y border-l border-line-subtle"
      >
        {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Close Button */}
      {isExpanded && (
        <button
          onClick={onClose}
          aria-label="Close explanation"
          className="absolute top-4 right-4 text-ink-3 hover:text-ink transition-colors"
        >
          <X size={20} />
        </button>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="p-6 overflow-y-auto h-full">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-accent" size={24} />
              <h2 className="text-2xl font-bold text-ink">Algorithm Info</h2>
            </div>
            <h3 className="text-xl font-semibold text-accent">{algorithmInfo.name}</h3>
          </div>

          {/* Overview */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-ink mb-2 flex items-center gap-2">
              <BookOpen size={18} className="text-accent" />
              Overview
            </h4>
            <p className="text-ink-2 text-sm leading-relaxed">{algorithmInfo.description}</p>
          </div>

          {/* Purpose */}
          {algorithmInfo.purpose && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-ink mb-2 flex items-center gap-2">
                <Zap size={18} className="text-amber-800 dark:text-amber-300" />
                Purpose
              </h4>
              <p className="text-ink-2 text-sm leading-relaxed">{algorithmInfo.purpose}</p>
            </div>
          )}

          {/* Working Principle */}
          {algorithmInfo.workingPrinciple && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-ink mb-2 flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-800 dark:text-emerald-300" />
                Working Principle
              </h4>
              <p className="text-ink-2 text-sm leading-relaxed">{algorithmInfo.workingPrinciple}</p>
            </div>
          )}

          {/* Complexity */}
          <div className="mb-6 bg-paper-0/60 border border-line-subtle rounded-lg p-4">
            <h4 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
              <Clock size={18} className="text-accent" />
              Time Complexity
            </h4>
            <div className="space-y-2">
              {algorithmInfo.bestCase && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-800 dark:text-emerald-300" />
                  <span className="text-ink-2 text-sm">
                    <span className="font-semibold text-ink">Best:</span> {algorithmInfo.bestCase}
                  </span>
                </div>
              )}
              {algorithmInfo.averageCase && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-800 dark:text-amber-300" />
                  <span className="text-ink-2 text-sm">
                    <span className="font-semibold text-ink">Average:</span> {algorithmInfo.averageCase}
                  </span>
                </div>
              )}
              {algorithmInfo.worstCase && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-700 dark:text-red-400" />
                  <span className="text-ink-2 text-sm">
                    <span className="font-semibold text-ink">Worst:</span> {algorithmInfo.worstCase}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Space Complexity */}
          <div className="mb-6 bg-paper-0/60 border border-line-subtle rounded-lg p-4">
            <h4 className="text-lg font-semibold text-ink mb-2 flex items-center gap-2">
              <Cpu size={18} className="text-accent" />
              Space Complexity
            </h4>
            <p className="text-ink text-sm font-semibold">{algorithmInfo.spaceComplexity}</p>
          </div>

          {/* Applications */}
          {algorithmInfo.applications && algorithmInfo.applications.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-ink mb-2 flex items-center gap-2">
                <Zap size={18} className="text-accent" />
                Applications
              </h4>
              <ul className="space-y-1">
                {algorithmInfo.applications.map((app, idx) => (
                  <li key={idx} className="text-ink-2 text-sm flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    {app}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advantages */}
          {algorithmInfo.advantages && algorithmInfo.advantages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-ink mb-2 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-800 dark:text-emerald-300" />
                Advantages
              </h4>
              <ul className="space-y-1">
                {algorithmInfo.advantages.map((adv, idx) => (
                  <li key={idx} className="text-ink-2 text-sm flex items-start gap-2">
                    <span className="text-emerald-800 dark:text-emerald-300 mt-1">✓</span>
                    {adv}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disadvantages */}
          {algorithmInfo.disadvantages && algorithmInfo.disadvantages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-ink mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-700 dark:text-red-400" />
                Disadvantages
              </h4>
              <ul className="space-y-1">
                {algorithmInfo.disadvantages.map((dis, idx) => (
                  <li key={idx} className="text-ink-2 text-sm flex items-start gap-2">
                    <span className="text-red-700 dark:text-red-400 mt-1">✗</span>
                    {dis}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ExplanationPanel;

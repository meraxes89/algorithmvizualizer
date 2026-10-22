import React, { useMemo } from 'react';
import { viz } from '../theme/vizTokens';

const VIEW_W = 100;
const VIEW_H = 100;
const MAX_DRAWN_POINTS = 300;

const RaceChart = ({ history, series, gridColor = viz.grid }) => {
  const points = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (history.length <= MAX_DRAWN_POINTS) return history;
    const stride = Math.ceil(history.length / MAX_DRAWN_POINTS);
    const sampled = [];
    for (let i = 0; i < history.length; i += stride) sampled.push(history[i]);
    if (sampled[sampled.length - 1] !== history[history.length - 1]) {
      sampled.push(history[history.length - 1]);
    }
    return sampled;
  }, [history]);

  const maxY = useMemo(() => {
    let max = 1;
    for (const p of points) {
      for (const s of series) {
        const v = p[s.key] || 0;
        if (v > max) max = v;
      }
    }
    return max;
  }, [points, series]);

  const paths = useMemo(() => {
    if (points.length === 0) return [];
    return series.map((s) => {
      let d = '';
      for (let i = 0; i < points.length; i++) {
        const x = points.length === 1 ? 0 : (i / (points.length - 1)) * VIEW_W;
        const y = VIEW_H - ((points[i][s.key] || 0) / maxY) * VIEW_H;
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      }
      return { key: s.key, d };
    });
  }, [series, points, maxY]);

  if (points.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Run a race to chart operations…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex flex-wrap gap-x-4 gap-y-1 pb-2 shrink-0">
        {series.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="flex-1 w-full min-h-0 overflow-visible"
        aria-hidden="true"
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={VIEW_W}
            y1={VIEW_H * f}
            y2={VIEW_H * f}
            stroke={gridColor}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.35}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke={series.find((s) => s.key === p.key)?.color || viz.muted}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="flex justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 pt-1.5 shrink-0 tabular-nums">
        <span>ops 0</span>
        <span>{maxY.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default React.memo(RaceChart);

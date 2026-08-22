import React, { useEffect, useRef } from 'react';
import { useCanvasPalette } from '../../utils/useCanvasPalette';

const VIZ_W = 160;
const VIZ_H = 100;

function initBars() {
  return { kind: 'bars', arr: shuffledVals(18), i: 1, j: 0, hold: 0 };
}
function shuffledVals(n) {
  const a = Array.from({ length: n }, (_, i) => 10 + Math.round((i / (n - 1)) * 90));
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    [a[i], a[k]] = [a[k], a[i]];
  }
  return a;
}

function initFlood() {
  const cols = 16;
  const rows = 10;
  const startIdx = Math.floor(rows / 2) * cols + Math.floor(cols / 2);
  return {
    kind: 'flood',
    cols,
    rows,
    visited: new Map([[startIdx, 0]]),
    frontier: [startIdx],
    tick: 0,
    hold: 0
  };
}

function initBinary() {
  return { kind: 'binary', n: 27, target: 8 + Math.floor(Math.random() * 11), lo: 0, hi: 26, phase: 'search', flash: 0, done: false };
}

function initGraph() {
  return { kind: 'graph', order: [0, 1, 4, 2, 6, 3, 5], step: 0, timer: 0, hold: 0 };
}

function initState(variant) {
  switch (variant) {
    case 'flood': return initFlood();
    case 'binary': return initBinary();
    case 'graph': return initGraph();
    default: return initBars();
  }
}

const GRAPH_NODES = [
  [0.5, 0.14], [0.14, 0.38], [0.86, 0.36], [0.30, 0.62],
  [0.70, 0.64], [0.18, 0.90], [0.82, 0.90]
];
const GRAPH_EDGES = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [1, 4], [0, 3]];

function stepVariant(st) {
  if (st.kind === 'bars') {
    if (st.i >= st.arr.length) {
      if (++st.hold > 50) Object.assign(st, initBars());
      return;
    }
    const key = st.arr[st.j];
    if (st.j > 0 && st.arr[st.j - 1] > key) {
      st.arr[st.j] = st.arr[st.j - 1];
      st.arr[st.j - 1] = key;
      st.j--;
    } else {
      st.i++;
      st.j = st.i;
    }
  } else if (st.kind === 'flood') {
    st.tick++;
    if (st.frontier.length > 0) {
      const next = [];
      for (const idx of st.frontier) {
        const r = Math.floor(idx / st.cols);
        const c = idx % st.cols;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= st.rows || nc < 0 || nc >= st.cols) continue;
          const nIdx = nr * st.cols + nc;
          if (!st.visited.has(nIdx)) {
            st.visited.set(nIdx, st.tick);
            next.push(nIdx);
          }
        }
      }
      st.frontier = next;
    } else if (++st.hold > 60) {
      Object.assign(st, initFlood());
    }
  } else if (st.kind === 'binary') {
    if (st.phase === 'search') {
      st.mid = Math.floor((st.lo + st.hi) / 2);
      if (st.mid === st.target) {
        st.phase = 'found';
      } else if (st.mid < st.target) {
        st.lo = st.mid + 1;
      } else {
        st.hi = st.mid - 1;
      }
    } else if (++st.flash > 45) {
      Object.assign(st, initBinary());
    }
  } else if (st.kind === 'graph') {
    if (++st.timer >= 9) {
      st.timer = 0;
      if (st.step < st.order.length) st.step++;
      else if (++st.hold > 40) Object.assign(st, initGraph());
    }
  }
}

function drawVariant(ctx, st, p, w, h) {
  ctx.clearRect(0, 0, w, h);

  if (st.kind === 'bars') {
    const gap = 3;
    const barW = (w - gap * (st.arr.length - 1)) / st.arr.length;
    for (let i = 0; i < st.arr.length; i++) {
      const bh = (st.arr[i] / 100) * h;
      ctx.fillStyle = p.ink1;
      ctx.globalAlpha = i === st.j ? 1 : 0.75;
      if (i === st.j) ctx.fillStyle = p.accent;
      ctx.fillRect(i * (barW + gap), h - bh, barW, bh);
    }
    ctx.globalAlpha = 1;
  } else if (st.kind === 'flood') {
    const cw = w / st.cols;
    const ch = h / st.rows;
    for (const [idx, t] of st.visited) {
      const age = st.tick - t;
      const alpha = Math.max(0.15, 1 - age / 55);
      const r = Math.floor(idx / st.cols);
      const c = idx % st.cols;
      ctx.fillStyle = p.accent;
      ctx.globalAlpha = alpha * 0.85;
      const pad = 1.5;
      ctx.beginPath();
      ctx.roundRect(c * cw + pad, r * ch + pad, cw - pad * 2, ch - pad * 2, 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (st.kind === 'binary') {
    const slotW = w / st.n;
    for (let i = 0; i < st.n; i++) {
      const v = 12 + (i / (st.n - 1)) * 88;
      const bh = (v / 100) * (h - 10);
      const inRange = i >= st.lo && i <= st.hi;
      ctx.fillStyle = p.ink1;
      ctx.globalAlpha = inRange ? 0.8 : 0.18;
      ctx.fillRect(i * slotW + 1, h - bh, slotW - 2, bh);
    }
    ctx.globalAlpha = 1;
    if (st.phase === 'search' && st.hi >= st.lo) {
      const midX = (st.mid + 0.5) * slotW;
      ctx.strokeStyle = p.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midX, 2);
      ctx.lineTo(midX, h);
      ctx.stroke();
    } else if (st.phase === 'found') {
      const tX = (st.target + 0.5) * slotW;
      ctx.fillStyle = p.accent;
      ctx.fillRect(tX - slotW / 2, 0, slotW, h);
    }
  } else if (st.kind === 'graph') {
    const pts = GRAPH_NODES.map(([x, y]) => [x * w, y * h]);
    const reached = new Set(st.order.slice(0, st.step));

    for (const [a, b] of GRAPH_EDGES) {
      const active = reached.has(a) && reached.has(b);
      ctx.strokeStyle = active ? p.accent : p.ink1;
      ctx.globalAlpha = active ? 0.7 : 0.15;
      ctx.lineWidth = active ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(pts[a][0], pts[a][1]);
      ctx.lineTo(pts[b][0], pts[b][1]);
      ctx.stroke();
    }

    pts.forEach(([x, y], i) => {
      const on = reached.has(i);
      ctx.beginPath();
      ctx.arc(x, y, on ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = on ? p.accent : p.ink1;
      ctx.globalAlpha = on ? 1 : 0.3;
      ctx.fill();
      if (on) {
        const latest = i === st.order[st.step - 1];
        if (latest) {
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    ctx.globalAlpha = 1;
  }
}

const MicroViz = ({ variant = 'bars', className = '' }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = initState(variant);
  const palette = useCanvasPalette();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !palette) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let visible = true;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => drawVariant(ctx, stateRef.current, palette, width, height);

    const tick = () => {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }
      stepVariant(stateRef.current);
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf && visible && !document.hidden && !reduceMotion) {
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [palette]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default React.memo(MicroViz);

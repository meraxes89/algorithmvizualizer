import { useEffect, useRef } from 'react';
import { useCanvasPalette } from '../../utils/useCanvasPalette';

const BAR_COUNT = 44;
const HOLD_FRAMES = 80;

function shuffled(n) {
  const arr = Array.from({ length: n }, (_, i) => 8 + Math.round((i / (n - 1)) * 92));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createState() {
  return { bars: shuffled(BAR_COUNT), outer: 1, inner: 0, hold: 0 };
}

function stepInsertion(st) {
  if (st.outer >= st.bars.length) {
    st.hold++;
    if (st.hold > HOLD_FRAMES) Object.assign(st, createState());
    return;
  }
  const key = st.bars[st.inner];
  const prev = st.bars[st.inner - 1];
  if (st.inner > 0 && prev > key) {
    st.bars[st.inner] = prev;
    st.bars[st.inner - 1] = key;
    st.inner--;
  } else {
    st.outer++;
    st.inner = st.outer;
  }
}

export default function LiveSortCanvas({ className = '' }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = createState();
  const palette = useCanvasPalette();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !palette) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    const draw = () => {
      const st = stateRef.current;
      const { ink1, accent } = palette;
      ctx.clearRect(0, 0, width, height);

      const gap = 3;
      const barW = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = st.bars[i];
        const h = (v / 100) * (height - 6);
        const x = i * (barW + gap);
        const y = height - h;
        const isActive = i === st.inner && st.outer < BAR_COUNT;
        const isSortedPrefix = i < st.outer && st.outer < BAR_COUNT;

        if (isActive) {
          ctx.fillStyle = accent;
        } else if (isSortedPrefix && st.outer < BAR_COUNT) {
          ctx.fillStyle = ink1;
          ctx.globalAlpha = 0.45 + 0.4 * (i / BAR_COUNT);
        } else {
          ctx.fillStyle = ink1;
          ctx.globalAlpha = 0.88;
        }

        const r = Math.min(barW / 2, 3);
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x + barW / 2, y, x + barW, y + r, r);
        ctx.lineTo(x + barW, height);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    const tick = () => {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }
      stepInsertion(stateRef.current);
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

    if (reduceMotion) {
      stateRef.current.bars.sort((a, b) => a - b);
      stateRef.current.outer = BAR_COUNT + 1;
      draw();
    } else {
      start();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [palette]);

  const reshuffle = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stateRef.current = createState();
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={reshuffle}
      className={`block w-full h-full cursor-pointer ${className}`}
      aria-label="Live insertion sort animation — click to shuffle"
      role="img"
    />
  );
}

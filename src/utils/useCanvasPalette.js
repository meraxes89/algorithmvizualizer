import { useEffect, useState } from 'react';

function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const v = (name, fallback) => (s.getPropertyValue(name) || '').trim() || fallback;
  return {
    ink1: v('--ink-1', '#211B14'),
    ink2: v('--ink-2', '#6D6353'),
    ink3: v('--ink-3', '#A79C89'),
    accent: v('--accent', '#BC4B1F'),
    accentStrong: v('--accent-strong', '#99390F'),
    paper0: v('--paper-0', '#F6F1E8'),
    paper1: v('--paper-1', '#FCFAF4'),
    paper2: v('--paper-2', '#FFFFFF'),
    isDark: document.documentElement.classList.contains('dark')
  };
}

export function useCanvasPalette() {
  const [palette, setPalette] = useState(readPalette);

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setPalette(readPalette());
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return palette;
}

export default useCanvasPalette;

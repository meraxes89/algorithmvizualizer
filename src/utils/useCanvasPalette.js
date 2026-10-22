import { useEffect, useState } from 'react';
import { readVizColors } from '../theme/vizTokens';

function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const v = (name) => (s.getPropertyValue(name) || '').trim();
  return {
    ink1: v('--ink-1'),
    ink2: v('--ink-2'),
    ink3: v('--ink-3'),
    accent: v('--accent'),
    accentStrong: v('--accent-strong'),
    paper0: v('--paper-0'),
    paper1: v('--paper-1'),
    paper2: v('--paper-2'),
    viz: readVizColors(),
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

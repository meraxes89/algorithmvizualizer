import { useEffect, useState } from 'react';
import { readVizColors, type VizColors } from '../theme/vizTokens';

/**
 * Resolved visualization colours for canvas and WebGL.
 *
 * The theme class is toggled on `<html>` by `ThemeProvider`; observing
 * the class means this hook reads the new values after the toggle rather
 * than during the render that requested it.
 */
export function useVizColors(): VizColors {
  const [colors, setColors] = useState<VizColors>(readVizColors);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setColors(readVizColors());
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

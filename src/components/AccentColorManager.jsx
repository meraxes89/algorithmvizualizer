import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { BRAND_DEFAULT, CATEGORY_ACCENTS, ON_ACCENT } from '../theme/accentPalettes';

function hexToRgbTriplet(hex) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function shade(hex, amount) {
  const n = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => {
    const v = parseInt(n.slice(i, i + 2), 16);
    const next = amount >= 0 ? v + (255 - v) * amount : v * (1 + amount);
    return Math.max(0, Math.min(255, Math.round(next)));
  });
  return `rgb(${channels.join(', ')})`;
}

const AccentColorManager = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  useEffect(() => {
    const path = location.pathname;
    let entry = BRAND_DEFAULT;

    for (const key of Object.keys(CATEGORY_ACCENTS)) {
      if (path.startsWith(key)) {
        entry = CATEGORY_ACCENTS[key];
        break;
      }
    }

    const mode = isDark ? 'dark' : 'light';
    const hex = entry[mode];
    const rgb = hexToRgbTriplet(hex);
    const strongHex = shade(hex, isDark ? 0.18 : -0.22);
    const onAccent = isDark ? ON_ACCENT.dark : ON_ACCENT.light;

    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-strong', strongHex);
    root.style.setProperty('--accent-soft', `rgba(${rgb}, ${isDark ? 0.13 : 0.10})`);
    root.style.setProperty('--on-accent', onAccent);
    root.style.setProperty('--accent-indigo', hex);
    root.style.setProperty('--glow-primary', `rgba(${rgb}, ${isDark ? 0.2 : 0.16})`);
    root.style.setProperty('--chromatic-1', `rgba(${rgb}, ${isDark ? 0.45 : 0.28})`);
  }, [location.pathname, isDark]);

  return null;
};

export default AccentColorManager;

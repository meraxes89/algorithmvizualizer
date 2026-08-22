import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

const readInitialDark = () => {
  try {
    if (document.documentElement.classList.contains('dark')) return true;
    const saved = localStorage.getItem('av-theme');
    if (saved) return saved === 'dark';
  } catch (e) {}
  return false;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(readInitialDark);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('av-theme', isDark ? 'dark' : 'light');
    } catch (e) {}
  }, [isDark]);

  const toggleTheme = useCallback((e) => {
    const next = !isDarkRef.current;
    isDarkRef.current = next;
    setIsDark(next);

    if (!e || !document.startViewTransition) return;

    const { clientX: x, clientY: y } = e;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition();

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: next ? [...clipPath].reverse() : clipPath
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          pseudoElement: next
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)'
        }
      );
    }).catch(() => {});
  }, []);

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

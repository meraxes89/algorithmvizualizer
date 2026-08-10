import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('av-theme');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('av-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('av-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = (e) => {
    const isDarkNew = !isDark;

    if (!document.startViewTransition || !e) {
      setIsDark(isDarkNew);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setIsDark(isDarkNew);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: isDarkNew ? [...clipPath].reverse() : clipPath
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          pseudoElement: isDarkNew
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)'
        }
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

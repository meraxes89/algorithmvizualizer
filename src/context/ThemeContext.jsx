import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('av-theme');
    if (saved) return saved === 'dark';
    return true;
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [animDirection, setAnimDirection] = useState('right');

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

  const toggleTheme = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimDirection(prev => (prev === 'right' ? 'left' : 'right'));

    // Switch theme halfway through curtain sweep (200ms)
    setTimeout(() => {
      setIsDark(prev => !prev);
    }, 200);

    // Complete transition (450ms)
    setTimeout(() => {
      setIsAnimating(false);
    }, 450);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
      {/* Hardware-Accelerated 60 FPS GPU Theme Wave Curtain Overlay */}
      <div
        className={`fixed inset-0 z-[9999] pointer-events-none transition-transform duration-450 ease-in-out ${
          isDark ? 'bg-[#05070f]' : 'bg-[#f8fafc]'
        } ${
          isAnimating ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        } ${
          animDirection === 'right' ? 'origin-right' : 'origin-left'
        }`}
        style={{ willChange: 'transform' }}
      />
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

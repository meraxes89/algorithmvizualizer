import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CATEGORY_COLORS = {
  '/sorting': {
    primary: '99, 102, 241', // #6366f1 (Indigo)
    hex: '#6366f1'
  },
  '/pathfinding': {
    primary: '6, 182, 212', // #06b6d4 (Cyan)
    hex: '#06b6d4'
  },
  '/graph': {
    primary: '16, 185, 129', // #10b981 (Emerald)
    hex: '#10b981'
  },
  '/trees': {
    primary: '245, 158, 11', // #f59e0b (Amber)
    hex: '#f59e0b'
  },
  '/recursion': {
    primary: '139, 92, 246', // #8b5cf6 (Purple)
    hex: '#8b5cf6'
  },
  '/dp': {
    primary: '244, 63, 94', // #f43f5e (Rose)
    hex: '#f43f5e'
  },
  'default': {
    primary: '99, 102, 241', // Default Indigo
    hex: '#6366f1'
  }
};

const AccentColorManager = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let theme = CATEGORY_COLORS.default;

    for (const key of Object.keys(CATEGORY_COLORS)) {
      if (path.startsWith(key)) {
        theme = CATEGORY_COLORS[key];
        break;
      }
    }

    const root = document.documentElement;
    
    // Update CSS variables for Glow Primary and Accent Indigo
    // This allows cursor glow, borders, and accents to shift dynamically
    root.style.setProperty('--glow-primary', `rgba(${theme.primary}, 0.25)`);
    root.style.setProperty('--accent-indigo', theme.hex);
    
    // We can also inject these into a class to override tailwind utilities if needed,
    // but the CSS variables in index.css govern the ambient glow and glassmorphism.
    // For Glassmorphism 2.0 borders:
    root.style.setProperty('--chromatic-1', `rgba(${theme.primary}, 0.6)`);
    root.style.setProperty('--chromatic-2', `rgba(${theme.primary}, 0.2)`);

  }, [location.pathname]);

  return null;
};

export default AccentColorManager;

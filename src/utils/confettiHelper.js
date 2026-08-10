import confetti from 'canvas-confetti';
import { soundEngine } from './soundEngine';

const COLOR_MAP = {
  'slate': '#64748b', 'gray': '#6b7280', 'zinc': '#717a8b', 'neutral': '#737373', 'stone': '#78716c',
  'red': '#ef4444', 'orange': '#f97316', 'amber': '#f59e0b', 'yellow': '#eab308',
  'lime': '#84cc16', 'green': '#22c55e', 'emerald': '#10b981', 'teal': '#14b8a6',
  'cyan': '#06b6d4', 'sky': '#0ea5e9', 'blue': '#3b82f6', 'indigo': '#6366f1',
  'violet': '#8b5cf6', 'purple': '#a855f7', 'fuchsia': '#d946ef', 'pink': '#ec4899', 'rose': '#f43f5e'
};

export const getColorsFromTailwind = (colorString) => {
  if (!colorString) return ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'];
  const colors = [];
  const words = colorString.split('-');
  words.forEach(word => {
    if (COLOR_MAP[word]) colors.push(COLOR_MAP[word]);
  });
  return colors.length > 0 ? colors : ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'];
};

export const triggerVictoryConfetti = (colors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b']) => {
  try {
    // Play pentatonic victory audio chord
    soundEngine.playSuccess();

    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2147483647 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, 
        colors 
      }));
      confetti(Object.assign({}, defaults, { 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, 
        colors 
      }));
    }, 250);
  } catch (e) {
    // Fallback if canvas confetti fails
  }
};

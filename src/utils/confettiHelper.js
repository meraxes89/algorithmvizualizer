import confetti from 'canvas-confetti';
import { soundEngine } from './soundEngine';
import { DEFAULT_CONFETTI, TAILWIND_COLORS } from '../theme/confettiPalette';

export const getColorsFromTailwind = (colorString) => {
  if (!colorString) return DEFAULT_CONFETTI;
  const colors = [];
  const words = colorString.split('-');
  words.forEach(word => {
    if (TAILWIND_COLORS[word]) colors.push(TAILWIND_COLORS[word]);
  });
  return colors.length > 0 ? colors : DEFAULT_CONFETTI;
};

export const triggerVictoryConfetti = (colors = DEFAULT_CONFETTI) => {
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

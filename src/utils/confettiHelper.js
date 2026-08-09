import confetti from 'canvas-confetti';
import { soundEngine } from './soundEngine';

export const triggerVictoryConfetti = () => {
  try {
    // Play pentatonic victory audio chord
    soundEngine.playSuccess();

    // Left side burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'],
    });
    // Right side burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'],
    });
  } catch (e) {
    // Fallback if canvas confetti fails
  }
};

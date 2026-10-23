/**
 * Confetti colours.
 *
 * canvas-confetti parses pixels, not CSS variables, so this is one of the
 * few places that needs concrete values. It reads Tailwind colour names
 * from the class strings the visualizers already use.
 */

export const TAILWIND_COLORS: Record<string, string> = {
  slate: '#64748b',
  gray: '#6b7280',
  zinc: '#717a8b',
  neutral: '#737373',
  stone: '#78716c',
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
};

export const DEFAULT_CONFETTI = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'];

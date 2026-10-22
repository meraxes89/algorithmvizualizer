/**
 * Accent colours per route, in one place.
 *
 * These are theme inputs, not component colours: AccentColorManager
 * writes the chosen value into `--accent` and derives the rest. Keep hex
 * values here so the rest of the app can stay on tokens.
 */

export type AccentPair = { light: string; dark: string };

export const BRAND_DEFAULT: AccentPair = { light: '#AA4218', dark: '#E5814B' };

export const ON_ACCENT: AccentPair = { light: '#FFF7F0', dark: '#201512' };

export const CATEGORY_ACCENTS: Record<string, AccentPair> = {
  '/sorting': { light: '#4338CA', dark: '#818CF8' },
  '/pathfinding': { light: '#155E75', dark: '#22D3EE' },
  '/graph': { light: '#065F46', dark: '#34D399' },
  '/trees': { light: '#92400E', dark: '#FBBF24' },
  '/recursion': { light: '#6D28D9', dark: '#A78BFA' },
  '/dp': { light: '#BE123C', dark: '#FB7185' },
};

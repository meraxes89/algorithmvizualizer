import { afterEach, describe, expect, it } from 'vitest';
import { readVizColors, viz } from './vizTokens';

describe('viz tokens', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--viz-compare');
  });

  it('exposes CSS references for components', () => {
    expect(viz.compare).toBe('var(--viz-compare)');
    expect(viz.nodeDefaultFrom).toBe('var(--viz-node-default-from)');
    expect(viz.threeGridLine).toBe('var(--viz-3d-grid-line)');
  });

  it('reads the resolved values used by canvas and WebGL', () => {
    document.documentElement.style.setProperty('--viz-compare', '#f59e0b');

    const colors = readVizColors();

    expect(colors.compare).toBe('#f59e0b');
    expect(colors.canvas).toBe('');
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useVizColors } from './useVizColors';

describe('useVizColors', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--viz-compare');
    document.documentElement.classList.remove('dark');
  });

  it('re-reads the tokens when the theme class changes', async () => {
    document.documentElement.style.setProperty('--viz-compare', 'rgb(17, 17, 17)');

    const { result } = renderHook(() => useVizColors());
    expect(result.current.compare).toBe('rgb(17, 17, 17)');

    document.documentElement.style.setProperty('--viz-compare', 'rgb(34, 34, 34)');
    act(() => {
      document.documentElement.classList.add('dark');
    });

    await waitFor(() => expect(result.current.compare).toBe('rgb(34, 34, 34)'));
  });
});

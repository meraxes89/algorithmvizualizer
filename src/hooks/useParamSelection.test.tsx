import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useParamSelection } from './useParamSelection';

const items = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
];

/** Render the hook with the URL it should read, and expose the URL back. */
const renderSelection = (
  initialEntry: string,
  options: { param?: string; clear?: readonly string[] } = {}
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );

  return renderHook(
    () => {
      const selection = useParamSelection(
        items,
        options.param,
        options.clear ? { clear: options.clear } : undefined
      );
      const location = useLocation();
      return { ...selection, search: location.search };
    },
    { wrapper }
  );
};

describe('useParamSelection', () => {
  it('falls back to the first item when the URL says nothing', () => {
    const { result } = renderSelection('/sorting');
    expect(result.current.selected).toEqual(items[0]);
  });

  it('reads the selected item from the URL', () => {
    const { result } = renderSelection('/sorting?algo=b');
    expect(result.current.selected).toEqual(items[1]);
  });

  it('falls back to the first item when the URL names something that is gone', () => {
    const { result } = renderSelection('/sorting?algo=deletedAlgorithm');
    expect(result.current.selected).toEqual(items[0]);
  });

  it('writes the selection to the URL, replacing the current entry', () => {
    const { result } = renderSelection('/sorting');

    act(() => result.current.select(items[1]));

    expect(result.current.selected).toEqual(items[1]);
    expect(result.current.search).toBe('?algo=b');
  });

  it('keeps unrelated parameters', () => {
    const { result } = renderSelection('/trees?theme=dark');

    act(() => result.current.select(items[1]));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('algo')).toBe('b');
    expect(params.get('theme')).toBe('dark');
  });

  it('drops the parameters it is told to clear when the selection changes', () => {
    const { result } = renderSelection('/trees?algo=a&op=preOrder', { clear: ['op'] });

    act(() => result.current.select(items[1]));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('algo')).toBe('b');
    expect(params.get('op')).toBeNull();
  });

  it('reads a second selection from its own parameter', () => {
    const { result } = renderSelection('/trees?op=b', { param: 'op' });
    expect(result.current.selected).toEqual(items[1]);
  });
});

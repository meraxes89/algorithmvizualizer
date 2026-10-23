import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ParamSelection<T> = {
  /** The selected item: the one named in the URL, or the first one. */
  readonly selected: T;
  /** Put an item in the URL. */
  readonly select: (item: T) => void;
};

/**
 * Selection that lives in the query string.
 *
 * A page can then be linked to a specific algorithm — `/sorting?algo=heapSort`
 * — and the back button walks back through the page rather than through
 * every tab the user looked at.
 *
 * The first item is the fallback, so a bare path and a stale link both
 * still open something sensible.
 */
export function useParamSelection<T extends { id: string }>(
  items: readonly T[],
  param = 'algo',
  options: { /** Parameters to drop when the selection changes. */ clear?: readonly string[] } = {}
): ParamSelection<T> {
  const [params, setParams] = useSearchParams();
  const requested = params.get(param);
  const selected = items.find((item) => item.id === requested) ?? items[0];

  const clear = options.clear ?? [];
  const clearKey = clear.join(',');

  const select = useCallback(
    (item: T) => {
      const next = new URLSearchParams(params);
      next.set(param, item.id);

      for (const key of clearKey.split(',').filter(Boolean)) {
        next.delete(key);
      }

      setParams(next, { replace: true });
    },
    [params, param, clearKey, setParams]
  );

  return { selected, select };
}

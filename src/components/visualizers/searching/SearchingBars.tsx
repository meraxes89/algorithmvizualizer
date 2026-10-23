import type { SearchView } from '@core/steps';

/** The colours a searching view is painted with. */
export type SearchColors = {
  default: string;
  range: string;
  current: string;
  found: string;
};

export type SearchingBarsProps = {
  /** The view carried by the step being displayed. */
  view: SearchView;
  /** The largest value in the array. Used to scale the bars. */
  maxValue: number;
  /** The colours to paint the bars with. */
  colors: SearchColors;
};

export type SearchBarState = 'idle' | 'range' | 'current' | 'found';

/**
 * The bars of a searching view.
 *
 * A dumb renderer: a function of the view carried by the current step.
 * The window still under consideration is highlighted, the element being
 * examined is highlighted harder, and the element that turned out to
 * hold the target is highlighted hardest.
 */
export function SearchingBars({ view, maxValue, colors }: SearchingBarsProps) {
  const inRange = (index: number): boolean =>
    view.range !== null && index >= view.range[0] && index <= view.range[1];

  const stateOf = (index: number): SearchBarState => {
    if (index === view.found) return 'found';
    if (index === view.current) return 'current';
    if (inRange(index)) return 'range';
    return 'idle';
  };

  const colorFor = (index: number): string => {
    switch (stateOf(index)) {
      case 'found':
        return colors.found;
      case 'current':
        return colors.current;
      case 'range':
        return colors.range;
      default:
        return colors.default;
    }
  };

  return (
    <div
      className="relative flex w-full flex-1 items-end justify-center gap-2 overflow-hidden p-6 pb-32"
      data-testid="searching-bars"
    >
      {view.array.map((value, index) => (
        <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <div
            data-index={index}
            data-state={stateOf(index)}
            className="h-full w-full rounded-t-md border border-black/5 shadow-sm transition-all duration-150"
            style={{
              transform: `scaleY(${(value / maxValue) * 0.8})`,
              transformOrigin: 'bottom',
              backgroundColor: colorFor(index),
              minHeight: '24px',
            }}
          />
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default SearchingBars;

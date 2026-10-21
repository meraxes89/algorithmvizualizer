import type { SortView } from '@core/steps';

/** The colours a sorting view is painted with. */
export type SortColors = {
  default: string;
  comparing: string;
  swapping: string;
  sorted: string;
};

export type SortingBarsProps = {
  /** The view carried by the step being displayed. */
  view: SortView;
  /** The largest value in the array. Used to scale the bars. */
  maxValue: number;
  /** The colours to paint the bars with. */
  colors: SortColors;
  /** Called with the index of a bar that was clicked. */
  onSelect?: (index: number) => void;
};

/**
 * The bars of a sorting view.
 *
 * A dumb renderer: it is a function of the view carried by the current
 * step, and it knows nothing about algorithms, playback or time. Give it
 * a different step and it draws a different picture.
 */
export function SortingBars({ view, maxValue, colors, onSelect }: SortingBarsProps) {
  const sorted = new Set(view.sorted);
  const swapping = new Set(view.swapping);
  const comparing = new Set(view.comparing);

  const colorFor = (index: number): string => {
    if (sorted.has(index)) return colors.sorted;
    if (swapping.has(index)) return colors.swapping;
    if (comparing.has(index)) return colors.comparing;
    return colors.default;
  };

  return (
    <div
      className="flex h-full w-full items-end justify-center gap-[2px]"
      data-testid="sorting-bars"
    >
      {view.array.map((value, index) => (
        <div
          key={index}
          data-index={index}
          data-state={
            sorted.has(index)
              ? 'sorted'
              : swapping.has(index)
                ? 'swapping'
                : comparing.has(index)
                  ? 'comparing'
                  : 'idle'
          }
          className="h-full flex-1 rounded-t-sm shadow-sm transition-all duration-75"
          style={{
            transform: `scaleY(${(value / maxValue) * 0.85})`,
            transformOrigin: 'bottom',
            backgroundColor: colorFor(index),
            minWidth: '2px',
          }}
          title={`Value: ${value}, Index: ${index}`}
          onClick={onSelect ? () => onSelect(index) : undefined}
        />
      ))}
    </div>
  );
}

export default SortingBars;

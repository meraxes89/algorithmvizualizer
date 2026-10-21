import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SortingBars, type SortColors } from './SortingBars';
import { bubbleSort } from '@algorithms/sorting/bubble-sort/bubble-sort';
import { collectSteps } from '@core/playback';
import type { SortStep } from '@core/steps';

const colors: SortColors = {
  default: '#a5b4fc',
  comparing: '#f472b6',
  swapping: '#f43f5e',
  sorted: '#fb923c',
};

const trace = collectSteps(bubbleSort([5, 2, 8, 1]));

const stepOf = (t: SortStep['t']): SortStep => {
  const step = trace.find((candidate) => candidate.t === t);
  if (!step) {
    throw new Error(`no ${t} step in the trace`);
  }
  return step;
};

const states = (): string[] =>
  screen.getAllByTestId('sorting-bars')[0].querySelectorAll('[data-index]').length > 0
    ? Array.from(screen.getAllByTestId('sorting-bars')[0].querySelectorAll('[data-index]')).map(
        (node) => node.getAttribute('data-state') ?? ''
      )
    : [];

describe('SortingBars', () => {
  it('renders one bar per element of the array', () => {
    render(<SortingBars view={stepOf('set-array').view} maxValue={8} colors={colors} />);

    const bars = screen.getByTestId('sorting-bars').querySelectorAll('[data-index]');
    expect(bars).toHaveLength(4);
  });

  it('shows the values the step carries', () => {
    render(<SortingBars view={stepOf('set-array').view} maxValue={8} colors={colors} />);

    expect(screen.getByTitle('Value: 5, Index: 0')).toBeInTheDocument();
    expect(screen.getByTitle('Value: 1, Index: 3')).toBeInTheDocument();
  });

  it('highlights the pair a compare step is comparing', () => {
    render(<SortingBars view={stepOf('compare').view} maxValue={8} colors={colors} />);

    expect(states().filter((state) => state === 'comparing')).toHaveLength(2);
  });

  it('highlights the pair a swap step is swapping', () => {
    render(<SortingBars view={stepOf('swap').view} maxValue={8} colors={colors} />);

    expect(states().filter((state) => state === 'swapping')).toHaveLength(2);
  });

  it('marks every position as sorted on the final step', () => {
    render(<SortingBars view={stepOf('done').view} maxValue={8} colors={colors} />);

    expect(states().every((state) => state === 'sorted')).toBe(true);
  });

  it('paints a bar with the colour its state asks for', () => {
    const view = stepOf('compare').view;
    render(<SortingBars view={view} maxValue={8} colors={colors} />);

    const comparing = screen
      .getByTestId('sorting-bars')
      .querySelector('[data-state="comparing"]') as HTMLElement;

    expect(comparing.style.backgroundColor).toBe('rgb(244, 114, 182)');
  });

  it('scales the bars by their value', () => {
    render(<SortingBars view={stepOf('set-array').view} maxValue={8} colors={colors} />);

    const tallest = screen.getByTitle('Value: 8, Index: 2') as HTMLElement;
    const shortest = screen.getByTitle('Value: 1, Index: 3') as HTMLElement;

    expect(tallest.style.transform).toBe('scaleY(0.85)');
    expect(shortest.style.transform).toBe('scaleY(0.10625)');
  });

  it('reports the bar that was clicked', () => {
    const onSelect = vi.fn();
    render(
      <SortingBars
        view={stepOf('set-array').view}
        maxValue={8}
        colors={colors}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByTitle('Value: 5, Index: 0'));

    expect(onSelect).toHaveBeenCalledWith(0);
  });
});

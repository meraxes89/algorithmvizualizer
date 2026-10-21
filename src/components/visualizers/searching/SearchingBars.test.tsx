import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchingBars, type SearchColors } from './SearchingBars';
import { binarySearch } from '@algorithms/searching/binary-search/binary-search';
import { collectSteps } from '@core/playback';
import type { SearchStep } from '@core/steps';

const colors: SearchColors = {
  default: '#a7f3d0',
  range: '#34d399',
  current: '#f43f5e',
  found: '#10b981',
};

const trace = collectSteps(binarySearch([2, 4, 6, 8, 10], 6));

const stepOf = (t: SearchStep['t']): SearchStep => {
  const step = trace.find((candidate) => candidate.t === t);
  if (!step) {
    throw new Error(`no ${t} step in the trace`);
  }
  return step;
};

const states = (): string[] =>
  Array.from(screen.getByTestId('searching-bars').querySelectorAll('[data-index]')).map(
    (node) => node.getAttribute('data-state') ?? ''
  );

describe('SearchingBars', () => {
  it('renders one bar per element of the array', () => {
    render(<SearchingBars view={stepOf('set-array').view} maxValue={10} colors={colors} />);

    expect(screen.getByTestId('searching-bars').querySelectorAll('[data-index]')).toHaveLength(5);
  });

  it('shows the value under each bar', () => {
    render(<SearchingBars view={stepOf('set-array').view} maxValue={10} colors={colors} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('highlights the element being examined', () => {
    render(<SearchingBars view={stepOf('probe').view} maxValue={10} colors={colors} />);

    expect(states().filter((state) => state === 'current')).toHaveLength(1);
  });

  it('highlights the window still under consideration', () => {
    render(<SearchingBars view={stepOf('probe').view} maxValue={10} colors={colors} />);

    // The window is the whole array, and the element in the middle of it
    // is also the one being examined.
    expect(states().filter((state) => state === 'range' || state === 'current')).toHaveLength(5);
  });

  it('marks the element that holds the target as found', () => {
    render(<SearchingBars view={stepOf('found').view} maxValue={10} colors={colors} />);

    expect(states().filter((state) => state === 'found')).toHaveLength(1);
  });

  it('paints a bar with the colour its state asks for', () => {
    render(<SearchingBars view={stepOf('found').view} maxValue={10} colors={colors} />);

    const found = screen
      .getByTestId('searching-bars')
      .querySelector('[data-state="found"]') as HTMLElement;

    expect(found.style.backgroundColor).toBe('rgb(16, 185, 129)');
  });
});

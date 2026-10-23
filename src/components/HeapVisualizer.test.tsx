import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (
  specifier: string
): Promise<{ default: ComponentType }> =>
  import(specifier) as Promise<{ default: ComponentType }>;

const renderVisualizer = async () => {
  const HeapVisualizer = (await loadVisualizer('./HeapVisualizer.jsx')).default;

  return render(<HeapVisualizer />);
};

const countCircles = (container: HTMLElement) =>
  container.querySelectorAll('circle').length;

describe('HeapVisualizer', () => {
  it('renders the heap header, max/min toggle, labelled input and controls', async () => {
    const { container } = await renderVisualizer();

    expect(screen.getByRole('heading', { name: 'Heap Operations' })).toBeInTheDocument();
    expect(
      screen.getByText(/Insert & Extract Root with Bubble-up \/ Heapify-down/i)
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Max Heap/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Value to insert into the heap')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Extract Root/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random Heap/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/ })).toBeInTheDocument();

    // The seeded heap holds ten values.
    expect(countCircles(container)).toBeGreaterThanOrEqual(10);
  });

  it('inserts a value and locks the controls while the trace plays', async () => {
    await renderVisualizer();

    const input = screen.getByLabelText('Value to insert into the heap');
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: /Insert/ }));

    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: /Extract Root/ })).toBeDisabled();
  });

  it('toggles between the max-heap and min-heap variants', async () => {
    await renderVisualizer();

    const toggle = screen.getByRole('button', { name: /Max Heap/ });
    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: /Min Heap/ })).toBeInTheDocument();
  });
});

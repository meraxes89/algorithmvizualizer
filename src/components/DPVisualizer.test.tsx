import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// What DPPage.jsx hands the visualizer: the tab id of the dynamic
// program to show ('knapsack' | 'lcs' | 'fibonacci').
type DPVisualizerProps = {
  algorithmType: string;
};

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (
  specifier: string
): Promise<{ default: ComponentType<DPVisualizerProps> }> =>
  import(specifier) as Promise<{ default: ComponentType<DPVisualizerProps> }>;

const renderVisualizer = async (algorithmType: string) => {
  const DPVisualizer = (await loadVisualizer('./DPVisualizer.jsx')).default;

  return render(<DPVisualizer algorithmType={algorithmType} />);
};

describe('DPVisualizer', () => {
  it('renders the knapsack header, complexity chips and control bar', async () => {
    await renderVisualizer('knapsack');

    expect(screen.getByRole('heading', { name: '0/1 Knapsack Problem' })).toBeInTheDocument();
    expect(screen.getAllByText(/O\(N × W\)/)).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Visualize DP/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Info/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Code/ })).toBeInTheDocument();
  });

  it('compiles the knapsack trace on mount and draws its table', async () => {
    const { container } = await renderVisualizer('knapsack');

    // The trace is collected up front, so the badge reads "Step: / N"
    // immediately and the 5 × 8 table is fully drawn.
    expect(screen.getByText(/Step: \/ \d+/)).toBeInTheDocument();
    expect(screen.getByText('i \\ j')).toBeInTheDocument();
    expect(screen.getByText('W=0')).toBeInTheDocument();
    expect(screen.getByText('W=7')).toBeInTheDocument();
    expect(screen.getByText('Item 4 (w:5, v:8)')).toBeInTheDocument();
    expect(container.querySelectorAll('tbody td').length).toBe(45);
  });

  it('switches the trace into playback and back to the start', async () => {
    await renderVisualizer('knapsack');

    fireEvent.click(screen.getByRole('button', { name: /Visualize DP/ }));

    // The run is now owned by the playback engine.
    expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Visualize DP/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset/ }));

    expect(screen.getByText(/Step: \/ \d+/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Visualize DP/ })).toBeInTheDocument();
  });

  it('renders the LCS variant with its string table', async () => {
    const { container } = await renderVisualizer('lcs');

    expect(
      screen.getByRole('heading', { name: 'Longest Common Subsequence (LCS)' })
    ).toBeInTheDocument();
    // The LCS table is headed by the second string, not capacities.
    expect(screen.getByText('Ø')).toBeInTheDocument();
    expect(container.querySelectorAll('tbody td').length).toBeGreaterThan(0);
  });

  it('opens and closes the explanation panel', async () => {
    await renderVisualizer('knapsack');

    expect(screen.queryByText('Algorithm Info')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Info/ }));
    expect(screen.getByText('Algorithm Info')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close explanation' }));
    expect(screen.queryByText('Algorithm Info')).not.toBeInTheDocument();
  });
});

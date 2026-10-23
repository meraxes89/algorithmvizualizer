import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// What RecursionAlgorithms.jsx hands the visualizer: the registry entry's
// id, which selects the board engine and the metadata panel.
type GridBacktrackingVisualizerProps = {
  algorithmId: string;
};

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (
  specifier: string
): Promise<{ default: ComponentType<GridBacktrackingVisualizerProps> }> =>
  import(specifier) as Promise<{ default: ComponentType<GridBacktrackingVisualizerProps> }>;

const renderVisualizer = async (algorithmId: string) => {
  const GridBacktrackingVisualizer = (await loadVisualizer('./GridBacktrackingVisualizer.jsx'))
    .default;

  return render(<GridBacktrackingVisualizer algorithmId={algorithmId} />);
};

describe('GridBacktrackingVisualizer', () => {
  it('renders the N-Queens header, its complexity and the controls', async () => {
    await renderVisualizer('nQueens');

    expect(screen.getByRole('heading', { name: 'N-Queens' })).toBeInTheDocument();
    expect(screen.getByText(/O\(N!\)/)).toBeInTheDocument();

    const input = screen.getByLabelText('Input for the algorithm') as HTMLInputElement;
    expect(input).toHaveValue('4');
    expect(input).toBeEnabled();

    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step' })).toBeInTheDocument();
  });

  it('starts idle with an empty board and a disabled stepper', async () => {
    await renderVisualizer('nQueens');

    expect(screen.getByText(/to visualize backtracking/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step' })).toBeDisabled();
  });

  it('lays out the 4×4 board when Run is pressed', async () => {
    const { container } = await renderVisualizer('nQueens');

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    expect(screen.queryByText(/to visualize backtracking/)).not.toBeInTheDocument();

    // The default input is 4, so the trace's first frame draws a 4×4 board.
    const board = container.querySelector('div.grid');
    expect(board).not.toBeNull();
    expect(board?.childElementCount).toBe(16);

    // This visualizer collects the trace but does not autoplay it, so
    // the transport stays on Play with the stepper armed.
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step' })).toBeEnabled();
  });

  it('plays, pauses and steps through the compiled board trace', async () => {
    const { container } = await renderVisualizer('nQueens');
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Step' }));

    // The board is still on screen after a manual step.
    expect(container.querySelector('div.grid')?.childElementCount).toBe(16);
  });

  it('disables the board input for the fixed-puzzle algorithms', async () => {
    await renderVisualizer('sudoku');

    expect(screen.getByRole('heading', { name: 'Sudoku Solver' })).toBeInTheDocument();
    expect(screen.getByLabelText('Input for the algorithm')).toBeDisabled();
  });
});

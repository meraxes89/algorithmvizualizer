import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// What RecursionAlgorithms.jsx hands the visualizer: the registry entry's
// id, which selects the trace engine and the metadata panel.
type TreeRecursionVisualizerProps = {
  algorithmId: string;
};

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (
  specifier: string
): Promise<{ default: ComponentType<TreeRecursionVisualizerProps> }> =>
  import(specifier) as Promise<{ default: ComponentType<TreeRecursionVisualizerProps> }>;

const renderVisualizer = async (algorithmId: string) => {
  const TreeRecursionVisualizer = (await loadVisualizer('./TreeRecursionVisualizer.jsx')).default;

  return render(<TreeRecursionVisualizer algorithmId={algorithmId} />);
};

describe('TreeRecursionVisualizer', () => {
  it('renders the factorial header, its complexity chips and the controls', async () => {
    await renderVisualizer('factorial');

    expect(screen.getByRole('heading', { name: 'Factorial' })).toBeInTheDocument();
    expect(screen.getAllByText(/O\(n\)/)).toHaveLength(2);

    const input = screen.getByLabelText('Input arguments') as HTMLInputElement;
    expect(input).toHaveValue('5');

    expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Speed' })).toBeInTheDocument();
  });

  it('starts idle with an empty canvas and a disabled stepper', async () => {
    await renderVisualizer('factorial');

    expect(screen.getByText(/to trace recursion tree/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step' })).toBeDisabled();
  });

  it('compiles the trace when Run is pressed and unlocks the stepper', async () => {
    await renderVisualizer('factorial');

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    // The idle hint is replaced by the trace canvas.
    expect(screen.queryByText(/to trace recursion tree/)).not.toBeInTheDocument();

    // This visualizer collects the trace but does not autoplay it, so
    // the transport stays on Play and the stepper is ready.
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step' })).toBeEnabled();
  });

  it('plays, pauses and steps through the compiled trace', async () => {
    await renderVisualizer('factorial');
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Step' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Step' }));

    // The trace canvas survives a manual step.
    expect(screen.queryByText(/to trace recursion tree/)).not.toBeInTheDocument();
  });

  it('binds the default input to the selected algorithm', async () => {
    await renderVisualizer('generateParentheses');

    expect(screen.getByRole('heading', { name: 'Generate Parentheses' })).toBeInTheDocument();
    expect(screen.getByLabelText('Input arguments')).toHaveValue('3');
  });
});

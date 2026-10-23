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
  const AVLVisualizer = (await loadVisualizer('./AVLVisualizer.jsx')).default;

  return render(<AVLVisualizer />);
};

const countCircles = (container: HTMLElement) =>
  container.querySelectorAll('circle').length;

describe('AVLVisualizer', () => {
  it('renders the AVL header, labelled input, controls and a seeded tree', async () => {
    const { container } = await renderVisualizer();

    expect(screen.getByRole('heading', { name: 'AVL Tree Operations' })).toBeInTheDocument();
    expect(
      screen.getByText(/Insert, Delete & Search with rotation animations/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Value to insert, search, or delete')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Insert/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random Tree/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/ })).toBeInTheDocument();

    // The seeded AVL has seven nodes.
    expect(countCircles(container)).toBeGreaterThanOrEqual(7);
  });

  it('inserts a value and locks the controls while the trace plays', async () => {
    await renderVisualizer();

    const input = screen.getByLabelText('Value to insert, search, or delete');
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: /Insert/ }));

    // The trace auto-plays, so the input and the operation buttons lock.
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: /Search/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Delete/ })).toBeDisabled();
  });

  it('reseeds the tree from the Random Tree button', async () => {
    const { container } = await renderVisualizer();

    fireEvent.click(screen.getByRole('button', { name: /Random Tree/ }));

    expect(countCircles(container)).toBeGreaterThanOrEqual(7);
    expect(
      screen.getByLabelText('Value to insert, search, or delete')
    ).not.toBeDisabled();
  });
});

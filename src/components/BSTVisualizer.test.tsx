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
  const BSTVisualizer = (await loadVisualizer('./BSTVisualizer.jsx')).default;

  return render(<BSTVisualizer />);
};

const countCircles = (container: HTMLElement) =>
  container.querySelectorAll('circle').length;

describe('BSTVisualizer', () => {
  it('renders the seeded tree on mount, not just the idle placeholder', async () => {
    const { container } = await renderVisualizer();

    expect(screen.getByRole('heading', { name: 'BST Operations' })).toBeInTheDocument();
    expect(screen.getByLabelText('Value to insert, search, or delete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random Tree/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/ })).toBeInTheDocument();

    // The seeded BST is visible before any operation runs — the port to
    // the step contract once dropped this, and the canvas stayed empty
    // until an Insert.
    expect(countCircles(container)).toBeGreaterThanOrEqual(7);
  });

  it('inserts a value and locks the controls while the trace plays', async () => {
    await renderVisualizer();

    const input = screen.getByLabelText('Value to insert, search, or delete');
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: /Insert/ }));

    expect(input).toBeDisabled();
  });

  it('reset clears the tree back to the empty state', async () => {
    const { container } = await renderVisualizer();

    fireEvent.click(screen.getByRole('button', { name: /Reset/ }));

    // The canvas svg is replaced by the idle placeholder; the only
    // circles left in the DOM belong to toolbar icons.
    expect(container.querySelector('svg[viewBox="0 0 1100 460"]')).not.toBeInTheDocument();
    // The placeholder wraps words in coloured spans, so match the exact
    // concatenated text; the canvas wrapper reports the same content, so
    // any hit proves the placeholder is what is on screen.
    expect(
      screen.getAllByText(
        (_, element) =>
          element?.tagName === 'DIV' &&
          element.textContent === 'Enter a value and click Insert or press Random Tree'
      ).length
    ).toBeGreaterThan(0);
  });
});

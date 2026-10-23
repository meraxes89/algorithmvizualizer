import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (specifier: string): Promise<{ default: ComponentType }> =>
  import(specifier) as Promise<{ default: ComponentType }>;

const renderVisualizer = async () => {
  const SegmentTreeVisualizer = (await loadVisualizer('./SegmentTreeVisualizer.jsx')).default;

  return render(<SegmentTreeVisualizer />);
};

describe('SegmentTreeVisualizer', () => {
  it('renders the header, tree-type select and labelled operation inputs', async () => {
    await renderVisualizer();

    expect(screen.getByRole('heading', { name: 'Segment Tree' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Segment tree type' })).toHaveValue('sum');
    expect(screen.getByLabelText('Array values')).toBeInTheDocument();
    expect(screen.getByLabelText('Index to update')).toBeInTheDocument();
    expect(screen.getByLabelText('Value to update')).toBeInTheDocument();
    expect(screen.getByLabelText('Query range start')).toBeInTheDocument();
    expect(screen.getByLabelText('Query range end')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Build' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random/ })).toBeInTheDocument();
  });

  it('builds a segment tree over a random eight-element array on mount', async () => {
    const { container } = await renderVisualizer();

    expect(screen.getByText('Base Array')).toBeInTheDocument();
    // Eight array cells — the seed always draws generateRandomArrayForSegTree(8, …).
    expect(container.querySelectorAll('div.w-10').length).toBe(8);
    // The tree view replaced the empty state.
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('runs a range query trace and locks the builders while it plays', async () => {
    await renderVisualizer();

    const left = screen.getByLabelText('Query range start');
    const right = screen.getByLabelText('Query range end');
    expect(screen.getByRole('button', { name: 'Query' })).toBeDisabled();

    fireEvent.change(left, { target: { value: '0' } });
    fireEvent.change(right, { target: { value: '7' } });
    expect(screen.getByRole('button', { name: 'Query' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Query' }));

    // The query trace narrates itself in the log and playback locks the
    // rebuild controls.
    expect(screen.getByText(/Querying range \[0-7\]/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random/ })).toBeDisabled();
  });

  it('applies a point update and narrates it', async () => {
    await renderVisualizer();

    fireEvent.change(screen.getByLabelText('Index to update'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Value to update'), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    expect(screen.getByText(/Updating index 0 to 10/)).toBeInTheDocument();
  });

  it('switches the combining rule from the tree-type select', async () => {
    const { container } = await renderVisualizer();

    const treeType = screen.getByRole('combobox', { name: 'Segment tree type' });
    fireEvent.change(treeType, { target: { value: 'min' } });

    expect(treeType).toHaveValue('min');
    // The same base array is rebuilt as a Min tree.
    expect(container.querySelectorAll('div.w-10').length).toBe(8);
  });
});

import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { preOrderTraversal } from '../algorithms/trees/traversals/traversals';

// What TreeAlgorithms.jsx hands the visualizer for a traversal operation:
// the generator bound in the page's TRAVERSALS table plus the metadata
// panel for that operation (see src/data/treeAlgorithms.js).
type TreeVisualizerProps = {
  algorithm: typeof preOrderTraversal;
  algorithmInfo: {
    name: string;
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
};

const preOrderInfo: TreeVisualizerProps['algorithmInfo'] = {
  name: 'Pre-order Traversal',
  description: 'Visit root, then left subtree, then right subtree.',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(h)',
};

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (
  specifier: string
): Promise<{ default: ComponentType<TreeVisualizerProps> }> =>
  import(specifier) as Promise<{ default: ComponentType<TreeVisualizerProps> }>;

const renderVisualizer = async () => {
  const TreeVisualizer = (await loadVisualizer('./TreeVisualizer.jsx')).default;

  return render(<TreeVisualizer algorithm={preOrderTraversal} algorithmInfo={preOrderInfo} />);
};

describe('TreeVisualizer', () => {
  it('renders the traversal header, complexity chips, controls and legend', async () => {
    await renderVisualizer();

    expect(screen.getByRole('heading', { name: 'Pre-order Traversal' })).toBeInTheDocument();
    expect(screen.getByText(/Visit root, then left subtree/i)).toBeInTheDocument();
    expect(screen.getByText(/O\(n\)/)).toBeInTheDocument();
    expect(screen.getByText(/O\(h\)/)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Start Traversal/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Tree/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Settings/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Info/ })).toBeInTheDocument();

    expect(screen.getByText('Unvisited')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Visited')).toBeInTheDocument();
  });

  it('seeds a complete depth-3 tree on mount', async () => {
    const { container } = await renderVisualizer();

    // A complete depth-3 binary tree: 15 nodes joined by 14 edges.
    const lines = container.querySelectorAll('svg line');
    expect(lines.length).toBe(14);

    // Every node is drawn as an ambient ring plus a main circle.
    const circles = container.querySelectorAll('svg circle');
    expect(circles.length).toBeGreaterThanOrEqual(30);
  });

  it('starts a traversal and locks the controls while it plays', async () => {
    await renderVisualizer();

    fireEvent.click(screen.getByRole('button', { name: /Start Traversal/ }));

    expect(screen.getByRole('button', { name: /Start Traversal/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /New Tree/ })).toBeDisabled();
  });

  it('grows a new tree from the New Tree button', async () => {
    const { container } = await renderVisualizer();

    const before = container.querySelectorAll('svg circle').length;
    fireEvent.click(screen.getByRole('button', { name: /New Tree/ }));

    // The reshuffle is random, but a complete depth-3 tree always has
    // the same shape: 14 edges and 15 ring + node circle pairs.
    expect(container.querySelectorAll('svg line').length).toBe(14);
    expect(container.querySelectorAll('svg circle').length).toBe(before);
  });

  it('opens and closes the explanation panel', async () => {
    await renderVisualizer();

    expect(screen.queryByText('Algorithm Info')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Info/ }));
    expect(screen.getByText('Algorithm Info')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close explanation' }));
    expect(screen.queryByText('Algorithm Info')).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GraphVisualizer from './GraphVisualizer';

const renderDijkstra = () =>
  render(<GraphVisualizer algorithmInfo={{ id: 'Dijkstra', name: "Dijkstra's Algorithm" }} />);

describe('GraphVisualizer', () => {
  it('renders the algorithm header, complexity chips and toolbar', () => {
    renderDijkstra();

    expect(
      screen.getByRole('heading', { name: "Dijkstra's Algorithm" })
    ).toBeInTheDocument();
    expect(screen.getByText(/single-source shortest path/i)).toBeInTheDocument();
    expect(screen.getByText(/O\(V \+ E\)/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Visualize/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Randomize/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Graph Builder/ })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Playback speed' })).toBeInTheDocument();
  });

  it('seeds a random connected graph on mount', () => {
    const { container } = renderDijkstra();

    // The seeded graph has six nodes arranged in a circle.
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(6);

    // Connectivity ring: node A is linked to at least one neighbour.
    const lines = container.querySelectorAll('svg > g > line');
    expect(lines.length).toBeGreaterThanOrEqual(6);
  });

  it('compiles a Dijkstra trace and exposes the transport controls', () => {
    renderDijkstra();

    fireEvent.click(screen.getByRole('button', { name: /Visualize/ }));

    // The step log appears as soon as a trace exists.
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause|Play/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next step' })).toBeInTheDocument();

    // Stepping forward moves the trace without owning a timer.
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText(/Step 2 of/)).toBeInTheDocument();
  });

  it('resets a compiled trace back to the idle state', () => {
    renderDijkstra();

    fireEvent.click(screen.getByRole('button', { name: /Visualize/ }));
    fireEvent.click(screen.getByRole('button', { name: /Reset/ }));

    expect(screen.getByRole('button', { name: /Visualize/ })).toBeInTheDocument();
    expect(screen.queryByText(/Step 1 of/)).not.toBeInTheDocument();
  });

  it('edits the graph: add-node mode places a node on double-click', () => {
    const { container } = renderDijkstra();

    const before = container.querySelectorAll('circle').length;

    fireEvent.click(screen.getByRole('button', { name: '+ Add Node' }));
    fireEvent.dblClick(screen.getByRole('img', { name: 'Interactive graph canvas' }));

    const after = container.querySelectorAll('circle').length;
    expect(after).toBeGreaterThan(before);
  });

  it('lets the user pick source and target nodes', () => {
    renderDijkstra();

    const source = screen.getByLabelText('Source node') as HTMLSelectElement;
    const target = screen.getByLabelText('Target node') as HTMLSelectElement;

    // The seeded circle graph defaults to the first and last nodes.
    expect(source.value).toBe('0');
    expect(target.value).toBe('5');

    // "None" truly clears the target instead of aliasing node 0.
    fireEvent.change(target, { target: { value: '' } });
    expect(target.value).toBe('');

    fireEvent.change(source, { target: { value: '2' } });
    expect(source.value).toBe('2');
  });

  it('opens and closes the graph builder overlay', () => {
    renderDijkstra();

    fireEvent.click(screen.getByRole('button', { name: /Graph Builder/ }));
    expect(screen.getByRole('button', { name: 'Close graph builder' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close graph builder' }));
    expect(
      screen.queryByRole('button', { name: 'Close graph builder' })
    ).not.toBeInTheDocument();
  });

  it('shows the source/target legend only for algorithms that need them', () => {
    render(
      <GraphVisualizer
        algorithmInfo={{ id: "Prim's MST", name: "Prim's Minimum Spanning Tree" }}
      />
    );

    expect(screen.queryByText('Source Node')).not.toBeInTheDocument();
    expect(screen.queryByText('Target Node')).not.toBeInTheDocument();

    renderDijkstra();

    expect(screen.getByText('Source Node')).toBeInTheDocument();
    expect(screen.getByText('Target Node')).toBeInTheDocument();
  });

  it('falls back to Dijkstra when the requested algorithm is unknown', () => {
    render(<GraphVisualizer algorithmInfo={{ id: 'unknown', name: 'Nope' }} />);

    expect(screen.getByRole('heading', { name: "Dijkstra's Algorithm" })).toBeInTheDocument();
  });
});

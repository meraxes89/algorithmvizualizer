import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// The generator itself lives in a stable module; the family index is
// being reshaped by the metadata unification, so it is not imported here.
import { breadthFirstSearch } from '../algorithms/pathfinding/bfs/bfs';

// What PathFindingPage.jsx hands the visualizer: the generator, its key
// and the metadata panel. The component reads the key and the info.
type PathFindingVisualizerProps = {
  algorithm: typeof breadthFirstSearch;
  algorithmKey: string;
  algorithmInfo: {
    name: string;
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
};

const bfsInfo: PathFindingVisualizerProps['algorithmInfo'] = {
  name: 'Breadth-First Search',
  description: 'Explores the grid level by level until the end node is reached.',
  timeComplexity: 'O(V+E)',
  spaceComplexity: 'O(V)',
};

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (
  specifier: string
): Promise<{ default: ComponentType<PathFindingVisualizerProps> }> =>
  import(specifier) as Promise<{ default: ComponentType<PathFindingVisualizerProps> }>;

const renderVisualizer = async () => {
  const PathFindingVisualizer = (await loadVisualizer('./PathFindingVisualizer.jsx')).default;

  return render(
    <PathFindingVisualizer
      algorithm={breadthFirstSearch}
      algorithmKey="bfs"
      algorithmInfo={bfsInfo}
    />
  );
};

describe('PathFindingVisualizer', () => {
  it('renders the header, telemetry chips, HUD controls and legend', async () => {
    await renderVisualizer();

    expect(screen.getByRole('heading', { name: 'Breadth-First Search' })).toBeInTheDocument();
    expect(screen.getByText(/explores the grid level by level/i)).toBeInTheDocument();
    expect(screen.getByText('O(V+E)')).toBeInTheDocument();
    expect(screen.getByText('O(V)')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Visualize/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Maze/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Maze type' })).toBeInTheDocument();
    expect(screen.getByTitle('Reset Board')).toBeInTheDocument();
    expect(screen.getByTitle('Clear Walls')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle 3D Mode')).toBeInTheDocument();

    // The HUD legend explains every grid colour.
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Wall')).toBeInTheDocument();
    expect(screen.getByText('Path')).toBeInTheDocument();
  });

  it('builds a maze and a trace on mount, exposing the timeline', async () => {
    await renderVisualizer();

    // The grid itself is a canvas with an accessible description; the
    // pixels are not asserted (jsdom has no 2D context), the structure is.
    expect(
      screen.getByRole('img', {
        name: 'Pathfinding grid. Drag to draw walls or move the start and end nodes.',
      })
    ).toBeInTheDocument();

    // The mount effect generates a maze, so a trace exists immediately
    // and the step controls dock is rendered.
    expect(screen.getByLabelText('Step position')).toBeInTheDocument();
    expect(screen.getByTitle('Reset')).toBeInTheDocument();
    expect(screen.getByTitle('Previous [←]')).toBeInTheDocument();
    expect(screen.getByTitle('Play [Space]')).toBeInTheDocument();
    expect(screen.getByTitle('Next [→]')).toBeInTheDocument();
  });

  it('flips into playback when Visualize is pressed', async () => {
    await renderVisualizer();

    fireEvent.click(screen.getByRole('button', { name: /Visualize/ }));

    // Playback owns the run: the HUD locks and the dock shows Pause.
    expect(screen.getByRole('button', { name: /Visualize/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Generate Maze/ })).toBeDisabled();
    expect(screen.getByTitle('Pause [Space]')).toBeInTheDocument();
  });

  it('switches the maze generator from the labelled select', async () => {
    await renderVisualizer();

    const mazeType = screen.getByRole('combobox', { name: 'Maze type' });
    expect(mazeType).toHaveValue('dfs');

    fireEvent.change(mazeType, { target: { value: 'prims' } });

    expect(mazeType).toHaveValue('prims');
    // The trace is recomputed, so the timeline survives the rebuild.
    expect(screen.getByLabelText('Step position')).toBeInTheDocument();
  });
});

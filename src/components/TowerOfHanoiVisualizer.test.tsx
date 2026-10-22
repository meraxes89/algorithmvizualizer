import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TowerOfHanoiVisualizer from './TowerOfHanoiVisualizer';

describe('TowerOfHanoiVisualizer', () => {
  it('renders the puzzle, controls and complexity metadata', () => {
    render(<TowerOfHanoiVisualizer algorithmId="towerOfHanoi" />);

    expect(screen.getByRole('heading', { name: 'Tower of Hanoi' })).toBeInTheDocument();
    expect(screen.getByLabelText('Number of disks')).toHaveValue(3);
    expect(screen.getByRole('button', { name: /Run/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Speed/ })).toBeInTheDocument();
    expect(screen.getByText(/O\(2\^n\)/)).toBeInTheDocument();
  });

  it('builds a trace and renders the three pegs when Run is pressed', () => {
    render(<TowerOfHanoiVisualizer algorithmId="towerOfHanoi" />);

    fireEvent.click(screen.getByRole('button', { name: /Run/ }));

    expect(screen.getByText('Peg A')).toBeInTheDocument();
    expect(screen.getByText('Peg B')).toBeInTheDocument();
    expect(screen.getByText('Peg C')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument();
  });

  it('opens the speed panel and applies a preset', () => {
    render(<TowerOfHanoiVisualizer algorithmId="towerOfHanoi" />);

    fireEvent.click(screen.getByRole('button', { name: /Speed/ }));

    expect(screen.getByText('Animation Speed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'SLOW' }));
    expect(screen.getByRole('button', { name: 'SLOW' })).toBeInTheDocument();
  });

  it('can step after pausing a running trace', () => {
    render(<TowerOfHanoiVisualizer algorithmId="towerOfHanoi" />);
    fireEvent.click(screen.getByRole('button', { name: /Run/ }));

    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));
    fireEvent.click(screen.getByRole('button', { name: /Step/ }));

    expect(screen.getByRole('button', { name: /Play/ })).toBeInTheDocument();
  });
});

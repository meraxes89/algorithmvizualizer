import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// The visualizer is still a legacy `.jsx` module. Routing the specifier
// through a parameter keeps it out of the typed surface (see src/env.d.ts)
// while vitest still loads and exercises the real component.
const loadVisualizer = (specifier: string): Promise<{ default: ComponentType }> =>
  import(specifier) as Promise<{ default: ComponentType }>;

const renderVisualizer = async () => {
  const TrieVisualizer = (await loadVisualizer('./TrieVisualizer.jsx')).default;

  return render(<TrieVisualizer />);
};

describe('TrieVisualizer', () => {
  it('renders the trie header, labelled word input and operation buttons', async () => {
    await renderVisualizer();

    expect(screen.getByRole('heading', { name: 'Trie (Prefix Tree)' })).toBeInTheDocument();
    expect(screen.getByLabelText('Word to insert, search, or delete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random Words/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Autocomplete' })).toBeInTheDocument();
    expect(screen.getByText('End of Word')).toBeInTheDocument();
  });

  it('seeds a random five-word trie on mount and shows its stats', async () => {
    const { container } = await renderVisualizer();

    // The stats bar reflects the freshly built trie.
    expect(screen.getByText('Total Words:')).toBeInTheDocument();
    expect(screen.getByText('Total Nodes:')).toBeInTheDocument();
    expect(screen.getByText('Max Depth:')).toBeInTheDocument();

    // Five words guarantee at least six drawn nodes (root + one per word).
    // The tree svg is picked out by its viewBox so lucide button icons
    // (which also draw circles) do not pollute the count.
    const circles = container.querySelectorAll('svg[viewBox="0 0 1100 500"] circle');
    expect(circles.length).toBeGreaterThanOrEqual(6);
  });

  it('runs an insert trace from the word input and locks the controls', async () => {
    await renderVisualizer();

    const word = screen.getByLabelText('Word to insert, search, or delete') as HTMLInputElement;
    expect(screen.getByRole('button', { name: 'Insert' })).toBeDisabled();

    // The input accepts letters only; digits are stripped on entry.
    fireEvent.change(word, { target: { value: 'algo' } });
    expect(word).toHaveValue('algo');
    expect(screen.getByRole('button', { name: 'Insert' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    // The insert trace starts: the log narrates it and playback owns
    // the component, so the destructive operations lock.
    expect(screen.getByText(/Inserting word 'algo'/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Random Words/ })).toBeDisabled();
  });

  it('resets the playground back to a bare root node', async () => {
    const { container } = await renderVisualizer();

    fireEvent.click(screen.getByRole('button', { name: /Reset/ }));

    // An empty trie is exactly the bare root circle.
    expect(container.querySelectorAll('svg[viewBox="0 0 1100 500"] circle').length).toBe(1);
    expect(screen.getByText('Total Words:')).toBeInTheDocument();
  });
});

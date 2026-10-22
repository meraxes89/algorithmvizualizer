import { Link } from 'react-router-dom';
import { FlaskConical, ArrowUpRight } from 'lucide-react';
import { SortingBars } from '../components/visualizers/sorting/SortingBars';
import { SearchingBars } from '../components/visualizers/searching/SearchingBars';
import { algorithmFamilies, algorithmHref } from '../registry';
import { viz, type VizColorName } from '../theme/vizTokens';
import type { SearchView, SortView } from '@core/steps';

/**
 * A dev-only surface for the visualization tokens.
 *
 * No Storybook: the point is to see every state colour, the surfaces it
 * sits on, and a couple of dumb renderers side by side while the token
 * sweep is in progress. It is lazy-loaded and not linked from the app.
 */

const STATE_TOKENS: { token: VizColorName; label: string }[] = [
  { token: 'idle', label: 'Idle / unsorted' },
  { token: 'active', label: 'Active' },
  { token: 'compare', label: 'Comparing' },
  { token: 'swap', label: 'Swapping / rejecting' },
  { token: 'sorted', label: 'Sorted / found' },
  { token: 'visited', label: 'Visited / exploring' },
  { token: 'path', label: 'Path' },
  { token: 'pivot', label: 'Pivot' },
  { token: 'warning', label: 'Rotating' },
  { token: 'danger', label: 'Deleting / backtracking' },
  { token: 'wall', label: 'Wall' },
  { token: 'start', label: 'Start' },
  { token: 'end', label: 'End' },
];

const SURFACE_TOKENS: { token: VizColorName; label: string }[] = [
  { token: 'canvas', label: 'Canvas' },
  { token: 'canvasDot', label: 'Canvas dot grid' },
  { token: 'surface', label: 'Surface' },
  { token: 'surface2', label: 'Surface raised' },
  { token: 'surface3', label: 'Surface inset' },
  { token: 'edge', label: 'Edges / borders' },
  { token: 'ink', label: 'Ink' },
  { token: 'inkMuted', label: 'Ink muted' },
  { token: 'muted', label: 'Muted' },
];

const NODE_GRADIENTS: { from: VizColorName; to: VizColorName; label: string }[] = [
  { from: 'nodeDefaultFrom', to: 'nodeDefaultTo', label: 'Default' },
  { from: 'nodeActiveFrom', to: 'nodeActiveTo', label: 'Active' },
  { from: 'nodeFoundFrom', to: 'nodeFoundTo', label: 'Found' },
  { from: 'nodeVisitedFrom', to: 'nodeVisitedTo', label: 'Visited' },
  { from: 'nodeDeleteFrom', to: 'nodeDeleteTo', label: 'Deleting' },
  { from: 'nodeWarnFrom', to: 'nodeWarnTo', label: 'Rotating' },
  { from: 'nodePivotFrom', to: 'nodePivotTo', label: 'Pivot' },
];

const SORT_VIEW: SortView = {
  array: [38, 72, 45, 90, 22, 60, 51],
  comparing: [1, 3],
  swapping: [2],
  sorted: [5, 6],
};

const SEARCH_VIEW: SearchView = {
  array: [10, 20, 30, 40, 50, 60, 70, 80],
  current: 3,
  found: 3,
  range: [2, 5],
};

const DevGallery = () => (
  <main className="mx-auto max-w-7xl px-6 py-12 text-ink">
    <header className="mb-10 max-w-2xl">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-accent-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-accent">
        <FlaskConical className="h-3.5 w-3.5" />
        Internal gallery
      </div>
      <h1 className="font-display text-4xl italic tracking-tight md:text-5xl">
        Visualization tokens
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        Every colour below is a CSS custom property in <code>src/index.css</code>. Flip the theme in
        the navbar to check both modes. Canvas and WebGL read the same values through{' '}
        <code>src/theme/vizTokens.ts</code>.
      </p>
    </header>

    <section className="mb-12">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-3">
        State colours
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {STATE_TOKENS.map(({ token, label }) => (
          <div key={token} className="rounded-2xl border border-line-subtle bg-paper-1/70 p-3">
            <div
              className="mb-3 h-14 rounded-xl border border-line-subtle"
              style={{ backgroundColor: viz[token] }}
            />
            <div className="text-[13px] font-semibold text-ink">{label}</div>
            <code className="text-[10px] text-ink-3">--viz-{token}</code>
          </div>
        ))}
      </div>
    </section>

    <section className="mb-12">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-3">
        Surfaces and ink
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SURFACE_TOKENS.map(({ token, label }) => (
          <div key={token} className="rounded-2xl border border-line-subtle bg-paper-1/70 p-3">
            <div
              className="mb-3 h-14 rounded-xl border border-line-subtle"
              style={{ backgroundColor: viz[token] }}
            />
            <div className="text-[13px] font-semibold text-ink">{label}</div>
            <code className="text-[10px] text-ink-3">--viz-{token}</code>
          </div>
        ))}
      </div>
    </section>

    <section className="mb-12">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-3">
        Node gradients
      </h2>
      <div className="flex flex-wrap gap-6 rounded-2xl border border-line-subtle bg-[var(--viz-canvas)] p-6">
        {NODE_GRADIENTS.map(({ from, to, label }) => (
          <div key={label} className="flex w-24 flex-col items-center gap-2">
            <div
              className="h-16 w-16 rounded-full border border-line-subtle"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${viz[from]}, ${viz[to]})`,
              }}
            />
            <span className="text-[11px] font-semibold text-[var(--viz-ink)]">{label}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="mb-12 grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-line-subtle bg-[var(--viz-canvas)] p-5">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--viz-ink-muted)]">
          Sorting bars
        </h2>
        <div className="relative h-48">
          <SortingBars
            view={SORT_VIEW}
            maxValue={100}
            colors={{
              default: viz.idle,
              comparing: viz.compare,
              swapping: viz.swap,
              sorted: viz.sorted,
            }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-line-subtle bg-[var(--viz-canvas)] p-5">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--viz-ink-muted)]">
          Searching bars
        </h2>
        <div className="relative h-48">
          <SearchingBars
            view={SEARCH_VIEW}
            maxValue={80}
            colors={{
              default: viz.nodeVisitedSoft,
              range: viz.nodeVisitedFrom,
              current: viz.swap,
              found: viz.sorted,
            }}
          />
        </div>
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-3">
        Family spot checks
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {algorithmFamilies.map((family) => (
          <Link
            key={family.id}
            to={algorithmHref(family.id, family.algorithms[0].id)}
            className="group flex items-center justify-between rounded-2xl border border-line-subtle bg-paper-1/70 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <span>{family.name}</span>
            <ArrowUpRight className="h-4 w-4 text-ink-3 group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </section>
  </main>
);

export default DevGallery;

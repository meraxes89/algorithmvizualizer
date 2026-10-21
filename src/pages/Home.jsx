
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Swords, Network, Search, BarChart3, PlayCircle, Code2, Cpu, GitBranch } from 'lucide-react';
import GitLabIcon from '../components/GitLabIcon';
import Logo from '../components/Logo';
import LiveSortCanvas from '../components/home/LiveSortCanvas';
import MicroViz from '../components/home/MicroViz';
import SpotlightCard from '../components/home/SpotlightCard';

const EASE = [0.22, 1, 0.36, 1];

const HEADLINE = [
  { text: 'Watch', italic: false },
  { text: 'algorithms', italic: true },
  { text: 'think.', italic: false },
];

const TICKER_ITEMS = [
  'Quick Sort', 'Dijkstra', 'A*', 'BFS', 'DFS', 'Merge Sort', 'Binary Search',
  'AVL Trees', 'Trie', 'Segment Tree', 'N-Queens', 'Tower of Hanoi',
  'Floyd–Warshall', 'Kadane', 'Longest Common Subsequence', 'Heap Sort',
];

const LAB_CARDS = [
  {
    to: '/sorting',
    icon: BarChart3,
    tag: 'Sorting',
    title: 'Sorting Suites',
    desc: 'Nine algorithms racing through the same array — bars, sound and every comparison on screen.',
    complexity: 'O(n²) → O(n log n)',
    viz: 'bars',
  },
  {
    to: '/pathfinding',
    icon: Network,
    tag: 'Pathfinding',
    title: 'Maze Runners',
    desc: 'Drop walls, weight terrain, then watch Dijkstra, A* and BFS negotiate the grid in real time.',
    complexity: 'O((V+E) log V)',
    viz: 'flood',
    wide: true,
  },
  {
    to: '/graph',
    icon: GitBranch,
    tag: 'Graphs',
    title: 'Graph Traversals',
    desc: 'Build any graph by hand and watch BFS and DFS sweep it node by node.',
    complexity: 'O(V + E)',
    viz: 'graph',
  },
  {
    to: '/searching',
    icon: Search,
    tag: 'Searching',
    title: 'Search Mechanics',
    desc: 'Linear scans versus logarithmic bisection — see the gap open up live.',
    complexity: 'O(log n)',
    viz: 'binary',
  },
];

const FEATURES = [
  {
    icon: PlayCircle,
    title: 'Frame-perfect control',
    desc: 'Pause, step, rewind or scrub any algorithm at your own pace.',
  },
  {
    icon: Code2,
    title: 'Real code, real time',
    desc: 'Every visualization is paired with C++, Java, Python and JS source that tracks execution.',
  },
  {
    icon: Swords,
    title: 'Battle Arena',
    desc: 'Race algorithms head-to-head on identical input and watch the leader board shift.',
  },
  {
    icon: Cpu,
    title: 'In-browser execution',
    desc: 'Write and run code instantly in the Monaco playground — no setup, no installs.',
  },
];

const reveal = {
  hidden: { y: '110%' },
  visible: (i) => ({
    y: '0%',
    transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.12 },
  }),
};

const KineticHeadline = () => (
  <h1 className="font-display text-[2.9rem] leading-[1.05] sm:text-6xl lg:text-[4.4rem] font-bold text-ink mb-7 tracking-tight">
    {HEADLINE.map((word, i) => (
      <span key={word.text} className="inline-block overflow-hidden align-bottom pb-1 -mb-1 mr-[0.24em] last:mr-0">
        <motion.span
          className={`inline-block ${word.italic ? 'italic text-accent' : ''}`}
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={i}
        >
          {word.text}
        </motion.span>
      </span>
    ))}
  </h1>
);

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <main className="max-w-7xl mx-auto px-6 pt-10 lg:pt-16 pb-20 relative z-10">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center mb-24">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-1 px-4 py-1.5 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-mono font-semibold tracking-[0.18em] uppercase text-ink-2">
                The Algorithm Studio
              </span>
            </motion.div>

            <KineticHeadline />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
              className="text-lg text-ink-2 leading-relaxed mb-10 max-w-xl"
            >
              A studio-grade laboratory where sorting, searching, graphs and trees
              unfold step by step — rendered at 60&nbsp;fps, annotated with real code,
              and scored with sound.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.68 }}
              className="flex flex-wrap items-center gap-4 mb-12"
            >
              <Link to="/algorithms" className="btn-premium px-7 py-3.5 rounded-2xl text-sm">
                <span>Enter the studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/arena"
                className="btn-secondary px-6 py-3.5 rounded-2xl text-sm items-center inline-flex"
              >
                <Swords className="w-4 h-4 text-accent" />
                <span>Battle Arena</span>
              </Link>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-line-subtle"
            >
              {[
                ['30+', 'Visualizers'],
                ['6', 'Domains'],
                ['60 fps', 'Rendering'],
                ['0', 'Setup needed'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-bold text-ink tabular-nums">{v}</dt>
                  <dd className="text-[11px] font-mono uppercase tracking-[0.14em] text-ink-3 mt-1">{l}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            className="lg:col-span-6 w-full max-w-xl lg:max-w-none lg:justify-self-end w-full"
          >
            <SpotlightCard className="glass-card p-0 overflow-hidden">
              <div className="relative z-[2] flex items-center justify-between px-5 py-3.5 border-b border-line-subtle">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-xs font-mono font-semibold tracking-wider text-ink-2">
                    insertion_sort.live
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-3">
                  click to shuffle
                </span>
              </div>
              <div className="relative z-[2] h-52 sm:h-60 px-5 py-4">
                <LiveSortCanvas />
              </div>
              <div className="relative z-[2] flex items-center justify-between px-5 py-3 border-t border-line-subtle text-[10px] font-mono text-ink-3">
                <span>n = 44</span>
                <span>O(n²) worst · O(n) best</span>
                <span className="text-accent">sorted ✓</span>
              </div>
            </SpotlightCard>
          </motion.div>
        </section>

        {/* ── TICKER ───────────────────────────────────── */}
        <section className="border-y border-line-subtle py-4 mb-24 overflow-hidden -mx-6 px-6" aria-hidden="true">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {TICKER_ITEMS.map((item) => (
                  <span key={`${copy}-${item}`} className="flex items-center text-sm font-mono text-ink-3 whitespace-nowrap">
                    <span className="px-5">{item}</span>
                    <span className="text-accent">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── LAB BENTO ────────────────────────────────── */}
        <section className="mb-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-accent mb-3">
                01 — The Laboratory
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
                Pick an instrument.
              </h2>
            </div>
            <Link
              to="/algorithms"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-strong transition-colors group"
            >
              All categories
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {LAB_CARDS.map((card, i) => (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.65, ease: EASE, delay: i * 0.09 }}
                className={card.wide ? 'lg:col-span-2' : ''}
              >
                <SpotlightCard className="glass-card p-0 h-full block group">
                  <Link to={card.to} className="relative z-[2] flex flex-col h-full">
                    <div className="p-6 pb-4 flex-1">
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-10 h-10 rounded-xl bg-accent-soft border border-line-subtle text-accent flex items-center justify-center">
                          <card.icon className="w-[18px] h-[18px]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-ink-3 border border-line-subtle rounded-full px-3 py-1">
                          {card.tag}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-ink mb-2 group-hover:text-accent transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[13px] text-ink-2 leading-relaxed mb-4">
                        {card.desc}
                      </p>
                      <span className="text-[11px] font-mono font-semibold text-ink-3">{card.complexity}</span>
                    </div>
                    <div className={`h-28 mt-auto border-t border-line-subtle relative overflow-hidden ${card.wide ? 'h-36' : ''}`}>
                      <MicroViz variant={card.viz} />
                    </div>
                  </Link>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="glass-card p-8 lg:p-10 mb-28"
        >
          <p className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-accent mb-3">
            02 — Craft details
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-10">
            Engineered like an instrument.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent-soft border border-line-subtle text-accent flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[15px] text-ink mb-1.5">{f.title}</h4>
                  <p className="text-[13px] text-ink-2 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ──────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink tracking-tight mb-4">
            Ready to see <em className="italic text-accent">logic</em> move?
          </h2>
          <p className="text-ink-2 mb-8 max-w-md mx-auto">
            No accounts. No installs. One click between you and watching Dijkstra think.
          </p>
          <Link to="/algorithms" className="btn-premium px-8 py-4 rounded-2xl text-sm">
            Start exploring
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="w-full relative z-10 border-t border-line-subtle bg-paper-1/70 backdrop-blur-xl px-8 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-sm text-ink">Algorithm Visualizer</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-line-subtle">
              flagship
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-ink-2 font-medium">
            <a
              href="https://gitlab.com/sireenyadav/algorithmvizualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
            >
              <GitLabIcon className="w-4 h-4" />
              GitLab Repository
            </a>
            <span className="text-ink-3">•</span>
            <p className="m-0">
              Designed &amp; engineered by{' '}
              <strong className="text-ink">Sireen Yadav</strong> · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

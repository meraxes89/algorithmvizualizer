import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';
import { EASE } from '../lib/motion';

const NotFoundPage = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass-card flex w-full max-w-lg flex-col items-center p-10 md:p-14"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-line-subtle bg-accent-soft text-accent">
        <Compass className="w-7 h-7" />
      </div>

      <p className="mb-3 text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-accent">
        404 · Route Not Found
      </p>

      <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Lost in the graph.
      </h1>

      <p className="mb-8 max-w-sm text-sm leading-relaxed text-ink-2">
        This node doesn't connect to anything. Dijkstra couldn't find a shortest path here either.
      </p>

      <Link to="/" className="btn-premium inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;

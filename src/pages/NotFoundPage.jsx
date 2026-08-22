import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card p-10 md:p-14 max-w-lg w-full flex flex-col items-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mb-6">
        <Compass className="w-7 h-7" />
      </div>

      <p className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-indigo-500 mb-3">
        404 &middot; Route Not Found
      </p>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        Lost in the graph.
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm">
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

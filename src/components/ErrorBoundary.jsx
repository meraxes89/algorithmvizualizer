import React from 'react';

const RELOAD_KEY = 'av:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 10000;

function isChunkLoadError(error) {
  const msg = error?.message || '';
  return (
    /loading chunk \d+ failed/i.test(msg) ||
    /importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /failed to fetch dynamically imported module/i.test(msg)
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, reloading: false };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (!isChunkLoadError(error)) return;
    let lastReloadAt = 0;
    try {
      lastReloadAt = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
    } catch (e) {}
    const now = Date.now();
    if (now - lastReloadAt < RELOAD_COOLDOWN_MS) return;
    try {
      sessionStorage.setItem(RELOAD_KEY, String(now));
    } catch (e) {}
    this.setState({ reloading: true });
    window.location.reload();
  }

  render() {
    const { error, reloading } = this.state;

    if (reloading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">
            Updating to the latest version…
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              Something went wrong.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              An unexpected error occurred while rendering this view. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-premium"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

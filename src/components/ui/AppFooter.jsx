

const AppFooter = () => (
  <footer className="border-t border-line-subtle bg-paper-1/60 px-6 py-8 mt-auto">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <img
          src="/logo-icon.svg"
          alt="Algorithm Visualizer"
          className="w-6 h-6 select-none"
          draggable="false"
        />
        <span className="text-xs text-ink-2">
          © {new Date().getFullYear()} Algorithm Visualizer
        </span>
      </div>
      <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-ink-3">
        <span>Paper Studio</span>
        <span className="w-1 h-1 rounded-full bg-line-strong" />
        <span>Interactive CS</span>
      </div>
    </div>
  </footer>
);

export default AppFooter;

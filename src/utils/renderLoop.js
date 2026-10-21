export function createVisibilityRenderLoop({ container, onFrame }) {
  let frameId = null;
  let running = false;
  let stopped = false;

  const tick = () => {
    if (!running) return;
    frameId = requestAnimationFrame(tick);
    onFrame();
  };

  const start = () => {
    if (stopped || running || document.visibilityState === 'hidden') return;
    running = true;
    tick();
  };

  const stop = () => {
    running = false;
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  };

  const handleVisibility = () => {
    if (document.visibilityState === 'hidden') stop();
    else start();
  };

  const observer = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0 }
  );

  if (container) observer.observe(container);
  document.addEventListener('visibilitychange', handleVisibility);
  start();

  return () => {
    stopped = true;
    stop();
    observer.disconnect();
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

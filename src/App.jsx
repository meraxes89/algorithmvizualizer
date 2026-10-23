import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { pageVariants } from './lib/motion';

import Navbar from './components/Navbar';
import BottomDock from './components/BottomDock';
import AccentColorManager from './components/AccentColorManager';
import CustomCursor from './components/CustomCursor';
import OnboardingTour from './components/OnboardingTour';
import ToastContainer from './components/Toast';
import EasterEgg from './components/EasterEgg';
import { subscribeToStepEvents } from './utils/soundEngine';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

// Lazy load pages for huge performance boost (Code Splitting)
const Home = lazy(() => import('./pages/Home'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const SortingPage = lazy(() => import('./pages/SortingPage'));
const SearchingPage = lazy(() => import('./pages/SearchingPage'));
const PathFindingPage = lazy(() => import('./pages/PathFindingPage'));
const GraphPage = lazy(() => import('./pages/GraphPage'));
const TreeAlgorithms = lazy(() => import('./pages/TreeAlgorithms'));
const RecursionAlgorithms = lazy(() => import('./pages/RecursionAlgorithms'));
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'));
const DPPage = lazy(() => import('./pages/DPPage'));
const ArenaPage = lazy(() => import('./pages/ArenaPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const DevGallery = lazy(() => import('./pages/DevGallery'));

import DioramaWrapper from './components/DioramaWrapper';

// Loading fallback for lazy pages (Loading States with Personality)
const PageLoader = () => (
  <div className="w-full min-h-screen flex flex-col items-center justify-center pt-24 gap-4">
    <div className="flex items-end gap-1.5 h-12">
      {[40, 70, 30, 90, 50].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: "10%" }}
          animate={{ height: `${height}%` }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          className="w-2.5 bg-accent rounded-t-sm shadow-[0_0_10px_var(--glow-primary)]"
        />
      ))}
    </div>
    <span className="text-xs font-bold text-ink-3 uppercase tracking-widest animate-pulse">Organizing Data...</span>
  </div>
);

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="w-full min-h-screen pt-24" // pt-24 accommodates the floating navbar
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* The key has to sit on AnimatePresence's direct child: it tracks
          children by key, so an unkeyed <Suspense> wrapper meant it never
          saw the route change and the exit variants never ran. The
          location prop on <Routes> keeps the frozen (exiting) copy
          rendering the page we are leaving. */}
      <Suspense key={location.pathname} fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/algorithms" element={<PageWrapper><CategoriesPage /></PageWrapper>} />
          <Route path="/sorting" element={<PageWrapper><SortingPage /></PageWrapper>} />
          <Route path="/searching" element={<PageWrapper><SearchingPage /></PageWrapper>} />
          <Route path="/pathfinding" element={<PageWrapper><PathFindingPage /></PageWrapper>} />
          <Route path="/graph" element={<PageWrapper><GraphPage /></PageWrapper>} />
          <Route path="/recursion" element={<PageWrapper><RecursionAlgorithms /></PageWrapper>} />
          <Route path="/trees" element={<PageWrapper><TreeAlgorithms /></PageWrapper>} />
          <Route path="/dp" element={<PageWrapper><DPPage /></PageWrapper>} />
          <Route path="/playground" element={<PageWrapper><PlaygroundPage /></PageWrapper>} />
          <Route path="/arena" element={<PageWrapper><ArenaPage /></PageWrapper>} />
          <Route path="/quiz" element={<PageWrapper><QuizPage /></PageWrapper>} />
          <Route path="/_dev" element={<PageWrapper><DevGallery /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ROUTE_WARMERS = [
  () => import('./pages/CategoriesPage'),
  () => import('./pages/SortingPage'),
  () => import('./pages/SearchingPage'),
  () => import('./pages/PathFindingPage'),
  () => import('./pages/GraphPage'),
  () => import('./pages/RecursionAlgorithms'),
  () => import('./pages/TreeAlgorithms'),
  () => import('./pages/DPPage'),
  () => import('./pages/PlaygroundPage'),
  () => import('./pages/ArenaPage'),
  () => import('./pages/QuizPage'),
];

const canWarmRoutes = () => {
  if (typeof navigator === 'undefined') return false;
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return false;
  return true;
};

const useRouteWarmup = () => {
  useEffect(() => {
    if (!canWarmRoutes()) return;

    const timers = [];
    const warm = () => {
      ROUTE_WARMERS.forEach((load, index) => {
        timers.push(setTimeout(() => load().catch(() => {}), index * 300));
      });
    };

    let idleId;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(warm, { timeout: 4000 });
    } else {
      timers.push(setTimeout(warm, 2500));
    }

    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      timers.forEach(clearTimeout);
    };
  }, []);
};

function App() {
  useRouteWarmup();

  // The sound engine is a subscriber: it listens to the step events the
  // playback engine publishes. No algorithm and no visualizer calls it.
  useEffect(() => subscribeToStepEvents(), []);

  return (
    <ThemeProvider>
      {/* Every framer-motion animation below — route transitions, the
          cursor springs, the toast slides, the dock — respects the
          user's reduced-motion preference from this one place. The CSS
          guard in index.css covers what CSS animates; this covers what
          framer drives through JavaScript. */}
      <MotionConfig reducedMotion="user">
        <Router>
          <AccentColorManager />
          <CustomCursor />
          <ScrollToTop />
          <div className="min-h-screen bg-paper text-ink selection:bg-accent-soft font-sans transition-colors duration-300 pb-20 overflow-hidden preserve-3d">
            <nav aria-label="Skip navigation">
              <a href="#main-content" className="skip-link">
                Skip to content
              </a>
            </nav>
            <Navbar />
            <div id="main-content" tabIndex={-1} className="outline-none">
              <DioramaWrapper>
                <ErrorBoundary>
                  <AnimatedRoutes />
                </ErrorBoundary>
              </DioramaWrapper>
            </div>
            <OnboardingTour />
            <ToastContainer />
            <EasterEgg />
            <BottomDock />
          </div>
        </Router>
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;

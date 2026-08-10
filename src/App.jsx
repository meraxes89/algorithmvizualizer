import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import BottomDock from './components/BottomDock';
import AccentColorManager from './components/AccentColorManager';

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

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

import DioramaWrapper from './components/DioramaWrapper';

// Loading fallback for lazy pages
const PageLoader = () => (
  <div className="w-full min-h-screen flex items-center justify-center pt-24">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="w-full min-h-screen pt-24 preserve-3d" // pt-24 accommodates the floating navbar
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
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
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AccentColorManager />
        <div className="min-h-screen bg-[#f7f4ee] dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 font-sans transition-colors duration-300 pb-20 overflow-hidden preserve-3d">
          <Navbar />
          <DioramaWrapper>
            <AnimatedRoutes />
          </DioramaWrapper>
          <BottomDock />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

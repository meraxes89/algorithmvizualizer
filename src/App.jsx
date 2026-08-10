import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import BottomDock from './components/BottomDock';
import AccentColorManager from './components/AccentColorManager';
import CustomCursor from './components/CustomCursor';
import OnboardingTour from './components/OnboardingTour';
import ToastContainer from './components/Toast';

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
          className="w-2.5 bg-indigo-500 rounded-t-sm shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        />
      ))}
    </div>
    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Organizing Data...</span>
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
        <CustomCursor />
        <div className="min-h-screen bg-[#f7f4ee] dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 font-sans transition-colors duration-300 pb-20 overflow-hidden preserve-3d">
          <Navbar />
          <DioramaWrapper>
            <AnimatedRoutes />
          </DioramaWrapper>
          <OnboardingTour />
          <ToastContainer />
          <BottomDock />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

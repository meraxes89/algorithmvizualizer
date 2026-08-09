import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import CategoriesPage from './pages/CategoriesPage';
import SortingPage from './pages/SortingPage';
import SearchingPage from './pages/SearchingPage';
import PathFindingPage from './pages/PathFindingPage';
import GraphPage from './pages/GraphPage';
import TreeAlgorithms from './pages/TreeAlgorithms';
import RecursionAlgorithms from './pages/RecursionAlgorithms';
import PlaygroundPage from './pages/PlaygroundPage';
import DPPage from './pages/DPPage';
import ArenaPage from './pages/ArenaPage';
import QuizPage from './pages/QuizPage';

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

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
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-[#f7f4ee] dark:bg-black text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 font-sans transition-colors duration-300">
          <Navbar />
          <AnimatedRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

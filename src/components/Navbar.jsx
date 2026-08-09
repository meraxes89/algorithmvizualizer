import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, Moon, Sun, Menu, X, Swords, Trophy } from 'lucide-react';
import GitLabIcon from './GitLabIcon';
import { useTheme } from '../context/ThemeContext';

import Logo from './Logo';

const SEARCH_ITEMS = [
  { name: 'Bubble Sort', path: '/sorting', category: 'Sorting' },
  { name: 'Selection Sort', path: '/sorting', category: 'Sorting' },
  { name: 'Insertion Sort', path: '/sorting', category: 'Sorting' },
  { name: 'Merge Sort', path: '/sorting', category: 'Sorting' },
  { name: 'Quick Sort', path: '/sorting', category: 'Sorting' },
  { name: 'Linear Search', path: '/searching', category: 'Searching' },
  { name: 'Binary Search', path: '/searching', category: 'Searching' },
  { name: "Dijkstra's Algorithm", path: '/pathfinding', category: 'Pathfinding' },
  { name: 'A* Search', path: '/pathfinding', category: 'Pathfinding' },
  { name: 'BFS (Breadth-First Search)', path: '/graph', category: 'Graph' },
  { name: 'DFS (Depth-First Search)', path: '/graph', category: 'Graph' },
  { name: 'Factorial', path: '/recursion', category: 'Recursion' },
  { name: 'Fibonacci', path: '/recursion', category: 'Recursion' },
  { name: 'Binary Search Tree', path: '/trees', category: 'Trees' },
  { name: '0/1 Knapsack', path: '/dp', category: 'Dynamic Programming' },
  { name: 'Longest Common Subsequence (LCS)', path: '/dp', category: 'Dynamic Programming' },
];

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Handle Cmd/Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = SEARCH_ITEMS.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectResult = (item) => {
    navigate(item.path);
    setSearchQuery('');
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
    searchInputRef.current?.blur();
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 transition-all duration-300">
      <nav className="pointer-events-auto w-full max-w-5xl border border-slate-200/50 dark:border-zinc-800/80 bg-white/70 dark:bg-black/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/10 rounded-2xl relative transition-colors duration-300">
        <div className="px-5 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
              <Logo showText={true} className="w-9 h-9" />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-slate-600 dark:text-slate-300 relative">
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors py-4"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                Algorithms <ChevronDown className="w-3.5 h-3.5 text-slate-400" />

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-[90%] left-0 w-64 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl rounded-xl py-2 z-50 transform origin-top-left transition-all">
                    <Link to="/algorithms" className="block px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Categories &rarr;
                    </Link>
                    <Link to="/sorting" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sorting Algorithms</Link>
                    <Link to="/searching" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Searching Algorithms</Link>
                    <Link to="/pathfinding" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pathfinding Algorithms</Link>
                    <Link to="/graph" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Graph Algorithms</Link>
                    <Link to="/recursion" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Recursion & Backtracking</Link>
                    <Link to="/trees" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Tree Algorithms</Link>
                    <Link to="/dp" className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-zinc-900/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dynamic Programming</Link>
                  </div>
                )}
              </div>

              <Link to="/algorithms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Categories</Link>
              <Link to="/arena" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                <Swords className="w-3.5 h-3.5 text-amber-500" />
                <span>Battle Arena</span>
              </Link>
              <Link to="/quiz" className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1.5 transition-colors">
                <Trophy className="w-3.5 h-3.5 text-purple-500" />
                <span>Quiz</span>
              </Link>
              <Link to="/playground" className="hover:text-slate-900 dark:hover:text-white transition-colors">Playground</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div ref={searchContainerRef} className="relative hidden lg:block">
              <div className={`flex items-center bg-white/50 dark:bg-zinc-900/60 border rounded-lg px-3 py-1.5 w-56 transition-all ${
                isSearchFocused ? 'ring-2 ring-indigo-500/20 border-indigo-400 bg-white dark:bg-zinc-900' : 'border-slate-200/80 dark:border-zinc-800/80'
              }`}>
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Quick search..."
                  className="bg-transparent text-[12px] font-medium outline-none w-full placeholder:text-slate-400/80 text-slate-900 dark:text-white"
                />
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded ml-2 shadow-sm whitespace-nowrap">
                  <span className="font-sans">⌘</span> K
                </div>
              </div>

              {/* Search Dropdown Results */}
              {isSearchFocused && (
                <div className="absolute top-[120%] left-0 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl rounded-xl py-2 z-50 max-h-80 overflow-y-auto">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectResult(item);
                        }}
                        className="px-4 py-2 hover:bg-slate-50/80 dark:hover:bg-zinc-900/80 cursor-pointer flex flex-col transition-colors border-b border-slate-100 dark:border-zinc-800/50 last:border-0"
                      >
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.category}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-[12px] font-medium text-slate-500 dark:text-slate-400 text-center">
                      No algorithms found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-zinc-900/60 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="https://gitlab.com/sireenyadav/algorithmvizualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
            >
              <GitLabIcon className="w-3.5 h-3.5 fill-current" />
              GitLab
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-zinc-900/60 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer (Floating) */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[110%] left-0 w-full border border-slate-200/50 dark:border-zinc-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-2xl shadow-2xl rounded-2xl px-6 py-4 space-y-2 z-50">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Navigation</div>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">Home</Link>
            <Link to="/algorithms" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">All Categories</Link>
            <Link to="/sorting" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-500/50">Sorting</Link>
            <Link to="/searching" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-500/50">Searching</Link>
            <Link to="/pathfinding" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-500/50">Pathfinding</Link>
            <Link to="/graph" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-500/50">Graphs</Link>
            <Link to="/recursion" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-500/50">Recursion</Link>
            <Link to="/trees" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-500/50">Trees</Link>
            <Link to="/playground" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">Playground</Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;

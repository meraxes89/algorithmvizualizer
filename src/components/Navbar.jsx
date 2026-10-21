import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, Moon, Sun, Menu, X, Swords, Trophy } from 'lucide-react';
import GitLabIcon from './GitLabIcon';
import { useTheme } from '../context/ThemeContext';
import CommandPalette from './CommandPalette';
import Logo from './Logo';
import SoundControls from './SoundControls';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 transition-all duration-300">
      <nav className="pointer-events-auto w-full max-w-5xl border border-line-subtle bg-paper-1/75 dark:bg-paper-0/75 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] rounded-2xl relative transition-all duration-300">
        <div className="px-5 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
              <Logo showText={true} className="w-9 h-9" />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-ink-2 relative">
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-ink transition-colors py-4"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                Algorithms <ChevronDown className="w-3.5 h-3.5 text-ink-3" />

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-[90%] left-0 w-64 bg-paper-1/95 dark:bg-paper-0/95 backdrop-blur-xl border border-line-subtle shadow-2xl rounded-xl py-2 z-50 transform origin-top-left transition-all">
                    <Link to="/algorithms" className="block px-4 py-2 text-xs font-bold text-ink-3 uppercase tracking-wider hover:text-accent transition-colors">
                      Categories &rarr;
                    </Link>
                    <Link to="/sorting" className="block px-4 py-2 text-ink-2 hover:bg-paper-0/60 dark:hover:bg-paper-2/50 hover:text-accent transition-colors">Sorting Algorithms</Link>
                    <Link to="/searching" className="block px-4 py-2 text-ink-2 hover:bg-paper-0/60 dark:hover:bg-paper-2/50 hover:text-accent transition-colors">Searching Algorithms</Link>
                    <Link to="/pathfinding" className="block px-4 py-2 text-ink-2 hover:bg-paper-0/60 dark:hover:bg-paper-2/50 hover:text-accent transition-colors">Pathfinding Algorithms</Link>
                    <Link to="/graph" className="block px-4 py-2 text-ink-2 hover:bg-paper-0/60 dark:hover:bg-paper-2/50 hover:text-accent transition-colors">Graph Algorithms</Link>
                    <Link to="/recursion" className="block px-4 py-2 text-ink-2 hover:bg-paper-0/60 dark:hover:bg-paper-2/50 hover:text-accent transition-colors">Recursion & Backtracking</Link>
                    <Link to="/trees" className="block px-4 py-2 text-ink-2 hover:bg-paper-0/60 dark:hover:bg-paper-2/50 hover:text-accent transition-colors">Tree Algorithms</Link>
                    <Link to="/dp" className="block px-4 py-2 text-ink-2 hover:bg-paper-0/60 dark:hover:bg-paper-2/50 hover:text-accent transition-colors">Dynamic Programming</Link>
                  </div>
                )}
              </div>

              <Link to="/algorithms" className="hover:text-ink transition-colors">Categories</Link>
              <Link id="tour-arena" to="/arena" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                <Swords className="w-3.5 h-3.5 text-amber-500" />
                <span>Battle Arena</span>
              </Link>
              <Link to="/quiz" className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1.5 transition-colors">
                <Trophy className="w-3.5 h-3.5 text-purple-500" />
                <span>Quiz</span>
              </Link>
              <Link to="/playground" className="hover:text-ink transition-colors">Playground</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Spotlight Search Trigger Button */}
            <button
              onClick={() => setIsCmdPaletteOpen(true)}
              className="hidden lg:flex items-center gap-3 bg-paper-1/80 dark:bg-paper-1/80 border border-line-subtle hover:border-accent text-ink-3 text-xs font-medium px-3 py-1.5 rounded-xl shadow-sm hover:shadow transition-all group"
            >
              <Search className="w-3.5 h-3.5 text-ink-3 group-hover:text-accent transition-colors" />
              <span>Search algorithms...</span>
              <kbd className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-ink-3 bg-paper-0/70 px-1.5 py-0.5 rounded border border-line-subtle ml-2">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </button>

            {/* Sound Toggle */}
            <div id="tour-sound" className="hidden sm:block scale-90 origin-right">
              <SoundControls />
            </div>

            {/* Theme Toggle Button */}
            <button
              id="tour-theme"
              onClick={(e) => toggleTheme(e)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 text-ink-3 hover:text-ink hover:bg-paper-2/70 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="https://gitlab.com/sireenyadav/algorithmvizualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-ink text-paper-0 hover:bg-accent text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-accent/20 transition-all"
            >
              <GitLabIcon className="w-3.5 h-3.5 fill-current" />
              GitLab
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden text-ink-2 hover:bg-paper-2/70 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer (Floating) */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[110%] left-0 w-full border border-line-subtle bg-paper-1/95 dark:bg-paper-0/95 backdrop-blur-xl shadow-2xl rounded-2xl px-6 py-4 space-y-2 z-50">
            <div className="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-2">Navigation</div>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-ink">Home</Link>
            <Link to="/algorithms" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-ink">All Categories</Link>
            <Link to="/sorting" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-ink-2 pl-3 border-l-2 border-accent/50">Sorting</Link>
            <Link to="/searching" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-ink-2 pl-3 border-l-2 border-accent/50">Searching</Link>
            <Link to="/pathfinding" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-ink-2 pl-3 border-l-2 border-accent/50">Pathfinding</Link>
            <Link to="/graph" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-ink-2 pl-3 border-l-2 border-accent/50">Graphs</Link>
            <Link to="/recursion" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-ink-2 pl-3 border-l-2 border-accent/50">Recursion</Link>
            <Link to="/trees" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-medium text-ink-2 pl-3 border-l-2 border-accent/50">Trees</Link>
            <Link to="/playground" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-ink">Playground</Link>
          </div>
        )}
      </nav>

      {/* Spotlight Command Palette Modal */}
      <CommandPalette isOpen={isCmdPaletteOpen} onClose={() => setIsCmdPaletteOpen(false)} />
    </div>
  );
};

export default Navbar;

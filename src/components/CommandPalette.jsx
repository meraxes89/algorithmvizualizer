import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Sparkles, Terminal, Swords, HelpCircle, List, Compass, Network, Share2, GitBranch } from 'lucide-react';

const SEARCH_ITEMS = [
  { title: 'Quick Sort', category: 'Sorting', path: '/sorting', icon: List },
  { title: 'Merge Sort', category: 'Sorting', path: '/sorting', icon: List },
  { title: 'Bubble Sort', category: 'Sorting', path: '/sorting', icon: List },
  { title: 'Insertion Sort', category: 'Sorting', path: '/sorting', icon: List },
  { title: 'Selection Sort', category: 'Sorting', path: '/sorting', icon: List },
  { title: 'Binary Search', category: 'Searching', path: '/searching', icon: Search },
  { title: 'Linear Search', category: 'Searching', path: '/searching', icon: Search },
  { title: "Dijkstra's Algorithm", category: 'Pathfinding', path: '/pathfinding', icon: Network },
  { title: 'A* Search', category: 'Pathfinding', path: '/pathfinding', icon: Network },
  { title: 'Breadth-First Search (BFS)', category: 'Graph', path: '/graph', icon: GitBranch },
  { title: 'Depth-First Search (DFS)', category: 'Graph', path: '/graph', icon: GitBranch },
  { title: 'Binary Search Tree (BST)', category: 'Trees', path: '/trees', icon: Share2 },
  { title: 'AVL Tree', category: 'Trees', path: '/trees', icon: Share2 },
  { title: 'Heap (Min/Max)', category: 'Trees', path: '/trees', icon: Share2 },
  { title: '0/1 Knapsack', category: 'Dynamic Programming', path: '/dp', icon: Sparkles },
  { title: 'Longest Common Subsequence', category: 'Dynamic Programming', path: '/dp', icon: Sparkles },
  { title: 'N-Queens Backtracking', category: 'Recursion', path: '/recursion', icon: Compass },
  { title: 'Tower of Hanoi', category: 'Recursion', path: '/recursion', icon: Compass },
  { title: 'Code Playground', category: 'Interactive Tool', path: '/playground', icon: Terminal },
  { title: 'Algorithm Arena', category: 'Gamification', path: '/arena', icon: Swords },
  { title: 'Knowledge Quiz', category: 'Gamification', path: '/quiz', icon: HelpCircle },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filteredItems = useMemo(() => SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-xl flex items-start justify-center pt-16 sm:pt-24 px-4 transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#faf7f2] dark:bg-zinc-950 border border-white/80 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200/80 dark:border-zinc-800/80">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type an algorithm or feature... (e.g. Quick Sort, Dijkstra)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder-stone-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-stone-400 bg-stone-200/60 dark:bg-zinc-800 rounded border border-stone-300/50 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-zinc-900">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-stone-500 dark:text-stone-400">
              No matching algorithms found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.title + item.category}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'hover:bg-stone-200/50 dark:hover:bg-zinc-900 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-stone-200/60 dark:bg-zinc-900 text-stone-600 dark:text-stone-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold tracking-tight">{item.title}</h4>
                      <span className={`text-[11px] font-medium ${
                        isSelected ? 'text-indigo-100' : 'text-stone-400 dark:text-stone-500'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  {isSelected && <ArrowRight className="w-4 h-4 shrink-0" />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-stone-100/60 dark:bg-zinc-900/60 border-t border-stone-200/60 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-zinc-800 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-zinc-800 rounded">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-zinc-800 rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>Spotlight Search</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

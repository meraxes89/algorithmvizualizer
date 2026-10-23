import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Sparkles } from 'lucide-react';
import { algorithmFamilies, algorithmHref, tools } from '../registry';
import { familyIcons, toolIcons } from './ui/registryIcons';

// Built from the registry: every algorithm on every page is one entry,
// and each one deep-links straight to itself.
const SEARCH_ITEMS = [
  ...algorithmFamilies.flatMap((family) =>
    family.algorithms.map((entry) => ({
      title: entry.name,
      category: family.shortName,
      path: algorithmHref(family.id, entry.id),
      icon: familyIcons[family.id],
    }))
  ),
  ...tools.map((tool) => ({
    title: tool.name,
    category: tool.category,
    path: tool.path,
    icon: toolIcons[tool.id] ?? Sparkles,
  })),
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const navigate = useNavigate();

  const filteredItems = useMemo(() => SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  ), [query]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      return () => clearTimeout(timer);
    }

    setQuery('');
    const previous = previousFocusRef.current;
    if (previous instanceof HTMLElement) previous.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.getElementById(`command-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        if (document.activeElement !== inputRef.current) return;
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
      role="presentation"
      className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-xl flex items-start justify-center pt-16 sm:pt-24 px-4 transition-all"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search algorithms"
        className="w-full max-w-xl bg-paper-1 dark:bg-zinc-950 border border-white/80 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200/80 dark:border-zinc-800/80">
          <Search className="w-5 h-5 text-stone-600 dark:text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-autocomplete="list"
            aria-activedescendant={filteredItems.length ? `command-item-${selectedIndex}` : undefined}
            aria-label="Search algorithms"
            placeholder="Type an algorithm or feature... (e.g. Quick Sort, Dijkstra)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder-stone-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-stone-600 dark:text-stone-300 bg-stone-200/60 dark:bg-zinc-800 rounded border border-stone-300/50 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          id="command-results"
          role="listbox"
          aria-label="Matching algorithms"
          tabIndex={0}
          className="flex-1 overflow-y-auto p-2 divide-y divide-stone-100 dark:divide-zinc-900"
        >
          {filteredItems.length === 0 ? (
            <div
              role="option"
              aria-selected="false"
              aria-disabled="true"
              className="py-12 text-center text-sm text-stone-600 dark:text-stone-400"
            >
              No matching algorithms found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.title + item.category}
                  id={`command-item-${index}`}
                  role="option"
                  aria-selected={isSelected}
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
                      <div className="text-sm font-semibold tracking-tight">{item.title}</div>
                      <span className={`text-[11px] font-medium ${
                        isSelected ? 'text-indigo-100' : 'text-stone-600 dark:text-stone-400'
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
        <div className="px-4 py-2.5 bg-stone-100/60 dark:bg-zinc-900/60 border-t border-stone-200/60 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400">
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

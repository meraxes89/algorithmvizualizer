import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trash2, ArrowLeft, Terminal, Keyboard, Cpu, CheckCircle2, AlertCircle, Settings, X, Globe, Server, Cloud, FileCode, Plus, Upload, Code, Folder, File, ChevronRight, ChevronDown, Trash, Edit2, FolderPlus, FilePlus, ChevronsLeft, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES, WANDBOX_COMPILERS, LANGUAGE_ICONS } from '../editor/languages';
import { runJSInBrowser, runPythonInBrowser, runOnWandbox, runOnCodeX, runOnPiston } from '../editor/executors';
import { registerCompletions } from '../editor/completions';


const PlaygroundPage = () => {
  const { isDark } = useTheme();
  const [selectedLang, setSelectedLang] = useState('cpp');
  
  // Virtual File System State
  const [fileSystem, setFileSystem] = useState([
    { path: LANGUAGES.cpp.fileName, content: LANGUAGES.cpp.template, type: 'file' }
  ]);
  const [activeFilePath, setActiveFilePath] = useState(LANGUAGES.cpp.fileName);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'input'
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runStats, setRunStats] = useState(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [executionEngine, setExecutionEngine] = useState(() => {
    return localStorage.getItem('playground-engine') || 'wandbox'; // 'wandbox' | 'codex' | 'piston'
  });
  const [pistonEndpoint, setPistonEndpoint] = useState(() => {
    return localStorage.getItem('playground-piston-endpoint') || 'http://localhost:2000/api/v2/execute';
  });
  const [pistonToken, setPistonToken] = useState(() => {
    return localStorage.getItem('playground-piston-token') || '';
  });
  const [jsExecutionMode, setJsExecutionMode] = useState(() => {
    return localStorage.getItem('playground-js-mode') || 'browser'; // 'browser' (default) or 'server'
  });

  // Pyodide runtime cache (loaded once, reused)
  const pyodideRef = useRef(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);

  // Monaco editor instance ref (for live option updates without remount)
  const editorRef = useRef(null);

  // VFS Helpers
  const activeCode = fileSystem.find(f => f.path === activeFilePath)?.content || '';
  
  const setCode = (newContent) => {
    setFileSystem(prev => prev.map(f => f.path === activeFilePath ? { ...f, content: newContent } : f));
  };

  const createItem = (type) => {
    const name = window.prompt(`Enter ${type} name (e.g., utils or utils/math.cpp):`);
    if (!name) return;
    
    // Simple validation
    if (fileSystem.some(f => f.path === name)) {
      alert('A file or folder with this path already exists.');
      return;
    }

    if (type === 'folder') {
      setFileSystem(prev => [...prev, { path: name, type: 'folder' }]);
    } else {
      setFileSystem(prev => [...prev, { path: name, content: '', type: 'file' }]);
      setActiveFilePath(name);
    }
  };

  const deleteItem = (path) => {
    if (path === LANGUAGES[selectedLang].fileName) {
      alert('Cannot delete the main entry file.');
      return;
    }
    if (window.confirm(`Delete ${path}? This will also delete all files inside if it's a folder.`)) {
      setFileSystem(prev => prev.filter(f => !f.path.startsWith(path)));
      if (activeFilePath.startsWith(path)) {
        setActiveFilePath(LANGUAGES[selectedLang].fileName);
      }
    }
  };

  // Sync templates on language change
  const handleLanguageChange = (langKey) => {
    if (window.confirm(`Switching to ${LANGUAGES[langKey].name} will reset the workspace. Continue?`)) {
      setSelectedLang(langKey);
      setFileSystem([
        { path: LANGUAGES[langKey].fileName, content: LANGUAGES[langKey].template, type: 'file' }
      ]);
      setActiveFilePath(LANGUAGES[langKey].fileName);
      setError('');
      setOutput('');
      setRunStats(null);
    }
  };

  // Reset template
  const handleReset = () => {
    if (window.confirm(`Are you sure you want to reset the workspace to default? All custom files will be lost.`)) {
      setFileSystem([
        { path: LANGUAGES[selectedLang].fileName, content: LANGUAGES[selectedLang].template, type: 'file' }
      ]);
      setActiveFilePath(LANGUAGES[selectedLang].fileName);
    }
  };

  // Clear console/input
  const handleClear = () => {
    setCustomInput('');
    setOutput('');
    setError('');
    setRunStats(null);
  };

  // Save Settings
  const saveSettings = () => {
    localStorage.setItem('playground-engine', executionEngine);
    localStorage.setItem('playground-piston-endpoint', pistonEndpoint);
    localStorage.setItem('playground-piston-token', pistonToken);
    localStorage.setItem('playground-js-mode', jsExecutionMode);
    setShowSettings(false);
  };

  // Reset Settings to Default
  const resetSettings = () => {
    setExecutionEngine('wandbox');
    setPistonEndpoint('http://localhost:2000/api/v2/execute');
    setPistonToken('');
    setJsExecutionMode('browser');
  };

  // Main runner router
  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');
    setRunStats(null);

    const ctx = {
      code: activeCode,
      langKey: selectedLang,
      fileSystem,
      activeFilePath,
      stdin: customInput,
      executionEngine,
      pistonEndpoint,
      pistonToken,
      jsExecutionMode,
      pyodideRef,
      setIsPyodideLoading,
      setOutput,
      setError,
      setRunStats,
    };

    // JavaScript: always run in browser by default (100% offline)
    if (selectedLang === 'javascript' && jsExecutionMode !== 'server') {
      setTimeout(() => {
        runJSInBrowser(ctx);
        setIsRunning(false);
      }, 50);
      return;
    }

    // Python: run via Pyodide (WASM) in the browser by default
    if (selectedLang === 'python') {
      await runPythonInBrowser(ctx);
      setIsRunning(false);
      return;
    }

    if (executionEngine === 'wandbox' || executionEngine === 'codex') {
      if (executionEngine === 'wandbox') {
        await runOnWandbox(ctx);
      } else {
        await runOnCodeX(ctx);
      }
    } else {
      await runOnPiston(ctx);
    }
    setIsRunning(false);
  };

  // Ctrl+Enter keyboard shortcut to run the program
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, handleRun]);

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col transition-colors duration-200">

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-[1600px] w-full mx-auto gap-4 pb-24">
        {/* Navigation & Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Link to="/algorithms" className="p-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm bg-white dark:bg-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Playground</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Write, run, and test your code in multiple languages</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg pl-4 pr-10 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {Object.keys(LANGUAGES).map((key) => (
                  <option key={key} value={key}>
                    {LANGUAGES[key].name} {WANDBOX_COMPILERS[key] ? `(${WANDBOX_COMPILERS[key]})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRun}
              disabled={isRunning}
              title="Run program (Ctrl+Enter)"
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all ml-2 ${
                isRunning
                  ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed opacity-80'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : 'fill-current'}`} />
              {isRunning ? 'Running...' : 'Run'}
              <kbd className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                isRunning
                  ? 'bg-indigo-300/30 border-indigo-300/40 text-indigo-100'
                  : 'bg-indigo-500/40 border-indigo-400/50 text-indigo-100'
              }`}>⌃↵</kbd>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors shadow-sm ml-1"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              Reset
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              Clear
            </button>

            {/* Settings (Subtle) */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm ml-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Layout - 3 Columns */}
        <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[600px]">
          
          {/* Left Column: Files Sidebar */}
          <div className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? 'w-52 min-w-[13rem]' : 'w-10 min-w-[2.5rem]'
          }`}>
            {isSidebarOpen ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">FILES</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button onClick={() => createItem('file')} className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="New File"><FilePlus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => createItem('folder')} className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="New Folder"><FolderPlus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Hide Files">
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-2 overflow-y-auto">
                  {[...fileSystem].sort((a, b) => a.path.localeCompare(b.path)).map((item) => {
                    const parts = item.path.split('/');
                    const depth = parts.length - 1;
                    const name = parts[parts.length - 1];
                    const isFolder = item.type === 'folder';
                    const isActive = item.path === activeFilePath;
                    const isMain = item.path === LANGUAGES[selectedLang].fileName;

                    return (
                      <div
                        key={item.path}
                        onClick={() => { if (!isFolder) setActiveFilePath(item.path); }}
                        className={`flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg border cursor-pointer transition-colors ${
                          isActive && !isFolder
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isFolder ? <Folder className="w-4 h-4 text-slate-400 shrink-0" /> : <FileCode className="w-4 h-4 shrink-0" />}
                          <span className="text-sm font-semibold truncate" title={item.path}>{name}</span>
                        </div>
                        <div className={`flex items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                          {!isMain && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteItem(item.path); }}
                              className="p-1 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {isActive && !isFolder && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 ml-2"></div>}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Collapsed sidebar — show only a toggle button */
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex flex-col items-center justify-start gap-2 w-full h-full pt-3 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                title="Show Files"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>FILES</span>
              </button>
            )}
          </div>

          {/* Middle Column: Editor */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between px-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {/* Active file tab */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 border-t-2 border-t-indigo-500 text-sm font-medium text-slate-700 dark:text-slate-200">
                {activeFilePath.split('/').pop()}
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 min-h-0 relative w-full overflow-hidden bg-white dark:bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={LANGUAGES[selectedLang].monacoLang}
                theme={isDark ? 'vs-dark' : 'light'}
                value={activeCode}
                onChange={(val) => setCode(val || '')}
                loading={
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1e1e1e]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-slate-500">Loading Editor...</span>
                    </div>
                  </div>
                }
                onMount={(editor, monaco) => {
                  // Store editor instance for live option updates
                  editorRef.current = editor;

                  // ── Ctrl+Enter → Run ──────────────────────────────────────
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                    () => { if (!isRunning) handleRun(); }
                  );

                  registerCompletions(monaco);
                }}
                options={{
                  fontSize: 14,
                  fontFamily: 'Fira Code, Menlo, Monaco, Consolas, Courier New, monospace',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  cursorBlinking: 'smooth',
                  formatOnPaste: true,
                  lineNumbersMinChars: 3,
                  // ── Autosuggest disabled ───────────────────────────
                  quickSuggestions: false,
                  suggestOnTriggerCharacters: false,
                  wordBasedSuggestions: 'off',
                  parameterHints: { enabled: false },
                  snippetSuggestions: 'none',
                  suggest: { showKeywords: false, showSnippets: false, showFunctions: false, preview: false },
                  inlineSuggest: { enabled: false },
                  acceptSuggestionOnEnter: 'off',
                  tabCompletion: 'off',
                  suggestSelection: 'recentlyUsedByPrefix',
                  formatOnType: false,                     // don't auto-reformat while typing
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  autoSurround: 'languageDefined',
                  matchBrackets: 'always',
                }}
              />
            </div>
            
            {/* Editor Status Bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <button title="Shortcuts"><Keyboard className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex items-center gap-4">
                <span>Ln {activeCode.split('\n').length}, Col {activeCode.length > 0 ? activeCode.length - activeCode.lastIndexOf('\n') : 1}</span>
                <span>Spaces: 4</span>
                <span>UTF-8</span>
                <span>{LANGUAGES[selectedLang].name} {WANDBOX_COMPILERS[selectedLang] ? `(${WANDBOX_COMPILERS[selectedLang]})` : ''}</span>
                <span className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                  {isRunning ? 'Running' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Input & Output Pane */}
          <div className="flex flex-col gap-4 w-[340px] min-w-[280px]">
            
            {/* Input Window */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1 min-h-[150px]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Custom Input (stdin)</span>
                {selectedLang === 'javascript' && jsExecutionMode === 'browser' && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded ml-auto">Not supported locally</span>
                )}
              </div>
              <textarea
                value={customInput}
                disabled={selectedLang === 'javascript' && jsExecutionMode === 'browser'}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={
                  selectedLang === 'javascript' && jsExecutionMode === 'browser'
                    ? "Local JavaScript execution runs immediately in browser memory and does not accept stdin streams."
                    : "Input for the program (optional)"
                }
                className="flex-1 w-full bg-transparent px-4 py-3 text-sm font-mono outline-none resize-none placeholder:text-slate-400/60 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 disabled:cursor-not-allowed"
              />
            </div>

            {/* Output Window */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-[1.5] min-h-[250px]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="font-mono font-bold text-slate-400">{'>_'}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Output</span>
                </div>
                <div className="flex items-center gap-2">
                  {runStats && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${runStats.success ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/30'}`}>
                      {runStats.success ? 'Success' : `Error (${runStats.stage})`}
                    </span>
                  )}
                  {runStats && runStats.timeMs !== undefined && (
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                      {runStats.timeMs}ms
                    </span>
                  )}
                  <button onClick={() => { setOutput(''); setError(''); }} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-2 transition-colors border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white dark:bg-slate-900 p-4 font-mono text-sm overflow-auto text-slate-700 dark:text-slate-300 select-text select-all">
                {isRunning && (
                  <div className="flex items-center gap-2 text-indigo-500 py-1">
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Executing...</span>
                  </div>
                )}

                {!isRunning && !output && !error && (
                  <span className="text-slate-400 italic">Program output will appear here...</span>
                )}

                {error && (
                  <div className="text-rose-500 font-medium whitespace-pre-wrap mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    {error}
                  </div>
                )}

                {output && (
                  <pre className="whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-200">{output}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                <Settings className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base">Playground Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5">
              {/* Execution Engine Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Compilation & Execution Engine
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setExecutionEngine('wandbox')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      executionEngine === 'wandbox'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Wandbox ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setExecutionEngine('codex')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      executionEngine === 'codex'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    CodeX
                  </button>
                  <button
                    type="button"
                    onClick={() => setExecutionEngine('piston')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      executionEngine === 'piston'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Piston
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  <strong className="text-slate-300">Wandbox</strong> (recommended) — free, no auth, supports all 5 languages + stdin.
                  <strong className="text-slate-300"> CodeX</strong> — fallback cloud. <strong className="text-slate-300">Piston</strong> — self-hosted Docker.
                </p>
              </div>

              {/* JS Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  JavaScript Execution Mode
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setJsExecutionMode('browser')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      jsExecutionMode === 'browser'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Local Browser (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJsExecutionMode('server')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                      jsExecutionMode === 'server'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Remote Engine
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Local browser runs immediately inside the browser memory. Remote engine executes on the selected compiler engine above.
                </p>
              </div>

              {/* Piston Settings (Only if piston engine is selected) */}
              {executionEngine === 'piston' && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-150">
                  {/* Endpoint URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Piston API Endpoint
                    </label>
                    <input
                      type="text"
                      value={pistonEndpoint}
                      onChange={(e) => setPistonEndpoint(e.target.value)}
                      placeholder="http://localhost:2000/api/v2/execute"
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Start your self-hosted server using Docker Compose to handle requests at this local address.
                    </p>
                  </div>

                  {/* API Token */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Authorization Token (Optional)
                    </label>
                    <input
                      type="password"
                      value={pistonToken}
                      onChange={(e) => setPistonToken(e.target.value)}
                      placeholder="Bearer or access token"
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={resetSettings}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
              >
                Reset to Default
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSettings}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaygroundPage;

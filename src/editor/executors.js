import { LANGUAGES, WANDBOX_COMPILERS } from './languages';

// Evaluate JavaScript browser-side
export function runJSInBrowser({ code: activeCode, setOutput, setError, setRunStats }) {
  const logs = [];
  const errors = [];

  // Backup original console methods
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  console.log = (...args) => {
    logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    originalLog.apply(console, args);
  };
  console.error = (...args) => {
    errors.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    originalError.apply(console, args);
  };
  console.warn = (...args) => {
    logs.push('[WARN] ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    originalWarn.apply(console, args);
  };
  console.info = (...args) => {
    logs.push('[INFO] ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
    originalInfo.apply(console, args);
  };

  const startTime = performance.now();
  try {
    // Execute the user's code using Function Constructor
    const runFn = new Function(activeCode);
    runFn();

    const endTime = performance.now();
    setOutput(logs.join('\n'));
    if (errors.length > 0) {
      setError(errors.join('\n'));
    }
    setRunStats({
      success: errors.length === 0,
      stage: 'Browser Execution',
      timeMs: Math.round(endTime - startTime),
      version: 'V8 (Local Browser)'
    });
  } catch (err) {
    setError(err.stack || err.message || 'Runtime Error');
    setRunStats({
      success: false,
      stage: 'Browser Execution Runtime',
      version: 'V8 (Local Browser)'
    });
  } finally {
    // Restore console methods
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;
  }
}

// Evaluate Python browser-side using Pyodide (WebAssembly) — 100% offline
export async function runPythonInBrowser({ code: activeCode, stdin: customInput, pyodideRef, setIsPyodideLoading, setOutput, setError, setRunStats }) {
  const startTime = performance.now();
  try {
    // Load Pyodide once and cache it in a ref
    if (!pyodideRef.current) {
      setIsPyodideLoading(true);

      // Dynamically inject Pyodide CDN script if not already loaded
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
      });
      pyodideRef.current = pyodide;
      setIsPyodideLoading(false);
      setOutput('Executing...');
    }

    // Show executing message before running user code
    setOutput('Executing...');

    const pyodide = pyodideRef.current;

    // Setup stdout/stderr capture and stdin simulation
    const setupCode = `
import sys, builtins
from io import StringIO
_stdout_buf = StringIO()
_stderr_buf = StringIO()
sys.stdout = _stdout_buf
sys.stderr = _stderr_buf
_input_lines = ${JSON.stringify(customInput ? customInput.split('\n') : [])}
_input_idx = [0]
def _mock_input(prompt=''):
    if prompt:
        _stdout_buf.write(prompt)
    if _input_idx[0] < len(_input_lines):
        line = _input_lines[_input_idx[0]]
        _input_idx[0] += 1
        return line
    raise EOFError('No more input')
builtins.input = _mock_input
`;
    await pyodide.runPythonAsync(setupCode);

    // Run the user's code
    try {
      await pyodide.runPythonAsync(activeCode);
    } catch (pyErr) {
      const stderr = await pyodide.runPythonAsync('_stderr_buf.getvalue()');
      setError(stderr || pyErr.message);
      setRunStats({ success: false, stage: 'Runtime Error', version: 'Pyodide (Browser)' });
      return;
    }

    const stdout = await pyodide.runPythonAsync('_stdout_buf.getvalue()');
    const stderr = await pyodide.runPythonAsync('_stderr_buf.getvalue()');
    const endTime = performance.now();

    setOutput(stdout);
    if (stderr) setError(stderr);
    setRunStats({
      success: !stderr,
      stage: 'Execution',
      timeMs: Math.round(endTime - startTime),
      version: 'Pyodide 0.25 (Browser)',
    });
  } catch (err) {
    setIsPyodideLoading(false);
    setError(`Failed to initialize Python runtime:\n${err.message}`);
    setRunStats({ success: false, stage: 'Runtime Load Error', version: 'Pyodide' });
  }
}

// Run code on Wandbox — primary free cloud engine (no auth, supports stdin)
export async function runOnWandbox(ctx) {
const {
  langKey: selectedLang,
  fileSystem,
  activeFilePath,
  stdin: customInput,
  setOutput,
  setError,
  setRunStats,
} = ctx;
  const compiler = WANDBOX_COMPILERS[selectedLang];
  if (!compiler) {
    setError('No Wandbox compiler found for this language.');
    return;
  }

  const secondaryCodes = [];
  let primaryCode = '';

  // Use the ACTIVE file as the entry point, not necessarily the language default file.
  // All other files are compiled alongside it as secondary units.
  fileSystem.forEach(f => {
    if (f.type !== 'file') return;
    if (f.path === activeFilePath) {
      primaryCode = f.content;
    } else {
      secondaryCodes.push({ file: f.path, code: f.content });
    }
  });

  // Special Wandbox wrapper for Java to support `public class Main` in Main.java
  if (selectedLang === 'java') {
    secondaryCodes.push({ file: LANGUAGES['java'].fileName, code: primaryCode });
    primaryCode = 'class prog { public static void main(String[] args) { try { Main.main(args); } catch (Exception e) { e.printStackTrace(); } } }';
  }

  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler,
        code: primaryCode,
        codes: secondaryCodes,
        stdin: customInput,
        'compiler-option-raw': '-w',  // suppress warnings so they don't block execution
        'runtime-option-raw': '',
        save: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Wandbox returned HTTP ${response.status}`);
    }

    const data = await response.json();

    const stdout = data.program_output || '';
    const stderr = data.program_error || '';
    const compileErr = data.compiler_error || '';
    const exitCode = data.status !== undefined ? parseInt(data.status, 10) : 0;

    // compileErr may contain GCC *warnings* even when compilation succeeded.
    // Only treat it as a fatal error if the program did NOT run (no stdout AND non-zero exit).
    const isCompilationFailure = compileErr && !stdout && exitCode !== 0;

    if (isCompilationFailure) {
      setError(compileErr);
      setRunStats({ success: false, stage: 'Compilation', version: 'Wandbox / gcc' });
      return;
    }

    setOutput(stdout);
    // Show compiler warnings + runtime errors together (non-fatal)
    const allErrors = [compileErr, stderr].filter(Boolean).join('\n');
    if (allErrors) setError(allErrors);
    setRunStats({
      success: exitCode === 0,
      stage: 'Execution',
      version: `Wandbox / ${compiler}`,
    });
  } catch (err) {
    // Wandbox failed — fall back to CodeX
    await runOnCodeX({ ...ctx, isFallback: true });
  }
}

// CodeX API — fallback cloud engine
export async function runOnCodeX(ctx) {
const {
  langKey: selectedLang,
  code: activeCode,
  stdin: customInput,
  isFallback = false,
  setOutput,
  setError,
  setRunStats,
} = ctx;
  const langConfig = LANGUAGES[selectedLang];
  const label = isFallback ? 'CodeX (fallback)' : 'CodeX Cloud';

  try {
    const response = await fetch('https://api.codex.jaagrav.in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: activeCode,
        language: langConfig.codexLang,
        input: customInput,
      }),
    });

    if (!response.ok) {
      throw new Error(`CodeX returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.output !== undefined || data.error !== undefined) {
      // CodeX v2-style response
      const out = data.output || '';
      const err = data.error || '';
      setOutput(out);
      if (err) setError(err);
      setRunStats({ success: !err, stage: 'Execution', version: label });
    } else if (data.success) {
      setOutput(data.data || '');
      if (data.error) setError(data.error);
      setRunStats({ success: !data.error, stage: 'Execution', version: label });
    } else {
      throw new Error(data.error || 'Execution returned no result');
    }
  } catch (err) {
    // Auto-fallback to browser for JS and Python
    if (selectedLang === 'javascript') {
      runJSInBrowser(ctx);
      return;
    }
    if (selectedLang === 'python') {
      await runPythonInBrowser(ctx);
      return;
    }
    setError(
      `All cloud engines are currently unavailable.\n\n` +
      `Tried: Wandbox → CodeX\n` +
      `Last error: ${err.message}`
    );
    setRunStats({ success: false, stage: 'Cloud Error', version: isFallback ? 'Wandbox+CodeX' : 'CodeX' });
  }
}

// Run code using custom self-hosted Piston server
export async function runOnPiston(ctx) {
const {
  langKey: selectedLang,
  fileSystem,
  stdin: customInput,
  pistonEndpoint,
  pistonToken,
  setOutput,
  setError,
  setRunStats,
} = ctx;
  const langConfig = LANGUAGES[selectedLang];

  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (pistonToken.trim()) {
      headers['Authorization'] = `Bearer ${pistonToken.trim()}`;
    }

    const response = await fetch(pistonEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        language: LANGUAGES[selectedLang].codexLang,
        version: '*',
        files: fileSystem.filter(f => f.type === 'file').map(f => ({
          name: f.path,
          content: f.content
        })),
        stdin: customInput
      })
    });

    if (response.status === 401) {
      setError(
        `Unauthorized (401):\n` +
        `The execution server at "${pistonEndpoint}" requires authentication.\n\n` +
        `Please provide a valid token in the settings panel.`
      );
      setRunStats({
        success: false,
        stage: 'Authentication Error',
        code: 401
      });
      return;
    }

    if (!response.ok) {
      throw new Error(`Execution server returned status code ${response.status}`);
    }

    const data = await response.json();

    // Check compile errors first
    if (data.compile && data.compile.code !== 0) {
      setError(data.compile.stderr || data.compile.output || 'Compilation failed');
      setRunStats({
        success: false,
        stage: 'Compilation',
        code: data.compile.code
      });
      return;
    }

    // Check run results
    const runResult = data.run;
    if (runResult) {
      if (runResult.stderr) {
        setError(runResult.stderr);
      }
      setOutput(runResult.stdout || '');
      setRunStats({
        success: runResult.code === 0,
        stage: 'Execution',
        code: runResult.code,
        signal: runResult.signal,
        version: data.version
      });
    } else {
      setError('No execution result returned from standard runner.');
    }
  } catch (err) {
    setError(
      `Connection Error:\n` +
      `Failed to reach code execution server at: "${pistonEndpoint}"\n\n` +
      `Details: ${err.message}`
    );
  }
}

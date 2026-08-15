import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';
import DOMPreview from './components/DOMPreview';
import { executeCode } from './utils/runnerWorker';

const DEFAULT_CODE = `// JS Studio - Online JavaScript IDE
// Press F5 or Ctrl+Enter to execute JavaScript
// Type '/' in the editor for quick snippets (/logarray, /maploop, /forloop, etc.)

console.log("🚀 Welcome to JS Studio!");

const numbers = [10, 20, 30, 40, 50];

// Log array elements one by one
numbers.forEach(num => console.log("Item:", num));
`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionMetrics, setExecutionMetrics] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('console');
  const [isCopied, setIsCopied] = useState(false);

  const editorRef = useRef(null);
  const activeWorkerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleRunCode = (codeToRun = code) => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    setExecutionMetrics(null);
    setActiveTab('console');

    // Terminate existing worker if running
    if (activeWorkerRef.current) {
      activeWorkerRef.current();
    }

    const cancelWorker = executeCode(
      codeToRun,
      (logEntry) => {
        if (logEntry.type === 'clear') {
          setLogs([]);
        } else {
          setLogs((prev) => [...prev, logEntry]);
        }
      },
      (finishMetrics) => {
        setIsRunning(false);
        setExecutionMetrics(finishMetrics);
      }
    );

    activeWorkerRef.current = cancelWorker;
  };

  // Global hotkey event listener for F5, Ctrl+Enter, Shift+Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F5 key
      if (e.key === 'F5') {
        e.preventDefault();
        handleRunCode();
      }
      // Ctrl+Enter or Cmd+Enter
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      // Shift+Enter
      else if (e.shiftKey && e.key === 'Enter') {
        // Prevent default if in global non-textarea context
        if (document.activeElement.tagName !== 'TEXTAREA' && !document.activeElement.classList.contains('inputarea')) {
          e.preventDefault();
          handleRunCode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, isRunning]);

  const handleClearCode = () => {
    setCode('// Start typing your JavaScript code here...\n\nconsole.log("Hello World!");\n');
  };

  const handleClearConsole = () => {
    setLogs([]);
    setExecutionMetrics(null);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <Header
        onRunCode={() => handleRunCode(code)}
        isRunning={isRunning}
        onClearCode={handleClearCode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onDownload={handleDownload}
        onCopyCode={handleCopyCode}
        isCopied={isCopied}
        onFormatCode={handleFormatCode}
      />

      <div className="app-body">
        <main className="workspace-area">
          <CodeEditor
            code={code}
            onChange={(newCode) => setCode(newCode || '')}
            onRunCode={() => handleRunCode(code)}
            theme={theme}
            editorRef={editorRef}
          />

          {activeTab === 'console' ? (
            <ConsoleOutput
              logs={logs}
              onClearConsole={handleClearConsole}
              executionMetrics={executionMetrics}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onEvaluateCommand={(cmd) => handleRunCode(cmd)}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <div className="tabs-bar">
                  <button
                    className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
                    onClick={() => setActiveTab('console')}
                  >
                    Terminal Output
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    DOM Preview
                  </button>
                </div>
              </div>
              <DOMPreview code={code} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

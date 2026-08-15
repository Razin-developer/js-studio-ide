import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';
import DOMPreview from './components/DOMPreview';
import { executeCode } from './utils/runnerWorker';

const STORAGE_KEY_CODE = 'js_studio_code';
const STORAGE_KEY_THEME = 'js_studio_theme';

export default function App() {
  const [code, setCode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CODE);
      return saved !== null ? saved : '';
    } catch (e) {
      return '';
    }
  });
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionMetrics, setExecutionMetrics] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      return savedTheme || 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  const [activeTab, setActiveTab] = useState('console');
  const [isCopied, setIsCopied] = useState(false);

  const editorRef = useRef(null);
  const activeWorkerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (e) {}
  }, [theme]);

  // Persist code to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CODE, code);
    } catch (e) {}
  }, [code]);

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
    setCode('');
    try {
      localStorage.removeItem(STORAGE_KEY_CODE);
    } catch (e) {}
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

import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';
import DOMPreview from './components/DOMPreview';
import { executeCode } from './utils/runnerWorker';

const DEFAULT_CODE = `// JS Studio - Online JavaScript IDE
// Write your JavaScript code below and press Ctrl+Enter or click "Run Code"

console.log("🚀 Hello from JavaScript!");

function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(15, 27);
console.log("Sum result:", result);
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

  const handleRunCode = () => {
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
      code,
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
        onRunCode={handleRunCode}
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
            onRunCode={handleRunCode}
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
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <div className="tabs-bar">
                  <button
                    className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
                    onClick={() => setActiveTab('console')}
                  >
                    Console Output
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

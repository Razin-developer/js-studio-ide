import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ConsoleOutput from './components/ConsoleOutput';
import DOMPreview from './components/DOMPreview';
import { executeCode } from './utils/runnerWorker';

const DEFAULT_CODE = `// JS Studio - Online JavaScript IDE
// Press F5 or Ctrl+Enter to execute JavaScript
// Type '/' in the editor for quick snippets (/maploop, /forloop, /sort, etc.)

console.log("🚀 Welcome to JS Studio Terminal!");

// 1. Array Loop using .map() with variable initialization
const numbers = [10, 20, 30, 40, 50];
const multiplier = 2; // Outer variable initialization

const mappedResult = numbers.map((item, index) => {
  // Inner variable initialization per iteration
  const calculatedValue = item * multiplier;
  const label = \`Item #\${index + 1}\`;
  return \`\${label}: \${calculatedValue}\`;
});

console.log("\\n--- 1. Array Loop using map() ---");
console.log("Original Array:", numbers);
console.log("Mapped Array:", mappedResult);

// 2. Array Loop using standard for loop with variable initialization
const fruits = ["Apple", "Banana", "Cherry", "Mango"];
let totalCharCount = 0; // Aggregator variable initialization

console.log("\\n--- 2. Array Loop using for loop ---");
for (let i = 0; i < fruits.length; i++) { // Loop counter variable init (let i = 0)
  // Variable initialization per iteration
  const fruit = fruits[i];
  const charCount = fruit.length;
  totalCharCount += charCount;
  console.log(\`Index \${i}: \${fruit} (\${charCount} letters)\`);
}

console.log("Total character count:", totalCharCount);

// 3. Array Loop using forEach() with console.log during & after iteration
const colors = ["Red", "Green", "Blue", "Yellow"];
let processedCount = 0; // Outer variable initialization

console.log("\\n--- 3. Array Loop using forEach() & console.log ---");
colors.forEach((color, index) => {
  // Inner variable initialization per iteration
  const formattedColor = \`[\${index + 1}] Color: \${color.toUpperCase()}\`;
  processedCount++;
  console.log(formattedColor);
});

// console.log output after loop completes
console.log("Finished logging total colors count after loop:", processedCount);

// 4. Array Initialization
const myArray = [10, 20, 30, 40, 50];
console.log("\n--- 4. Array Initialization ---");
console.log("Initialized Array:", myArray);
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

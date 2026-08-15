import React from 'react';
import { 
  Play, 
  RotateCcw, 
  Sun, 
  Moon, 
  Download, 
  Copy, 
  Check, 
  Code2,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  onRunCode, 
  isRunning, 
  onClearCode, 
  theme, 
  onToggleTheme, 
  onDownload, 
  onCopyCode,
  isCopied,
  onFormatCode
}) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Code2 size={20} />
        </div>
        
        <h1 className="brand-title">
          JS Studio <span className="badge-tag">React IDE</span>
        </h1>
      </div>

      <div className="header-actions">
        <button 
          className="btn btn-primary" 
          onClick={onRunCode}
          disabled={isRunning}
          title="Run Code (F5 or Ctrl+Enter)"
          style={{ paddingRight: '14px' }}
        >
          <Play size={15} fill="currentColor" />
          {isRunning ? "Running..." : "Run Code"}
          <span style={{ 
            fontSize: '0.68rem', 
            background: 'rgba(255,255,255,0.2)', 
            padding: '1px 5px', 
            borderRadius: '4px',
            marginLeft: '4px',
            fontWeight: '600'
          }}>
            F5
          </span>
        </button>

        <button 
          className="btn" 
          onClick={onFormatCode}
          title="Format JavaScript Code"
        >
          <Sparkles size={15} />
          Format
        </button>

        <button 
          className="btn" 
          onClick={onCopyCode}
          title="Copy Code to Clipboard"
        >
          {isCopied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
          {isCopied ? "Copied" : "Copy"}
        </button>

        <button 
          className="btn" 
          onClick={onDownload}
          title="Download script.js"
        >
          <Download size={15} />
          Export
        </button>

        <button 
          className="btn btn-icon" 
          onClick={onClearCode}
          title="Reset Code Editor"
        >
          <RotateCcw size={15} />
        </button>

        <button 
          className="btn btn-icon" 
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}

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
          title="Run Code (Ctrl+Enter)"
        >
          <Play size={16} fill="currentColor" />
          {isRunning ? "Running..." : "Run Code"}
        </button>

        <button 
          className="btn" 
          onClick={onFormatCode}
          title="Format JavaScript Code"
        >
          <Sparkles size={16} />
          Format
        </button>

        <button 
          className="btn" 
          onClick={onCopyCode}
          title="Copy Code to Clipboard"
        >
          {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          {isCopied ? "Copied" : "Copy"}
        </button>

        <button 
          className="btn" 
          onClick={onDownload}
          title="Download script.js"
        >
          <Download size={16} />
          Export
        </button>

        <button 
          className="btn btn-icon" 
          onClick={onClearCode}
          title="Reset Code Editor"
        >
          <RotateCcw size={16} />
        </button>

        <button 
          className="btn btn-icon" 
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

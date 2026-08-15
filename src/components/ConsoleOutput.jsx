import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Clock, Search, ChevronRight, CornerDownLeft } from 'lucide-react';

export default function ConsoleOutput({ 
  logs, 
  onClearConsole, 
  executionMetrics, 
  activeTab, 
  setActiveTab,
  onEvaluateCommand
}) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const logsEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false;
    if (searchQuery.trim() !== '') {
      return String(log.content).toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    // Add to history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Handle built-in CLI commands
    if (cmd === 'clear' || cmd === 'cls') {
      onClearConsole();
    } else if (cmd === 'help') {
      onEvaluateCommand(`
        console.info("--- JS Studio Terminal Commands ---");
        console.log("  help       : Display this help menu");
        console.log("  clear/cls  : Clear the terminal screen");
        console.log("  history    : View executed command history");
        console.log("  version    : Display JS Engine environment");
        console.log("  [JS Code]  : Execute any JS expression directly");
      `);
    } else if (cmd === 'history') {
      onEvaluateCommand(`
        console.info("Command History:");
        console.table(${JSON.stringify(commandHistory.concat(cmd))});
      `);
    } else if (cmd === 'version') {
      onEvaluateCommand(`
        console.info("JS Studio Terminal v1.0.0 (ECMAScript 2024 / WebWorker Engine)");
      `);
    } else {
      // Evaluate custom JS expression
      onEvaluateCommand(cmd);
    }

    setTerminalInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - nextIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - nextIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  return (
    <div className="output-section" style={{ background: '#0a0d14', color: '#00ff66', fontFamily: "'Fira Code', monospace" }}>
      {/* Terminal Header Bar */}
      <div className="panel-header" style={{ background: '#0f1420', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* macOS Terminal Window Control Dots */}
          <div style={{ display: 'flex', gap: '6px', marginRight: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }}></span>
          </div>

          <div className="tabs-bar">
            <button 
              className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
              onClick={() => setActiveTab('console')}
              style={{ fontFamily: "'Fira Code', monospace" }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} color="#00ff66" /> bash - js-studio@node:~
                {logs.length > 0 && (
                  <span className="badge-tag" style={{ borderRadius: '10px', padding: '1px 6px', background: 'rgba(0, 255, 102, 0.15)', color: '#00ff66', border: '1px solid rgba(0,255,102,0.3)' }}>
                    {logs.length}
                  </span>
                )}
              </span>
            </button>
            
            <button 
              className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              DOM Preview
            </button>
          </div>
        </div>

        <div className="panel-controls">
          {executionMetrics && (
            <span style={{ 
              fontSize: '0.75rem', 
              color: executionMetrics.success ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginRight: '8px',
              fontFamily: "'Fira Code', monospace"
            }}>
              <Clock size={13} /> {executionMetrics.duration} ms
            </span>
          )}

          <button 
            className="btn btn-icon" 
            onClick={onClearConsole}
            title="Clear Terminal Output"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {activeTab === 'console' && (
        <>
          {/* Subheader controls for searching and filtering logs */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: '#0d121d',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {['all', 'log', 'warn', 'error'].map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: filter === level ? '#6366f1' : 'transparent',
                    color: filter === level ? 'white' : '#9ca3af',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: filter === level ? '600' : 'normal',
                    fontFamily: "'Fira Code', monospace"
                  }}
                >
                  {level}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#080a10', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search size={12} color="#6b7280" />
              <input 
                type="text" 
                placeholder="grep logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#f3f4f6',
                  fontSize: '0.75rem',
                  outline: 'none',
                  width: '100px',
                  fontFamily: "'Fira Code', monospace"
                }}
              />
            </div>
          </div>

          {/* Terminal Output Log List */}
          <div className="console-logs-list" style={{ background: '#0a0d14', color: '#e5e7eb' }}>
            {filteredLogs.length === 0 ? (
              <div className="empty-state" style={{ color: '#4b5563' }}>
                <Terminal size={36} style={{ color: '#00ff66', opacity: 0.3 }} />
                <p style={{ color: '#9ca3af', fontFamily: "'Fira Code', monospace" }}>
                  JS Studio Terminal ready.
                </p>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Press <kbd style={{ background: '#1f293d', padding: '2px 6px', borderRadius: '4px', color: '#00ff66' }}>F5</kbd> or <kbd style={{ background: '#1f293d', padding: '2px 6px', borderRadius: '4px', color: '#00ff66' }}>Ctrl + Enter</kbd> to execute JavaScript.
                </span>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className={`log-entry ${log.type}`} style={{ fontFamily: "'Fira Code', monospace" }}>
                  <span className="log-timestamp" style={{ color: '#4b5563' }}>[{log.timestamp}]</span>
                  <span style={{ color: '#00ff66', fontWeight: 'bold' }}>➜</span>
                  <div className="log-content">{log.content}</div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Interactive Terminal Command Input Line */}
          <form 
            onSubmit={handleCommandSubmit}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px', 
              background: '#0a0d14', 
              borderTop: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.82rem'
            }}
          >
            <span style={{ color: '#00ff66', fontWeight: 'bold', userSelect: 'none' }}>
              js-studio@node:~$
            </span>

            <input
              ref={inputRef}
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type expression or command (e.g. 2 + 2, help, clear)..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: '#00ff66',
                fontFamily: "'Fira Code', monospace",
                fontSize: '0.82rem',
                outline: 'none',
                caretColor: '#00ff66'
              }}
            />

            <button 
              type="submit" 
              className="btn btn-icon" 
              style={{ color: '#00ff66', padding: '4px' }}
              title="Run Terminal Command (Enter)"
            >
              <CornerDownLeft size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Terminal, Trash2, Clock, AlertCircle, AlertTriangle, Info, CheckCircle2, Search } from 'lucide-react';

export default function ConsoleOutput({ logs, onClearConsole, executionMetrics, activeTab, setActiveTab }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false;
    if (searchQuery.trim() !== '') {
      return String(log.content).toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle size={14} className="json-value-error" />;
      case 'warn': return <AlertTriangle size={14} style={{ color: 'var(--status-warning)' }} />;
      case 'info': return <Info size={14} style={{ color: 'var(--status-info)' }} />;
      default: return <Terminal size={14} style={{ color: 'var(--accent-primary)' }} />;
    }
  };

  return (
    <div className="output-section">
      <div className="panel-header">
        <div className="tabs-bar">
          <button 
            className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
            onClick={() => setActiveTab('console')}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} /> Console Output
              {logs.length > 0 && (
                <span className="badge-tag" style={{ borderRadius: '10px', padding: '1px 6px' }}>
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

        <div className="panel-controls">
          {executionMetrics && (
            <span style={{ 
              fontSize: '0.75rem', 
              color: executionMetrics.success ? 'var(--status-success)' : 'var(--status-error)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginRight: '8px'
            }}>
              <Clock size={13} /> {executionMetrics.duration} ms
            </span>
          )}

          <button 
            className="btn btn-icon" 
            onClick={onClearConsole}
            title="Clear Console Output"
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
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.78rem'
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
                    background: filter === level ? 'var(--accent-primary)' : 'transparent',
                    color: filter === level ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: filter === level ? '600' : 'normal'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-panel)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              <Search size={12} color="var(--text-dim)" />
              <input 
                type="text" 
                placeholder="Filter logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  outline: 'none',
                  width: '100px'
                }}
              />
            </div>
          </div>

          <div className="console-logs-list">
            {filteredLogs.length === 0 ? (
              <div className="empty-state">
                <Terminal size={32} className="empty-state-icon" />
                <p>No console logs yet.</p>
                <span style={{ fontSize: '0.78rem' }}>Click "Run Code" or press Ctrl+Enter to execute JavaScript.</span>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className={`log-entry ${log.type}`}>
                  <span className="log-timestamp">{log.timestamp}</span>
                  <div style={{ marginTop: '2px' }}>{getLogIcon(log.type)}</div>
                  <div className="log-content">{log.content}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

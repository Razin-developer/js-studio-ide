import React from 'react';
import { Eye } from 'lucide-react';

export default function DOMPreview({ code }) {
  // Generate HTML iframe source with modern styling wrapper
  const iframeSrc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #0d1322;
            color: #f3f4f6;
            margin: 16px;
            padding: 0;
          }
          canvas {
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            background: #000;
          }
        </style>
      </head>
      <body>
        <div id="app"></div>
        <script>
          try {
            ${code}
          } catch(err) {
            document.body.innerHTML += '<div style="color:#ef4444; padding:12px; border:1px solid #ef4444; border-radius:6px; background:rgba(239,68,68,0.1)">Runtime Error: ' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)' }}>
      <iframe
        title="DOM Preview"
        srcDoc={iframeSrc}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'var(--bg-panel)'
        }}
      />
    </div>
  );
}

/**
 * Executes user JavaScript code in a sandboxed Web Worker environment
 * @param {string} code 
 * @param {function} onLog Callback for log messages
 * @param {function} onFinish Callback when execution finishes
 */
export function executeCode(code, onLog, onFinish) {
  const startTime = performance.now();
  
  // Worker script blob string
  const workerCode = `
    const formatValue = (val) => {
      if (val === undefined) return 'undefined';
      if (val === null) return 'null';
      if (typeof val === 'function') return val.toString();
      if (typeof val === 'symbol') return val.toString();
      if (typeof val === 'object') {
        try {
          return JSON.stringify(val, null, 2);
        } catch (e) {
          return String(val);
        }
      }
      return val;
    };

    const sendLog = (type, args) => {
      const formattedArgs = Array.from(args).map(arg => formatValue(arg));
      self.postMessage({ type: 'log', logType: type, content: formattedArgs.join(' ') });
    };

    // Override console methods inside worker
    self.console = {
      log: (...args) => sendLog('log', args),
      warn: (...args) => sendLog('warn', args),
      error: (...args) => sendLog('error', args),
      info: (...args) => sendLog('info', args),
      table: (...args) => sendLog('table', args),
      clear: () => self.postMessage({ type: 'clear' })
    };

    self.onmessage = async function(e) {
      const userCode = e.data.code;
      try {
        // Execute code using AsyncFunction constructor to support top-level await cleanly
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const asyncFn = new AsyncFunction(userCode);

        const result = await asyncFn();
        if (result !== undefined) {
          sendLog('log', ['=> ' + formatValue(result)]);
        }
        self.postMessage({ type: 'success' });
      } catch (err) {
        self.postMessage({ 
          type: 'error', 
          message: err.name + ': ' + err.message,
          stack: err.stack 
        });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl);

  let finished = false;

  const cleanup = () => {
    if (!finished) {
      finished = true;
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    }
  };

  // Timeout protection (5s)
  const timeoutId = setTimeout(() => {
    if (!finished) {
      cleanup();
      onLog({
        id: Date.now(),
        type: 'error',
        timestamp: new Date().toLocaleTimeString(),
        content: '⚠️ Execution Timeout Error: Code execution exceeded 5000ms limit (possible infinite loop).'
      });
      onFinish({ success: false, duration: (performance.now() - startTime).toFixed(2) });
    }
  }, 5000);

  worker.onmessage = function(e) {
    const { type, logType, content, message } = e.data;

    if (type === 'log') {
      onLog({
        id: Date.now() + Math.random(),
        type: logType || 'log',
        timestamp: new Date().toLocaleTimeString(),
        content
      });
    } else if (type === 'clear') {
      onLog({ type: 'clear' });
    } else if (type === 'error') {
      if (!finished) {
        cleanup();
        onLog({
          id: Date.now() + Math.random(),
          type: 'error',
          timestamp: new Date().toLocaleTimeString(),
          content: message
        });
        const duration = (performance.now() - startTime).toFixed(2);
        onFinish({ success: false, duration });
      }
    } else if (type === 'success') {
      if (!finished) {
        cleanup();
        const duration = (performance.now() - startTime).toFixed(2);
        onFinish({ success: true, duration });
      }
    }
  };

  worker.onerror = function(err) {
    if (!finished) {
      cleanup();
      onLog({
        id: Date.now(),
        type: 'error',
        timestamp: new Date().toLocaleTimeString(),
        content: `Uncaught Error: ${err.message}`
      });
      onFinish({ success: false, duration: (performance.now() - startTime).toFixed(2) });
    }
  };

  // Start execution
  worker.postMessage({ code });

  return () => {
    cleanup();
  };
}

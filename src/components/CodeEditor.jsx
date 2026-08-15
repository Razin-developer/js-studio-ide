import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

const SLASH_TEMPLATES = [
  {
    label: '/arrayinit',
    detail: 'Initialize an Array',
    documentation: 'Creates an array initialization statement.',
    insertText: `const \${1:arr} = [\${2:10, 20, 30, 40, 50}];`
  },
  {
    label: '/logarray',
    detail: 'Log Array Elements One by One',
    documentation: 'Logs each element of an array sequentially.',
    insertText: `\${1:arr}.forEach(\${2:item} => console.log(\${2:item}));`
  },
  {
    label: '/maploop',
    detail: 'Array map() Loop',
    documentation: 'Transforms array elements using map().',
    insertText: `const \${1:result} = \${2:arr}.map(\${3:item} => \${4:item * 2});`
  },
  {
    label: '/forloop',
    detail: 'Standard for Loop',
    documentation: 'Standard indexed for loop over array.',
    insertText: `for (let \${1:i} = 0; \${1:i} < \${2:arr}.length; \${1:i}++) {
  console.log(\${2:arr}[\${1:i}]);
}`
  },
  {
    label: '/foreach',
    detail: 'Array forEach() Loop',
    documentation: 'Iterates array elements using forEach().',
    insertText: `\${1:arr}.forEach(\${2:item} => {
  console.log(\${2:item});
});`
  },
  {
    label: '/forof',
    detail: 'for...of Loop',
    documentation: 'Iterates iterable elements using for...of.',
    insertText: `for (const \${1:item} of \${2:arr}) {
  console.log(\${1:item});
}`
  },
  {
    label: '/clog',
    detail: 'console.log Statement',
    documentation: 'Outputs values to console.',
    insertText: `console.log(\${1:item});`
  },
  {
    label: '/push',
    detail: 'Array push Operation',
    documentation: 'Appends elements to an array.',
    insertText: `\${1:arr}.push(\${2:item});`
  },
  {
    label: '/nestedloop',
    detail: 'Nested Double Loop',
    documentation: '2D matrix loop over rows and columns.',
    insertText: `for (let \${1:i} = 0; \${1:i} < \${2:rows}; \${1:i}++) {
  for (let \${3:j} = 0; \${3:j} < \${4:cols}; \${3:j}++) {
    console.log(\${1:i}, \${3:j});
  }
}`
  },
  {
    label: '/sort',
    detail: 'Sort Array Ascending',
    documentation: 'Sorts numbers in ascending order.',
    insertText: `\${1:arr}.sort((a, b) => a - b);`
  },
  {
    label: '/maxmin',
    detail: 'Get Max and Min Values',
    documentation: 'Extracts max and min values from array.',
    insertText: `const max = Math.max(...\${1:arr});
const min = Math.min(...\${1:arr});`
  },
  {
    label: '/mergearray',
    detail: 'Merge Arrays',
    documentation: 'Combines two arrays using spread operator.',
    insertText: `const \${1:merged} = [...\${2:arr1}, ...\${3:arr2}];`
  },
  {
    label: '/unique',
    detail: 'Remove Array Duplicates',
    documentation: 'Returns unique elements using Set.',
    insertText: `const \${1:unique} = [...new Set(\${2:arr})];`
  },
  {
    label: '/pattern',
    detail: 'Star Pattern Loop',
    documentation: 'Prints right triangle star pattern.',
    insertText: `for (let \${1:i} = 1; \${1:i} <= \${2:rows}; \${1:i}++) {
  console.log("* ".repeat(\${1:i}));
}`
  },
  {
    label: '/matrix',
    detail: 'Create 2D Matrix',
    documentation: 'Initializes a 2D matrix array with default values.',
    insertText: `const \${1:matrix} = Array.from({ length: \${2:rows} }, () => Array(\${3:cols}).fill(\${4:0}));`
  },
  {
    label: '/evenodd',
    detail: 'Even or Odd Check',
    documentation: 'Function to test if a number is even.',
    insertText: `const isEven = (\${1:num}) => \${1:num} % 2 === 0;`
  },
  {
    label: '/prime',
    detail: 'Prime Check Function',
    documentation: 'Function to test if a number is prime.',
    insertText: `const isPrime = n => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every(i => n % i !== 0);`
  },
  {
    label: '/arrayadd',
    detail: 'Sum Array Elements',
    documentation: 'Calculates total sum of array elements using reduce.',
    insertText: `const \${1:sum} = \${2:arr}.reduce((a, b) => a + b, 0);`
  },
  {
    label: '/reverse',
    detail: 'Reverse Array',
    documentation: 'Reverses an array in-place.',
    insertText: `\${1:arr}.reverse();`
  },
  {
    label: '/palindrome',
    detail: 'Palindrome Check',
    documentation: 'Function to check if string or number is palindrome.',
    insertText: `const isPalindrome = str => String(str) === String(str).split('').reverse().join('');`
  },
  {
    label: '/frequency',
    detail: 'Element Frequency Map',
    documentation: 'Counts frequencies of items in an array.',
    insertText: `const \${1:freq} = \${2:arr}.reduce((acc, item) => (acc[item] = (acc[item] || 0) + 1, acc), {});`
  },
  {
    label: '/binarysearch',
    detail: 'Binary Search Algorithm',
    documentation: 'Fast binary search on sorted array.',
    insertText: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = (low + high) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`
  },
  {
    label: '/twopointer',
    detail: 'Two Pointer Template',
    documentation: 'Two-pointer array traversal template.',
    insertText: `let left = 0, right = \${1:arr}.length - 1;
while (left < right) {
  left++; right--;
}`
  }
];

export default function CodeEditor({ code, onChange, onRunCode, theme, editorRef }) {
  const providerRef = useRef(null);
  const [errorCount, setErrorCount] = useState(0);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Enable real-time JavaScript syntax & error validation (on-the-fly linter)
    if (monaco?.languages?.typescript?.javascriptDefaults) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: []
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget?.ESNext || 99,
        allowNonTsExtensions: true,
        checkJs: true,
        allowJs: true
      });
    }

    // Real-time error marker listener
    const updateMarkers = () => {
      const model = editor.getModel();
      if (!model) return;
      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      const errors = markers.filter((m) => m.severity === monaco.MarkerSeverity.Error);
      setErrorCount(errors.length);
    };

    updateMarkers();
    const markerListener = monaco.editor.onDidChangeMarkers(updateMarkers);

    // Add Ctrl+Enter shortcut to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunCode();
    });

    // Register '/' Slash Command Completion Provider if not already registered
    if (!providerRef.current) {
      providerRef.current = monaco.languages.registerCompletionItemProvider('javascript', {
        triggerCharacters: ['/'],
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          const match = textUntilPosition.match(/\/([a-zA-Z]*)$/);
          if (!match) return { suggestions: [] };

          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - match[0].length,
            endColumn: position.column
          };

          const suggestions = SLASH_TEMPLATES.map((item) => ({
            label: item.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: item.documentation,
            detail: item.detail,
            insertText: item.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range
          }));

          return { suggestions };
        }
      });
    }

    return () => {
      markerListener.dispose();
    };
  };

  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.dispose();
        providerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="editor-section" style={{ height: '100%', width: '100%' }}>
      <div className="panel-header">
        <span className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>index.js</span>
          {errorCount > 0 ? (
            <span style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#ef4444', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.72rem', 
              fontWeight: '600',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              ❌ {errorCount} Syntax Error{errorCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.72rem', 
              fontWeight: '600',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              ✓ Syntax Clean
            </span>
          )}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Run: <kbd style={{ background: 'var(--bg-surface-hover)', padding: '2px 4px', borderRadius: '4px' }}>Ctrl + Enter</kbd>
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 12, bottom: 12 },
            quickSuggestions: { other: true, comments: true, strings: true },
            suggestOnTriggerCharacters: true
          }}
        />
      </div>
    </div>
  );
}

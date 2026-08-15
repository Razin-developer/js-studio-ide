import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const SLASH_TEMPLATES = [
  {
    label: '/maploop',
    detail: 'Loop Array using map() with Variable Init',
    documentation: 'Iterates and transforms an array using Array.prototype.map() with local variable initialization.',
    insertText: `// Loop through an array using map() with variable initialization
const \${1:numbers} = [10, 20, 30, 40, 50];

// Initialization of multiplier variable
const \${2:multiplier} = 2;

const \${3:mappedResult} = \${1:numbers}.map((\${4:item}, \${5:index}) => {
  // Variable initialization per iteration
  const \${6:calculatedValue} = \${4:item} * \${2:multiplier};
  const \${7:label} = \`Item #\${\${5:index} + 1}\`;
  return \`\${\${7:label}}: \${\${6:calculatedValue}}\`;
});

console.log("Original Array:", \${1:numbers});
console.log("Mapped Array:", \${3:mappedResult});`
  },
  {
    label: '/forloop',
    detail: 'Loop Array using for Loop with Variable Init',
    documentation: 'Iterates through an array using a standard for loop with index variable initialization.',
    insertText: `// Loop through an array using for loop with variable initialization
const \${1:fruits} = ["Apple", "Banana", "Cherry", "Mango"];

// Variable initialization for tracking / aggregation
let \${2:totalLength} = 0;

for (let \${3:i} = 0; \${3:i} < \${1:fruits}.length; \${3:i}++) {
  // Variable initialization inside loop body
  let \${4:fruit} = \${1:fruits}[\${3:i}];
  let \${5:charCount} = \${4:fruit}.length;
  \${2:totalLength} += \${5:charCount};
  
  console.log(\`Index \${\${3:i}}: \${\${4:fruit}} (\${\${5:charCount}} letters)\`);
}

console.log("Total character count:", \${2:totalLength});`
  },
  {
    label: '/foreach',
    detail: 'Loop Array using forEach() with console.log',
    documentation: 'Iterates through an array using forEach() with variable initialization and console.log output after.',
    insertText: `// Loop through array using forEach() and console.log
const \${1:colors} = ["Red", "Green", "Blue", "Yellow"];
let \${2:count} = 0; // Outer variable initialization

\${1:colors}.forEach((\${3:color}, \${4:index}) => {
  // Inner variable initialization
  const \${5:formatted} = \`[\${\${4:index} + 1}] Color: \${\${3:color}.toUpperCase()}\`;
  \${2:count}++;
  console.log(\${5:formatted});
});

// console.log output after loop completes
console.log("Finished processing \${2:count} colors!");`
  },
  {
    label: '/forof',
    detail: 'Loop Array using for...of with console.log',
    documentation: 'Iterates through array items using for...of with variable init and console.log output.',
    insertText: `// Loop through array using for...of loop with console.log
const \${1:scores} = [85, 92, 78, 95, 88];
let \${2:highestScore} = 0; // Variable init before loop

for (const \${3:score} of \${1:scores}) {
  // Variable init inside loop
  const \${4:isPassed} = \${3:score} >= 80;
  if (\${3:score} > \${2:highestScore}) {
    \${2:highestScore} = \${3:score};
  }
  console.log(\`Score: \${\${3:score}} | Status: \${\${4:isPassed} ? "PASSED" : "FAILED"}\`);
}

// console.log output after loop completes
console.log("Highest Score Achieved:", \${2:highestScore});`
  },
  {
    label: '/clog',
    detail: 'console.log() Statement',
    documentation: 'Inserts a console.log statement to log values.',
    insertText: `console.log("\${1:Output:}", \${2:value});`
  },
  {
    label: '/push',
    detail: 'Array push() Loop Operation',
    documentation: 'Pushes dynamic elements into an array during loop iteration and logs results.',
    insertText: `// Loop and push elements into a new array
const \${1:sourceArray} = [1, 2, 3, 4, 5];
const \${2:pushedArray} = [];

for (let \${3:i} = 0; \${3:i} < \${1:sourceArray}.length; \${3:i}++) {
  // Variable initialization per element
  let \${4:newItem} = \${1:sourceArray}[\${3:i}] * 10;
  
  // Push item to target array
  \${2:pushedArray}.push(\${4:newItem});
  console.log(\`Pushed element: \${\${4:newItem}}\`);
}

console.log("Final Pushed Array:", \${2:pushedArray});`
  },
  {
    label: '/nestedloop',
    detail: '2D / Double Loop with Dynamic Sync',
    documentation: 'Generates nested loops with synchronized variable tabstops (i, j).',
    insertText: `// Nested double loop with dynamic variable scope
const \${1:rows} = 3;
const \${2:cols} = 4;

for (let \${3:i} = 0; \${3:i} < \${1:rows}; \${3:i}++) {
  for (let \${4:j} = 0; \${4:j} < \${2:cols}; \${4:j}++) {
    console.log(\`Cell [\${\${3:i}}][\${\${4:j}}]\`);
  }
}`
  },
  {
    label: '/sort',
    detail: 'Bubble Sort Algorithm',
    documentation: 'Sorts an array in ascending order using Bubble Sort with element swapping.',
    insertText: `// Bubble Sort Algorithm (Ascending order)
function bubbleSort(\${1:arr}) {
  const n = \${1:arr}.length;
  for (let \${2:i} = 0; \${2:i} < n - 1; \${2:i}++) {
    for (let \${3:j} = 0; \${3:j} < n - \${2:i} - 1; \${3:j}++) {
      if (\${1:arr}[\${3:j}] > \${1:arr}[\${3:j} + 1]) {
        // Swap elements
        let temp = \${1:arr}[\${3:j}];
        \${1:arr}[\${3:j}] = \${1:arr}[\${3:j} + 1];
        \${1:arr}[\${3:j} + 1] = temp;
      }
    }
  }
  return \${1:arr};
}

const \${4:numbers} = [64, 34, 25, 12, 22, 11, 90];
console.log("Original Array:", \${4:numbers});
console.log("Sorted Array:", bubbleSort([...\${4:numbers}]));`
  },
  {
    label: '/maxmin',
    detail: 'Find Bigger (Max) & Smaller (Min) Number',
    documentation: 'Finds the largest and smallest numbers in an array.',
    insertText: `// Find Maximum (Bigger) and Minimum (Smaller) numbers in an array
function findMaxMin(\${1:numbers}) {
  if (\${1:numbers}.length === 0) return null;
  
  let \${2:maxVal} = \${1:numbers}[0];
  let \${3:minVal} = \${1:numbers}[0];

  for (let \${4:i} = 1; \${4:i} < \${1:numbers}.length; \${4:i}++) {
    if (\${1:numbers}[\${4:i}] > \${2:maxVal}) {
      \${2:maxVal} = \${1:numbers}[\${4:i}];
    }
    if (\${1:numbers}[\${4:i}] < \${3:minVal}) {
      \${3:minVal} = \${1:numbers}[\${4:i}];
    }
  }

  return { max: \${2:maxVal}, min: \${3:minVal} };
}

const \${5:sampleData} = [45, 12, 89, 3, 99, 27, -5, 64];
const { max, min } = findMaxMin(\${5:sampleData});
console.log("Array:", \${5:sampleData});
console.log(\`Bigger (Max) Number: \${max}\`);
console.log(\`Smaller (Min) Number: \${min}\`);`
  },
  {
    label: '/mergearray',
    detail: 'Merge Arrays & Sort',
    documentation: 'Merges multiple arrays and returns a sorted combined result.',
    insertText: `// Merging two arrays and sorting the result
const \${1:array1} = [1, 3, 5, 7];
const \${2:array2} = [2, 4, 6, 8, 10];

// Merge using Spread Operator
const \${3:mergedArray} = [...\${1:array1}, ...\${2:array2}].sort((a, b) => a - b);

console.log("Array 1:", \${1:array1});
console.log("Array 2:", \${2:array2});
console.log("Merged & Sorted Array:", \${3:mergedArray});`
  },
  {
    label: '/unique',
    detail: 'Unique Elements / Remove Duplicates',
    documentation: 'Extracts unique items from an array using Set & filter.',
    insertText: `// Find unique elements and remove duplicates from array
function getUniqueElements(\${1:arr}) {
  // Method 1: Using Set
  const \${2:uniqueSet} = [...new Set(\${1:arr})];

  // Method 2: Manual filtering
  const \${3:uniqueManual} = \${1:arr}.filter((item, index) => \${1:arr}.indexOf(item) === index);

  return { uniqueSet: \${2:uniqueSet}, uniqueManual: \${3:uniqueManual} };
}

const \${4:dataWithDupes} = [1, 2, 2, 3, 4, 4, 4, 5, "a", "b", "a"];
console.log("Original Array:", \${4:dataWithDupes});
console.log("Unique Elements:", getUniqueElements(\${4:dataWithDupes}).uniqueSet);`
  },
  {
    label: '/pattern',
    detail: 'Pattern Printing (Star Pyramid & Triangle)',
    documentation: 'Prints right triangle and pyramid patterns using nested loops.',
    insertText: `// Pattern Printing: Star Pyramid & Right Triangle
function printPatterns(\${1:rows}) {
  console.log("--- Right Triangle Pattern ---");
  for (let \${2:i} = 1; \${2:i} <= \${1:rows}; \${2:i}++) {
    let \${3:line} = "";
    for (let \${4:j} = 1; \${4:j} <= \${2:i}; \${4:j}++) {
      \${3:line} += "* ";
    }
    console.log(\${3:line});
  }

  console.log("\\n--- Star Pyramid Pattern ---");
  for (let \${2:i} = 1; \${2:i} <= \${1:rows}; \${2:i}++) {
    let \${5:spaces} = " ".repeat(\${1:rows} - \${2:i});
    let \${6:stars} = "*".repeat(2 * \${2:i} - 1);
    console.log(\${5:spaces} + \${6:stars});
  }
}

printPatterns(5);`
  },
  {
    label: '/matrix',
    detail: '2D Matrix Traversal & Diagonal Sum',
    documentation: 'Traverses a 2D matrix and computes the primary diagonal sum.',
    insertText: `// 2D Matrix Traversal & Sum of Diagonals
const \${1:matrix} = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

let \${2:primaryDiagonalSum} = 0;
const \${3:size} = \${1:matrix}.length;

for (let \${4:i} = 0; \${4:i} < \${3:size}; \${4:i}++) {
  for (let \${5:j} = 0; \${5:j} < \${3:size}; \${5:j}++) {
    if (\${4:i} === \${5:j}) {
      \${2:primaryDiagonalSum} += \${1:matrix}[\${4:i}][\${5:j}];
    }
  }
}

console.log("Matrix:");
console.table(\${1:matrix});
console.log(\`Primary Diagonal Sum: \${\${2:primaryDiagonalSum}}\`);`
  },
  {
    label: '/evenodd',
    detail: 'Even or Odd Number Checker',
    documentation: 'Generates a function to determine if numbers are Even or Odd.',
    insertText: `// Function to check if a number is Even or Odd
function isEvenOrOdd(\${1:num}) {
  if (\${1:num} % 2 === 0) {
    return \`\${\${1:num}} is EVEN\`;
  } else {
    return \`\${\${1:num}} is ODD\`;
  }
}

// Test numbers
[7, 12, 0, 99, 100].forEach(n => console.log(isEvenOrOdd(n)));`
  },
  {
    label: '/prime',
    detail: 'Prime Number Checker',
    documentation: 'Generates a function to check for prime numbers.',
    insertText: `// Function to check if a number is Prime
function isPrime(\${1:num}) {
  if (\${1:num} <= 1) return false;
  for (let \${2:i} = 2; \${2:i} <= Math.sqrt(\${1:num}); \${2:i}++) {
    if (\${1:num} % \${2:i} === 0) return false;
  }
  return true;
}

// Test prime numbers
const \${3:numbersToTest} = [2, 3, 4, 11, 15, 29, 33];
\${3:numbersToTest}.forEach(n => {
  console.log(\`\${n} is \${isPrime(n) ? "PRIME" : "NOT prime"}\`);
});`
  },
  {
    label: '/arrayadd',
    detail: 'Array Operations & Dynamic Sum',
    documentation: 'Creates an array, adds elements dynamically, and calculates total sum.',
    insertText: `// Create array and add elements dynamically
const \${1:numbers} = [10, 20, 30];

// Adding elements
\${1:numbers}.push(40);
\${1:numbers}.push(50);

console.log("Current Array:", \${1:numbers});

// Calculate total sum using reduce
const \${2:totalSum} = \${1:numbers}.reduce((acc, curr) => acc + curr, 0);
const \${3:average} = \${2:totalSum} / \${1:numbers}.length;

console.log(\`Total Sum: \${\${2:totalSum}}\`);
console.log(\`Average: \${\${3:average}}\`);`
  },
  {
    label: '/reverse',
    detail: 'Reverse Array or String',
    documentation: 'Reverses an array in-place without built-in methods.',
    insertText: `// Reverse an array in-place
function reverseArray(\${1:arr}) {
  let \${2:left} = 0;
  let \${3:right} = \${1:arr}.length - 1;
  const \${4:reversed} = [...\${1:arr}];

  while (\${2:left} < \${3:right}) {
    let temp = \${4:reversed}[\${2:left}];
    \${4:reversed}[\${2:left}] = \${4:reversed}[\${3:right}];
    \${4:reversed}[\${3:right}] = temp;
    \${2:left}++;
    \${3:right}--;
  }
  return \${4:reversed};
}

const \${5:inputArray} = [1, 2, 3, 4, 5];
console.log("Original Array:", \${5:inputArray});
console.log("Reversed Array:", reverseArray(\${5:inputArray}));`
  },
  {
    label: '/palindrome',
    detail: 'Palindrome Checker',
    documentation: 'Checks if a string or number reads the same backwards.',
    insertText: `// Check if String or Number is a Palindrome
function isPalindrome(\${1:str}) {
  const \${2:cleanStr} = String(\${1:str}).toLowerCase().replace(/[^a-z0-9]/g, '');
  const \${3:reversedStr} = \${2:cleanStr}.split('').reverse().join('');
  return \${2:cleanStr} === \${3:reversedStr};
}

const \${4:testCases} = ["racecar", "madam", "hello", 12321, 12345];
\${4:testCases}.forEach(\${5:item} => {
  console.log(\`"\${\${5:item}}" is Palindrome? \${isPalindrome(\${5:item})}\`);
});`
  },
  {
    label: '/frequency',
    detail: 'Element Frequency Map Counter',
    documentation: 'Counts occurrence frequencies of items in an array or string.',
    insertText: `// Count frequency of elements in an array
function countFrequency(\${1:arr}) {
  const \${2:freqMap} = {};
  for (let \${3:item} of \${1:arr}) {
    \${2:freqMap}[\${3:item}] = (\${2:freqMap}[\${3:item}] || 0) + 1;
  }
  return \${2:freqMap};
}

const \${4:sampleList} = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
console.log("Element Frequencies:");
console.table(countFrequency(\${4:sampleList}));`
  },
  {
    label: '/binarysearch',
    detail: 'Binary Search Algorithm',
    documentation: 'Searches for a target element in a sorted array in O(log n) time.',
    insertText: `// Binary Search on a sorted array
function binarySearch(\${1:arr}, \${2:target}) {
  let \${3:low} = 0;
  let \${4:high} = \${1:arr}.length - 1;

  while (\${3:low} <= \${4:high}) {
    let \${5:mid} = Math.floor((\${3:low} + \${4:high}) / 2);
    if (\${1:arr}[\${5:mid}] === \${2:target}) {
      return \${5:mid}; // Found index
    } else if (\${1:arr}[\${5:mid}] < \${2:target}) {
      \${3:low} = \${5:mid} + 1;
    } else {
      \${4:high} = \${5:mid} - 1;
    }
  }
  return -1; // Not found
}

const \${6:sortedNums} = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
const \${7:targetVal} = 23;
const \${8:foundIndex} = binarySearch(\${6:sortedNums}, \${7:targetVal});

console.log("Sorted Array:", \${6:sortedNums});
console.log(\`Target \${\${7:targetVal}} found at index: \${\${8:foundIndex}}\`);`
  },
  {
    label: '/twopointer',
    detail: 'Two Pointer Pair Sum Technique',
    documentation: 'Finds pair in array that equals target sum using two pointers.',
    insertText: `// Two-pointer technique to find pair with target sum
function findPairWithSum(\${1:arr}, \${2:targetSum}) {
  const \${3:sorted} = [...\${1:arr}].sort((a, b) => a - b);
  let \${4:left} = 0;
  let \${5:right} = \${3:sorted}.length - 1;

  while (\${4:left} < \${5:right}) {
    let \${6:currentSum} = \${3:sorted}[\${4:left}] + \${3:sorted}[\${5:right}];
    if (\${6:currentSum} === \${2:targetSum}) {
      return [\${3:sorted}[\${4:left}], \${3:sorted}[\${5:right}]];
    } else if (\${6:currentSum} < \${2:targetSum}) {
      \${4:left}++;
    } else {
      \${5:right}--;
    }
  }
  return null;
}

const \${7:arr} = [10, 20, 35, 50, 75, 80];
const \${8:target} = 70;
console.log("Pair with sum", \${8:target}, ":", findPairWithSum(\${7:arr}, \${8:target}));`
  }
];

export default function CodeEditor({ code, onChange, onRunCode, theme, editorRef }) {
  const providerRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

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
        <span className="panel-title">
          <span>index.js</span>
          <span className="badge-tag" style={{ textTransform: 'none', marginLeft: '6px' }}>
            Type '/' for Problem Templates (Sort, Max/Min, Merge, Patterns, Loops)
          </span>
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

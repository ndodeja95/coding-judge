import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  examples: Example[];
  testCases: TestCase[];
  starterCodePython: string;
  starterCodeCpp: string;
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  error?: string;
  passed: boolean;
}

interface DebugSession {
  sessionId: string;
  status: 'initialized' | 'active' | 'completed' | 'error' | 'terminated';
  output: string;
  error?: string;
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<'python' | 'cpp'>('python');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);
  
  // Debugging state
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [debugSession, setDebugSession] = useState<DebugSession | null>(null);
  const [debugOutput, setDebugOutput] = useState<string>('');
  const [debugCommand, setDebugCommand] = useState<string>('');
  const [debugLoading, setDebugLoading] = useState<boolean>(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/problems/${id}`);
        setProblem(response.data);
        setCode(response.data.starterCodePython);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch problem details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'python' | 'cpp';
    setLanguage(newLang);
    setCode(newLang === 'python' ? problem?.starterCodePython || '' : problem?.starterCodeCpp || '');
    // Reset results when changing language
    setResults(null);
    setAllPassed(null);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    
    setExecuting(true);
    setResults(null);
    setAllPassed(null);
    
    try {
      const endpoint = language === 'python' 
        ? 'http://localhost:5002/api/execute/python' 
        : 'http://localhost:5002/api/execute/cpp';
        
      const response = await axios.post(endpoint, {
        code,
        problemId: problem.id
      });
      
      setResults(response.data.results);
      setAllPassed(response.data.allPassed);
    } catch (err) {
      setError('Failed to execute code. Please try again later.');
    } finally {
      setExecuting(false);
    }
  };
  
  // Initialize debugging session
  const handleStartDebug = async () => {
    if (!problem) return;
    if (language !== 'python') {
      setDebugError('Debugging is currently only supported for Python.');
      return;
    }
    
    setDebugLoading(true);
    setDebugError(null);
    setDebugOutput('');
    
    try {
      // Initialize debug session
      const initResponse = await axios.post('http://localhost:5002/api/debug/python/init', {
        code,
        problemId: problem.id
      });
      
      if (!initResponse.data.success) {
        throw new Error(initResponse.data.error || 'Failed to initialize debugging session');
      }
      
      const sessionId = initResponse.data.sessionId;
      
      // Start the debug session
      const startResponse = await axios.post('http://localhost:5002/api/debug/python/start', {
        sessionId
      });
      
      if (!startResponse.data.success) {
        throw new Error(startResponse.data.error || 'Failed to start debugging session');
      }
      
      setDebugSession({
        sessionId,
        status: startResponse.data.status,
        output: startResponse.data.output || 'Debug session started.',
        error: startResponse.data.error
      });
      
      setDebugOutput(startResponse.data.output || 'Debug session started.');
      setIsDebugging(true);
      
    } catch (err: any) {
      setDebugError(err.message || 'Failed to start debugging session');
    } finally {
      setDebugLoading(false);
    }
  };
  
  // Send a debugger command
  const handleDebugCommand = async () => {
    if (!debugSession || !debugCommand.trim()) return;
    
    setDebugLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5002/api/debug/python/command', {
        sessionId: debugSession.sessionId,
        command: debugCommand
      });
      
      if (response.data.output) {
        setDebugOutput(prev => prev + '\n> ' + debugCommand + '\n' + response.data.output);
      }
      
      if (response.data.error) {
        setDebugOutput(prev => prev + '\nError: ' + response.data.error);
      }
      
      // Clear command after sending
      setDebugCommand('');
      
      // Update session status
      const statusResponse = await axios.get(`http://localhost:5002/api/debug/python/${debugSession.sessionId}`);
      
      setDebugSession({
        ...debugSession,
        status: statusResponse.data.status,
      });
      
      // If session is completed or terminated, end debugging mode
      if (['completed', 'terminated', 'error'].includes(statusResponse.data.status)) {
        setIsDebugging(false);
      }
      
    } catch (err: any) {
      setDebugError(err.message || 'Failed to send debug command');
    } finally {
      setDebugLoading(false);
    }
  };
  
  // Terminate debug session
  const handleStopDebug = async () => {
    if (!debugSession) return;
    
    try {
      await axios.post('http://localhost:5002/api/debug/python/terminate', {
        sessionId: debugSession.sessionId
      });
      
      setIsDebugging(false);
      setDebugSession(null);
      setDebugOutput(prev => prev + '\nDebugging session terminated.');
    } catch (err: any) {
      setDebugError(err.message || 'Failed to terminate debugging session');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        Problem not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{problem.title}</h1>
        <div className="mt-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full
            ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}`}>
            {problem.difficulty}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem description */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="whitespace-pre-line mb-6">{problem.description}</p>
          
          <h3 className="text-lg font-semibold mb-2">Examples:</h3>
          <div className="space-y-4">
            {problem.examples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <p><strong>Input:</strong> {example.input}</p>
                <p><strong>Output:</strong> {example.output}</p>
                {example.explanation && <p><strong>Explanation:</strong> {example.explanation}</p>}
              </div>
            ))}
          </div>
          
          {isDebugging && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Debug Console</h3>
              <div className="bg-black text-white p-3 rounded-md font-mono text-sm h-64 overflow-y-auto whitespace-pre-wrap">
                {debugOutput}
              </div>
              <div className="flex mt-2">
                <input
                  type="text"
                  value={debugCommand}
                  onChange={(e) => setDebugCommand(e.target.value)}
                  placeholder="Enter debug command (e.g., n, s, p variable)"
                  className="flex-grow border rounded-l px-3 py-2 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDebugCommand();
                    }
                  }}
                  disabled={debugLoading || !isDebugging}
                />
                <button
                  onClick={handleDebugCommand}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r"
                  disabled={debugLoading || !debugCommand.trim() || !isDebugging}
                >
                  Send
                </button>
              </div>
              <div className="flex justify-between mt-3">
                <div>
                  <span className="text-xs font-semibold">Common commands:</span>
                  <div className="text-xs text-gray-500 mt-1">
                    <code className="bg-gray-100 p-1 rounded">n</code> - next line, 
                    <code className="bg-gray-100 p-1 rounded ml-1">s</code> - step into, 
                    <code className="bg-gray-100 p-1 rounded ml-1">c</code> - continue, 
                    <code className="bg-gray-100 p-1 rounded ml-1">p var</code> - print variable
                  </div>
                </div>
                <button
                  onClick={handleStopDebug}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Stop Debugging
                </button>
              </div>
              {debugError && (
                <div className="bg-red-100 text-red-700 p-2 rounded mt-2 text-sm">
                  {debugError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code editor */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <label htmlFor="language" className="mr-2 font-semibold">Language:</label>
              <select
                id="language"
                value={language}
                onChange={handleLanguageChange}
                className="border rounded px-2 py-1"
                disabled={isDebugging}
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div>
              {!isDebugging ? (
                <>
                  <button
                    onClick={handleStartDebug}
                    disabled={language !== 'python' || executing || debugLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mr-2 disabled:opacity-50"
                  >
                    Debug
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={executing || debugLoading || isDebugging}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {executing ? 'Running...' : 'Submit'}
                  </button>
                </>
              ) : (
                <div className="text-sm text-indigo-600 font-semibold">
                  Debugging Mode Active
                </div>
              )}
            </div>
          </div>
          
          <div className="border rounded-md h-96">
            <Editor
              height="100%"
              language={language === 'python' ? 'python' : 'cpp'}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                readOnly: isDebugging, // Make read-only during debugging
              }}
            />
          </div>
          
          {/* Debug Help */}
          {language === 'python' && !isDebugging && (
            <div className="mt-4 bg-blue-50 p-3 rounded-md text-sm">
              <p className="font-semibold text-blue-800">Python Debugging Tips:</p>
              <ul className="text-blue-700 mt-1 list-disc list-inside">
                <li>Use the <strong>Debug</strong> button to start debugging your solution</li>
                <li>The debugger uses Python's built-in pdb</li>
                <li>Your code will run with the first test case</li>
                <li>Common commands: <code className="bg-blue-100 rounded px-1">n</code> (next line), <code className="bg-blue-100 rounded px-1">s</code> (step into), <code className="bg-blue-100 rounded px-1">p variable</code> (print a variable's value)</li>
              </ul>
            </div>
          )}
          
          {/* Test results */}
          {results && !isDebugging && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Test Results: 
                <span className={`ml-2 ${allPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {allPassed ? 'All Passed' : 'Failed'}
                </span>
              </h3>
              
              <div className="space-y-4 mt-4">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`border p-3 rounded-md ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <p><strong>Test Case {index + 1}</strong></p>
                    <p><strong>Input:</strong> {result.input}</p>
                    <p><strong>Expected:</strong> {result.expectedOutput}</p>
                    {result.actualOutput && <p><strong>Output:</strong> {result.actualOutput}</p>}
                    {result.error && <p className="text-red-600"><strong>Error:</strong> {result.error}</p>}
                    <p className={`font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail; 
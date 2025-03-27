const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create temp directory for code files
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Store active debugging sessions
const debugSessions = {};

// Sample problems
const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." }
    ],
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      { input: "[3,3], 6", expectedOutput: "[0,1]" }
    ],
    starterCodePython: `def two_sum(nums, target):
    # Your code here
    pass

# Example usage:
# result = two_sum([2,7,11,15], 9)
# print(result)  # Should print [0,1]`,
    starterCodeCpp: `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

// Example usage:
// vector<int> nums = {2,7,11,15};
// vector<int> result = twoSum(nums, 9);
// Should return [0,1]`
  },
  {
    id: 2,
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    examples: [
      { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
      { input: "x = -121", output: "false", explanation: "From left to right, it reads -121. From right to left, it reads 121-. Therefore it is not a palindrome." }
    ],
    testCases: [
      { input: "121", expectedOutput: "true" },
      { input: "-121", expectedOutput: "false" },
      { input: "10", expectedOutput: "false" }
    ],
    starterCodePython: `def is_palindrome(x):
    # Your code here
    pass

# Example usage:
# result = is_palindrome(121)
# print(result)  # Should print True`,
    starterCodeCpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // Your code here
    return false;
}

// Example usage:
// bool result = isPalindrome(121);
// Should return true`
  },
  {
    id: 3,
    title: "Buggy Fibonacci",
    difficulty: "Easy",
    description: "This function should calculate the nth Fibonacci number, but it has bugs! Debug and fix the issues.\n\nThe Fibonacci sequence is defined as: F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1.",
    examples: [
      { input: "n = 0", output: "0", explanation: "F(0) = 0 by definition." },
      { input: "n = 1", output: "1", explanation: "F(1) = 1 by definition." },
      { input: "n = 5", output: "5", explanation: "F(5) = F(4) + F(3) = 3 + 2 = 5" }
    ],
    testCases: [
      { input: "0", expectedOutput: "0" },
      { input: "1", expectedOutput: "1" },
      { input: "5", expectedOutput: "5" },
      { input: "10", expectedOutput: "55" }
    ],
    starterCodePython: `def fibonacci(n):
    # This function has bugs!
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        # Bug 1: Incorrect recursive call
        return fibonacci(n-1) + fibonacci(n-3)
        
    # Bug 2: Missing edge case handling
    # Bug 3: Inefficient implementation (not a bug per se, but could be improved)

# Example usage:
# result = fibonacci(5)
# print(result)  # Should print 5`,
    starterCodeCpp: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    // This function has bugs!
    if (n <= 0) {
        return 0;
    } else if (n == 1) {
        return 1;
    } else {
        // Bug 1: Incorrect recursive call
        return fibonacci(n-1) + fibonacci(n-3);
    }
    
    // Bug 2: Missing edge case handling
    // Bug 3: Inefficient implementation (not a bug per se, but could be improved)
}

// Example usage:
// int result = fibonacci(5);
// Should return 5`
  },
  {
    id: 4,
    title: "Buggy Binary Search",
    difficulty: "Medium",
    description: "This binary search function is supposed to return the index of a target element in a sorted array, or -1 if the target is not found. However, it contains bugs that you need to identify and fix.",
    examples: [
      { input: "arr = [1, 3, 5, 7, 9], target = 5", output: "2", explanation: "The number 5 is at index 2 in the array." },
      { input: "arr = [1, 3, 5, 7, 9], target = 6", output: "-1", explanation: "The number 6 is not in the array, so return -1." }
    ],
    testCases: [
      { input: "[1, 3, 5, 7, 9], 5", expectedOutput: "2" },
      { input: "[1, 3, 5, 7, 9], 1", expectedOutput: "0" },
      { input: "[1, 3, 5, 7, 9], 9", expectedOutput: "4" },
      { input: "[1, 3, 5, 7, 9], 6", expectedOutput: "-1" },
      { input: "[], 5", expectedOutput: "-1" }
    ],
    starterCodePython: `def binary_search(arr, target):
    # This function has bugs!
    left = 0
    right = len(arr)  # Bug 1: Incorrect right boundary
    
    while left <= right:  # Bug 2: Incorrect loop condition
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid  # Bug 3: Incorrect update of left pointer
        else:
            right = mid  # Bug 4: Incorrect update of right pointer
    
    return -1  # Target not found

# Example usage:
# result = binary_search([1, 3, 5, 7, 9], 5)
# print(result)  # Should print 2`,
    starterCodeCpp: `#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    // This function has bugs!
    int left = 0;
    int right = arr.size();  // Bug 1: Incorrect right boundary
    
    while (left <= right) {  // Bug 2: Incorrect loop condition
        int mid = (left + right) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid;  // Bug 3: Incorrect update of left pointer
        } else {
            right = mid;  // Bug 4: Incorrect update of right pointer
        }
    }
    
    return -1;  // Target not found
}

// Example usage:
// vector<int> arr = {1, 3, 5, 7, 9};
// int result = binarySearch(arr, 5);
// Should return 2`
  }
];

// API Routes
app.get('/api/problems', (req, res) => {
  const problemsData = problems.map(p => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty
  }));
  res.json(problemsData);
});

app.get('/api/problems/:id', (req, res) => {
  const problem = problems.find(p => p.id === parseInt(req.params.id));
  if (!problem) return res.status(404).json({ message: "Problem not found" });
  res.json(problem);
});

// Execute Python code
app.post('/api/execute/python', (req, res) => {
  const { code, problemId } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  const problem = problems.find(p => p.id === parseInt(problemId));
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  
  const timestamp = Date.now();
  const filename = `${tempDir}/solution_${timestamp}.py`;
  
  // Write user code to file
  fs.writeFileSync(filename, code);
  
  // Results array to store test case outcomes
  const results = [];
  let allPassed = true;
  
  // Run each test case
  for (const testCase of problem.testCases) {
    // Create test runner code - Modified to fix the import
    const testRunnerCode = `
import sys
import json
import os

# Add the temporary directory to the Python path
sys.path.append("${tempDir}")

# Import the solution module directly by filename without the .py extension
from solution_${timestamp} import *

try:
    # Parse input for Two Sum
    if ${problemId} == 1:
        input_str = '${testCase.input}'
        parts = input_str.split(', ')
        nums_str = parts[0].replace('[', '').replace(']', '')
        nums = [int(n) for n in nums_str.split(',')]
        target = int(parts[1])
        result = two_sum(nums, target)
        print(json.dumps(result))
    # Parse input for Palindrome
    elif ${problemId} == 2:
        input_str = '${testCase.input}'
        x = int(input_str)
        result = is_palindrome(x)
        print(json.dumps(result))
    # Parse input for Fibonacci
    elif ${problemId} == 3:
        input_str = '${testCase.input}'
        n = int(input_str)
        result = fibonacci(n)
        print(json.dumps(result))
    # Parse input for Binary Search
    elif ${problemId} == 4:
        input_str = '${testCase.input}'
        parts = input_str.split(', ')
        arr_str = parts[0].replace('[', '').replace(']', '')
        if arr_str:
            arr = [int(n) for n in arr_str.split(',')]
        else:
            arr = []
        target = int(parts[1])
        result = binary_search(arr, target)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "Unsupported problem"}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;
    
    const testFilename = `${tempDir}/test_${timestamp}.py`;
    fs.writeFileSync(testFilename, testRunnerCode);
    
    // Execute the test
    try {
      const output = require('child_process').execSync(`python ${testFilename}`, { 
        encoding: 'utf-8',
        timeout: 5000 // 5 seconds timeout
      }).trim();
      
      // Parse output
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(output);
      } catch (e) {
        parsedOutput = output;
      }
      
      // Compare with expected output
      const expectedOutput = JSON.parse(testCase.expectedOutput.replace(/'/g, '"'));
      const passed = JSON.stringify(parsedOutput) === JSON.stringify(expectedOutput);
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: JSON.stringify(parsedOutput),
        passed
      });
      
      if (!passed) allPassed = false;
      
      // Clean up test file
      fs.unlinkSync(testFilename);
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        error: error.message,
        passed: false
      });
      allPassed = false;
      
      // Clean up test file if it exists
      if (fs.existsSync(testFilename)) {
        fs.unlinkSync(testFilename);
      }
    }
  }
  
  // Clean up solution file
  fs.unlinkSync(filename);
  
  res.json({
    success: true,
    allPassed,
    results
  });
});

// Execute C++ code
app.post('/api/execute/cpp', (req, res) => {
  const { code, problemId } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  const problem = problems.find(p => p.id === parseInt(problemId));
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  
  const filename = `${tempDir}/solution_${Date.now()}.cpp`;
  const executableFile = `${tempDir}/solution_${Date.now()}`;
  
  // Write user code to file
  fs.writeFileSync(filename, code);
  
  // Compile C++ code
  exec(`clang++ -std=c++17 ${filename} -o ${executableFile}`, (compileError, compileStdout, compileStderr) => {
    if (compileError) {
      return res.json({
        success: false,
        error: 'Compilation error',
        message: compileStderr
      });
    }
    
    // Results array to store test case outcomes
    const results = [];
    let allPassed = true;
    
    // Run each test case
    let testCasesProcessed = 0;
    
    problem.testCases.forEach((testCase, index) => {
      // Create test runner code - this would be more complex for C++
      // For simplicity, we'll just run the executable and provide inputs via command line args
      const command = `${executableFile} "${testCase.input}"`;
      
      exec(command, { timeout: 5000 }, (runError, runStdout, runStderr) => {
        testCasesProcessed++;
        
        if (runError) {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            error: runStderr || runError.message,
            passed: false
          });
          allPassed = false;
        } else {
          // Parse output
          const output = runStdout.trim();
          const passed = output === testCase.expectedOutput;
          
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: output,
            passed
          });
          
          if (!passed) allPassed = false;
        }
        
        // When all test cases are processed
        if (testCasesProcessed === problem.testCases.length) {
          // Clean up files
          fs.unlinkSync(filename);
          fs.unlinkSync(executableFile);
          
          res.json({
            success: true,
            allPassed,
            results
          });
        }
      });
    });
    
    // Handle the case when there are no test cases
    if (problem.testCases.length === 0) {
      fs.unlinkSync(filename);
      fs.unlinkSync(executableFile);
      
      res.json({
        success: true,
        allPassed: true,
        results: []
      });
    }
  });
});

// Initialize Python debugging session
app.post('/api/debug/python/init', (req, res) => {
  const { code, problemId } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  const problem = problems.find(p => p.id === parseInt(problemId));
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  
  // Generate a unique session ID
  const sessionId = uuidv4();
  const filename = `${tempDir}/debug_${sessionId}.py`;
  
  // Create the debug wrapper code that includes test case input
  const testCase = problem.testCases[0]; // Use the first test case for debugging
  
  // Create the debug file with a wrapper to handle the test case input
  let debugWrapperCode = '';
  
  if (problemId == 1) { // Two Sum
    const parts = testCase.input.split(', ');
    const numsStr = parts[0].replace('[', '').replace(']', '');
    const nums = numsStr.split(',').map(n => n.trim());
    const target = parts[1];
    
    debugWrapperCode = `# Debug file - session ${sessionId}
import pdb

${code}

# Test with first test case
nums = [${nums}]
target = ${target}
result = two_sum(nums, target)
print(f"Result: {result}")
`;
  } else if (problemId == 2) { // Palindrome
    debugWrapperCode = `# Debug file - session ${sessionId}
import pdb

${code}

# Test with first test case
x = ${testCase.input}
result = is_palindrome(x)
print(f"Result: {result}")
`;
  } else if (problemId == 3) { // Buggy Fibonacci
    debugWrapperCode = `# Debug file - session ${sessionId}
import pdb

${code}

# Test with first test case
n = ${testCase.input}
result = fibonacci(n)
print(f"Result: {result}")
`;
  } else if (problemId == 4) { // Buggy Binary Search
    const parts = testCase.input.split(', ');
    let arrStr = parts[0];
    const target = parts[1];
    
    debugWrapperCode = `# Debug file - session ${sessionId}
import pdb

${code}

# Test with first test case
arr = ${arrStr}
target = ${target}
result = binary_search(arr, target)
print(f"Result: {result}")
`;
  }
  
  // Write debug file
  fs.writeFileSync(filename, debugWrapperCode);
  
  // Store session info
  debugSessions[sessionId] = {
    filename,
    problemId,
    status: 'initialized',
    testCase: testCase,
    created: Date.now()
  };
  
  res.json({
    success: true,
    sessionId,
    message: 'Debug session initialized'
  });
});

// Start Python debugging session
app.post('/api/debug/python/start', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId || !debugSessions[sessionId]) {
    return res.status(404).json({ error: 'Debug session not found' });
  }
  
  const session = debugSessions[sessionId];
  
  if (session.status !== 'initialized') {
    return res.status(400).json({ error: 'Debug session already started or completed' });
  }
  
  // Create a temporary file with debugger commands
  const pdbCmdsFile = `${tempDir}/pdb_cmds_${sessionId}.txt`;
  fs.writeFileSync(pdbCmdsFile, 'b 1\nc\n'); // Set breakpoint at line 1 and continue
  
  try {
    // Start Python with PDB
    const debugProcess = spawn('python', ['-m', 'pdb', session.filename]);
    
    // Update session
    session.status = 'active';
    session.process = debugProcess;
    session.stdout = [];
    session.stderr = [];
    session.lastCommand = 'start';
    
    // Collect stdout/stderr
    debugProcess.stdout.on('data', (data) => {
      const output = data.toString();
      session.stdout.push(output);
    });
    
    debugProcess.stderr.on('data', (data) => {
      const error = data.toString();
      session.stderr.push(error);
    });
    
    // Handle process exit
    debugProcess.on('exit', (code) => {
      session.status = 'completed';
      session.exitCode = code;
      
      // Clean up after some time
      setTimeout(() => {
        if (fs.existsSync(session.filename)) {
          fs.unlinkSync(session.filename);
        }
        delete debugSessions[sessionId];
      }, 60000); // Clean up after 1 minute
    });
    
    // Wait a bit for the debugger to initialize
    setTimeout(() => {
      res.json({
        success: true,
        sessionId,
        status: session.status,
        output: session.stdout.join('')
      });
    }, 500);
  } catch (error) {
    session.status = 'error';
    session.error = error.message;
    
    res.status(500).json({
      success: false,
      error: 'Failed to start debugger',
      message: error.message
    });
  }
});

// Execute debugger command
app.post('/api/debug/python/command', (req, res) => {
  const { sessionId, command } = req.body;
  
  if (!sessionId || !debugSessions[sessionId]) {
    return res.status(404).json({ error: 'Debug session not found' });
  }
  
  if (!command) {
    return res.status(400).json({ error: 'No command provided' });
  }
  
  const session = debugSessions[sessionId];
  
  if (session.status !== 'active') {
    return res.status(400).json({ error: 'Debug session not active' });
  }
  
  try {
    // Record command
    session.lastCommand = command;
    session.stdout = [];
    
    // Send command to debugger
    session.process.stdin.write(command + '\n');
    
    // Wait for output
    setTimeout(() => {
      res.json({
        success: true,
        sessionId,
        command,
        output: session.stdout.join(''),
        error: session.stderr.join('')
      });
    }, 200);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to execute debugger command',
      message: error.message
    });
  }
});

// Get debug session status
app.get('/api/debug/python/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId || !debugSessions[sessionId]) {
    return res.status(404).json({ error: 'Debug session not found' });
  }
  
  const session = debugSessions[sessionId];
  
  res.json({
    success: true,
    sessionId,
    status: session.status,
    lastCommand: session.lastCommand,
    output: session.stdout.join(''),
    error: session.stderr.join('')
  });
});

// Terminate debug session
app.post('/api/debug/python/terminate', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId || !debugSessions[sessionId]) {
    return res.status(404).json({ error: 'Debug session not found' });
  }
  
  const session = debugSessions[sessionId];
  
  if (session.status === 'active' && session.process) {
    session.process.kill();
    session.status = 'terminated';
  }
  
  // Clean up files
  if (fs.existsSync(session.filename)) {
    fs.unlinkSync(session.filename);
  }
  
  delete debugSessions[sessionId];
  
  res.json({
    success: true,
    message: 'Debug session terminated'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
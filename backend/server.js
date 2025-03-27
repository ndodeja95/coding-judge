const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
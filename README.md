# Coding Judge Platform

A web-based coding judge platform for solving algorithmic problems with debugging support.

## Features

- Interactive code editor with syntax highlighting
- Support for multiple programming languages (Python and C++)
- Automatic test case execution
- Debugging support for Python
- Problem description and examples
- Test results display

## Debugging Support

The platform now includes an interactive debugging feature for Python code that allows users to:

1. Step through their code line by line
2. Inspect variables at each step
3. Set breakpoints and watch expressions
4. Practice debugging skills with intentionally buggy problems

### How to Use the Debugger

1. Select a problem and write your Python solution
2. Click the "Debug" button to start a debugging session
3. Use the following commands in the debug console:
   - `n` - Execute the next line (step over)
   - `s` - Step into a function call
   - `c` - Continue execution until the next breakpoint
   - `q` - Quit the debugger
   - `p variable_name` - Print the value of a variable
   - `l` - List the current source code context
   - `b line_number` - Set a breakpoint at a specific line

### Intentionally Buggy Problems

The platform includes problems with intentional bugs for users to practice debugging:

- **Buggy Fibonacci**: A recursive Fibonacci implementation with incorrect logic
- **Buggy Binary Search**: A binary search implementation with multiple bugs to fix

These problems are designed to help users improve their debugging skills by identifying and fixing common issues.

## Setup

### Prerequisites

- Node.js and npm
- Modern web browser

### Installation

1. Clone the repository
2. Install dependencies for the backend:
   ```
   cd backend
   npm install
   ```
3. Install dependencies for the frontend:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   node server.js
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Architecture

The application consists of:

- **Frontend**: React application with Monaco Editor for code editing
- **Backend**: Node.js with Express for code execution and testing

## Adding New Problems

To add new problems, modify the `problems` array in `backend/server.js`. Each problem should include:

- Title and difficulty
- Description and examples
- Test cases with inputs and expected outputs
- Starter code for supported languages

## Debugging Implementation Details

The debugging implementation works by:

1. Creating a session-specific Python file with the user's code
2. Running the code with Python's built-in `pdb` debugger
3. Establishing a communication channel between the debugger and the UI
4. Translating user commands into debugger actions
5. Displaying the debugging output in real-time

This provides a real debugging experience within the browser, similar to using a local development environment 
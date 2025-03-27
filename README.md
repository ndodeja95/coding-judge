# Coding Judge

A simple LeetCode-like web application that provides an interface to write code in Python/C++ and compile it with given test cases to judge the correctness of the code.

## Features

- View a list of coding problems
- Select a problem to solve
- Write code in Python or C++
- Submit your code for evaluation against test cases
- View test results showing which test cases passed or failed

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Monaco Editor
- **Backend:** Node.js, Express
- **Code Execution:** Python and C++ compilers/interpreters

## Prerequisites

- Node.js (v14+)
- npm (v6+)
- Python (3.x)
- C++ compiler (g++)

## Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd coding-judge
   ```

2. Install the dependencies
   ```
   npm install
   cd frontend
   npm install
   cd ..
   ```

## Running the Application

To run both the frontend and backend concurrently:

```
npm start
```

This will start:
- The backend server on http://localhost:5000
- The React frontend on http://localhost:3000

## Project Structure

```
coding-judge/
├── frontend/                    # React frontend
│   ├── public/
│   └── src/
│       ├── components/          # React components
│       │   ├── ProblemList.tsx  # Displays list of problems
│       │   └── ProblemDetail.tsx # Problem details and code editor
│       └── App.tsx              # Main App component
├── backend/                     # Express backend
│   ├── server.js                # Express server setup
│   └── temp/                    # Temporary directory for code files
└── package.json                 # Project configuration
```

## Adding New Problems

To add new problems, modify the `problems` array in the `backend/server.js` file. Each problem should have:

- `id`: Unique identifier
- `title`: Problem title
- `difficulty`: "Easy", "Medium", or "Hard"
- `description`: Problem description
- `examples`: Array of examples with input, output, and explanation
- `testCases`: Array of test cases with input and expectedOutput
- `starterCodePython`: Python starter code for the problem
- `starterCodeCpp`: C++ starter code for the problem

## Limitations

- The backend relies on local system compilers and executables, which may pose security risks in a production environment
- The C++ implementation is simplified and doesn't provide robust input handling for complex data structures
- No user authentication or code saving functionality

## Future Enhancements

- Add user authentication
- Save submissions history
- Support more programming languages
- Add timed contests
- Improve code execution security with containerization 
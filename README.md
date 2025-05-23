# Knightcode

Knightcode is a CLI tool that provides AI-powered coding assistance using Ollama with the devstral:24b model. It runs completely locally on your machine, with no need for authentication or API keys.

## Prerequisites

- Node.js >= 18.0.0
- [Ollama](https://ollama.ai/) installed and running
- The devstral:24b model pulled in Ollama

## Installation

1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Pull the devstral:24b model:
   ```bash
   ollama pull devstral:24b
   ```
3. Install Knightcode:
   ```bash
   npm install -g @ttracx/knightcode
   ```

## Usage

Knightcode provides several commands to help with your coding tasks:

### Ask Questions
```bash
knightcode ask "How do I implement a binary search tree in TypeScript?"
```

### Explain Code
```bash
knightcode explain path/to/file.js
```

### Refactor Code
```bash
knightcode refactor path/to/file.py --focus=performance
```

### Fix Bugs
```bash
knightcode fix path/to/code.ts
```

### Get Help
```bash
knightcode help
knightcode help <command>
```

## Features

- **Local AI Processing**: All AI processing is done locally using Ollama
- **No Authentication Required**: No need for API keys or authentication
- **Code Generation**: Generate code based on natural language descriptions
- **Code Explanation**: Get detailed explanations of code
- **Code Refactoring**: Refactor code with AI assistance
- **Bug Fixing**: Identify and fix bugs in your code

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ttracx/knightcode.git
   cd knightcode
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

## License

MIT

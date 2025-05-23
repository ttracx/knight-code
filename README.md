# Knightcode

Knightcode is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows - all through natural language commands.

## Features

- Edit files and fix bugs across your codebase
- Answer questions about your code's architecture and logic
- Execute and fix tests, lint, and other commands
- Search through git history, resolve merge conflicts, and create commits and PRs

## Installation

```bash
npm install -g @ttracx/knightcode
```

## Usage

### Research Preview

```bash
knightcode
```

### Basic Commands

- `knightcode ask "How do I implement a binary search tree in TypeScript?"`
- `knightcode explain path/to/file.js`
- `knightcode refactor path/to/file.py --focus=performance`
- `knightcode fix path/to/code.ts`

### Available Commands

- `/help` - Show help information
- `/ask` - Ask questions about code or programming
- `/explain` - Explain code files or snippets
- `/refactor` - Refactor code for better readability or performance
- `/fix` - Fix bugs or issues in code
- `/generate` - Generate code based on a prompt
- `/search` - Search through your codebase
- `/git` - Perform git operations
- `/config` - View or edit configuration settings
- `/theme` - Change the UI theme
- `/verbosity` - Set output verbosity level

## Requirements

- Node.js >= 18.0.0
- macOS or Linux (Windows is not supported)

## Development

```bash
# Clone the repository
git clone https://github.com/ttracx/knightcode.git
cd knightcode

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © ttracx # knight-code

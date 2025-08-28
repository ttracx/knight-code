# Knightcode CLI

A powerful AI coding assistant CLI tool that helps you write, understand, and debug code using Ollama.

## Features

- 🤖 AI-powered code assistance
- 📝 Code generation and refactoring
- 🔍 Code explanation and documentation
- 🐛 Bug fixing and debugging
- 💡 Intelligent code suggestions
- 🔄 Real-time code analysis

## Installation

```bash
npm install -g @neuroequalityorg/knightcode
```

## Prerequisites

- Node.js >= 18.0.0
- Ollama installed and running locally

## Usage

```bash
# Start the CLI
knightcode

# Ask a coding question
knightcode ask "How do I implement a binary search tree in TypeScript?"

# Explain code
knightcode explain path/to/file.ts

# Refactor code
knightcode refactor path/to/file.ts --focus readability

# Fix bugs
knightcode fix path/to/file.ts --issue "Infinite loop in the sort function"
```

## Commands

- `ask` - Ask questions about code or programming
- `explain` - Get explanations of code files or snippets
- `refactor` - Refactor code for better readability or performance
- `fix` - Fix bugs or issues in code
- `generate` - Generate code based on a prompt
- `config` - View or edit configuration settings
- `login` - Log in to Knightcode
- `logout` - Log out and clear stored credentials

## Configuration

Knightcode can be configured through:

1. Environment variables
2. Configuration file (`.claude-code.json`)
3. Command line arguments

See the [Configuration Guide](docs/configuration.md) for details.

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

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

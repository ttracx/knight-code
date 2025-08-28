# Knightcode CLI

A powerful AI coding assistant CLI tool that helps you write, understand, and debug code using local AI models.

## Features

- 🤖 **Local AI-powered code assistance** - No cloud API keys required
- 🏠 **Multiple local providers** - Ollama and LM Studio support
- 📝 **Code generation and refactoring** - Generate code from natural language
- 🔍 **Code explanation and documentation** - Understand complex codebases
- 🐛 **Bug fixing and debugging** - AI-powered problem solving
- 💡 **Intelligent code suggestions** - Context-aware recommendations
- 🔄 **Real-time code analysis** - Instant feedback on your code
- 🔒 **Privacy-focused** - Your code stays on your machine

## Installation

```bash
npm install -g @neuroequalityorg/knightcode
```

## Prerequisites

- Node.js >= 18.0.0
- Either Ollama or LM Studio installed and running locally

## Quick Start

**New to Knightcode?** Start with our [Getting Started Guide](GETTING_STARTED.md) for a 5-minute setup!

### Option 1: Using Ollama (Recommended)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull a coding model
ollama pull devstral:24b

# Test Knightcode
knightcode ask "Hello, can you help me with coding?"
```

### Option 2: Using LM Studio

```bash
# Download LM Studio from https://lmstudio.ai/
# Load a model and start the local server

# Test Knightcode
knightcode ask "Hello, can you help me with coding?"
```

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

# Generate code
knightcode generate "a REST API server with Express" --language TypeScript

# Use specific AI provider
knightcode --provider ollama --model devstral:24b ask "How do I implement authentication?"
```

## Commands

### Core Commands
- `ask` - Ask questions about code or programming
- `explain` - Get explanations of code files or snippets
- `refactor` - Refactor code for better readability or performance
- `fix` - Fix bugs or issues in code
- `generate` - Generate code based on a prompt

### Configuration & System
- `config` - View or edit configuration settings
- `login` - Log in to Knightcode (for cloud features)
- `logout` - Log out and clear stored credentials

## AI Providers

Knightcode supports multiple local AI providers:

### Ollama
- **Default provider** - Easy to set up and use
- **Recommended models**: `devstral:24b`, `codellama:7b`, `llama3.2:3b`
- **Port**: 11434 (default)
- **Best for**: Most users, good balance of speed and quality

### LM Studio
- **Alternative provider** - More control over models
- **Port**: 1234 (default)
- **Best for**: Users who want to experiment with different models

### Anthropic (Cloud)
- **Fallback option** - Requires API key
- **Best for**: When local models aren't sufficient

## Configuration

Knightcode can be configured through:

1. **Configuration file** (`.knightcode.json`) - Recommended
2. **Environment variables** - For automation
3. **Command line arguments** - For one-time use

### Example Configuration File

Create `.knightcode.json` in your project directory:

```json
{
  "ai": {
    "provider": "ollama",
    "model": "devstral:24b",
    "temperature": 0.7,
    "maxTokens": 4096
  },
  "terminal": {
    "theme": "system",
    "useColors": true
  }
}
```

### Environment Variables

```bash
export KNIGHTCODE_AI_PROVIDER=ollama
export KNIGHTCODE_AI_MODEL=devstral:24b
```

## Performance Tips

- **Smaller models** (3B-7B): Faster responses, good for simple tasks
- **Larger models** (13B-70B): Better quality, slower responses
- **Memory**: Ensure you have enough RAM for your chosen model
- **GPU**: Models run faster with GPU acceleration (if supported)

## Troubleshooting

### Common Issues

1. **Connection failed**: Make sure your AI service is running
2. **Model not found**: Download/pull the model first
3. **Slow responses**: Try a smaller model or check your hardware
4. **Memory errors**: Reduce model size or increase available RAM

### Getting Help

```bash
# Check configuration
knightcode config

# Test connection
knightcode ask "Hello"

# View logs
knightcode --verbose ask "Hello"
```

## Development

```bash
# Clone the repository
git clone https://github.com/neuroequalityorg/knightcode.git
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

## Support

- 🚀 **Getting Started**: [GETTING_STARTED.md](GETTING_STARTED.md) - 5-minute setup guide
- 📖 **Detailed Setup**: [SETUP_LOCAL_AI.md](SETUP_LOCAL_AI.md) - Comprehensive configuration guide
- 🐛 **Issues**: Report bugs on GitHub
- 💬 **Discussions**: Join community discussions
- ⭐ **Star**: If this project helps you, consider giving it a star!

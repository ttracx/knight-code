# Getting Started with Knightcode

A simple, step-by-step guide to get Knightcode working with local AI in under 10 minutes.

## 🎯 What You'll Get

- A private AI coding assistant running on your machine
- No API keys or cloud services required
- Fast, local AI responses
- Complete privacy for your code

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Knightcode
```bash
npm install -g @neuroequalityorg/knightcode
```

### Step 2: Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download
```

### Step 3: Start Ollama & Download Model
```bash
# Terminal 1: Start Ollama (keep running)
ollama serve

# Terminal 2: Download a coding model
ollama pull devstral:24b
```

### Step 4: Test It!
```bash
knightcode ask "Hello! Can you help me write a function that sorts an array?"
```

That's it! 🎉

## 🔧 Detailed Setup

### Option A: Ollama (Recommended)

#### 1. Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

#### 2. Start Ollama Service
```bash
ollama serve
```
**Keep this terminal running!** This starts the AI service.

#### 3. Download a Model
Open a new terminal and run:
```bash
# Best coding model (24B parameters)
ollama pull devstral:24b

# Or faster alternatives:
# ollama pull codellama:7b      # 7B parameters, faster
# ollama pull llama3.2:3b       # 3B parameters, fastest
```

#### 4. Test Ollama
```bash
ollama run devstral:24b "Write a hello world function in Python"
```

### Option B: LM Studio

#### 1. Download LM Studio
- Go to [https://lmstudio.ai/](https://lmstudio.ai/)
- Download and install for your platform

#### 2. Download a Model
- Open LM Studio
- Go to "Search" tab
- Search for "CodeLlama" or "Llama 3.2"
- Click "Download"

#### 3. Load Model & Start Server
- Go to "Local Models" tab
- Click "Load" on your downloaded model
- Go to "Local Server" tab
- Click "Start Server"

## ⚙️ Configure Knightcode

### Create Configuration File
Create `.knightcode.json` in your project directory:

```json
{
  "ai": {
    "provider": "ollama",
    "model": "devstral:24b"
  }
}
```

### Or Use Environment Variables
```bash
export KNIGHTCODE_AI_PROVIDER=ollama
export KNIGHTCODE_AI_MODEL=devstral:24b
```

## 🧪 Test Your Setup

### 1. Check Configuration
```bash
knightcode config
```
You should see `"provider": "ollama"` or `"provider": "lmstudio"`.

### 2. Test Basic Functionality
```bash
# Simple test
knightcode ask "Hello! Can you help me with coding?"

# Code generation
knightcode generate "a function that calculates fibonacci numbers" --language Python

# Code explanation
knightcode explain path/to/your/file.js
```

### 3. Try Real Tasks
```bash
# Ask for help with algorithms
knightcode ask "How do I implement a binary search tree?"

# Get code reviews
knightcode ask "Can you review this code for best practices?"

# Debug help
knightcode ask "Why is this function returning undefined?"
```

## 🚨 Common Issues

### "Connection Failed"
- Make sure Ollama is running: `ollama serve`
- Check if service is accessible: `curl http://localhost:11434/api/tags`

### "Model Not Found"
- Download the model: `ollama pull devstral:24b`
- Check available models: `ollama list`

### Slow Responses
- Use smaller models (7B instead of 24B)
- Close other applications
- Check available RAM

### Port Conflicts
```bash
# Check what's using the port
lsof -i :11434    # For Ollama
lsof -i :1234     # For LM Studio

# Kill conflicting processes
kill -9 <PID>
```

## 🎯 What You Can Do Now

### Code Generation
```bash
knightcode generate "a REST API with Express and MongoDB" --language JavaScript
```

### Code Explanation
```bash
knightcode explain src/components/UserProfile.tsx
```

### Bug Fixing
```bash
knightcode fix src/utils/calculator.js --issue "Function returns NaN for negative numbers"
```

### Code Refactoring
```bash
knightcode refactor src/services/api.js --focus readability
```

### Learning & Questions
```bash
knightcode ask "How do I implement proper error handling in async functions?"
knightcode ask "What are the differences between let, const, and var in JavaScript?"
knightcode ask "How do I optimize this React component for performance?"
```

## 🔄 Switching Models

### Try Different Models
```bash
# Download a faster model
ollama pull codellama:7b

# Update configuration
export KNIGHTCODE_AI_MODEL=codellama:7b

# Test it
knightcode ask "Hello!"
```

### Switch Providers
```bash
# From Ollama to LM Studio
export KNIGHTCODE_AI_PROVIDER=lmstudio

# From LM Studio to Ollama
export KNIGHTCODE_AI_PROVIDER=ollama
```

## 📚 Next Steps

1. **Explore Commands**: Try all available commands
2. **Customize Settings**: Adjust temperature, max tokens, etc.
3. **Experiment with Models**: Try different models for different tasks
4. **Integrate with Workflow**: Use Knightcode in your daily coding
5. **Join Community**: Report bugs, suggest features, contribute

## 🆘 Need Help?

- **Check logs**: `knightcode --verbose ask "Hello"`
- **View help**: `knightcode help` or `knightcode help ask`
- **Configuration**: `knightcode config`
- **Documentation**: See [SETUP_LOCAL_AI.md](SETUP_LOCAL_AI.md) for detailed setup
- **Issues**: Report problems on GitHub

## 🎉 Success!

You now have a powerful, private AI coding assistant running entirely on your machine. No more API keys, no more data privacy concerns, just fast, local AI help whenever you need it.

Happy coding! 🚀

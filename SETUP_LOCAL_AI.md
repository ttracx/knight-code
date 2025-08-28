# Setting Up Knightcode with Local AI Providers

Knightcode can work with local AI models using Ollama or LM Studio, eliminating the need for cloud API keys and providing faster, more private AI assistance.

## 🚀 Quick Start

Choose your preferred AI provider and follow the setup steps below:

### Option 1: Ollama (Recommended for Beginners)
- **Pros**: Easy setup, good performance, active community
- **Cons**: Limited model selection compared to LM Studio
- **Best for**: Most users, quick setup

### Option 2: LM Studio
- **Pros**: More model options, better control, GUI interface
- **Cons**: Slightly more complex setup
- **Best for**: Power users, model experimentation

## 📋 Prerequisites

- **Node.js 18+** installed
- **8GB+ RAM** (16GB+ recommended for larger models)
- **Either Ollama or LM Studio** running locally

## 🐳 Option 1: Using Ollama

### Step 1: Install Ollama

#### macOS/Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows
Download from [https://ollama.ai/download](https://ollama.ai/download)

#### Verify Installation
```bash
ollama --version
```

### Step 2: Start Ollama Service
```bash
# Start the service (keep this running)
ollama serve
```

### Step 3: Download a Model
Open a new terminal and run:

```bash
# Recommended coding model (24B parameters, good quality)
ollama pull devstral:24b

# Alternative models (faster, smaller):
# ollama pull codellama:7b        # 7B parameters, fast
# ollama pull llama3.2:3b         # 3B parameters, very fast
# ollama pull mistral:7b          # 7B parameters, good balance
```

### Step 4: Test Ollama
```bash
# Test if the model works
ollama run devstral:24b "Hello, can you help me with coding?"
```

### Step 5: Configure Knightcode
Create a `.knightcode.json` file in your project directory:

```json
{
  "ai": {
    "provider": "ollama",
    "model": "devstral:24b",
    "temperature": 0.7,
    "maxTokens": 4096,
    "timeout": 60000
  },
  "terminal": {
    "theme": "system",
    "useColors": true,
    "showProgressIndicators": true,
    "codeHighlighting": true
  },
  "telemetry": {
    "enabled": false
  }
}
```

## 🎮 Option 2: Using LM Studio

### Step 1: Install LM Studio
Download from [https://lmstudio.ai/](https://lmstudio.ai/)

### Step 2: Download a Model
1. Open LM Studio
2. Go to "Search" tab
3. Search for coding models like:
   - **CodeLlama** (good for coding)
   - **Llama 3.2** (general purpose)
   - **Mistral** (good balance)
4. Click "Download" on your preferred model

### Step 3: Load the Model
1. Go to "Local Models" tab
2. Click on your downloaded model
3. Click "Load" to load it into memory

### Step 4: Start Local Server
1. Go to "Local Server" tab
2. Click "Start Server"
3. Note the port (usually 1234)

### Step 5: Configure Knightcode
Create a `.knightcode.json` file:

```json
{
  "ai": {
    "provider": "lmstudio",
    "model": "default",
    "temperature": 0.7,
    "maxTokens": 4096,
    "timeout": 60000
  },
  "terminal": {
    "theme": "system",
    "useColors": true,
    "showProgressIndicators": true,
    "codeHighlighting": true
  }
}
```

## 🔧 Configuration Options

### Environment Variables
You can also configure via environment variables:

```bash
# Set AI provider
export KNIGHTCODE_AI_PROVIDER=ollama

# Set AI model
export KNIGHTCODE_AI_MODEL=devstral:24b

# For LM Studio, customize API URL if needed
export KNIGHTCODE_AI_API_URL=http://localhost:1234
```

### CLI Flags
Specify provider and model via command line:

```bash
# Use Ollama with a specific model
knightcode --provider ollama --model devstral:24b ask "How do I implement a binary search tree?"

# Use LM Studio
knightcode --provider lmstudio ask "Explain this code"

# Check current configuration
knightcode config
```

## 🧪 Testing Your Setup

### Step 1: Verify Configuration
```bash
knightcode config
```

You should see:
- `"provider": "ollama"` or `"provider": "lmstudio"`
- The correct model name
- Appropriate timeout settings

### Step 2: Test Basic Functionality
```bash
# Simple test
knightcode ask "Hello, can you help me with coding?"

# Code generation test
knightcode generate "a function that sorts an array" --language JavaScript

# Code explanation test
knightcode explain path/to/your/file.js
```

### Step 3: Check for Errors
If you get errors, check the logs and see the troubleshooting section below.

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Connection Failed

**Symptoms**: `Failed to connect to Ollama service` or `Failed to connect to LM Studio service`

**Solutions**:
```bash
# For Ollama:
# Check if service is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve

# For LM Studio:
# Check if server is running
curl http://localhost:1234/v1/models

# Restart LM Studio local server
```

#### 2. Model Not Found

**Symptoms**: `Model not found` or similar errors

**Solutions**:
```bash
# For Ollama:
ollama list                    # See available models
ollama pull devstral:24b      # Download the model

# For LM Studio:
# Make sure model is loaded in LM Studio
# Check "Local Models" tab
```

#### 3. Slow Responses

**Symptoms**: Very slow AI responses

**Solutions**:
- Use smaller models (3B-7B instead of 24B+)
- Ensure you have enough RAM
- Check if GPU acceleration is available
- Close other applications to free up resources

#### 4. Memory Errors

**Symptoms**: `Out of memory` or crashes

**Solutions**:
- Use smaller models
- Increase available RAM
- Close other applications
- Restart the AI service

#### 5. Port Conflicts

**Symptoms**: `Connection refused` or `Address already in use`

**Solutions**:
```bash
# Check what's using the port
lsof -i :11434    # For Ollama
lsof -i :1234     # For LM Studio

# Kill conflicting processes
kill -9 <PID>

# Or change ports in configuration
```

### Debug Mode

Enable verbose logging to see what's happening:

```bash
knightcode --verbose ask "Hello"
```

## 📊 Performance Optimization

### Model Selection Guide

| Model Size | Speed | Quality | RAM Usage | Best For |
|------------|-------|---------|-----------|----------|
| 3B         | ⚡⚡⚡ | ⭐⭐    | 4-6GB     | Quick tasks, simple code |
| 7B         | ⚡⚡   | ⭐⭐⭐   | 8-12GB    | Most coding tasks |
| 13B        | ⚡    | ⭐⭐⭐⭐  | 16-24GB   | Complex code, debugging |
| 24B+       | 🐌    | ⭐⭐⭐⭐⭐ | 32GB+     | Best quality, research |

### Hardware Recommendations

- **Minimum**: 8GB RAM, any CPU
- **Recommended**: 16GB RAM, modern CPU
- **Optimal**: 32GB+ RAM, GPU acceleration

## 🔄 Switching Between Providers

You can easily switch between providers:

### From Ollama to LM Studio
```bash
# Update configuration
export KNIGHTCODE_AI_PROVIDER=lmstudio

# Or edit .knightcode.json
{
  "ai": {
    "provider": "lmstudio",
    "model": "default"
  }
}
```

### From LM Studio to Ollama
```bash
# Update configuration
export KNIGHTCODE_AI_PROVIDER=ollama

# Or edit .knightcode.json
{
  "ai": {
    "provider": "ollama",
    "model": "devstral:24b"
  }
}
```

## 🆘 Getting Help

### Check Logs
```bash
# Enable debug logging
export KNIGHTCODE_LOG_LEVEL=debug
knightcode ask "Hello"
```

### Common Commands
```bash
# Check configuration
knightcode config

# Test connection
knightcode ask "Hello"

# View help
knightcode help
knightcode help ask
```

### Community Resources
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share solutions
- **Documentation**: Check for updates and examples

## 🔒 Security & Privacy

### Local Processing
- **No data leaves your machine** - All AI processing happens locally
- **No API keys required** - No external service authentication needed
- **Offline capable** - Works without internet connection (after model download)

### Model Safety
- Models are downloaded from trusted sources (Ollama, Hugging Face)
- No telemetry or data collection by default
- You control what models run on your system

## 📈 Next Steps

Once you have Knightcode working with local AI:

1. **Explore Commands**: Try all the available commands
2. **Customize Configuration**: Adjust settings for your workflow
3. **Experiment with Models**: Try different models for different tasks
4. **Integrate with Workflow**: Use Knightcode in your daily coding
5. **Contribute**: Report bugs, suggest features, or contribute code

## 🎯 Success Checklist

- [ ] AI service (Ollama/LM Studio) is running
- [ ] Model is downloaded and loaded
- [ ] `.knightcode.json` configuration file is created
- [ ] `knightcode config` shows correct provider
- [ ] `knightcode ask "Hello"` works without errors
- [ ] You can generate and explain code

Congratulations! You now have a powerful, private AI coding assistant running entirely on your local machine. 🎉

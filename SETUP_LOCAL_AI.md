# Setting Up Knightcode with Local AI Providers

Knightcode can work with local AI models using Ollama or LM Studio, eliminating the need for cloud API keys and providing faster, more private AI assistance.

## Prerequisites

- Node.js 18+ installed
- Either Ollama or LM Studio running locally

## Option 1: Using Ollama

### 1. Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### 2. Start Ollama and pull a model
```bash
# Start Ollama service
ollama serve

# In another terminal, pull a model (e.g., Devstral)
ollama pull devstral:24b

# Or try other models:
# ollama pull llama3.2:3b
# ollama pull codellama:7b
# ollama pull mistral:7b
```

### 3. Configure Knightcode
Create a `.knightcode.json` file in your project directory:
```json
{
  "ai": {
    "provider": "ollama",
    "model": "devstral:24b",
    "temperature": 0.7,
    "maxTokens": 4096
  }
}
```

## Option 2: Using LM Studio

### 1. Install LM Studio
Download from [https://lmstudio.ai/](https://lmstudio.ai/)

### 2. Start LM Studio and load a model
1. Open LM Studio
2. Download a model (e.g., Llama 3.2, CodeLlama, etc.)
3. Load the model in LM Studio
4. Start the local server (usually on port 1234)

### 3. Configure Knightcode
Create a `.knightcode.json` file in your project directory:
```json
{
  "ai": {
    "provider": "lmstudio",
    "model": "default",
    "temperature": 0.7,
    "maxTokens": 4096
  }
}
```

## Environment Variables

You can also configure via environment variables:

```bash
# Set AI provider
export KNIGHTCODE_AI_PROVIDER=ollama

# Set AI model
export KNIGHTCODE_AI_MODEL=devstral:24b

# For LM Studio, you can customize the API URL
export KNIGHTCODE_AI_API_URL=http://localhost:1234
```

## CLI Options

You can specify the provider and model via command line:

```bash
# Use Ollama with a specific model
knightcode --provider ollama --model devstral:24b ask "How do I implement a binary search tree?"

# Use LM Studio
knightcode --provider lmstudio ask "Explain this code"
```

## Testing Your Setup

1. Make sure your AI service is running
2. Run a simple command:
   ```bash
   knightcode ask "Hello, can you help me with coding?"
   ```

3. Check the configuration:
   ```bash
   knightcode config
   ```

## Troubleshooting

### Ollama Issues
- **Connection failed**: Make sure `ollama serve` is running
- **Model not found**: Pull the model first with `ollama pull <model-name>`
- **Port conflicts**: Ollama uses port 11434 by default

### LM Studio Issues
- **Connection failed**: Make sure LM Studio local server is running
- **Model not loaded**: Load a model in LM Studio before starting the server
- **Port conflicts**: LM Studio uses port 1234 by default

### General Issues
- Check that your AI service is accessible at the expected URL
- Verify the model name matches exactly what's available
- Check logs for detailed error messages

## Configuration File Locations

Knightcode looks for configuration in this order:
1. `.knightcode.json` in current directory
2. `.knightcode.json` in home directory
3. `~/.config/knightcode/config.json`
4. Environment variables

## Switching Between Providers

You can easily switch between providers by updating your configuration:

```json
{
  "ai": {
    "provider": "ollama",  // or "lmstudio" or "anthropic"
    "model": "devstral:24b"
  }
}
```

## Performance Tips

- **Ollama**: Use smaller models (3B-7B) for faster responses, larger models (13B-70B) for better quality
- **LM Studio**: Adjust context length based on your hardware capabilities
- **Memory**: Ensure you have enough RAM for your chosen model size

## Security

- Local AI providers keep your code and conversations private
- No data is sent to external services
- Models run entirely on your local machine

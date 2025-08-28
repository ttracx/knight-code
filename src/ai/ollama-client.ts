/**
 * Ollama Client
 * 
 * Handles interaction with Ollama API for text completion
 * and code assistance features.
 */

import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { withTimeout, withRetry } from '../utils/async.js';
import { AIProvider, Message, CompletionOptions, CompletionResponse, StreamEvent } from './provider.js';

interface CompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
  system?: string;
}

interface ApiError {
  error?: {
    message?: string;
  };
}

// Default API configuration
const DEFAULT_CONFIG = {
  apiBaseUrl: 'http://localhost:11434',
  timeout: 60000, // 60 seconds
  retryOptions: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000
  },
  defaultModel: 'devstral:24b',
  defaultMaxTokens: 4096,
  defaultTemperature: 0.7
};

/**
 * Ollama AI client for interacting with Ollama API
 */
export class OllamaClient implements AIProvider {
  private config: typeof DEFAULT_CONFIG;
  
  /**
   * Create a new Ollama client
   */
  constructor(config: Partial<typeof DEFAULT_CONFIG> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    logger.debug('Ollama client created with config', { 
      apiBaseUrl: this.config.apiBaseUrl,
      defaultModel: this.config.defaultModel
    });
  }
  
  /**
   * Format API request headers
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Send a completion request to Ollama
   */
  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    logger.debug('Sending completion request', { model: options.model || this.config.defaultModel });
    
    // Format the request
    const messages: Message[] = options.messages;
    
    const request = {
      model: options.model || this.config.defaultModel,
      prompt: messages.map(m => m.content).join('\n'),
      stream: false,
      options: {
        temperature: options.temperature ?? this.config.defaultTemperature,
        num_predict: options.maxTokens || this.config.defaultMaxTokens,
        top_p: options.topP,
        top_k: options.topK,
        stop: options.stopSequences
      }
    };
    
    // Make the API request with timeout and retry
    try {
      const sendRequestWithPath = async (path: string, requestOptions: RequestInit) => {
        return this.sendRequest(path, requestOptions);
      };
      
      const timeoutFn = withTimeout(sendRequestWithPath, this.config.timeout);
      
      const retryFn = withRetry(timeoutFn, {
        maxRetries: this.config.retryOptions.maxRetries,
        initialDelayMs: this.config.retryOptions.initialDelayMs,
        maxDelayMs: this.config.retryOptions.maxDelayMs
      });
      
      const response = await retryFn('/api/generate', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      });
      
      // Convert Ollama response to our CompletionResponse format
      return {
        id: Date.now().toString(),
        model: response.model,
        usage: {
          input_tokens: response.prompt_eval_count || 0,
          output_tokens: response.eval_count || 0
        },
        content: [{
          type: 'text',
          text: response.response
        }]
      };
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && 'error' in error) {
        const err = error as { error?: { message?: string } };
        errorMessage = err.error?.message || 'Unknown error';
      }
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Send a streaming completion request to Ollama
   */
  async *completeStream(options: CompletionOptions): AsyncGenerator<StreamEvent> {
    logger.debug('Sending streaming completion request', { model: options.model || this.config.defaultModel });
    
    // Format the request
    const messages: Message[] = options.messages;
    
    const request = {
      model: options.model || this.config.defaultModel,
      prompt: messages.map(m => m.content).join('\n'),
      stream: true,
      options: {
        temperature: options.temperature ?? this.config.defaultTemperature,
        num_predict: options.maxTokens || this.config.defaultMaxTokens,
        top_p: options.topP,
        top_k: options.topK,
        stop: options.stopSequences
      }
    };
    
    // For now, return a simple stream implementation
    // In a full implementation, this would handle actual streaming
    try {
      const response = await this.complete(options);
      
      yield {
        type: 'message_start',
        message: {
          id: response.id,
          model: response.model,
          content: response.content,
          stop_reason: response.stop_reason
        }
      };
      
      yield {
        type: 'message_stop',
        message: {
          id: response.id,
          model: response.model,
          content: response.content,
          stop_reason: response.stop_reason
        }
      };
    } catch (error) {
      logger.error('Ollama streaming failed:', error);
      throw error;
    }
  }
  
  /**
   * Type guard for API error response
   */
  private isApiErrorResponse(error: unknown): error is { error?: { message?: string } } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof (error as any).error === 'object' &&
      (error as any).error !== null
    );
  }
  
  /**
   * Test the connection to the Ollama API
   */
  async testConnection(): Promise<boolean> {
    logger.debug('Testing connection to Ollama API');
    
    try {
      // First try to get available models (lighter request)
      const models = await this.getModels();
      if (models.length > 0) {
        logger.debug('Connection test successful - found models:', models);
        return true;
      }
      
      // If no models found, try a simple health check
      const response = await fetch(`${this.config.apiBaseUrl}/api/tags`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        logger.debug('Connection test successful - API responded');
        return true;
      }
      
      logger.debug('Connection test failed - API responded with status:', response.status);
      return false;
    } catch (error: unknown) {
      logger.debug('Connection test failed with error:', error);
      return false;
    }
  }
  
  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage: string;
    let errorDetails: any;
    
    try {
      const errorResponse = await response.json() as ApiError;
      errorMessage = errorResponse.error?.message || 'Unknown error';
      errorDetails = errorResponse;
    } catch {
      errorMessage = `HTTP error ${response.status}`;
      errorDetails = { status: response.status };
    }
    
    throw createUserError(`Ollama API error: ${errorMessage}`, {
      category: ErrorCategory.AI_SERVICE,
      details: errorDetails
    });
  }
  
  /**
   * Send a request to the Ollama API
   */
  private async sendRequest(path: string, options: RequestInit): Promise<any> {
    const url = `${this.config.apiBaseUrl}${path}`;
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
    
    return response.json();
  }
  
  /**
   * Send a streaming request to the Ollama API
   */
  private async sendStreamRequest(
    path: string, 
    options: RequestInit,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    const url = `${this.config.apiBaseUrl}${path}`;
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      await this.handleErrorResponse(response);
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }
    
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON objects
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              
              // Convert Ollama stream event to our StreamEvent format
              const event: StreamEvent = {
                type: 'content_block_delta',
                delta: {
                  type: 'text',
                  text: data.response
                }
              };
              
              onEvent(event);
            } catch (error) {
              logger.error('Failed to parse stream event', error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get available models from Ollama
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await this.sendRequest('/api/tags', { method: 'GET' });
      return response.models?.map((model: any) => model.name) || [];
    } catch (error) {
      logger.error('Failed to get Ollama models:', error);
      return [];
    }
  }

  /**
   * Set the model to use
   */
  setModel(model: string): void {
    this.config.defaultModel = model;
    logger.debug('Ollama model set to:', model);
  }

  /**
   * Get the current model
   */
  getModel(): string {
    return this.config.defaultModel;
  }

  /**
   * Get configuration information
   */
  getConfig(): any {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<typeof DEFAULT_CONFIG>): void {
    this.config = { ...this.config, ...newConfig };
    logger.debug('Ollama client configuration updated:', this.config);
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'ollama';
  }
} 
/**
 * Ollama Client
 * 
 * Handles interaction with Ollama API, using the devstral:24b model
 * for text completion and code assistance features.
 */

import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { withTimeout, withRetry } from '../utils/async.js';

// Types for API requests and responses
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  stream?: boolean;
  system?: string;
}

export interface CompletionRequest {
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

export interface CompletionResponse {
  id: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  content: {
    type: string;
    text: string;
  }[];
  stop_reason?: string;
  stop_sequence?: string;
}

export interface StreamEvent {
  type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop';
  message?: {
    id: string;
    model: string;
    content: {
      type: string;
      text: string;
    }[];
    stop_reason?: string;
    stop_sequence?: string;
  };
  index?: number;
  delta?: {
    type: string;
    text: string;
  };
  usage_metadata?: {
    input_tokens: number;
    output_tokens: number;
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
export class OllamaClient {
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
  async complete(
    prompt: string | Message[],
    options: CompletionOptions = {}
  ): Promise<CompletionResponse> {
    logger.debug('Sending completion request', { model: options.model || this.config.defaultModel });
    
    // Format the request
    const messages: Message[] = Array.isArray(prompt) 
      ? prompt 
      : [{ role: 'user', content: prompt }];
    
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
    } catch (error) {
      logger.error('Completion request failed', error);
      
      throw createUserError('Failed to get response from Ollama', {
        cause: error,
        category: ErrorCategory.AI_SERVICE,
        resolution: 'Check if Ollama is running and try again.'
      });
    }
  }
  
  /**
   * Send a streaming completion request to Ollama
   */
  async completeStream(
    prompt: string | Message[],
    options: CompletionOptions = {},
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    logger.debug('Sending streaming completion request', { model: options.model || this.config.defaultModel });
    
    // Format the request
    const messages: Message[] = Array.isArray(prompt) 
      ? prompt 
      : [{ role: 'user', content: prompt }];
    
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
    
    try {
      await this.sendStreamRequest('/api/generate', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      }, onEvent);
    } catch (error) {
      logger.error('Streaming completion request failed', error);
      
      throw createUserError('Failed to get streaming response from Ollama', {
        cause: error,
        category: ErrorCategory.AI_SERVICE,
        resolution: 'Check if Ollama is running and try again.'
      });
    }
  }
  
  /**
   * Test the connection to the Ollama API
   */
  async testConnection(): Promise<boolean> {
    logger.debug('Testing connection to Ollama API');
    
    try {
      // Send a minimal request to test connectivity
      const result = await this.complete('Hello', {
        maxTokens: 10,
        temperature: 0
      });
      
      logger.debug('Connection test successful', { modelUsed: result.model });
      return true;
    } catch (error) {
      logger.error('Connection test failed', error);
      return false;
    }
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
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage: string;
    let errorDetails: any;
    
    try {
      const error = await response.json();
      errorMessage = error.error?.message || 'Unknown error';
      errorDetails = error;
    } catch {
      errorMessage = `HTTP error ${response.status}`;
      errorDetails = { status: response.status };
    }
    
    throw createUserError(`Ollama API error: ${errorMessage}`, {
      category: ErrorCategory.AI_SERVICE,
      details: errorDetails
    });
  }
} 
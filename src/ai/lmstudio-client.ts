/**
 * LM Studio Client
 * 
 * Handles interaction with LM Studio's local API for text completion
 * and code assistance features.
 */

import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';
import { withTimeout, withRetry } from '../utils/async.js';
import { AIProvider, Message, CompletionOptions, CompletionResponse, StreamEvent } from './provider.js';

interface CompletionRequest {
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
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
  apiBaseUrl: 'http://localhost:1234',
  timeout: 60000, // 60 seconds
  retryOptions: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000
  },
  defaultModel: 'default', // LM Studio uses 'default' for the loaded model
  defaultMaxTokens: 4096,
  defaultTemperature: 0.7
};

/**
 * LM Studio client for interacting with local LM Studio API
 */
export class LMStudioClient implements AIProvider {
  private config: typeof DEFAULT_CONFIG;
  private model: string;

  constructor(config: Partial<typeof DEFAULT_CONFIG> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.model = this.config.defaultModel;
  }

  /**
   * Test connection to LM Studio service
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.debug('Testing connection to LM Studio service');
      
      const timeoutFetch = withTimeout(
        () => fetch(`${this.config.apiBaseUrl}/v1/models`),
        this.config.timeout
      );
      const response = await timeoutFetch();

      if (!response.ok) {
        logger.debug('LM Studio service responded with non-OK status:', response.status);
        return false;
      }

      const models = await response.json();
      logger.debug('Available LM Studio models:', models);
      
      return true;
    } catch (error) {
      logger.debug('Failed to connect to LM Studio service:', error);
      return false;
    }
  }

  /**
   * Get available models from LM Studio
   */
  async getModels(): Promise<string[]> {
    try {
      const timeoutFetch = withTimeout(
        () => fetch(`${this.config.apiBaseUrl}/v1/models`),
        this.config.timeout
      );
      const response = await timeoutFetch();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      logger.error('Failed to get LM Studio models:', error);
      throw createUserError('Failed to get available models', {
        cause: error,
        category: ErrorCategory.CONNECTION,
        resolution: 'Check if LM Studio is running and accessible.'
      });
    }
  }

  /**
   * Set the model to use
   */
  setModel(model: string): void {
    this.model = model;
    logger.debug('LM Studio model set to:', model);
  }

  /**
   * Get the current model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Complete text using LM Studio
   */
  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const {
      temperature = this.config.defaultTemperature,
      maxTokens = this.config.defaultMaxTokens,
      topP = 1.0,
      topK = 40,
      stopSequences = [],
      stream = false,
      system = ''
    } = options;

            const messages = system ? [{ role: 'system' as const, content: system }, ...options.messages] : options.messages;

    const requestBody: CompletionRequest = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      top_k: topK,
      stop_sequences: stopSequences,
      stream
    };

    try {
      logger.debug('Sending completion request to LM Studio:', {
        model: this.model,
        messageCount: messages.length,
        temperature,
        maxTokens
      });

      const timeoutFetch = withTimeout(
        () => fetch(`${this.config.apiBaseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }),
        this.config.timeout
      );
      
      const retryFetch = withRetry(timeoutFetch, this.config.retryOptions);
      const response = await retryFetch();

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`LM Studio API error: ${response.status} - ${errorText}`);
        
        throw createUserError('LM Studio API error', {
          cause: new Error(`HTTP ${response.status}: ${errorText}`),
          category: ErrorCategory.API,
          resolution: 'Check LM Studio logs and ensure the model is loaded.'
        });
      }

      const data = await response.json() as any;
      
      // Transform LM Studio response to match our interface
      const completionResponse: CompletionResponse = {
        id: data.id || `lmstudio_${Date.now()}`,
        model: data.model || this.model,
        usage: {
          input_tokens: data.usage?.prompt_tokens || 0,
          output_tokens: data.usage?.completion_tokens || 0
        },
        content: data.choices?.[0]?.message?.content ? [{
          type: 'text',
          text: data.choices[0].message.content
        }] : [],
        stop_reason: data.choices?.[0]?.finish_reason || 'stop'
      };

      logger.debug('LM Studio completion successful:', {
        id: completionResponse.id,
        model: completionResponse.model,
        inputTokens: completionResponse.usage.input_tokens,
        outputTokens: completionResponse.usage.output_tokens
      });

      return completionResponse;
    } catch (error) {
      logger.error('LM Studio completion failed:', error);
      
      if (error instanceof Error && error.message.includes('LM Studio API error')) {
        throw error;
      }
      
      throw createUserError('Failed to complete text with LM Studio', {
        cause: error,
        category: ErrorCategory.API,
        resolution: 'Check if LM Studio is running and the model is loaded.'
      });
    }
  }

  /**
   * Stream text completion using LM Studio
   */
  async *completeStream(options: CompletionOptions): AsyncGenerator<StreamEvent> {
    const streamOptions = { ...options, stream: true };
    
    try {
      const response = await this.complete(streamOptions);
      
      // For now, return the complete response as a single event
      // In a full implementation, this would handle actual streaming
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
      logger.error('LM Studio streaming failed:', error);
      throw error;
    }
  }

  /**
   * Get configuration information
   */
  getConfig(): typeof DEFAULT_CONFIG {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<typeof DEFAULT_CONFIG>): void {
    this.config = { ...this.config, ...newConfig };
    logger.debug('LM Studio client configuration updated:', this.config);
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'lmstudio';
  }
}

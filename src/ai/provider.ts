/**
 * AI Provider Interface
 * 
 * Defines a unified interface for different AI providers (Ollama, LM Studio, etc.)
 */

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
  messages: Message[];
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

export interface AIProvider {
  /**
   * Test connection to the AI service
   */
  testConnection(): Promise<boolean>;
  
  /**
   * Get available models
   */
  getModels(): Promise<string[]>;
  
  /**
   * Set the model to use
   */
  setModel(model: string): void;
  
  /**
   * Get the current model
   */
  getModel(): string;
  
  /**
   * Complete text
   */
  complete(options: CompletionOptions): Promise<CompletionResponse>;
  
  /**
   * Stream text completion
   */
  completeStream(options: CompletionOptions): AsyncGenerator<StreamEvent>;
  
  /**
   * Get configuration
   */
  getConfig(): any;
  
  /**
   * Update configuration
   */
  updateConfig(config: any): void;
  
  /**
   * Get provider name
   */
  getProviderName(): string;
}

export type AIProviderType = 'ollama' | 'lmstudio' | 'anthropic';

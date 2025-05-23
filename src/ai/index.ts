/**
 * AI Module
 * 
 * Provides AI capabilities using Ollama with the devstral:24b model.
 * This module handles initialization, configuration, and access to AI services.
 */

import { OllamaClient } from './ollama-client.js';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';

// Singleton AI client instance
let aiClient: OllamaClient | null = null;

/**
 * Initialize the AI module
 */
export async function initAI(config: any = {}): Promise<OllamaClient> {
  logger.info('Initializing AI module');
  
  try {
    // Create AI client
    aiClient = new OllamaClient(config);
    
    // Test connection
    logger.debug('Testing connection to Ollama service');
    const connectionSuccess = await aiClient.testConnection();
    
    if (!connectionSuccess) {
      throw createUserError('Failed to connect to Ollama service', {
        category: ErrorCategory.CONNECTION,
        resolution: 'Make sure Ollama is running and the devstral:24b model is available.'
      });
    }
    
    logger.info('AI module initialized successfully');
    return aiClient;
  } catch (error) {
    logger.error('Failed to initialize AI module', error);
    
    throw createUserError('Failed to initialize AI capabilities', {
      cause: error,
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Check if Ollama is running and try again.'
    });
  }
}

/**
 * Get the AI client instance
 */
export function getAIClient(): OllamaClient {
  if (!aiClient) {
    throw createUserError('AI module not initialized', {
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Make sure to call initAI() before using AI capabilities.'
    });
  }
  
  return aiClient;
}

/**
 * Check if AI module is initialized
 */
export function isAIInitialized(): boolean {
  return !!aiClient;
}

// Re-export types and components
export * from './ollama-client.js';
export * from './prompts.js'; 
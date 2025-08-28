/**
 * AI Module
 * 
 * Provides AI capabilities using multiple local providers (Ollama, LM Studio).
 * This module handles initialization, configuration, and access to AI services.
 */

import { OllamaClient } from './ollama-client.js';
import { LMStudioClient } from './lmstudio-client.js';
import { AIProvider, AIProviderType } from './provider.js';
import { logger } from '../utils/logger.js';
import { createUserError } from '../errors/formatter.js';
import { ErrorCategory } from '../errors/types.js';

// Singleton AI client instance
let aiClient: AIProvider | null = null;
let currentProvider: AIProviderType = 'ollama';

/**
 * Initialize the AI module
 */
export async function initAI(config: any = {}): Promise<AIProvider> {
  logger.info('Initializing AI module');
  
  try {
    // Try to initialize with the preferred provider
    const provider = config.provider || currentProvider;
    
    if (provider === 'lmstudio') {
      aiClient = new LMStudioClient(config);
      currentProvider = 'lmstudio';
    } else {
      aiClient = new OllamaClient(config);
      currentProvider = 'ollama';
    }
    
    // Test connection
    logger.debug(`Testing connection to ${currentProvider} service`);
    const connectionSuccess = await aiClient.testConnection();
    
    if (!connectionSuccess) {
      // If the preferred provider fails, try the other one
      if (provider === 'lmstudio') {
        logger.info('LM Studio connection failed, trying Ollama...');
        aiClient = new OllamaClient(config);
        currentProvider = 'ollama';
        const ollamaSuccess = await aiClient.testConnection();
        if (!ollamaSuccess) {
          throw createUserError('Failed to connect to any AI service', {
            category: ErrorCategory.CONNECTION,
            resolution: 'Make sure either Ollama or LM Studio is running.'
          });
        }
      } else {
        logger.info('Ollama connection failed, trying LM Studio...');
        aiClient = new LMStudioClient(config);
        currentProvider = 'lmstudio';
        const lmstudioSuccess = await aiClient.testConnection();
        if (!lmstudioSuccess) {
          throw createUserError('Failed to connect to any AI service', {
            category: ErrorCategory.CONNECTION,
            resolution: 'Make sure either Ollama or LM Studio is running.'
          });
        }
      }
    }
    
    logger.info(`AI module initialized successfully with ${currentProvider}`);
    return aiClient;
  } catch (error) {
    logger.error('Failed to initialize AI module', error);
    
    throw createUserError('Failed to initialize AI capabilities', {
      cause: error,
      category: ErrorCategory.INITIALIZATION,
      resolution: 'Check if Ollama or LM Studio is running and try again.'
    });
  }
}

/**
 * Get the AI client instance
 */
export function getAIClient(): AIProvider {
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

/**
 * Get the current AI provider
 */
export function getCurrentProvider(): AIProviderType {
  return currentProvider;
}

/**
 * Set the preferred AI provider
 */
export function setPreferredProvider(provider: AIProviderType): void {
  currentProvider = provider;
  logger.info(`Preferred AI provider set to: ${provider}`);
}

// Re-export types and components
export * from './provider.js';
export * from './prompts.js';
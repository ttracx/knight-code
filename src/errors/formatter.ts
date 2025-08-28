/**
 * Error Formatter
 * 
 * Provides functions for formatting and creating user-friendly error messages.
 */

import { ErrorCategory, ErrorLevel, UserError, ErrorOptions } from './types.js';
import { logger } from '../utils/logger.js';
import { formatErrorDetails } from '../utils/formatting.js';

/**
 * Create a user-friendly error from any error
 */
export function createUserError(
  message: string,
  options: ErrorOptions = {}
): UserError {
  // Create UserError instance
  const userError = new UserError(message, options);
  
  // Log the error with appropriate level
  const level = userError.level === ErrorLevel.FATAL ? 'error' : 'warn';
  logger[level](`User error: ${message}`, {
    category: userError.category,
    details: userError.details,
    resolution: userError.resolution
  });
  
  return userError;
}

/**
 * Format an error for display
 */
export function formatErrorForDisplay(error: unknown, options: ErrorOptions = {}): string {
    if (error instanceof UserError) {
        return formatUserError(error);
    }
    
    if (error instanceof Error) {
        return formatStandardError(error, options);
    }
    
    return formatUnknownError(error, options);
}

/**
 * Format a user error
 */
function formatUserError(error: UserError): string {
    const parts = [
        `[${error.category}]`,
        `[${error.level}]`,
        error.message
    ];
    
    if (error.resolution) {
        parts.push(`\nResolution: ${error.resolution}`);
    }
    
    if (error.details) {
        parts.push(`\nDetails: ${JSON.stringify(error.details, null, 2)}`);
    }
    
    return parts.join(' ');
}

/**
 * Format a standard error
 */
function formatStandardError(error: Error, options: ErrorOptions): string {
    const category = options.category || ErrorCategory.UNKNOWN;
    const level = options.level || ErrorLevel.ERROR;
    
    const parts = [
        `[${category}]`,
        `[${level}]`,
        error.message
    ];
    
    if (error.stack) {
        parts.push(`\nStack: ${error.stack}`);
    }
    
    if (options.details) {
        parts.push(`\nDetails: ${JSON.stringify(options.details, null, 2)}`);
    }
    
    return parts.join(' ');
}

/**
 * Format an unknown error
 */
function formatUnknownError(error: unknown, options: ErrorOptions): string {
    const category = options.category || ErrorCategory.UNKNOWN;
    const level = options.level || ErrorLevel.ERROR;
    
    const parts = [
        `[${category}]`,
        `[${level}]`,
        String(error)
    ];
    
    if (options.details) {
        parts.push(`\nDetails: ${JSON.stringify(options.details, null, 2)}`);
    }
    
    return parts.join(' ');
}

/**
 * Convert an error to a UserError if it isn't already
 */
export function ensureUserError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred',
  options: ErrorOptions = {}
): UserError {
  if (error instanceof UserError) {
    return error;
  }
  
  const message = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : defaultMessage;
  
  return createUserError(message, {
    ...options,
    cause: error
  });
}

/**
 * Get a category name for an error
 */
export function getErrorCategoryName(category: ErrorCategory): string {
    return category;
}

/**
 * Get an error level name
 */
export function getErrorLevelName(level: ErrorLevel): string {
    return level;
}

/**
 * Get detailed information about an error
 */
export function getErrorDetails(error: unknown): string {
  if (error instanceof UserError) {
    return formatUserError(error);
  }
  
  if (error instanceof Error) {
    return formatErrorDetails(error);
  }
  
  return String(error);
}

/**
 * Format an error category for display
 */
function formatErrorCategory(category: ErrorCategory): string {
  return category;
}

/**
 * Format an error level for display
 */
function formatErrorLevel(level: ErrorLevel): string {
  return level;
} 
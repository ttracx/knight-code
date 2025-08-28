/**
 * Console Error Handling
 * 
 * Provides functions for handling console errors and warnings.
 */

import { ErrorManager, ErrorOptions, ErrorCategory, ErrorLevel } from './types.js';
import { logger } from '../utils/logger.js';

/**
 * Set up console error handling
 */
export function setupConsoleErrorHandling(errorManager: ErrorManager): void {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console.error
  console.error = function(...args: unknown[]): void {
    // Call original console.error
    originalConsoleError.apply(console, args);
    
    // Handle the error
    const error = args[0];
    if (error instanceof Error) {
      errorManager.handleError(error, {
        category: ErrorCategory.APPLICATION,
        level: ErrorLevel.ERROR
      });
    }
  };
  
  // Override console.warn
  console.warn = function(...args: unknown[]): void {
    // Call original console.warn
    originalConsoleWarn.apply(console, args);
    
    // Handle the warning
    const warning = args[0];
    if (warning instanceof Error) {
      errorManager.handleError(warning, {
        category: ErrorCategory.APPLICATION,
        level: ErrorLevel.WARNING
      });
    }
  };
  
  logger.debug('Console error handling set up');
}

/**
 * Extract an error from console arguments
 */
function extractErrorFromArgs(args: any[]): Error | string | null {
  if (args.length === 0) {
    return null;
  }
  
  // Check for Error objects
  for (const arg of args) {
    if (arg instanceof Error) {
      return arg;
    }
  }
  
  // If no Error object found, convert to string
  try {
    const message = args.map(arg => {
      if (typeof arg === 'string') {
        return arg;
      } else if (arg === null || arg === undefined) {
        return String(arg);
      } else {
        try {
          return JSON.stringify(arg);
        } catch (error) {
          return String(arg);
        }
      }
    }).join(' ');
    
    return message || null;
  } catch (error) {
    // If all else fails, return a generic message
    return 'Console error occurred';
  }
} 
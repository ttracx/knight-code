/**
 * Error Handling Types
 * 
 * Type definitions for the error handling system.
 */

/**
 * Error levels
 */
export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
  MAJOR = 'major',
  MINOR = 'minor',
  INFORMATIONAL = 'informational',
  CRITICAL = 'critical'
}

/**
 * Error categories
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  CONNECTION = 'connection',
  CONFIGURATION = 'configuration',
  VALIDATION = 'validation',
  EXECUTION = 'execution',
  AI_SERVICE = 'ai_service',
  FILE_SYSTEM = 'file_system',
  UNKNOWN = 'unknown',
  TIMEOUT = 'timeout',
  API = 'api',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  INITIALIZATION = 'initialization',
  FILE_NOT_FOUND = 'file_not_found',
  FILE_READ = 'file_read',
  FILE_WRITE = 'file_write',
  COMMAND = 'command',
  COMMAND_EXECUTION = 'command_execution',
  APPLICATION = 'application'
}

/**
 * Error options
 */
export interface ErrorOptions {
  category?: ErrorCategory;
  level?: ErrorLevel;
  resolution?: string;
  details?: Record<string, any>;
  cause?: unknown;
}

/**
 * Error manager interface
 */
export interface ErrorManager {
  handleError(error: unknown, options?: ErrorOptions): void;
  handleFatalError(error: unknown, options?: ErrorOptions): never;
  formatError(error: unknown, options?: ErrorOptions): string;
}

/**
 * User error class
 */
export class UserError extends Error {
  category: ErrorCategory;
  level: ErrorLevel;
  resolution?: string;
  details?: Record<string, any>;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = 'UserError';
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.level = options.level || ErrorLevel.ERROR;
    this.resolution = options.resolution;
    this.details = options.details;
  }
} 
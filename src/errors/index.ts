/**
 * Error Handling Module
 * 
 * Provides centralized error handling, tracking, and reporting.
 */

import { logger } from '../utils/logger.js';
import { ErrorLevel, ErrorCategory, ErrorManager, ErrorOptions, UserError } from './types.js';
import { formatErrorForDisplay, createUserError } from './formatter.js';
import { setupConsoleErrorHandling } from './console.js';

/**
 * Implementation of the ErrorManager interface
 */
class ErrorHandlerImpl implements ErrorManager {
    private errorCount: Map<string, number> = new Map();
    private readonly MAX_ERRORS = 100;
    
    /**
     * Handle a fatal error that should terminate the application
     */
    public handleFatalError(error: unknown): never {
        const userError = this.createUserError(error, {
            level: ErrorLevel.CRITICAL,
            category: ErrorCategory.APPLICATION
        });
        
        logger.error('FATAL ERROR:', userError);
        
        // Exit with error code
        process.exit(1);
    }
    
    /**
     * Handle an unhandled promise rejection
     */
    public handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
        const userError = this.createUserError(reason, {
            level: ErrorLevel.MAJOR,
            category: ErrorCategory.APPLICATION,
            details: { promise }
        });
        
        logger.error('Unhandled Promise Rejection:', userError);
    }
    
    /**
     * Handle an uncaught exception
     */
    public handleUncaughtException(error: unknown): void {
        const userError = this.createUserError(error, {
            level: ErrorLevel.CRITICAL,
            category: ErrorCategory.APPLICATION
        });
        
        logger.error('Uncaught Exception:', userError);
    }
    
    /**
     * Handle a general error
     */
    public handleError(error: unknown, options: ErrorOptions = {}): void {
        const category = options.category || ErrorCategory.APPLICATION;
        const level = options.level || ErrorLevel.MINOR;
        
        // Track error count for rate limiting
        const errorKey = `${category}:${level}:${this.getErrorMessage(error)}`;
        const count = (this.errorCount.get(errorKey) || 0) + 1;
        this.errorCount.set(errorKey, count);
        
        // Create user error
        const userError = this.createUserError(error, options);
        
        // Log the error based on level
        switch (level) {
            case ErrorLevel.CRITICAL:
            case ErrorLevel.MAJOR:
                logger.error(`[${category}] ${userError.message}`, userError);
                break;
            case ErrorLevel.MINOR:
                logger.warn(`[${category}] ${userError.message}`, userError);
                break;
            case ErrorLevel.INFORMATIONAL:
                logger.info(`[${category}] ${userError.message}`, userError);
                break;
        }
        
        // Report to telemetry/monitoring if appropriate
        if (level === ErrorLevel.CRITICAL || level === ErrorLevel.MAJOR) {
            this.reportError(userError, options);
        }
    }
    
    /**
     * Format an error object for consistent handling
     */
    public formatError(error: unknown): string {
        return formatErrorForDisplay(error);
    }
    
    /**
     * Create a UserError from any error type
     */
    private createUserError(error: unknown, options: ErrorOptions = {}): UserError {
        const message = this.getErrorMessage(error);
        return createUserError(message, options);
    }
    
    /**
     * Get an error message from any error type
     */
    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        } else if (typeof error === 'string') {
            return error;
        } else {
            try {
                return JSON.stringify(error);
            } catch {
                return String(error);
            }
        }
    }
    
    /**
     * Report an error to monitoring/telemetry systems
     */
    private reportError(error: UserError, options: ErrorOptions = {}): void {
        // We're skipping Sentry SDK as requested
        // In a real implementation, this would send the error to Sentry
        
        // Instead, just log that we would report it
        logger.debug('Would report error to monitoring system:', {
            error: error.message,
            level: options.level,
            category: options.category
        });
    }
}

/**
 * Initialize error handling system
 */
export function initErrorHandling(): ErrorManager {
    logger.debug('Initializing error handling system');
    
    // Create error manager instance
    const errorManager = new ErrorHandlerImpl();
    
    try {
        // Set up console error handling
        setupConsoleErrorHandling(errorManager);
        
        return errorManager;
    } catch (error) {
        logger.error('Failed to initialize error handling system', error);
        
        // Return a basic error manager even if initialization failed
        return errorManager;
    }
}

// Export error types
export * from './types.js'; 
/**
 * Authentication Module
 * 
 * Provides authentication functionality and token management.
 */

import { AuthManager, AUTH_EVENTS } from './manager.js';
import { AuthToken, AuthMethod, AuthState, AuthResult, TokenStorage, OAuthConfig, AuthConfig } from './types.js';
import { createTokenStorage } from './tokens.js';
import { performOAuthFlow, refreshOAuthToken } from './oauth.js';
import { logger } from '../utils/logger.js';

// Default auth configuration
const DEFAULT_AUTH_CONFIG: AuthConfig = {
    preferredMethod: AuthMethod.API_KEY,
    autoRefresh: true,
    tokenRefreshThreshold: 300, // 5 minutes
    maxRetryAttempts: 3
};

// Create and export singleton auth manager
export const authManager = new AuthManager(DEFAULT_AUTH_CONFIG);

/**
 * Initialize the authentication system
 * 
 * @param config Configuration options for authentication
 * @returns The initialized authentication manager
 */
export async function initAuthentication(config: Partial<AuthConfig> = {}): Promise<AuthManager> {
    logger.info('Initializing authentication system');
    
    try {
        // Update auth manager with provided config
        if (config) {
            Object.assign(authManager, config);
        }
        
        // Initialize auth manager
        await authManager.initialize();
        
        logger.info('Authentication system initialized successfully');
        return authManager;
    } catch (error) {
        logger.error('Failed to initialize authentication system', error);
        throw error;
    }
}

/**
 * Create a new authentication manager
 */
export function createAuthManager(config: Partial<AuthConfig> = {}): AuthManager {
    logger.debug('Creating authentication manager');
    return new AuthManager({
        ...DEFAULT_AUTH_CONFIG,
        ...config
    });
}

/**
 * Get the current authentication state
 */
export function getAuthState(manager: AuthManager): AuthState {
    return manager.getState();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(manager: AuthManager): boolean {
    return manager.isAuthenticated();
}

/**
 * Get the current authentication token
 */
export function getAuthToken(manager: AuthManager): AuthToken | null {
    return manager.getToken();
}

/**
 * Get the authorization header value for API requests
 */
export function getAuthHeader(manager: AuthManager): string | null {
    return manager.getAuthorizationHeader();
}

/**
 * Authenticate the user
 */
export async function authenticate(manager: AuthManager, method?: AuthMethod): Promise<AuthResult> {
    return manager.authenticate(method);
}

/**
 * Log out the current user
 */
export async function logout(manager: AuthManager): Promise<void> {
    return manager.logout();
}

/**
 * Initialize authentication
 */
export async function initializeAuth(manager: AuthManager): Promise<void> {
    return manager.initialize();
}

/**
 * Create a token storage instance
 */
export function createAuthTokenStorage(): TokenStorage {
    return createTokenStorage();
}

/**
 * Perform OAuth authentication flow
 */
export async function performAuthFlow(config: OAuthConfig): Promise<AuthToken> {
    const result = await performOAuthFlow(config);
    if (!result.success || !result.token) {
        throw new Error(result.error || 'OAuth flow failed');
    }
    return result.token;
}

/**
 * Refresh an OAuth token
 */
export async function refreshAuthToken(refreshToken: string, config: OAuthConfig): Promise<AuthToken> {
    return refreshOAuthToken(refreshToken, config);
}

// Export types
export type { AuthToken, AuthMethod, AuthState, AuthResult, TokenStorage, OAuthConfig, AuthConfig };

// Export events
export { AUTH_EVENTS }; 
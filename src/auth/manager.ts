/**
 * Authentication Manager
 * 
 * Handles authentication state and token management.
 */

import { EventEmitter } from 'events';
import { AuthToken, AuthMethod, AuthState, AuthResult, TokenStorage, AuthConfig } from './types.js';
import { createTokenStorage } from './tokens.js';
import { performOAuthFlow, refreshOAuthToken } from './oauth.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication events
 */
export const AUTH_EVENTS = {
    STATE_CHANGED: 'auth:state_changed',
    TOKEN_REFRESHED: 'auth:token_refreshed',
    ERROR: 'auth:error'
};

/**
 * Authentication Manager class
 */
export class AuthManager extends EventEmitter {
    private config: AuthConfig;
    private tokenStorage: TokenStorage;
    private state: AuthState;
    private currentToken: AuthToken | null;
    private tokenKey: string;
    private refreshTimeout: NodeJS.Timeout | null;

    public constructor(config: Partial<AuthConfig> = {}) {
        super();
        this.config = config;
        this.tokenStorage = createTokenStorage();
        this.state = AuthState.INITIAL;
        this.currentToken = null;
        this.tokenKey = 'auth_token';
        this.refreshTimeout = null;
    }

    /**
     * Initialize the authentication manager
     */
    public async initialize(): Promise<void> {
        try {
            // Load stored token
            const token = await this.tokenStorage.getToken(this.tokenKey);
            if (token) {
                this.currentToken = token;
                this.setState(AuthState.AUTHENTICATED);
            }
        } catch (error) {
            logger.error('Failed to initialize auth manager', error);
            this.setState(AuthState.FAILED);
        }
    }

    /**
     * Get the current authentication state
     */
    public getState(): AuthState {
        return this.state;
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return this.state === AuthState.AUTHENTICATED && !!this.currentToken;
    }

    /**
     * Get the current token
     */
    public getToken(): AuthToken | null {
        return this.currentToken;
    }

    /**
     * Get authorization header
     */
    public getAuthorizationHeader(): string | null {
        if (!this.currentToken) {
            return null;
        }
        return `Bearer ${this.currentToken.accessToken}`;
    }

    /**
     * Authenticate the user
     */
    public async authenticate(method?: AuthMethod): Promise<AuthResult> {
        try {
            this.setState(AuthState.AUTHENTICATING);
            
            if (method === AuthMethod.API_KEY) {
                return await this.authenticateWithApiKey();
            } else if (method === AuthMethod.OAUTH) {
                return await this.authenticateWithOAuth();
            } else {
                throw new Error('Invalid authentication method');
            }
        } catch (error) {
            this.setState(AuthState.FAILED);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                state: AuthState.FAILED
            };
        }
    }

    /**
     * Authenticate with API key
     */
    private async authenticateWithApiKey(): Promise<AuthResult> {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('API key not found in environment');
        }

        const token: AuthToken = {
            accessToken: apiKey,
            expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
            tokenType: 'Bearer',
            scope: 'api'
        };

        this.currentToken = token;
        await this.tokenStorage.saveToken(this.tokenKey, token);
        this.setState(AuthState.AUTHENTICATED);

        return {
            success: true,
            token,
            state: AuthState.AUTHENTICATED
        };
    }

    /**
     * Authenticate with OAuth
     */
    private async authenticateWithOAuth(): Promise<AuthResult> {
        if (!this.config.oauth) {
            throw new Error('OAuth configuration is required');
        }

        const result = await performOAuthFlow(this.config.oauth);
        if (result.success && result.token) {
            this.currentToken = result.token;
            await this.tokenStorage.saveToken(this.tokenKey, result.token);
            this.setState(AuthState.AUTHENTICATED);
        }

        return result;
    }

    /**
     * Refresh the current token
     */
    private async refreshToken(): Promise<boolean> {
        if (!this.currentToken?.refreshToken || !this.config.oauth) {
            return false;
        }

        try {
            this.setState(AuthState.REFRESHING);
            const newToken = await refreshOAuthToken(this.currentToken.refreshToken, this.config.oauth);
            
            this.currentToken = newToken;
            await this.tokenStorage.saveToken(this.tokenKey, newToken);
            this.setState(AuthState.AUTHENTICATED);
            
            return true;
        } catch (error) {
            logger.error('Failed to refresh token', error);
            this.setState(AuthState.FAILED);
            return false;
        }
    }

    /**
     * Log out the current user
     */
    public async logout(): Promise<void> {
        await this.tokenStorage.deleteToken(this.tokenKey);
        this.currentToken = null;
        this.setState(AuthState.INITIAL);
    }

    /**
     * Set the authentication state
     */
    private setState(newState: AuthState): void {
        const oldState = this.state;
        this.state = newState;
        logger.debug(`Authentication state changed: ${oldState} → ${newState}`);
        this.emit(AUTH_EVENTS.STATE_CHANGED, newState);
    }
} 
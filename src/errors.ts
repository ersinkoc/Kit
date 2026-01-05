/**
 * Base error class for all @oxog/kit errors
 *
 * @example
 * ```typescript
 * throw new KitError('Something went wrong', 'ERR_SOMETHING', { userId: 123 });
 * ```
 */
export class KitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'KitError';
    Error.captureStackTrace?.(this, KitError);
  }

  /**
   * Convert error to JSON representation
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
    };
  }

  /**
   * Check if error is a KitError
   */
  static isKitError(error: unknown): error is KitError {
    return error instanceof KitError;
  }
}

/**
 * Validation error for invalid input data
 *
 * @example
 * ```typescript
 * throw new ValidationError('Invalid email address', { field: 'email', value: 'invalid' });
 * ```
 */
export class ValidationError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

/**
 * Network error for HTTP/WebSocket failures
 *
 * @example
 * ```typescript
 * throw new NetworkError('Request failed', { status: 500, url: '/api/data' });
 * ```
 */
export class NetworkError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

/**
 * Timeout error for operations that exceed time limits
 *
 * @example
 * ```typescript
 * throw new TimeoutError('Request timed out after 5000ms', { timeout: 5000 });
 * ```
 */
export class TimeoutError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'TIMEOUT_ERROR', context);
    this.name = 'TimeoutError';
  }
}

/**
 * Configuration error for missing or invalid configuration
 *
 * @example
 * ```typescript
 * throw new ConfigError('Missing required config: database.url', { key: 'database.url' });
 * ```
 */
export class ConfigError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigError';
  }
}

/**
 * Not found error for missing resources
 *
 * @example
 * ```typescript
 * throw new NotFoundError('User not found', { resource: 'User', id: 123 });
 * ```
 */
export class NotFoundError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'NOT_FOUND_ERROR', context);
    this.name = 'NotFoundError';
  }
}

/**
 * Authentication/authorization error
 *
 * @example
 * ```typescript
 * throw new AuthError('Invalid token', { reason: 'expired' });
 * ```
 */
export class AuthError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'AUTH_ERROR', context);
    this.name = 'AuthError';
  }
}

/**
 * Rate limit error for exceeding rate limits
 *
 * @example
 * ```typescript
 * throw new RateLimitError('Too many requests', { limit: 100, window: '1m' });
 * ```
 */
export class RateLimitError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT_ERROR', context);
    this.name = 'RateLimitError';
  }
}

/**
 * Circuit breaker error for open circuits
 *
 * @example
 * ```typescript
 * throw new CircuitOpenError('Circuit breaker is open', { circuit: 'api', state: 'open' });
 * ```
 */
export class CircuitOpenError extends KitError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'CIRCUIT_OPEN_ERROR', context);
    this.name = 'CircuitOpenError';
  }
}

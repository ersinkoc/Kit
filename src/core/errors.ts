import { events } from './events.js';
import type { MetaData } from '../types.js';
import {
  KitError,
  ValidationError,
  NetworkError,
  TimeoutError,
  ConfigError,
  NotFoundError,
  AuthError,
  RateLimitError,
  CircuitOpenError,
} from '../errors.js';

/**
 * Error handler utilities
 *
 * @example
 * ```typescript
 * import { errors } from '@oxog/kit';
 *
 * // Create custom error
 * throw errors.create('User not found', 'USER_NOT_FOUND', { userId: 123 });
 *
 * // Wrap existing error
 * try {
 *   await apiCall();
 * } catch (err) {
 *   throw errors.wrap(err, { context: 'apiCall' });
 * }
 *
 * // Capture errors
 * const result = errors.capture(() => {
 *   return JSON.parse(invalidJson);
 * });
 *
 * // Listen to errors
 * errors.on('error', (error) => {
 *   console.error('Caught:', error);
 * });
 * ```
 */
export class ErrorHandler {
  /**
   * Create a new KitError
   */
  create(message: string, code: string, context?: MetaData): KitError {
    return new KitError(message, code, context);
  }

  /**
   * Create a ValidationError
   */
  validation(message: string, context?: MetaData): ValidationError {
    return new ValidationError(message, context);
  }

  /**
   * Create a NetworkError
   */
  network(message: string, context?: MetaData): NetworkError {
    return new NetworkError(message, context);
  }

  /**
   * Create a TimeoutError
   */
  timeout(message: string, context?: MetaData): TimeoutError {
    return new TimeoutError(message, context);
  }

  /**
   * Create a ConfigError
   */
  config(message: string, context?: MetaData): ConfigError {
    return new ConfigError(message, context);
  }

  /**
   * Create a NotFoundError
   */
  notFound(message: string, context?: MetaData): NotFoundError {
    return new NotFoundError(message, context);
  }

  /**
   * Create an AuthError
   */
  auth(message: string, context?: MetaData): AuthError {
    return new AuthError(message, context);
  }

  /**
   * Create a RateLimitError
   */
  rateLimit(message: string, context?: MetaData): RateLimitError {
    return new RateLimitError(message, context);
  }

  /**
   * Create a CircuitOpenError
   */
  circuitOpen(message: string, context?: MetaData): CircuitOpenError {
    return new CircuitOpenError(message, context);
  }

  /**
   * Wrap an error with additional context
   */
  wrap(error: unknown, context?: MetaData, message?: string): KitError {
    if (error instanceof KitError) {
      // Merge context if provided
      if (context) {
        return new KitError(
          message || error.message,
          error.code,
          { ...error.context, ...context }
        );
      }
      return error;
    }

    if (error instanceof Error) {
      return new KitError(
        message || error.message,
        'WRAPPED_ERROR',
        { originalError: error.message, ...context }
      );
    }

    return new KitError(
      message || String(error),
      'WRAPPED_ERROR',
      { originalValue: error, ...context }
    );
  }

  /**
   * Check if error is a KitError
   */
  isKitError(error: unknown): error is KitError {
    return error instanceof KitError;
  }

  /**
   * Capture synchronous errors
   */
  capture<T>(fn: () => T): T | never {
    try {
      return fn();
    } catch (error) {
      events.emit('error', error);
      throw error;
    }
  }

  /**
   * Capture asynchronous errors
   */
  async captureAsync<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      events.emit('error', error);
      throw error;
    }
  }

  /**
   * Register error event listener
   */
  on(handler: (error: unknown) => void): void {
    events.on('error', handler);
  }

  /**
   * Remove error event listener
   */
  off(handler: (error: unknown) => void): void {
    events.off('error', handler);
  }
}

/**
 * Create a new error handler instance
 *
 * @example
 * ```typescript
 * const errors = createErrorHandler();
 *
 * try {
 *   await riskyOperation();
 * } catch (err) {
 *   throw errors.wrap(err, { operation: 'riskyOperation' });
 * }
 * ```
 */
export function createErrorHandler(): ErrorHandler {
  return new ErrorHandler();
}

/**
 * Default error handler instance
 */
export const errors = createErrorHandler();

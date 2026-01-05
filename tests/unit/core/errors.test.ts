/**
 * Tests for errors utility module
 */
import { describe, it, expect, vi } from 'vitest';
import { ErrorHandler, createErrorHandler, errors } from '@oxog/kit/core';
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
} from '@oxog/kit';

describe('ErrorHandler', () => {
  describe('createErrorHandler', () => {
    it('creates an ErrorHandler instance', () => {
      const handler = createErrorHandler();
      expect(handler).toBeInstanceOf(ErrorHandler);
    });
  });

  describe('create', () => {
    it('creates a KitError', () => {
      const handler = createErrorHandler();
      const error = handler.create('Test error', 'TEST_ERROR', { key: 'value' });
      expect(error).toBeInstanceOf(KitError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toEqual({ key: 'value' });
    });
  });

  describe('specialized error creators', () => {
    it('creates ValidationError', () => {
      const handler = createErrorHandler();
      const error = handler.validation('Invalid input', { field: 'email' });
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('creates NetworkError', () => {
      const handler = createErrorHandler();
      const error = handler.network('Connection failed', { url: 'http://test.com' });
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('creates TimeoutError', () => {
      const handler = createErrorHandler();
      const error = handler.timeout('Request timed out', { timeout: 5000 });
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.code).toBe('TIMEOUT_ERROR');
    });

    it('creates ConfigError', () => {
      const handler = createErrorHandler();
      const error = handler.config('Missing config', { key: 'DATABASE_URL' });
      expect(error).toBeInstanceOf(ConfigError);
      expect(error.code).toBe('CONFIG_ERROR');
    });

    it('creates NotFoundError', () => {
      const handler = createErrorHandler();
      const error = handler.notFound('Resource not found', { id: 123 });
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.code).toBe('NOT_FOUND_ERROR');
    });

    it('creates AuthError', () => {
      const handler = createErrorHandler();
      const error = handler.auth('Unauthorized', { userId: 123 });
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe('AUTH_ERROR');
    });

    it('creates RateLimitError', () => {
      const handler = createErrorHandler();
      const error = handler.rateLimit('Too many requests', { limit: 100 });
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
    });

    it('creates CircuitOpenError', () => {
      const handler = createErrorHandler();
      const error = handler.circuitOpen('Circuit is open', { service: 'api' });
      expect(error).toBeInstanceOf(CircuitOpenError);
      expect(error.code).toBe('CIRCUIT_OPEN_ERROR');
    });
  });

  describe('wrap', () => {
    it('wraps KitError with additional context', () => {
      const handler = createErrorHandler();
      const original = new KitError('Original', 'ORIGINAL');
      const wrapped = handler.wrap(original, { extra: 'data' });
      expect(wrapped.message).toBe('Original');
      expect(wrapped.code).toBe('ORIGINAL');
      expect(wrapped.context).toEqual({ extra: 'data' });
    });

    it('returns KitError unchanged if no context', () => {
      const handler = createErrorHandler();
      const original = new KitError('Original', 'ORIGINAL');
      const wrapped = handler.wrap(original);
      expect(wrapped).toBe(original);
    });

    it('wraps standard Error', () => {
      const handler = createErrorHandler();
      const original = new Error('Standard error');
      const wrapped = handler.wrap(original, { context: 'test' });
      expect(wrapped).toBeInstanceOf(KitError);
      expect(wrapped.message).toBe('Standard error');
      expect(wrapped.code).toBe('WRAPPED_ERROR');
    });

    it('wraps non-Error values', () => {
      const handler = createErrorHandler();
      const wrapped = handler.wrap('string error', { context: 'test' });
      expect(wrapped).toBeInstanceOf(KitError);
      expect(wrapped.message).toBe('string error');
      expect(wrapped.code).toBe('WRAPPED_ERROR');
    });

    it('uses custom message', () => {
      const handler = createErrorHandler();
      const original = new Error('Original');
      const wrapped = handler.wrap(original, {}, 'Custom message');
      expect(wrapped.message).toBe('Custom message');
    });
  });

  describe('isKitError', () => {
    it('returns true for KitError', () => {
      const handler = createErrorHandler();
      const error = new KitError('Test', 'TEST');
      expect(handler.isKitError(error)).toBe(true);
    });

    it('returns true for subclasses', () => {
      const handler = createErrorHandler();
      const error = new ValidationError('Test');
      expect(handler.isKitError(error)).toBe(true);
    });

    it('returns false for standard Error', () => {
      const handler = createErrorHandler();
      const error = new Error('Test');
      expect(handler.isKitError(error)).toBe(false);
    });

    it('returns false for non-errors', () => {
      const handler = createErrorHandler();
      expect(handler.isKitError('not an error')).toBe(false);
      expect(handler.isKitError(null)).toBe(false);
      expect(handler.isKitError(undefined)).toBe(false);
    });
  });

  describe('capture', () => {
    it('returns function result on success', () => {
      const handler = createErrorHandler();
      const result = handler.capture(() => 'success');
      expect(result).toBe('success');
    });

    it('throws on error', () => {
      const handler = createErrorHandler();
      expect(() => handler.capture(() => {
        throw new Error('test');
      })).toThrow('test');
    });
  });

  describe('captureAsync', () => {
    it('returns promise result on success', async () => {
      const handler = createErrorHandler();
      const result = await handler.captureAsync(async () => 'success');
      expect(result).toBe('success');
    });

    it('throws on async error', async () => {
      const handler = createErrorHandler();
      await expect(handler.captureAsync(async () => {
        throw new Error('async error');
      })).rejects.toThrow('async error');
    });
  });

  describe('event listeners', () => {
    it('on registers error listener', () => {
      const handler = createErrorHandler();
      const listener = vi.fn();
      handler.on(listener);
      // Trigger via capture
      try {
        handler.capture(() => { throw new Error('test'); });
      } catch {
        // Expected
      }
      expect(listener).toHaveBeenCalled();
    });

    it('off removes error listener', () => {
      const handler = createErrorHandler();
      const listener = vi.fn();
      handler.on(listener);
      handler.off(listener);
      try {
        handler.capture(() => { throw new Error('test'); });
      } catch {
        // Expected
      }
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('default instance', () => {
    it('errors is an ErrorHandler instance', () => {
      expect(errors).toBeInstanceOf(ErrorHandler);
    });
  });
});

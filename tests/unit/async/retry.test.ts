import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retry, retryWithResult, retryable, createRetry, Retry } from '../../../src/async/retry';

describe('Retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = retry(fn, { maxAttempts: 3 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const promise = retry(fn, { maxAttempts: 3, initialDelay: 100 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('always fail'));

      const promise = retry(fn, { maxAttempts: 3, initialDelay: 100 });
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      const promise = retry(fn, {
        maxAttempts: 3,
        initialDelay: 100,
        backoffFactor: 2,
        jitter: false,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      // First retry delay should be ~100ms, second ~200ms
      expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1, expect.any(Number));
      expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2, expect.any(Number));
    });
  });

  describe('retryWithResult', () => {
    it('should return success result', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = retryWithResult(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
    });

    it('should return failure result', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      const promise = retryWithResult(fn, { maxAttempts: 2, initialDelay: 100 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('fail');
      expect(result.attempts).toBe(2);
    });

    it('should include totalTime', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = retryWithResult(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.totalTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('retryable', () => {
    it('should create a retryable function', async () => {
      let attempts = 0;
      const fn = async (x: number) => {
        attempts++;
        if (attempts < 2) throw new Error('fail');
        return x * 2;
      };

      const retryableFn = retryable(fn, { maxAttempts: 3, initialDelay: 100 });

      const promise = retryableFn(5);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe(10);
    });
  });

  describe('createRetry', () => {
    it('should create a Retry instance', () => {
      const retrier = createRetry({ maxAttempts: 5 });
      expect(retrier).toBeInstanceOf(Retry);
    });
  });

  describe('Retry class', () => {
    it('should use retryOn filter', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('non-retryable'));

      const retrier = createRetry({
        maxAttempts: 3,
        retryOn: (error) => error.message.includes('retryable'),
      });

      const promise = retrier.executeWithResult(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.success).toBe(false);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should respect maxDelay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      const promise = retry(fn, {
        maxAttempts: 2,
        initialDelay: 10000,
        maxDelay: 100,
        jitter: false,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 100);
    });

    it('should handle timeout', async () => {
      const fn = vi.fn().mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 500));
        return 'success';
      });

      const promise = retry(fn, { maxAttempts: 1, timeout: 100 });
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('timed out');
    });

    it('should convert non-Error throws to Error', async () => {
      const fn = vi.fn().mockRejectedValue('string error');

      const promise = retryWithResult(fn, { maxAttempts: 1 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.error).toBeInstanceOf(Error);
    });
  });
});

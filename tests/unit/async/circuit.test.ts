import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker, createCircuitBreaker } from '../../../src/async/circuit';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createCircuitBreaker', () => {
    it('should create a circuit breaker with default options', () => {
      const breaker = createCircuitBreaker();
      expect(breaker).toBeInstanceOf(CircuitBreaker);
      expect(breaker.getState()).toBe('closed');
    });
  });

  describe('execute', () => {
    it('should execute function when circuit is closed', async () => {
      const breaker = createCircuitBreaker();
      const fn = vi.fn().mockResolvedValue('success');

      const result = await breaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('should open circuit after failure threshold', async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 3 });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(fn);
        } catch {}
      }

      expect(breaker.getState()).toBe('open');
      expect(breaker.isOpen()).toBe(true);
    });

    it('should throw when circuit is open', async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 1 });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}

      await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is open');
    });

    it('should use fallback when circuit is open', async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        fallback: () => 'fallback',
      });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}

      const result = await breaker.execute(fn);
      expect(result).toBe('fallback');
    });
  });

  describe('state transitions', () => {
    it('should transition to half-open after resetTimeout', async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        resetTimeout: 1000,
      });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}
      expect(breaker.isOpen()).toBe(true);

      vi.advanceTimersByTime(1000);

      fn.mockResolvedValue('success');
      await breaker.execute(fn);

      expect(breaker.isHalfOpen()).toBe(true);
    });

    it('should close circuit after success threshold in half-open', async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        successThreshold: 2,
        resetTimeout: 1000,
      });
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      try { await breaker.execute(fn); } catch {}

      vi.advanceTimersByTime(1000);

      await breaker.execute(fn);
      await breaker.execute(fn);

      expect(breaker.isClosed()).toBe(true);
    });

    it('should reopen circuit on failure in half-open', async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        resetTimeout: 1000,
      });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}

      vi.advanceTimersByTime(1000);

      try { await breaker.execute(fn); } catch {}

      expect(breaker.isOpen()).toBe(true);
    });
  });

  describe('manual control', () => {
    it('should manually reset circuit', async () => {
      const breaker = createCircuitBreaker({ failureThreshold: 1 });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}
      expect(breaker.isOpen()).toBe(true);

      breaker.reset();
      expect(breaker.isClosed()).toBe(true);
    });

    it('should manually open circuit', () => {
      const breaker = createCircuitBreaker();
      expect(breaker.isClosed()).toBe(true);

      breaker.open();
      expect(breaker.isOpen()).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return circuit statistics', async () => {
      const breaker = createCircuitBreaker();
      const successFn = vi.fn().mockResolvedValue('success');
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));

      await breaker.execute(successFn);
      await breaker.execute(successFn);
      try { await breaker.execute(failFn); } catch {}

      const stats = breaker.getStats();

      expect(stats.state).toBe('closed');
      expect(stats.totalCalls).toBe(3);
      expect(stats.totalSuccesses).toBe(2);
      expect(stats.totalFailures).toBe(1);
      expect(stats.lastSuccess).toBeDefined();
      expect(stats.lastFailure).toBeDefined();
    });
  });

  describe('callbacks', () => {
    it('should call onStateChange', async () => {
      const onStateChange = vi.fn();
      const breaker = createCircuitBreaker({
        failureThreshold: 1,
        onStateChange,
      });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}

      expect(onStateChange).toHaveBeenCalledWith('closed', 'open');
    });

    it('should call onFailure', async () => {
      const onFailure = vi.fn();
      const breaker = createCircuitBreaker({ onFailure });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}

      expect(onFailure).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const breaker = createCircuitBreaker({ onSuccess });
      const fn = vi.fn().mockResolvedValue('success');

      await breaker.execute(fn);

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('timeout', () => {
    it('should timeout slow functions', async () => {
      const breaker = createCircuitBreaker({ timeout: 100 });
      const fn = vi.fn().mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 500));
        return 'success';
      });

      const promise = breaker.execute(fn);
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('timed out');
    });
  });

  describe('failureWindow', () => {
    it('should clean up old failures', async () => {
      const breaker = createCircuitBreaker({
        failureThreshold: 3,
        failureWindow: 1000,
      });
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      try { await breaker.execute(fn); } catch {}
      try { await breaker.execute(fn); } catch {}

      vi.advanceTimersByTime(1500);

      try { await breaker.execute(fn); } catch {}

      // Should still be closed because old failures expired
      expect(breaker.isClosed()).toBe(true);
    });
  });
});

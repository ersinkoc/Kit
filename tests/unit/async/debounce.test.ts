import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, debounceAsync, createDebounce } from '../../../src/async/debounce';

describe('Debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should accept number as options', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the function', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should use latest arguments', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced('first');
      debounced('second');
      debounced('third');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('third');
    });

    it('should call on leading edge', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100, leading: true, trailing: false });

      debounced();
      expect(fn).toHaveBeenCalledTimes(1);

      debounced();
      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call on both edges', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100, leading: true, trailing: true });

      debounced('first');
      expect(fn).toHaveBeenCalledWith('first');

      debounced('second');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('second');
    });

    it('should respect maxWait', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100, maxWait: 200 });

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);

      // After 200ms (maxWait), should have been called
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel pending execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });

    it('should flush pending execution', () => {
      const fn = vi.fn().mockReturnValue('result');
      const debounced = debounce(fn, { wait: 100 });

      debounced();
      const result = debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });

    it('should report pending status', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, { wait: 100 });

      expect(debounced.pending()).toBe(false);

      debounced();
      expect(debounced.pending()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(debounced.pending()).toBe(false);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100 });

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should accept number as options', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the function', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100 });

      throttled('arg1', 'arg2');

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should call on leading edge by default', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100 });

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should skip leading edge when disabled', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100, leading: false });

      throttled();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call on trailing edge by default', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100 });

      throttled();
      throttled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should skip trailing edge when disabled', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100, trailing: false });

      throttled();
      throttled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel pending execution', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, { wait: 100, leading: false });

      throttled();
      throttled.cancel();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });

    it('should flush pending execution', () => {
      const fn = vi.fn().mockReturnValue('result');
      const throttled = throttle(fn, { wait: 100, leading: false });

      throttled();
      const result = throttled.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });
  });

  describe('debounceAsync', () => {
    it('should debounce async function calls', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const debounced = debounceAsync(fn, { wait: 100 });

      const promise1 = debounced();
      const promise2 = debounced();
      const promise3 = debounced();

      vi.advanceTimersByTime(100);

      const results = await Promise.all([promise1, promise2, promise3]);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(results).toEqual(['result', 'result', 'result']);
    });

    it('should handle async errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('async fail'));
      const debounced = debounceAsync(fn, { wait: 100 });

      const promise1 = debounced();
      const promise2 = debounced();

      vi.advanceTimersByTime(100);

      await expect(promise1).rejects.toThrow('async fail');
      await expect(promise2).rejects.toThrow('async fail');
    });
  });

  describe('createDebounce', () => {
    it('should return debounce utilities', () => {
      const utils = createDebounce();
      expect(utils.debounce).toBeDefined();
      expect(utils.throttle).toBeDefined();
      expect(utils.debounceAsync).toBeDefined();
    });
  });
});

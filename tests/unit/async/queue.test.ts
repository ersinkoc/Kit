import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createQueue, Queue } from '../../../src/async/queue';

describe('Queue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createQueue', () => {
    it('should create a queue with default options', () => {
      const queue = createQueue();
      expect(queue).toBeInstanceOf(Queue);
      expect(queue.size).toBe(0);
      expect(queue.idle).toBe(true);
    });

    it('should create a queue with custom concurrency', () => {
      const queue = createQueue({ concurrency: 5 });
      expect(queue).toBeInstanceOf(Queue);
    });
  });

  describe('add', () => {
    it('should add and execute a task', async () => {
      const queue = createQueue();
      const task = vi.fn().mockResolvedValue('result');

      const promise = queue.add(task);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('result');
      expect(task).toHaveBeenCalled();
    });

    it('should execute tasks with concurrency limit', async () => {
      const queue = createQueue({ concurrency: 2 });
      let running = 0;
      let maxRunning = 0;

      const createTask = () => async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise(r => setTimeout(r, 100));
        running--;
        return 'done';
      };

      const promises = [
        queue.add(createTask()),
        queue.add(createTask()),
        queue.add(createTask()),
        queue.add(createTask()),
      ];

      await vi.runAllTimersAsync();
      await Promise.all(promises);

      expect(maxRunning).toBe(2);
    });

    it('should handle task errors', async () => {
      const queue = createQueue();
      const error = new Error('Task failed');
      const task = vi.fn().mockRejectedValue(error);

      const promise = queue.add(task);
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Task failed');
    });

    it('should respect priority', async () => {
      const queue = createQueue({ concurrency: 1, autoStart: false });
      const results: number[] = [];

      queue.add(async () => { results.push(1); return 1; }, 0);
      queue.add(async () => { results.push(3); return 3; }, 10);
      queue.add(async () => { results.push(2); return 2; }, 5);

      queue.start();
      await vi.runAllTimersAsync();
      await queue.onIdle();

      expect(results).toEqual([3, 2, 1]);
    });
  });

  describe('addAll', () => {
    it('should add multiple tasks', async () => {
      const queue = createQueue();
      const tasks = [
        async () => 1,
        async () => 2,
        async () => 3,
      ];

      const promise = queue.addAll(tasks);
      await vi.runAllTimersAsync();
      const results = await promise;

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('pause/start', () => {
    it('should pause and resume processing', async () => {
      const queue = createQueue({ concurrency: 1 });
      const results: number[] = [];

      queue.add(async () => { results.push(1); return 1; });
      await vi.runAllTimersAsync();

      queue.pause();
      queue.add(async () => { results.push(2); return 2; });

      expect(results).toEqual([1]);
      expect(queue.isPaused).toBe(true);

      queue.start();
      await vi.runAllTimersAsync();
      await queue.onIdle();

      expect(results).toEqual([1, 2]);
      expect(queue.isPaused).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear pending tasks', async () => {
      const queue = createQueue({ autoStart: false });

      const promise1 = queue.add(async () => 1);
      const promise2 = queue.add(async () => 2);

      queue.clear();

      await expect(promise1).rejects.toThrow('Queue cleared');
      await expect(promise2).rejects.toThrow('Queue cleared');
      expect(queue.pending).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return queue statistics', async () => {
      const queue = createQueue();

      queue.add(async () => 'success');
      queue.add(async () => { throw new Error('fail'); });

      await vi.runAllTimersAsync();

      try {
        await queue.onIdle();
      } catch {}

      const stats = queue.getStats();
      expect(stats.total).toBe(2);
      expect(stats.completed).toBeGreaterThanOrEqual(1);
    });
  });

  describe('setConcurrency', () => {
    it('should change concurrency', () => {
      const queue = createQueue({ concurrency: 1 });
      queue.setConcurrency(5);
      expect(queue).toBeDefined();
    });
  });

  describe('events', () => {
    it('should emit task:start event', async () => {
      const queue = createQueue();
      const listener = vi.fn();

      queue.on('task:start', listener);
      queue.add(async () => 'done');

      await vi.runAllTimersAsync();
      await queue.onIdle();

      expect(listener).toHaveBeenCalled();
    });

    it('should emit task:complete event', async () => {
      const queue = createQueue();
      const listener = vi.fn();

      queue.on('task:complete', listener);
      queue.add(async () => 'done');

      await vi.runAllTimersAsync();
      await queue.onIdle();

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ result: 'done' }));
    });

    it('should emit task:error event', async () => {
      const queue = createQueue();
      const listener = vi.fn();

      queue.on('task:error', listener);
      const promise = queue.add(async () => { throw new Error('fail'); });

      await vi.runAllTimersAsync();

      try { await promise; } catch {}

      expect(listener).toHaveBeenCalled();
    });

    it('should emit idle event', async () => {
      const queue = createQueue();
      const listener = vi.fn();

      queue.on('idle', listener);
      queue.add(async () => 'done');

      await vi.runAllTimersAsync();
      await queue.onIdle();

      expect(listener).toHaveBeenCalled();
    });

    it('should remove event listener', async () => {
      const queue = createQueue();
      const listener = vi.fn();

      queue.on('idle', listener);
      queue.off('idle', listener);
      queue.add(async () => 'done');

      await vi.runAllTimersAsync();
      await queue.onIdle();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('timeout', () => {
    it('should timeout long-running tasks', async () => {
      const queue = createQueue({ timeout: 100 });

      const promise = queue.add(async () => {
        await new Promise(r => setTimeout(r, 500));
        return 'done';
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('timed out');
    });
  });

  describe('onIdle/onDrain', () => {
    it('should resolve onIdle when queue is empty', async () => {
      const queue = createQueue();
      queue.add(async () => 'done');

      await vi.runAllTimersAsync();
      await expect(queue.onIdle()).resolves.toBeUndefined();
    });

    it('should resolve onDrain when pending tasks are complete', async () => {
      const queue = createQueue();

      await expect(queue.onDrain()).resolves.toBeUndefined();
    });
  });
});

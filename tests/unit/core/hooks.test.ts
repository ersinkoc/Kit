/**
 * Tests for hooks utility module
 */
import { describe, it, expect, vi } from 'vitest';
import { Hooks, createHooks, hooks } from '@oxog/kit/core';

describe('Hooks', () => {
  describe('createHooks', () => {
    it('creates a Hooks instance', () => {
      const h = createHooks();
      expect(h).toBeInstanceOf(Hooks);
    });
  });

  describe('on/trigger', () => {
    it('registers and triggers handlers', async () => {
      const h = createHooks();
      const handler = vi.fn();
      h.on('init', handler);
      await h.trigger('init');
      expect(handler).toHaveBeenCalled();
    });

    it('passes context to handler', async () => {
      const h = createHooks();
      const handler = vi.fn();
      h.on('request', handler);
      await h.trigger('request', { id: 123 });
      expect(handler).toHaveBeenCalledWith({ id: 123 });
    });

    it('triggers multiple handlers in order', async () => {
      const h = createHooks();
      const order: number[] = [];
      h.on('init', () => { order.push(1); });
      h.on('init', () => { order.push(2); });
      h.on('init', () => { order.push(3); });
      await h.trigger('init');
      expect(order).toEqual([1, 2, 3]);
    });

    it('handles async handlers', async () => {
      const h = createHooks();
      const handler = vi.fn().mockResolvedValue(undefined);
      h.on('async', handler);
      await h.trigger('async');
      expect(handler).toHaveBeenCalled();
    });

    it('does nothing for missing hooks', async () => {
      const h = createHooks();
      await expect(h.trigger('missing')).resolves.toBeUndefined();
    });
  });

  describe('off', () => {
    it('removes specific handler', async () => {
      const h = createHooks();
      const handler = vi.fn();
      h.on('test', handler);
      h.off('test', handler);
      await h.trigger('test');
      expect(handler).not.toHaveBeenCalled();
    });

    it('removes all handlers for hook', async () => {
      const h = createHooks();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      h.on('test', handler1);
      h.on('test', handler2);
      h.off('test');
      await h.trigger('test');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('does nothing for missing hook', () => {
      const h = createHooks();
      expect(() => h.off('missing')).not.toThrow();
    });

    it('does nothing for missing handler', () => {
      const h = createHooks();
      const handler = vi.fn();
      h.on('test', vi.fn());
      expect(() => h.off('test', handler)).not.toThrow();
    });
  });

  describe('removeAll', () => {
    it('removes all handlers for specific hook', async () => {
      const h = createHooks();
      h.on('hook1', vi.fn());
      h.on('hook2', vi.fn());
      h.removeAll('hook1');
      expect(h.has('hook1')).toBe(false);
      expect(h.has('hook2')).toBe(true);
    });

    it('removes all hooks when no name specified', async () => {
      const h = createHooks();
      h.on('hook1', vi.fn());
      h.on('hook2', vi.fn());
      h.removeAll();
      expect(h.getHooks()).toEqual([]);
    });
  });

  describe('has', () => {
    it('returns true if hook has handlers', () => {
      const h = createHooks();
      h.on('test', vi.fn());
      expect(h.has('test')).toBe(true);
    });

    it('returns false if hook has no handlers', () => {
      const h = createHooks();
      expect(h.has('test')).toBe(false);
    });

    it('returns false after removing all handlers', () => {
      const h = createHooks();
      const handler = vi.fn();
      h.on('test', handler);
      h.off('test', handler);
      expect(h.has('test')).toBe(false);
    });
  });

  describe('getHooks', () => {
    it('returns array of hook names', () => {
      const h = createHooks();
      h.on('init', vi.fn());
      h.on('start', vi.fn());
      h.on('stop', vi.fn());
      expect(h.getHooks()).toContain('init');
      expect(h.getHooks()).toContain('start');
      expect(h.getHooks()).toContain('stop');
    });

    it('returns empty array when no hooks', () => {
      const h = createHooks();
      expect(h.getHooks()).toEqual([]);
    });
  });

  describe('getHandlers', () => {
    it('returns handlers for hook', () => {
      const h = createHooks();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      h.on('test', handler1);
      h.on('test', handler2);
      expect(h.getHandlers('test')).toEqual([handler1, handler2]);
    });

    it('returns empty array for missing hook', () => {
      const h = createHooks();
      expect(h.getHandlers('missing')).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('triggers error hook on handler error', async () => {
      const h = createHooks();
      const errorHandler = vi.fn();
      h.on('error', errorHandler);
      h.on('test', () => {
        throw new Error('test error');
      });
      await expect(h.trigger('test')).rejects.toThrow('test error');
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ hook: 'test' })
      );
    });

    it('does not recurse for error hook errors', async () => {
      const h = createHooks();
      h.on('error', () => {
        throw new Error('error handler error');
      });
      await expect(h.trigger('error', { error: new Error('original') }))
        .rejects.toThrow('error handler error');
    });
  });

  describe('lifecycle hooks', () => {
    it('supports standard lifecycle hooks', async () => {
      const h = createHooks();
      const handlers = {
        init: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        shutdown: vi.fn(),
      };
      h.on('init', handlers.init);
      h.on('start', handlers.start);
      h.on('stop', handlers.stop);
      h.on('shutdown', handlers.shutdown);

      await h.trigger('init');
      await h.trigger('start');
      await h.trigger('stop');
      await h.trigger('shutdown');

      expect(handlers.init).toHaveBeenCalled();
      expect(handlers.start).toHaveBeenCalled();
      expect(handlers.stop).toHaveBeenCalled();
      expect(handlers.shutdown).toHaveBeenCalled();
    });

    it('supports request hooks', async () => {
      const h = createHooks();
      const beforeHandler = vi.fn();
      const afterHandler = vi.fn();
      h.on('request:before', beforeHandler);
      h.on('request:after', afterHandler);

      await h.trigger('request:before', { method: 'GET' });
      await h.trigger('request:after', { status: 200 });

      expect(beforeHandler).toHaveBeenCalledWith({ method: 'GET' });
      expect(afterHandler).toHaveBeenCalledWith({ status: 200 });
    });
  });

  describe('default instance', () => {
    it('hooks is a Hooks instance', () => {
      expect(hooks).toBeInstanceOf(Hooks);
    });
  });
});

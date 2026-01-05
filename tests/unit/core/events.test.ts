/**
 * Tests for events utility module
 */
import { describe, it, expect, vi } from 'vitest';
import { Emitter, createEmitter, events } from '@oxog/kit/core';

describe('Emitter', () => {
  describe('createEmitter', () => {
    it('creates an Emitter instance', () => {
      const emitter = createEmitter();
      expect(emitter).toBeInstanceOf(Emitter);
    });

    it('accepts options', () => {
      const emitter = createEmitter({ maxListeners: 50 });
      expect(emitter.getMaxListeners()).toBe(50);
    });
  });

  describe('on/emit', () => {
    it('registers and triggers listeners', () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.emit('test', 'arg1', 'arg2');
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('supports multiple listeners', () => {
      const emitter = createEmitter();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      emitter.on('test', handler1);
      emitter.on('test', handler2);
      emitter.emit('test');
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('returns true if listeners exist', () => {
      const emitter = createEmitter();
      emitter.on('test', () => {});
      expect(emitter.emit('test')).toBe(true);
    });

    it('returns false if no listeners', () => {
      const emitter = createEmitter();
      expect(emitter.emit('test')).toBe(false);
    });

    it('supports chaining', () => {
      const emitter = createEmitter();
      const result = emitter.on('test', () => {}).on('test2', () => {});
      expect(result).toBe(emitter);
    });
  });

  describe('once', () => {
    it('triggers only once', () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.once('test', handler);
      emitter.emit('test');
      emitter.emit('test');
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('removes specific listener', () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.on('test', handler);
      emitter.off('test', handler);
      emitter.emit('test');
      expect(handler).not.toHaveBeenCalled();
    });

    it('removes all listeners for event', () => {
      const emitter = createEmitter();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      emitter.on('test', handler1);
      emitter.on('test', handler2);
      emitter.off('test');
      emitter.emit('test');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('removeAllListeners', () => {
    it('removes all listeners for specific event', () => {
      const emitter = createEmitter();
      emitter.on('test1', vi.fn());
      emitter.on('test2', vi.fn());
      emitter.removeAllListeners('test1');
      expect(emitter.listenerCount('test1')).toBe(0);
      expect(emitter.listenerCount('test2')).toBe(1);
    });

    it('removes all listeners when no event specified', () => {
      const emitter = createEmitter();
      emitter.on('test1', vi.fn());
      emitter.on('test2', vi.fn());
      emitter.removeAllListeners();
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('wildcard listeners', () => {
    it('* listener receives all events', () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.on('*', handler);
      emitter.emit('test', 'data');
      expect(handler).toHaveBeenCalledWith('test', 'data');
    });

    it('pattern listener matches events', () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.on('user:*', handler);
      emitter.emit('user:created', { id: 1 });
      emitter.emit('user:deleted', { id: 1 });
      emitter.emit('post:created', { id: 1 });
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('? pattern matches single character', () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.on('user?', handler);
      emitter.emit('user1', 'data');
      emitter.emit('userA', 'data');
      emitter.emit('user12', 'data'); // Should not match
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('removes wildcard listeners', () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.on('*', handler);
      emitter.off('*', handler);
      emitter.emit('test');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('returns count of direct listeners', () => {
      const emitter = createEmitter();
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      expect(emitter.listenerCount('test')).toBe(2);
    });

    it('includes wildcard listeners', () => {
      const emitter = createEmitter();
      emitter.on('test', () => {});
      emitter.on('*', () => {});
      expect(emitter.listenerCount('test')).toBe(2);
    });

    it('includes pattern listeners', () => {
      const emitter = createEmitter();
      emitter.on('test', () => {});
      emitter.on('te*', () => {});
      expect(emitter.listenerCount('test')).toBe(2);
    });
  });

  describe('eventNames', () => {
    it('returns array of event names', () => {
      const emitter = createEmitter();
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});
      const names = emitter.eventNames();
      expect(names).toContain('event1');
      expect(names).toContain('event2');
    });

    it('includes * for wildcard listeners', () => {
      const emitter = createEmitter();
      emitter.on('*', () => {});
      expect(emitter.eventNames()).toContain('*');
    });
  });

  describe('setMaxListeners/getMaxListeners', () => {
    it('sets and gets max listeners', () => {
      const emitter = createEmitter();
      emitter.setMaxListeners(25);
      expect(emitter.getMaxListeners()).toBe(25);
    });

    it('warns when exceeding max listeners', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const emitter = createEmitter({ maxListeners: 2 });
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      emitter.on('test', () => {}); // Should trigger warning
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('emits error event on handler exception', () => {
      const emitter = createEmitter();
      const errorHandler = vi.fn();
      emitter.on('error', errorHandler);
      emitter.on('test', () => {
        throw new Error('test error');
      });
      emitter.emit('test');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('emitAsync', () => {
    it('calls handlers', async () => {
      const emitter = createEmitter();
      const handler = vi.fn();
      emitter.on('test', handler);
      await emitter.emitAsync('test', 'data');
      expect(handler).toHaveBeenCalledWith('data');
    });

    it('handles async handlers', async () => {
      const emitter = createEmitter();
      const handler = vi.fn().mockResolvedValue(undefined);
      emitter.on('test', handler);
      await emitter.emitAsync('test');
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('default instance', () => {
    it('events is an Emitter instance', () => {
      expect(events).toBeInstanceOf(Emitter);
    });
  });
});

/**
 * Tests for context utility module
 */
import { describe, it, expect, vi } from 'vitest';
import { Context, createContext, context } from '@oxog/kit/core';

describe('Context', () => {
  describe('createContext', () => {
    it('creates a Context instance', () => {
      const ctx = createContext();
      expect(ctx).toBeInstanceOf(Context);
    });
  });

  describe('run/get', () => {
    it('stores and retrieves values', () => {
      const ctx = createContext();
      let retrievedValue: string | undefined;
      ctx.run({ key: 'value' }, () => {
        retrievedValue = ctx.get<string>('key');
      });
      expect(retrievedValue).toBe('value');
    });

    it('isolates context between runs', () => {
      const ctx = createContext();
      const values: (string | undefined)[] = [];

      ctx.run({ key: 'first' }, () => {
        values.push(ctx.get<string>('key'));
      });

      ctx.run({ key: 'second' }, () => {
        values.push(ctx.get<string>('key'));
      });

      expect(values).toEqual(['first', 'second']);
    });

    it('returns undefined outside run', () => {
      const ctx = createContext();
      expect(ctx.get('key')).toBe(undefined);
    });

    it('works with async functions', async () => {
      const ctx = createContext();
      let retrievedValue: string | undefined;

      await new Promise<void>((resolve) => {
        ctx.run({ requestId: 'async-123' }, async () => {
          await new Promise((r) => setTimeout(r, 10));
          retrievedValue = ctx.get<string>('requestId');
          resolve();
        });
      });

      expect(retrievedValue).toBe('async-123');
    });
  });

  describe('set', () => {
    it('sets value in current context', () => {
      const ctx = createContext();
      let retrievedValue: number | undefined;
      ctx.run({ initial: 'value' }, () => {
        ctx.set('count', 42);
        retrievedValue = ctx.get<number>('count');
      });
      expect(retrievedValue).toBe(42);
    });

    it('does nothing outside context', () => {
      const ctx = createContext();
      // Should not throw
      ctx.set('key', 'value');
      expect(ctx.get('key')).toBe(undefined);
    });
  });

  describe('getStore', () => {
    it('returns entire store', () => {
      const ctx = createContext();
      let store: Record<string, unknown> | undefined;
      ctx.run({ a: 1, b: 2 }, () => {
        store = ctx.getStore();
      });
      expect(store).toEqual({ a: 1, b: 2 });
    });

    it('returns undefined outside context', () => {
      const ctx = createContext();
      expect(ctx.getStore()).toBe(undefined);
    });
  });

  describe('with', () => {
    it('merges values with existing context', () => {
      const ctx = createContext();
      let innerStore: Record<string, unknown> | undefined;

      ctx.run({ a: 1 }, () => {
        ctx.with({ b: 2 }, () => {
          innerStore = ctx.getStore();
        });
      });

      expect(innerStore).toEqual({ a: 1, b: 2 });
    });

    it('creates new context if none exists', () => {
      const ctx = createContext();
      let store: Record<string, unknown> | undefined;

      ctx.with({ key: 'value' }, () => {
        store = ctx.getStore();
      });

      expect(store).toEqual({ key: 'value' });
    });

    it('overrides existing values', () => {
      const ctx = createContext();
      let value: string | undefined;

      ctx.run({ key: 'original' }, () => {
        ctx.with({ key: 'overridden' }, () => {
          value = ctx.get<string>('key');
        });
      });

      expect(value).toBe('overridden');
    });
  });

  describe('nested contexts', () => {
    it('supports nested runs with different values', () => {
      const ctx = createContext();
      const values: (string | undefined)[] = [];

      ctx.run({ level: 'outer' }, () => {
        values.push(ctx.get<string>('level'));
        ctx.run({ level: 'inner' }, () => {
          values.push(ctx.get<string>('level'));
        });
        values.push(ctx.get<string>('level'));
      });

      expect(values).toEqual(['outer', 'inner', 'outer']);
    });
  });

  describe('typed values', () => {
    it('preserves types', () => {
      const ctx = createContext();
      interface User {
        id: number;
        name: string;
      }

      let user: User | undefined;
      ctx.run({ user: { id: 1, name: 'John' } }, () => {
        user = ctx.get<User>('user');
      });

      expect(user?.id).toBe(1);
      expect(user?.name).toBe('John');
    });
  });

  describe('default instance', () => {
    it('context is a Context instance', () => {
      expect(context).toBeInstanceOf(Context);
    });
  });
});

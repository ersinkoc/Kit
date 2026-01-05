/**
 * Tests for data/cache module
 * 100% coverage target
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cache, createCache } from '@oxog/kit/data';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>();
  });

  afterEach(() => {
    cache.destroy();
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should update existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    it('should set value with custom TTL', () => {
      const shortTTLCache = new Cache<string>({ defaultTTL: 100 });
      shortTTLCache.set('key1', 'value1', { ttl: 50 });
      expect(shortTTLCache.get('key1')).toBe('value1');
      shortTTLCache.destroy();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entry after TTL', async () => {
      const shortCache = new Cache<string>({ defaultTTL: 50 });
      shortCache.set('key1', 'value1');
      expect(shortCache.get('key1')).toBe('value1');

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(shortCache.get('key1')).toBeUndefined();

      shortCache.destroy();
    });

    it('should support per-entry TTL override', async () => {
      const cache = new Cache<string>({ defaultTTL: 1000 });
      cache.set('key1', 'value1', { ttl: 50 });

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(cache.get('key1')).toBeUndefined();

      cache.destroy();
    });

    it('should not expire entry with TTL of 0', async () => {
      const cache = new Cache<string>({ defaultTTL: 0 });
      cache.set('key1', 'value1');

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(cache.get('key1')).toBe('value1');

      cache.destroy();
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      const shortCache = new Cache<string>({ defaultTTL: 50 });
      shortCache.set('key1', 'value1');

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(shortCache.has('key1')).toBe(false);

      shortCache.destroy();
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size).toBe(3);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(cache.size).toBe(0);
      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);
      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);
      cache.delete('key1');
      expect(cache.size).toBe(1);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const keys = cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should not include expired keys', async () => {
      const shortCache = new Cache<string>({ defaultTTL: 50 });
      shortCache.set('key1', 'value1');
      shortCache.set('key2', 'value2');

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(shortCache.keys()).toHaveLength(0);

      shortCache.destroy();
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const values = cache.values();
      expect(values).toHaveLength(3);
      expect(values).toContain('value1');
      expect(values).toContain('value2');
      expect(values).toContain('value3');
    });

    it('should not include expired values', async () => {
      const shortCache = new Cache<string>({ defaultTTL: 50 });
      shortCache.set('key1', 'value1');
      shortCache.set('key2', 'value2');

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(shortCache.values()).toHaveLength(0);

      shortCache.destroy();
    });
  });

  describe('entries', () => {
    it('should return all entries as key-value pairs', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const entries = cache.entries();
      expect(entries).toHaveLength(2);

      const entryMap = new Map(entries);
      expect(entryMap.get('key1')).toBe('value1');
      expect(entryMap.get('key2')).toBe('value2');
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const shortCache = new Cache<string>({ defaultTTL: 50 });
      shortCache.set('key1', 'value1');
      shortCache.set('key2', 'value2');
      shortCache.set('key3', 'value3', { ttl: 100 }); // Longer TTL

      await new Promise(resolve => setTimeout(resolve, 60));

      const removed = shortCache.cleanup();
      expect(removed).toBe(2);
      expect(shortCache.size).toBe(1);
      expect(shortCache.get('key3')).toBe('value3');

      shortCache.destroy();
    });

    it('should return 0 when no expired entries', () => {
      cache.set('key1', 'value1');
      const removed = cache.cleanup();
      expect(removed).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const shortCache = new Cache<string>({ defaultTTL: 50 });
      shortCache.set('key1', 'value1');
      shortCache.set('key2', 'value2');

      const stats = shortCache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.expired).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 60));

      const statsAfter = shortCache.getStats();
      expect(statsAfter.size).toBe(2);
      expect(statsAfter.expired).toBe(2);

      shortCache.destroy();
    });
  });

  describe('maxSize', () => {
    it('should evict oldest entry when at max size', () => {
      const sizeLimitedCache = new Cache<string>({ maxSize: 3 });
      sizeLimitedCache.set('key1', 'value1');
      sizeLimitedCache.set('key2', 'value2');
      sizeLimitedCache.set('key3', 'value3');
      expect(sizeLimitedCache.size).toBe(3);

      // Adding 4th entry should evict key1
      sizeLimitedCache.set('key4', 'value4');
      expect(sizeLimitedCache.size).toBe(3);
      expect(sizeLimitedCache.get('key1')).toBeUndefined();
      expect(sizeLimitedCache.get('key4')).toBe('value4');

      sizeLimitedCache.destroy();
    });

    it('should update existing key without evicting', () => {
      const sizeLimitedCache = new Cache<string>({ maxSize: 2 });
      sizeLimitedCache.set('key1', 'value1');
      sizeLimitedCache.set('key2', 'value2');
      sizeLimitedCache.set('key1', 'value1-updated');

      expect(sizeLimitedCache.size).toBe(2);
      expect(sizeLimitedCache.get('key1')).toBe('value1-updated');
      expect(sizeLimitedCache.get('key2')).toBe('value2');

      sizeLimitedCache.destroy();
    });
  });

  describe('cleanupInterval', () => {
    it('should automatically cleanup expired entries', async () => {
      vi.useFakeTimers();

      const autoCache = new Cache<string>({
        defaultTTL: 1000,
        cleanupInterval: 500
      });

      autoCache.set('key1', 'value1');
      autoCache.set('key2', 'value2');
      expect(autoCache.size).toBe(2);

      // Advance time past expiration
      vi.advanceTimersByTime(1500);

      // Advance to next cleanup interval
      vi.advanceTimersByTime(500);

      expect(autoCache.size).toBe(0);

      autoCache.destroy();
      vi.useRealTimers();
    });
  });

  describe('destroy', () => {
    it('should cleanup resources and clear interval', () => {
      const autoCache = new Cache<string>({
        cleanupInterval: 100
      });

      autoCache.set('key1', 'value1');
      autoCache.destroy();

      expect(autoCache.size).toBe(0);
    });
  });

  describe('complex types', () => {
    it('should store objects', () => {
      type Obj = { foo: string; bar: number };
      const objCache = new Cache<Obj>();

      const obj = { foo: 'test', bar: 42 };
      objCache.set('key1', obj);

      expect(objCache.get('key1')).toEqual(obj);
      objCache.destroy();
    });

    it('should store arrays', () => {
      const arrCache = new Cache<number[]>();

      const arr = [1, 2, 3, 4, 5];
      arrCache.set('key1', arr);

      expect(arrCache.get('key1')).toEqual(arr);
      arrCache.destroy();
    });

    it('should store null values', () => {
      cache.set('key1', null);
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('createCache factory', () => {
    it('should create cache instance', () => {
      const newCache = createCache<number>({ defaultTTL: 1000 });
      expect(newCache).toBeInstanceOf(Cache);

      newCache.set('key', 42);
      expect(newCache.get('key')).toBe(42);

      newCache.destroy();
    });
  });
});

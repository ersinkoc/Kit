/**
 * In-memory cache with TTL (Time To Live) support
 */

/**
 * Cache entry with value and expiration
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Default TTL in milliseconds (0 = no expiration) */
  defaultTTL?: number;
  /** Maximum number of entries */
  maxSize?: number;
  /** Cleanup interval in milliseconds */
  cleanupInterval?: number;
}

/**
 * In-memory cache with TTL support
 *
 * @example
 * ```typescript
 * import { createCache } from '@oxog/kit/data';
 *
 * const cache = createCache({ defaultTTL: 60000 }); // 1 minute TTL
 *
 * cache.set('key1', 'value1');
 * cache.set('key2', 'value2', { ttl: 30000 }); // 30 second TTL
 *
 * cache.get('key1'); // 'value1'
 * cache.has('key2'); // true
 * cache.delete('key1');
 * cache.clear();
 * ```
 */
export class Cache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;
  private maxSize: number;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.defaultTTL ?? 0;
    this.maxSize = options.maxSize ?? Infinity;

    if (options.cleanupInterval && options.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(
        () => this.cleanup(),
        options.cleanupInterval
      );
    }
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T, options: { ttl?: number } = {}): void {
    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const ttl = options.ttl ?? this.defaultTTL;
    this.cache.set(key, {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl : null,
    });
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) return false;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    const result: string[] = [];
    for (const [key] of this.cache) {
      if (this.has(key)) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Get all values in the cache (excluding expired)
   */
  values(): T[] {
    const result: T[] = [];
    for (const [key, entry] of this.cache) {
      if (this.has(key)) {
        result.push(entry.value);
      }
    }
    return result;
  }

  /**
   * Get all entries as key-value pairs
   */
  entries(): [string, T][] {
    const result: [string, T][] = [];
    for (const [key] of this.cache) {
      const value = this.get(key);
      if (value !== undefined) {
        result.push([key, value]);
      }
    }
    return result;
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; expired: number } {
    let expired = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        expired++;
      }
    }

    return { size: this.cache.size, expired };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }
}

/**
 * Create a new cache instance
 */
export function createCache<T = unknown>(
  options?: CacheOptions
): Cache<T> {
  return new Cache<T>(options);
}

/**
 * Default cache instance
 */
export const cache = createCache();

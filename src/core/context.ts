import { AsyncLocalStorage } from 'node:async_hooks';
import type { MetaData } from '../types.js';

/**
 * Async context storage for request-scoped data
 *
 * @example
 * ```typescript
 * import { context } from '@oxog/kit';
 *
 * context.run({ requestId: 'abc-123' }, async () => {
 *   // Anywhere in this async call chain:
 *   const requestId = context.get('requestId'); // 'abc-123'
 * });
 * ```
 */
export class Context {
  private storage = new AsyncLocalStorage<MetaData>();

  /**
   * Run a function with context
   */
  run(store: MetaData, fn: () => Promise<void> | void): void {
    this.storage.run(store, fn);
  }

  /**
   * Get a value from context
   */
  get<T = unknown>(key: string): T | undefined {
    const store = this.storage.getStore();
    return store?.[key] as T | undefined;
  }

  /**
   * Set a value in context
   */
  set<T>(key: string, value: T): void {
    const store = this.storage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  /**
   * Get entire context store
   */
  getStore(): MetaData | undefined {
    return this.storage.getStore();
  }

  /**
   * Merge values and run function
   */
  with(values: MetaData, fn: () => Promise<void> | void): void {
    const store = this.getStore() || {};
    this.run({ ...store, ...values }, fn);
  }

  /**
   * Disable context storage (for testing)
   */
  disable(): void {
    this.storage.disable();
  }
}

/**
 * Create a new context instance
 *
 * @example
 * ```typescript
 * const context = createContext();
 *
 * context.run({ userId: 123 }, async () => {
 *   context.get('userId'); // 123
 * });
 * ```
 */
export function createContext(): Context {
  return new Context();
}

/**
 * Default context instance
 */
export const context = createContext();

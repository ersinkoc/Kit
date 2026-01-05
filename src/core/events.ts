import type { MetaData } from '../types.js';

/**
 * Event handler function type
 */
type EventHandler = (...args: unknown[]) => void;

/**
 * Async event handler function type
 */
type AsyncEventHandler = (...args: unknown[]) => Promise<void> | void;

/**
 * Event emitter options
 */
export interface EmitterOptions {
  /** Maximum number of listeners per event */
  maxListeners?: number;
}

/**
 * Event emitter with wildcard support
 *
 * @example
 * ```typescript
 * const emitter = createEmitter();
 *
 * emitter.on('user:created', (data) => {
 *   console.log('User created:', data);
 * });
 *
 * emitter.on('user:*', (event, data) => {
 *   console.log('User event:', event, data);
 * });
 *
 * emitter.emit('user:created', { id: 1, name: 'John' });
 * ```
 */
export class Emitter {
  private listeners = new Map<string, Set<EventHandler>>();
  private wildcardListeners = new Set<EventHandler>();
  private patternListeners = new Map<string, Set<EventHandler>>();
  private maxListeners: number;
  private listenerCounts = new Map<string, number>();

  constructor(options: EmitterOptions = {}) {
    this.maxListeners = options.maxListeners || 100;
  }

  /**
   * Register an event listener
   */
  on(event: string, handler: EventHandler): this {
    if (event === '*') {
      this.wildcardListeners.add(handler);
      return this;
    }

    if (event.includes('*') || event.includes('?')) {
      if (!this.patternListeners.has(event)) {
        this.patternListeners.set(event, new Set());
      }
      this.patternListeners.get(event)!.add(handler);
    } else {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      const handlers = this.listeners.get(event)!;
      handlers.add(handler);

      // Check max listeners
      const count = handlers.size;
      this.listenerCounts.set(event, count);

      if (count > this.maxListeners) {
        console.warn(
          `Possible memory leak: ${count} listeners registered for event "${event}". ` +
            `Use emitter.setMaxListeners() to increase limit.`
        );
      }
    }

    return this;
  }

  /**
   * Register a one-time event listener
   */
  once(event: string, handler: EventHandler): this {
    const wrappedHandler = (...args: unknown[]) => {
      handler(...args);
      this.off(event, wrappedHandler);
    };
    return this.on(event, wrappedHandler);
  }

  /**
   * Remove an event listener
   */
  off(event: string, handler?: EventHandler): this {
    if (event === '*') {
      if (handler) {
        this.wildcardListeners.delete(handler);
      } else {
        this.wildcardListeners.clear();
      }
      return this;
    }

    if (event.includes('*') || event.includes('?')) {
      if (handler) {
        this.patternListeners.get(event)?.delete(handler);
      } else {
        this.patternListeners.delete(event);
      }
      return this;
    }

    if (handler) {
      this.listeners.get(event)?.delete(handler);
    } else {
      this.listeners.delete(event);
      this.listenerCounts.delete(event);
    }

    return this;
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.listeners.delete(event);
      this.patternListeners.delete(event);
      this.listenerCounts.delete(event);
    } else {
      this.listeners.clear();
      this.patternListeners.clear();
      this.wildcardListeners.clear();
      this.listenerCounts.clear();
    }

    return this;
  }

  /**
   * Emit an event synchronously
   */
  emit(event: string, ...args: unknown[]): boolean {
    let hasListeners = false;

    // Direct listeners
    const handlers = this.listeners.get(event);
    if (handlers && handlers.size > 0) {
      hasListeners = true;
      for (const handler of handlers) {
        try {
          handler(...args);
        } catch (error) {
          this.emit('error', error);
        }
      }
    }

    // Wildcard listeners
    if (this.wildcardListeners.size > 0) {
      hasListeners = true;
      for (const handler of this.wildcardListeners) {
        try {
          handler(event, ...args);
        } catch (error) {
          this.emit('error', error);
        }
      }
    }

    // Pattern listeners
    for (const [pattern, handlers] of this.patternListeners) {
      if (this.matchPattern(pattern, event)) {
        hasListeners = true;
        for (const handler of handlers) {
          try {
            handler(event, ...args);
          } catch (error) {
            this.emit('error', error);
          }
        }
      }
    }

    return hasListeners;
  }

  /**
   * Emit an event and wait for all async handlers
   */
  async emitAsync(event: string, ...args: unknown[]): Promise<void> {
    const checkAndAdd = (result: unknown): void => {
      if (result && (typeof result === 'object') && 'then' in result) {
        // It's a promise-like
        Promise.resolve(result).then();
      }
    };

    // Direct listeners
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        const result = handler(...args);
        checkAndAdd(result);
      }
    }

    // Wildcard listeners
    for (const handler of this.wildcardListeners) {
      const result = handler(event, ...args);
      checkAndAdd(result);
    }

    // Pattern listeners
    for (const [pattern, handlers] of this.patternListeners) {
      if (this.matchPattern(pattern, event)) {
        for (const handler of handlers) {
          const result = handler(event, ...args);
          checkAndAdd(result);
        }
      }
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    let count = this.listenerCounts.get(event) || 0;

    // Add pattern listeners that match
    for (const pattern of this.patternListeners.keys()) {
      if (this.matchPattern(pattern, event)) {
        count += this.patternListeners.get(pattern)!.size;
      }
    }

    // Add wildcard listeners
    count += this.wildcardListeners.size;

    return count;
  }

  /**
   * Get all event names with listeners
   */
  eventNames(): string[] {
    const names = new Set<string>();

    for (const event of this.listeners.keys()) {
      names.add(event);
    }

    for (const pattern of this.patternListeners.keys()) {
      names.add(pattern);
    }

    if (this.wildcardListeners.size > 0) {
      names.add('*');
    }

    return Array.from(names);
  }

  /**
   * Set maximum listeners per event
   */
  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  /**
   * Get maximum listeners per event
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * Match event pattern (supports * and ? wildcards)
   */
  private matchPattern(pattern: string, event: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(event);
  }
}

/**
 * Create a new event emitter
 *
 * @example
 * ```typescript
 * const emitter = createEmitter({ maxListeners: 50 });
 *
 * emitter.on('data', (data) => console.log(data));
 * emitter.emit('data', { message: 'hello' });
 * ```
 */
export function createEmitter(options?: EmitterOptions): Emitter {
  return new Emitter(options);
}

/**
 * Default emitter instance
 */
export const events = createEmitter();

/**
 * Reactive state store with subscription support
 */

type Listener<T> = (value: T) => void;
type Unsubscribe = () => void;

/**
 * Store configuration options
 */
export interface StoreOptions<T> {
  /** Initial state */
  initial?: T;
  /** Persist to localStorage */
  persist?: boolean;
  /** Storage key for persistence */
  storageKey?: string;
}

/**
 * Reactive state store with subscription support
 *
 * @example
 * ```typescript
 * import { createStore } from '@oxog/kit/data';
 *
 * interface State {
 *   count: number;
 *   name: string;
 * }
 *
 * const store = createStore<State>({
 *   initial: { count: 0, name: 'test' }
 * });
 *
 * // Subscribe to changes
 * const unsubscribe = store.subscribe((state) => {
 *   console.log('Count:', state.count);
 * });
 *
 * // Update state
 * store.set({ count: 1 });
 * store.update((state) => ({ count: state.count + 1 }));
 *
 * // Get current state
 * store.get(); // { count: 2, name: 'test' }
 *
 * unsubscribe();
 * ```
 */
export class Store<T extends Record<string, unknown> = Record<string, unknown>> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();
  private persist: boolean;
  private storageKey?: string;
  private batchDepth: number = 0;

  constructor(options: StoreOptions<T> = {}) {
    this.persist = options.persist ?? false;
    this.storageKey = options.storageKey;

    // Load from storage if persisting
    if (this.persist && this.storageKey) {
      const saved = this.loadFromStorage();
      this.state = (saved ?? options.initial ?? {}) as T;
    } else {
      this.state = (options.initial ?? {}) as T;
    }
  }

  /**
   * Get current state
   */
  get(): T {
    return { ...this.state };
  }

  /**
   * Get a specific property from state
   */
  getKey<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }

  /**
   * Set state (merge with existing)
   */
  set(partial: Partial<T>): void {
    this.state = { ...this.state, ...partial };
    // Only notify and save if not batching
    if (this.batchDepth === 0) {
      this.notify();
      this.saveToStorage();
    }
  }

  /**
   * Update state using a function
   */
  update(updater: (state: T) => Partial<T>): void {
    const partial = updater({ ...this.state });
    this.set(partial);
  }

  /**
   * Reset state to initial value
   */
  reset(initial: T): void {
    this.state = { ...initial };
    this.notify();
    this.saveToStorage();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);

    // Call listener immediately with current state
    try {
      listener({ ...this.state });
    } catch (error) {
      console.error('Error in store listener:', error);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Watch a specific property
   */
  watch<K extends keyof T>(
    key: K,
    listener: (value: T[K]) => void
  ): Unsubscribe {
    let lastValue = this.state[key];

    // Call listener immediately with current value
    listener(lastValue);

    const unsubscribe = this.subscribe((state) => {
      if (state[key] !== lastValue) {
        lastValue = state[key];
        listener(state[key]);
      }
    });

    return unsubscribe;
  }

  /**
   * Batch multiple updates (only notify once)
   */
  batch(updates: () => void): void {
    const startDepth = this.batchDepth;
    this.batchDepth++;
    try {
      updates();
    } finally {
      this.batchDepth--;
      // Notify when returning to original batch depth or when completely done
      if (this.batchDepth === startDepth || this.batchDepth === 0) {
        this.notify();
        this.saveToStorage();
      }
    }
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    }
  }

  /**
   * Save state to localStorage
   */
  private saveToStorage(): void {
    if (this.persist && this.storageKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch (error) {
        console.error('Failed to persist store:', error);
      }
    }
  }

  /**
   * Load state from localStorage
   */
  private loadFromStorage(): T | null {
    if (this.persist && this.storageKey && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Failed to load persisted store:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear persisted state
   */
  clearPersistence(): void {
    if (this.persist && this.storageKey && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Get number of subscribers
   */
  get listenerCount(): number {
    return this.listeners.size;
  }
}

/**
 * Create a new store instance
 */
export function createStore<T extends Record<string, unknown>>(
  options?: StoreOptions<T>
): Store<T> {
  return new Store<T>(options);
}

/**
 * Default store instance
 */
export const store = createStore();

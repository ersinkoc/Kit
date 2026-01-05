import { AsyncLocalStorage } from 'node:async_hooks';
import type { MetaData } from './types.js';

/**
 * Plugin interface for module registration
 */
export interface Plugin {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Initialize plugin with kernel */
  init?(kernel: Kernel): Promise<void> | void;
  /** Start plugin */
  start?(): Promise<void> | void;
  /** Stop plugin */
  stop?(): Promise<void> | void;
}

/**
 * Kernel interface
 */
export interface Kernel {
  /** Register a plugin */
  register(name: string, plugin: Plugin): void;
  /** Get a plugin by name */
  get(name: string): Plugin | undefined;
  /** Check if plugin exists */
  has(name: string): boolean;
  /** Initialize all plugins */
  init(): Promise<void>;
  /** Start all plugins */
  start(): Promise<void>;
  /** Stop all plugins */
  stop(): Promise<void>;
  /** Emit an event */
  emit(event: string, ...args: unknown[]): void;
  /** Listen to events */
  on(event: string, handler: (...args: unknown[]) => void): void;
  /** Remove event listener */
  off(event: string, handler?: (...args: unknown[]) => void): void;
  /** Async context storage */
  context: AsyncLocalStorage<Context>;
}

/**
 * Context for async operations
 */
export interface Context extends MetaData {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
}

/**
 * Event handler type
 */
type EventHandler = (...args: unknown[]) => void;

/**
 * Micro-kernel implementation for plugin-based architecture
 *
 * @example
 * ```typescript
 * const kernel = new Kernel();
 * kernel.register('log', logPlugin);
 * await kernel.init();
 * await kernel.start();
 * ```
 */
export class MicroKernel implements Kernel {
  private plugins = new Map<string, Plugin>();
  private listeners = new Map<string, Set<EventHandler>>();
  private wildcardListeners = new Set<EventHandler>();
  private patternListeners = new Map<string, Set<EventHandler>>();
  private initialized = false;
  private started = false;

  readonly context = new AsyncLocalStorage<Context>();

  /**
   * Register a plugin
   */
  register(name: string, plugin: Plugin): void {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin already registered: ${name}`);
    }
    this.plugins.set(name, plugin);
  }

  /**
   * Get a plugin by name
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if plugin exists
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Initialize all plugins
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize in registration order
    for (const plugin of this.plugins.values()) {
      if (plugin.init) {
        await plugin.init(this);
      }
    }

    this.initialized = true;
    this.emit('kernel:init');
  }

  /**
   * Start all plugins
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    if (!this.initialized) {
      await this.init();
    }

    // Start in registration order
    for (const plugin of this.plugins.values()) {
      if (plugin.start) {
        await plugin.start();
      }
    }

    this.started = true;
    this.emit('kernel:start');
  }

  /**
   * Stop all plugins
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    // Stop in reverse order
    const plugins = Array.from(this.plugins.values()).reverse();
    for (const plugin of plugins) {
      if (plugin.stop) {
        await plugin.stop();
      }
    }

    this.started = false;
    this.emit('kernel:stop');
  }

  /**
   * Emit an event
   */
  emit(event: string, ...args: unknown[]): void {
    // Direct listeners
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args);
        } catch (error) {
          this.emit('error', error);
        }
      }
    }

    // Wildcard listeners
    for (const handler of this.wildcardListeners) {
      try {
        handler(event, ...args);
      } catch (error) {
        this.emit('error', error);
      }
    }

    // Pattern listeners (e.g., 'user:*')
    for (const [pattern, handlers] of this.patternListeners) {
      if (this.matchPattern(pattern, event)) {
        for (const handler of handlers) {
          try {
            handler(event, ...args);
          } catch (error) {
            this.emit('error', error);
          }
        }
      }
    }
  }

  /**
   * Listen to events
   */
  on(event: string, handler: EventHandler): void {
    if (event === '*') {
      this.wildcardListeners.add(handler);
    } else if (event.includes('*')) {
      if (!this.patternListeners.has(event)) {
        this.patternListeners.set(event, new Set());
      }
      this.patternListeners.get(event)!.add(handler);
    } else {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event)!.add(handler);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, handler?: EventHandler): void {
    if (event === '*') {
      if (handler) {
        this.wildcardListeners.delete(handler);
      } else {
        this.wildcardListeners.clear();
      }
    } else if (event.includes('*')) {
      if (handler) {
        this.patternListeners.get(event)?.delete(handler);
      } else {
        this.patternListeners.delete(event);
      }
    } else {
      if (handler) {
        this.listeners.get(event)?.delete(handler);
      } else {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Match event pattern (supports wildcards)
   */
  private matchPattern(pattern: string, event: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(event);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Map<string, Plugin> {
    return new Map(this.plugins);
  }

  /**
   * Check if kernel is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if kernel is started
   */
  isStarted(): boolean {
    return this.started;
  }
}

/**
 * Create a new kernel instance
 *
 * @example
 * ```typescript
 * const kernel = createKernel();
 * kernel.register('log', logPlugin);
 * ```
 */
export function createKernel(): Kernel {
  return new MicroKernel();
}

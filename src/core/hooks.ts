import type { MetaData } from '../types.js';

/**
 * Hook handler type
 */
export type HookHandler = (context?: MetaData) => void | Promise<void>;

/**
 * Lifecycle hook names
 */
export type HookName =
  | 'init'
  | 'start'
  | 'stop'
  | 'error'
  | 'shutdown'
  | 'request:before'
  | 'request:after'
  | string;

/**
 * Lifecycle hooks manager
 *
 * @example
 * ```typescript
 * const hooks = createHooks();
 *
 * hooks.on('init', async () => {
 *   console.log('Initializing...');
 * });
 *
 * hooks.on('request:before', (req) => {
 *   req.startTime = Date.now();
 * });
 *
 * await hooks.trigger('init');
 * ```
 */
export class Hooks {
  private hooks = new Map<HookName, HookHandler[]>();

  /**
   * Register a hook handler
   */
  on(hook: HookName, handler: HookHandler): void {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, []);
    }
    this.hooks.get(hook)!.push(handler);
  }

  /**
   * Remove a hook handler
   */
  off(hook: HookName, handler?: HookHandler): void {
    if (!this.hooks.has(hook)) {
      return;
    }

    if (!handler) {
      this.hooks.delete(hook);
      return;
    }

    const handlers = this.hooks.get(hook)!;
    const index = handlers.indexOf(handler);
    if (index >= 0) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      this.hooks.delete(hook);
    }
  }

  /**
   * Trigger a hook
   */
  async trigger(hook: HookName, context?: MetaData): Promise<void> {
    const handlers = this.hooks.get(hook);
    if (!handlers || handlers.length === 0) {
      return;
    }

    for (const handler of handlers) {
      try {
        await handler(context);
      } catch (error) {
        // Emit error hook if this is not an error hook
        if (hook !== 'error') {
          await this.trigger('error', { hook, error });
        }
        throw error;
      }
    }
  }

  /**
   * Remove all hooks
   */
  removeAll(hook?: HookName): void {
    if (hook) {
      this.hooks.delete(hook);
    } else {
      this.hooks.clear();
    }
  }

  /**
   * Get all registered hooks
   */
  getHooks(): HookName[] {
    return Array.from(this.hooks.keys());
  }

  /**
   * Get handlers for a hook
   */
  getHandlers(hook: HookName): HookHandler[] {
    return this.hooks.get(hook) || [];
  }

  /**
   * Check if a hook has handlers
   */
  has(hook: HookName): boolean {
    const handlers = this.hooks.get(hook);
    return handlers !== undefined && handlers.length > 0;
  }
}

/**
 * Create a new hooks instance
 *
 * @example
 * ```typescript
 * const hooks = createHooks();
 *
 * hooks.on('init', async () => {
 *   console.log('Starting up');
 * });
 *
 * hooks.on('shutdown', async () => {
 *   console.log('Shutting down');
 * });
 * ```
 */
export function createHooks(): Hooks {
  return new Hooks();
}

/**
 * Default hooks instance
 */
export const hooks = createHooks();

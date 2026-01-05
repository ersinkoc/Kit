/**
 * Resource Pool - Reusable resource pooling
 * Zero dependencies, pure TypeScript implementation
 */

export interface PoolOptions<T> {
  /** Factory function to create resources */
  create: () => Promise<T> | T;
  /** Optional destructor for resources */
  destroy?: (resource: T) => Promise<void> | void;
  /** Optional validator to check if resource is still valid */
  validate?: (resource: T) => Promise<boolean> | boolean;
  /** Minimum pool size (default: 0) */
  min?: number;
  /** Maximum pool size (default: 10) */
  max?: number;
  /** Acquire timeout in ms (default: 30000) */
  acquireTimeout?: number;
  /** Idle timeout for resources in ms (default: 30000) */
  idleTimeout?: number;
  /** Whether to test resources on borrow (default: true) */
  testOnBorrow?: boolean;
}

export interface PoolStats {
  size: number;
  available: number;
  borrowed: number;
  pending: number;
  created: number;
  destroyed: number;
}

interface PooledResource<T> {
  resource: T;
  createdAt: number;
  lastUsedAt: number;
}

interface PendingAcquire<T> {
  resolve: (resource: T) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Resource pool for managing reusable resources
 */
export class Pool<T> {
  private available: PooledResource<T>[] = [];
  private borrowed: Set<T> = new Set();
  private pending: PendingAcquire<T>[] = [];
  private stats = { created: 0, destroyed: 0 };
  private idleTimer?: ReturnType<typeof setInterval>;
  private closed: boolean = false;

  private create: () => Promise<T> | T;
  private destroyFn?: (resource: T) => Promise<void> | void;
  private validate?: (resource: T) => Promise<boolean> | boolean;
  private min: number;
  private max: number;
  private acquireTimeout: number;
  private idleTimeout: number;
  private testOnBorrow: boolean;

  constructor(options: PoolOptions<T>) {
    this.create = options.create;
    this.destroyFn = options.destroy;
    this.validate = options.validate;
    this.min = options.min ?? 0;
    this.max = options.max ?? 10;
    this.acquireTimeout = options.acquireTimeout ?? 30000;
    this.idleTimeout = options.idleTimeout ?? 30000;
    this.testOnBorrow = options.testOnBorrow ?? true;

    // Initialize minimum resources
    this.initialize();

    // Start idle cleanup
    if (this.idleTimeout > 0) {
      this.idleTimer = setInterval(() => this.cleanupIdle(), this.idleTimeout / 2);
    }
  }

  /**
   * Acquire a resource from the pool
   */
  async acquire(): Promise<T> {
    if (this.closed) {
      throw new Error('Pool is closed');
    }

    // Try to get from available
    while (this.available.length > 0) {
      const pooled = this.available.shift()!;

      // Validate if needed
      if (this.testOnBorrow && this.validate) {
        try {
          const valid = await this.validate(pooled.resource);
          if (!valid) {
            await this.destroyResource(pooled.resource);
            continue;
          }
        } catch {
          await this.destroyResource(pooled.resource);
          continue;
        }
      }

      pooled.lastUsedAt = Date.now();
      this.borrowed.add(pooled.resource);
      return pooled.resource;
    }

    // Create new if under max
    if (this.size < this.max) {
      const resource = await this.createResource();
      this.borrowed.add(resource);
      return resource;
    }

    // Wait for available resource
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.pending.findIndex(p => p.resolve === resolve);
        if (index !== -1) {
          this.pending.splice(index, 1);
        }
        reject(new Error('Acquire timeout'));
      }, this.acquireTimeout);

      this.pending.push({ resolve, reject, timeoutId });
    });
  }

  /**
   * Release a resource back to the pool
   */
  async release(resource: T): Promise<void> {
    if (!this.borrowed.has(resource)) {
      return; // Not from this pool
    }

    this.borrowed.delete(resource);

    // If pool is closed, destroy resource
    if (this.closed) {
      await this.destroyResource(resource);
      return;
    }

    // Check if there are pending acquires
    if (this.pending.length > 0) {
      const pending = this.pending.shift()!;
      clearTimeout(pending.timeoutId);
      this.borrowed.add(resource);
      pending.resolve(resource);
      return;
    }

    // Return to available pool
    this.available.push({
      resource,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    });
  }

  /**
   * Destroy a borrowed resource
   */
  async destroy(resource: T): Promise<void> {
    this.borrowed.delete(resource);
    await this.destroyResource(resource);
  }

  /**
   * Use a resource with auto-release
   */
  async use<R>(fn: (resource: T) => Promise<R>): Promise<R> {
    const resource = await this.acquire();
    try {
      return await fn(resource);
    } finally {
      await this.release(resource);
    }
  }

  /**
   * Get pool size
   */
  get size(): number {
    return this.available.length + this.borrowed.size;
  }

  /**
   * Get statistics
   */
  getStats(): PoolStats {
    return {
      size: this.size,
      available: this.available.length,
      borrowed: this.borrowed.size,
      pending: this.pending.length,
      created: this.stats.created,
      destroyed: this.stats.destroyed,
    };
  }

  /**
   * Close the pool
   */
  async close(): Promise<void> {
    this.closed = true;

    // Clear idle timer
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = undefined;
    }

    // Reject all pending
    for (const pending of this.pending) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Pool closed'));
    }
    this.pending = [];

    // Destroy all available
    for (const pooled of this.available) {
      await this.destroyResource(pooled.resource);
    }
    this.available = [];

    // Note: borrowed resources will be destroyed when released
  }

  /**
   * Drain the pool (release all available resources)
   */
  async drain(): Promise<void> {
    while (this.available.length > this.min) {
      const pooled = this.available.pop();
      if (pooled) {
        await this.destroyResource(pooled.resource);
      }
    }
  }

  private async initialize(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.min; i++) {
      promises.push(
        (async () => {
          const resource = await this.createResource();
          this.available.push({
            resource,
            createdAt: Date.now(),
            lastUsedAt: Date.now(),
          });
        })()
      );
    }
    await Promise.all(promises);
  }

  private async createResource(): Promise<T> {
    const resource = await this.create();
    this.stats.created++;
    return resource;
  }

  private async destroyResource(resource: T): Promise<void> {
    this.stats.destroyed++;
    if (this.destroyFn) {
      try {
        await this.destroyFn(resource);
      } catch {
        // Ignore destruction errors
      }
    }
  }

  private async cleanupIdle(): Promise<void> {
    const now = Date.now();
    const toRemove: PooledResource<T>[] = [];

    // Keep minimum, remove idle beyond that
    while (this.available.length > this.min) {
      const pooled = this.available[this.available.length - 1];
      if (pooled && now - pooled.lastUsedAt > this.idleTimeout) {
        toRemove.push(this.available.pop()!);
      } else {
        break;
      }
    }

    for (const pooled of toRemove) {
      await this.destroyResource(pooled.resource);
    }
  }
}

/**
 * Create a resource pool
 */
export function createPool<T>(options: PoolOptions<T>): Pool<T> {
  return new Pool<T>(options);
}

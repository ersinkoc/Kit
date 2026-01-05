/**
 * Rate Limiter - Token bucket rate limiting
 * Zero dependencies, pure TypeScript implementation
 */

export interface RateLimitOptions {
  /** Maximum tokens in bucket (default: 10) */
  limit?: number;
  /** Time window in ms (default: 1000) */
  window?: number;
  /** Tokens to add per refill (default: limit) */
  refillAmount?: number;
  /** Whether to queue requests when limited (default: false) */
  queueRequests?: boolean;
  /** Maximum queue size (default: 100) */
  maxQueueSize?: number;
  /** Called when rate limited */
  onRateLimited?: () => void;
}

export interface RateLimitStats {
  tokens: number;
  limit: number;
  queued: number;
  totalAllowed: number;
  totalLimited: number;
}

interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

/**
 * Token bucket rate limiter
 */
export class RateLimiter {
  private tokens: number;
  private limit: number;
  private window: number;
  private refillAmount: number;
  private lastRefill: number;
  private queueRequests: boolean;
  private maxQueueSize: number;
  private onRateLimited?: () => void;
  private queue: QueuedRequest<unknown>[] = [];
  private stats = { totalAllowed: 0, totalLimited: 0 };
  private refillTimer?: ReturnType<typeof setInterval>;

  constructor(options: RateLimitOptions = {}) {
    this.limit = options.limit ?? 10;
    this.window = options.window ?? 1000;
    this.refillAmount = options.refillAmount ?? this.limit;
    this.tokens = this.limit;
    this.lastRefill = Date.now();
    this.queueRequests = options.queueRequests ?? false;
    this.maxQueueSize = options.maxQueueSize ?? 100;
    this.onRateLimited = options.onRateLimited;

    // Start refill timer
    this.refillTimer = setInterval(() => this.refill(), this.window);
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.refill();

    if (this.tokens > 0) {
      this.tokens--;
      this.stats.totalAllowed++;
      return fn();
    }

    // Rate limited
    this.stats.totalLimited++;

    if (this.onRateLimited) {
      try {
        this.onRateLimited();
      } catch {
        // Ignore callback errors
      }
    }

    if (this.queueRequests) {
      return this.enqueue(fn);
    }

    throw new Error('Rate limit exceeded');
  }

  /**
   * Check if an operation would be allowed (without consuming a token)
   */
  canExecute(): boolean {
    this.refill();
    return this.tokens > 0;
  }

  /**
   * Try to acquire a token (returns false if rate limited)
   */
  tryAcquire(): boolean {
    this.refill();

    if (this.tokens > 0) {
      this.tokens--;
      this.stats.totalAllowed++;
      return true;
    }

    this.stats.totalLimited++;
    return false;
  }

  /**
   * Wait until a token is available
   */
  async acquire(): Promise<void> {
    if (this.tryAcquire()) {
      return;
    }

    return new Promise(resolve => {
      const check = () => {
        if (this.tryAcquire()) {
          resolve();
        } else {
          setTimeout(check, Math.min(100, this.window / 10));
        }
      };
      setTimeout(check, Math.min(100, this.window / 10));
    });
  }

  /**
   * Get remaining tokens
   */
  getRemaining(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Get time until next refill
   */
  getResetTime(): number {
    const elapsed = Date.now() - this.lastRefill;
    return Math.max(0, this.window - elapsed);
  }

  /**
   * Get statistics
   */
  getStats(): RateLimitStats {
    this.refill();
    return {
      tokens: this.tokens,
      limit: this.limit,
      queued: this.queue.length,
      totalAllowed: this.stats.totalAllowed,
      totalLimited: this.stats.totalLimited,
    };
  }

  /**
   * Reset the rate limiter
   */
  reset(): this {
    this.tokens = this.limit;
    this.lastRefill = Date.now();
    this.processQueue();
    return this;
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    if (this.refillTimer) {
      clearInterval(this.refillTimer);
      this.refillTimer = undefined;
    }

    // Reject all queued requests
    for (const req of this.queue) {
      req.reject(new Error('Rate limiter destroyed'));
    }
    this.queue = [];
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    if (elapsed >= this.window) {
      const refills = Math.floor(elapsed / this.window);
      this.tokens = Math.min(this.limit, this.tokens + refills * this.refillAmount);
      this.lastRefill = now - (elapsed % this.window);
      this.processQueue();
    }
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    if (this.queue.length >= this.maxQueueSize) {
      return Promise.reject(new Error('Rate limit queue full'));
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
    });
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.tokens > 0) {
      const req = this.queue.shift()!;
      this.tokens--;
      this.stats.totalAllowed++;

      req.fn()
        .then(req.resolve)
        .catch(req.reject);
    }
  }
}

/**
 * Create a rate limiter
 */
export function createRateLimiter(options?: RateLimitOptions): RateLimiter {
  return new RateLimiter(options);
}

/**
 * Rate limit decorator for functions
 */
export function rateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: RateLimitOptions
): T {
  const limiter = new RateLimiter(options);
  return ((...args: Parameters<T>) => limiter.execute(() => fn(...args))) as T;
}

/**
 * Default rate limiter instance
 */
export const rateLimiter = createRateLimiter();

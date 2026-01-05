/**
 * Circuit Breaker - Failure handling pattern
 * Zero dependencies, pure TypeScript implementation
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  /** Failure threshold to open circuit (default: 5) */
  failureThreshold?: number;
  /** Success threshold to close circuit in half-open (default: 2) */
  successThreshold?: number;
  /** Time in ms before attempting to close circuit (default: 30000) */
  resetTimeout?: number;
  /** Time window in ms for counting failures (default: 60000) */
  failureWindow?: number;
  /** Timeout per call in ms */
  timeout?: number;
  /** Called on state change */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
  /** Called on failure */
  onFailure?: (error: Error) => void;
  /** Called on success */
  onSuccess?: () => void;
  /** Custom fallback when circuit is open */
  fallback?: <T>() => T | Promise<T>;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  consecutiveSuccesses: number;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  openedAt?: Date;
}

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number[] = [];
  private consecutiveSuccesses: number = 0;
  private openedAt?: number;
  private stats = {
    totalCalls: 0,
    totalFailures: 0,
    totalSuccesses: 0,
    lastFailure: undefined as Date | undefined,
    lastSuccess: undefined as Date | undefined,
  };

  private failureThreshold: number;
  private successThreshold: number;
  private resetTimeout: number;
  private failureWindow: number;
  private timeout?: number;
  private onStateChange?: (from: CircuitState, to: CircuitState) => void;
  private onFailure?: (error: Error) => void;
  private onSuccess?: () => void;
  private fallback?: <T>() => T | Promise<T>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.successThreshold = options.successThreshold ?? 2;
    this.resetTimeout = options.resetTimeout ?? 30000;
    this.failureWindow = options.failureWindow ?? 60000;
    this.timeout = options.timeout;
    this.onStateChange = options.onStateChange;
    this.onFailure = options.onFailure;
    this.onSuccess = options.onSuccess;
    this.fallback = options.fallback;
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.stats.totalCalls++;

    // Check if circuit is open
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('half-open');
      } else {
        return this.handleOpen<T>();
      }
    }

    try {
      let result: T;

      if (this.timeout) {
        result = await this.withTimeout(fn(), this.timeout);
      } else {
        result = await fn();
      }

      this.handleSuccess();
      return result;
    } catch (error) {
      this.handleFailure(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit is open
   */
  isOpen(): boolean {
    return this.state === 'open';
  }

  /**
   * Check if circuit is closed
   */
  isClosed(): boolean {
    return this.state === 'closed';
  }

  /**
   * Check if circuit is half-open
   */
  isHalfOpen(): boolean {
    return this.state === 'half-open';
  }

  /**
   * Get statistics
   */
  getStats(): CircuitBreakerStats {
    this.cleanupOldFailures();
    return {
      state: this.state,
      failures: this.failures.length,
      successes: this.consecutiveSuccesses,
      consecutiveSuccesses: this.consecutiveSuccesses,
      totalCalls: this.stats.totalCalls,
      totalFailures: this.stats.totalFailures,
      totalSuccesses: this.stats.totalSuccesses,
      lastFailure: this.stats.lastFailure,
      lastSuccess: this.stats.lastSuccess,
      openedAt: this.openedAt ? new Date(this.openedAt) : undefined,
    };
  }

  /**
   * Manually reset the circuit
   */
  reset(): this {
    this.transitionTo('closed');
    this.failures = [];
    this.consecutiveSuccesses = 0;
    this.openedAt = undefined;
    return this;
  }

  /**
   * Manually open the circuit
   */
  open(): this {
    this.transitionTo('open');
    this.openedAt = Date.now();
    return this;
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;

      if (newState === 'open') {
        this.openedAt = Date.now();
      } else if (newState === 'closed') {
        this.failures = [];
        this.consecutiveSuccesses = 0;
      }

      if (this.onStateChange) {
        try {
          this.onStateChange(oldState, newState);
        } catch {
          // Ignore callback errors
        }
      }
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.openedAt) return true;
    return Date.now() - this.openedAt >= this.resetTimeout;
  }

  private async handleOpen<T>(): Promise<T> {
    if (this.fallback) {
      return this.fallback<T>();
    }
    throw new Error('Circuit breaker is open');
  }

  private handleSuccess(): void {
    this.stats.totalSuccesses++;
    this.stats.lastSuccess = new Date();
    this.consecutiveSuccesses++;

    if (this.onSuccess) {
      try {
        this.onSuccess();
      } catch {
        // Ignore callback errors
      }
    }

    if (this.state === 'half-open') {
      if (this.consecutiveSuccesses >= this.successThreshold) {
        this.transitionTo('closed');
      }
    }
  }

  private handleFailure(error: Error): void {
    this.stats.totalFailures++;
    this.stats.lastFailure = new Date();
    this.consecutiveSuccesses = 0;
    this.failures.push(Date.now());

    if (this.onFailure) {
      try {
        this.onFailure(error);
      } catch {
        // Ignore callback errors
      }
    }

    this.cleanupOldFailures();

    if (this.state === 'half-open') {
      // Any failure in half-open reopens the circuit
      this.transitionTo('open');
    } else if (this.state === 'closed') {
      if (this.failures.length >= this.failureThreshold) {
        this.transitionTo('open');
      }
    }
  }

  private cleanupOldFailures(): void {
    const cutoff = Date.now() - this.failureWindow;
    this.failures = this.failures.filter(time => time > cutoff);
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);

      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

/**
 * Create a circuit breaker
 */
export function createCircuitBreaker(options?: CircuitBreakerOptions): CircuitBreaker {
  return new CircuitBreaker(options);
}

/**
 * Default circuit breaker instance
 */
export const circuitBreaker = createCircuitBreaker();

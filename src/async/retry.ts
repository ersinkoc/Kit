/**
 * Retry - Exponential backoff retry logic
 * Zero dependencies, pure TypeScript implementation
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in ms (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in ms (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffFactor?: number;
  /** Add random jitter to delay (default: true) */
  jitter?: boolean;
  /** Jitter factor 0-1 (default: 0.1) */
  jitterFactor?: number;
  /** Retry only on specific errors */
  retryOn?: (error: Error) => boolean;
  /** Called on each retry */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  /** Timeout per attempt in ms */
  timeout?: number;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Retry class for reusable retry configuration
 */
export class Retry {
  private options: Required<Omit<RetryOptions, 'retryOn' | 'onRetry' | 'timeout'>> &
    Pick<RetryOptions, 'retryOn' | 'onRetry' | 'timeout'>;

  constructor(options: RetryOptions = {}) {
    this.options = {
      maxAttempts: options.maxAttempts ?? 3,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
      backoffFactor: options.backoffFactor ?? 2,
      jitter: options.jitter ?? true,
      jitterFactor: options.jitterFactor ?? 0.1,
      retryOn: options.retryOn,
      onRetry: options.onRetry,
      timeout: options.timeout,
    };
  }

  /**
   * Execute a function with retries
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const result = await this.executeWithResult(fn);
    if (result.success) {
      return result.result!;
    }
    throw result.error;
  }

  /**
   * Execute with detailed result
   */
  async executeWithResult<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt < this.options.maxAttempts) {
      attempt++;

      try {
        let result: T;

        if (this.options.timeout) {
          result = await this.withTimeout(fn(), this.options.timeout);
        } else {
          result = await fn();
        }

        return {
          success: true,
          result,
          attempts: attempt,
          totalTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if we should retry this error
        if (this.options.retryOn && !this.options.retryOn(lastError)) {
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalTime: Date.now() - startTime,
          };
        }

        // Check if we have more attempts
        if (attempt >= this.options.maxAttempts) {
          break;
        }

        // Calculate delay
        const delay = this.calculateDelay(attempt);

        // Call onRetry callback
        if (this.options.onRetry) {
          try {
            this.options.onRetry(lastError, attempt, delay);
          } catch {
            // Ignore callback errors
          }
        }

        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: attempt,
      totalTime: Date.now() - startTime,
    };
  }

  /**
   * Calculate delay for a given attempt
   */
  private calculateDelay(attempt: number): number {
    // Exponential backoff
    let delay = this.options.initialDelay * Math.pow(this.options.backoffFactor, attempt - 1);

    // Apply jitter
    if (this.options.jitter) {
      const jitterRange = delay * this.options.jitterFactor;
      delay += (Math.random() * 2 - 1) * jitterRange;
    }

    // Clamp to max delay
    return Math.min(Math.max(0, delay), this.options.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
 * Create a retry instance
 */
export function createRetry(options?: RetryOptions): Retry {
  return new Retry(options);
}

/**
 * Execute a function with retries
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return new Retry(options).execute(fn);
}

/**
 * Execute with detailed result
 */
export async function retryWithResult<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<RetryResult<T>> {
  return new Retry(options).executeWithResult(fn);
}

/**
 * Create a retryable version of a function
 */
export function retryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: RetryOptions
): T {
  const retrier = new Retry(options);
  return ((...args: Parameters<T>) => retrier.execute(() => fn(...args))) as T;
}

/**
 * Default retry instance
 */
export const defaultRetry = createRetry();

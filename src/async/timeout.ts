/**
 * Timeout utilities - Async timeout helpers
 * Zero dependencies, pure TypeScript implementation
 */

export class TimeoutError extends Error {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 */
export async function timeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(message ?? `Operation timed out after ${ms}ms`));
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

/**
 * Create a timeout that resolves after a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a timeout that resolves with a value after a delay
 */
export function delayValue<T>(ms: number, value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

/**
 * Create a timeout that rejects after a delay
 */
export function delayReject(ms: number, error?: Error | string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(error instanceof Error ? error : new Error(error ?? 'Delayed rejection'));
    }, ms);
  });
}

/**
 * Race a promise against a timeout
 */
export async function race<T>(
  promise: Promise<T>,
  ms: number,
  fallback?: T | (() => T | Promise<T>)
): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(async () => {
      if (settled) return;
      settled = true;

      if (fallback !== undefined) {
        try {
          const value = typeof fallback === 'function' ? await (fallback as () => T | Promise<T>)() : fallback;
          resolve(value);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new TimeoutError(`Operation timed out after ${ms}ms`));
      }
    }, ms);

    promise
      .then(result => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Wait for a condition to become true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number; message?: string } = {}
): Promise<void> {
  const { timeout: timeoutMs = 5000, interval = 50, message } = options;
  const startTime = Date.now();

  while (true) {
    const result = await condition();
    if (result) {
      return;
    }

    const elapsed = Date.now() - startTime;
    if (elapsed >= timeoutMs) {
      throw new TimeoutError(message ?? `Condition not met within ${timeoutMs}ms`);
    }

    await delay(Math.min(interval, timeoutMs - elapsed));
  }
}

/**
 * Retry with timeout per attempt
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    timeout?: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { attempts = 3, timeout: timeoutMs = 5000, delay: delayMs = 0, onRetry } = options;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await timeout(fn(), timeoutMs);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < attempts) {
        if (onRetry) {
          try {
            onRetry(lastError, attempt);
          } catch {
            // Ignore callback errors
          }
        }
        if (delayMs > 0) {
          await delay(delayMs);
        }
      }
    }
  }

  throw lastError;
}

/**
 * Create a deferred promise
 */
export function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Create a deferred promise with timeout
 */
export function deferredWithTimeout<T>(ms: number): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  cancel: () => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  let settled = false;

  const timer = setTimeout(() => {
    if (!settled) {
      settled = true;
      reject(new TimeoutError(`Deferred timed out after ${ms}ms`));
    }
  }, ms);

  const promise = new Promise<T>((res, rej) => {
    resolve = (value: T) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        res(value);
      }
    };
    reject = (error: Error) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        rej(error);
      }
    };
  });

  const cancel = () => {
    if (!settled) {
      settled = true;
      clearTimeout(timer);
      reject(new Error('Deferred cancelled'));
    }
  };

  return { promise, resolve, reject, cancel };
}

/**
 * Execute function with deadline
 */
export async function deadline<T>(
  fn: () => Promise<T>,
  deadlineTime: Date | number
): Promise<T> {
  const ms = typeof deadlineTime === 'number' ? deadlineTime - Date.now() : deadlineTime.getTime() - Date.now();

  if (ms <= 0) {
    throw new TimeoutError('Deadline has passed');
  }

  return timeout(fn(), ms, 'Deadline exceeded');
}

// Re-export TimeoutError
export { TimeoutError as Timeout };

/**
 * Create timeout utilities instance
 */
export function createTimeout() {
  return {
    timeout,
    delay,
    delayValue,
    delayReject,
    race,
    waitFor,
    retryWithTimeout,
    deferred,
    deferredWithTimeout,
    deadline,
  };
}

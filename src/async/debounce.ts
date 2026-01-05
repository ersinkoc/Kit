/**
 * Debounce and Throttle utilities
 * Zero dependencies, pure TypeScript implementation
 */

export interface DebounceOptions {
  /** Wait time in ms (default: 100) */
  wait?: number;
  /** Call on leading edge (default: false) */
  leading?: boolean;
  /** Call on trailing edge (default: true) */
  trailing?: boolean;
  /** Maximum wait time in ms */
  maxWait?: number;
}

export interface ThrottleOptions {
  /** Wait time in ms (default: 100) */
  wait?: number;
  /** Call on leading edge (default: true) */
  leading?: boolean;
  /** Call on trailing edge (default: true) */
  trailing?: boolean;
}

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
}

export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: DebounceOptions | number = {}
): DebouncedFunction<T> {
  const opts = typeof options === 'number' ? { wait: options } : options;
  const wait = opts.wait ?? 100;
  const leading = opts.leading ?? false;
  const trailing = opts.trailing ?? true;
  const maxWait = opts.maxWait;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let maxTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args) as ReturnType<T>;
    return result;
  }

  function startTimer(pendingFunc: () => void, waitTime: number): ReturnType<typeof setTimeout> {
    return setTimeout(pendingFunc, waitTime);
  }

  function cancelTimer(): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = undefined;
    }
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time;

    // Start max wait timer
    if (maxWait !== undefined) {
      maxTimeoutId = startTimer(maxWaitExpired, maxWait);
    }

    // Invoke on leading edge
    if (leading) {
      return invokeFunc(time);
    }
    return result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    if (maxWait !== undefined) {
      return Math.min(timeWaiting, maxWait - timeSinceLastInvoke);
    }
    return timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): void {
    const time = Date.now();

    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }

    // Restart timer
    timeoutId = startTimer(timerExpired, remainingWait(time));
  }

  function maxWaitExpired(): void {
    const time = Date.now();
    if (shouldInvoke(time) && trailing && lastArgs) {
      invokeFunc(time);
    }
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    cancelTimer();

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    lastThis = undefined;
    return result;
  }

  function cancel(): void {
    cancelTimer();
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = undefined;
    lastThis = undefined;
  }

  function flush(): ReturnType<T> | undefined {
    if (timeoutId === undefined) {
      return result;
    }
    return trailingEdge(Date.now());
  }

  function pending(): boolean {
    return timeoutId !== undefined;
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(time);
      }
      if (maxWait !== undefined) {
        // Handle invocations in a tight loop
        timeoutId = startTimer(timerExpired, wait);
        return invokeFunc(time);
      }
    }

    if (timeoutId === undefined) {
      timeoutId = startTimer(timerExpired, wait);
    }

    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced as DebouncedFunction<T>;
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: ThrottleOptions | number = {}
): ThrottledFunction<T> {
  const opts = typeof options === 'number' ? { wait: options } : options;
  const wait = opts.wait ?? 100;
  const leading = opts.leading ?? true;
  const trailing = opts.trailing ?? true;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T> | undefined;
  let lastInvokeTime = 0;

  function invokeFunc(): ReturnType<T> {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = Date.now();
    result = fn.apply(thisArg, args) as ReturnType<T>;
    return result;
  }

  function startTimer(): void {
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      if (trailing && lastArgs) {
        invokeFunc();
        startTimer();
      }
    }, wait);
  }

  function cancel(): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastThis = undefined;
  }

  function flush(): ReturnType<T> | undefined {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    if (lastArgs) {
      return invokeFunc();
    }
    return result;
  }

  function throttled(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    const remaining = wait - (now - lastInvokeTime);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      if (leading) {
        return invokeFunc();
      }
    }

    if (!timeoutId && trailing) {
      startTimer();
    }

    return result;
  }

  throttled.cancel = cancel;
  throttled.flush = flush;

  return throttled as ThrottledFunction<T>;
}

/**
 * Create an async debounced function
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: DebounceOptions | number = {}
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  const opts = typeof options === 'number' ? { wait: options } : options;
  const wait = opts.wait ?? 100;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let pendingPromise: Promise<Awaited<ReturnType<T>>> | undefined;
  let resolveList: ((value: Awaited<ReturnType<T>>) => void)[] = [];
  let rejectList: ((error: Error) => void)[] = [];

  return async function(this: unknown, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    const thisArg = this;

    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      resolveList.push(resolve);
      rejectList.push(reject);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        timeoutId = undefined;
        const currentResolves = resolveList;
        const currentRejects = rejectList;
        resolveList = [];
        rejectList = [];

        try {
          const result = await fn.apply(thisArg, args) as Awaited<ReturnType<T>>;
          for (const res of currentResolves) {
            res(result);
          }
        } catch (error) {
          for (const rej of currentRejects) {
            rej(error instanceof Error ? error : new Error(String(error)));
          }
        }
      }, wait);
    });
  };
}

// Convenience exports
export const Debounce = { debounce, throttle, debounceAsync };

/**
 * Create debounce utilities instance
 */
export function createDebounce() {
  return { debounce, throttle, debounceAsync };
}

/**
 * Timer utilities for performance measurement
 */

/**
 * Timer class for measuring elapsed time
 *
 * @example
 * ```typescript
 * import { timer } from '@oxog/kit/utils';
 *
 * const t = new timer.Timer();
 * // ... do some work ...
 * const elapsed = t.stop(); // milliseconds
 * ```
 */
export class Timer {
  private startTime: number;
  private endTime: number | null;
  private running: boolean;

  constructor() {
    this.startTime = performance.now();
    this.endTime = null;
    this.running = true;
  }

  /**
   * Stop the timer and return elapsed time
   */
  stop(): number {
    if (!this.running) return this.elapsed();
    this.endTime = performance.now();
    this.running = false;
    return this.elapsed();
  }

  /**
   * Reset the timer
   */
  reset(): void {
    this.startTime = performance.now();
    this.endTime = null;
    this.running = true;
  }

  /**
   * Get elapsed time in milliseconds
   */
  elapsed(): number {
    const end = this.endTime ?? performance.now();
    return end - this.startTime;
  }

  /**
   * Check if timer is running
   */
  isRunning(): boolean {
    return this.running;
  }
}

/**
 * Create a new timer
 *
 * @example
 * ```typescript
 * import { timer } from '@oxog/kit/utils';
 *
 * const t = timer.create();
 * // ... do work ...
 * console.log(t.stop()); // elapsed ms
 * ```
 */
export function create(): Timer {
  return new Timer();
}

/**
 * Measure execution time of a function
 *
 * @example
 * ```typescript
 * import { timer } from '@oxog/kit/utils';
 *
 * const result = timer.time(() => {
 *   // expensive operation
 *   return 42;
 * });
 * // result === { time: number, value: 42 }
 * ```
 */
export function time<T>(fn: () => T): { time: number; value: T } {
  const t = new Timer();
  const value = fn();
  const elapsed = t.stop();
  return { time: elapsed, value };
}

/**
 * Measure execution time of an async function
 *
 * @example
 * ```typescript
 * import { timer } from '@oxog/kit/utils';
 *
 * const result = await timer.timeAsync(async () => {
 *   // async operation
 *   return 42;
 * });
 * // result === { time: number, value: 42 }
 * ```
 */
export async function timeAsync<T>(fn: () => Promise<T>): Promise<{ time: number; value: T }> {
  const t = new Timer();
  const value = await fn();
  const elapsed = t.stop();
  return { time: elapsed, value };
}

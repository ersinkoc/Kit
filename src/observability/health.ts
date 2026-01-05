/**
 * Health check module
 * Liveness, readiness, and dependency health checks
 */

export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded';

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  duration?: number;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface HealthCheckOptions {
  name: string;
  timeout?: number;
  critical?: boolean;
  interval?: number;
}

export interface HealthCheckFn {
  (): Promise<boolean | HealthStatus | HealthCheckResult> | boolean | HealthStatus | HealthCheckResult;
}

export interface HealthReport {
  status: HealthStatus;
  timestamp: number;
  duration: number;
  checks: HealthCheckResult[];
}

export interface HealthCheckerOptions {
  timeout?: number;
  cacheTTL?: number;
}

interface RegisteredCheck {
  name: string;
  fn: HealthCheckFn;
  timeout: number;
  critical: boolean;
  interval?: number;
  lastResult?: HealthCheckResult;
  lastRun?: number;
}

/**
 * Health checker for monitoring application and dependency health
 */
export class HealthChecker {
  private checks: Map<string, RegisteredCheck> = new Map();
  private defaultTimeout: number;
  private cacheTTL: number;
  private cachedReport?: HealthReport;
  private cachedAt?: number;
  private intervalTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor(options: HealthCheckerOptions = {}) {
    this.defaultTimeout = options.timeout ?? 5000;
    this.cacheTTL = options.cacheTTL ?? 0;
  }

  /**
   * Register a health check
   */
  register(options: HealthCheckOptions | string, fn: HealthCheckFn): this {
    const opts = typeof options === 'string' ? { name: options } : options;
    const check: RegisteredCheck = {
      name: opts.name,
      fn,
      timeout: opts.timeout ?? this.defaultTimeout,
      critical: opts.critical ?? true,
      interval: opts.interval,
    };

    this.checks.set(opts.name, check);

    // Set up periodic check if interval specified
    if (opts.interval && opts.interval > 0) {
      this.startPeriodicCheck(opts.name, opts.interval);
    }

    return this;
  }

  /**
   * Unregister a health check
   */
  unregister(name: string): this {
    this.checks.delete(name);
    this.stopPeriodicCheck(name);
    return this;
  }

  /**
   * Run all health checks
   */
  async check(): Promise<HealthReport> {
    // Return cached result if valid
    if (this.cacheTTL > 0 && this.cachedReport && this.cachedAt) {
      if (Date.now() - this.cachedAt < this.cacheTTL) {
        return this.cachedReport;
      }
    }

    const startTime = Date.now();
    const results: HealthCheckResult[] = [];

    // Run all checks in parallel
    const checkPromises = Array.from(this.checks.values()).map((check) => this.runCheck(check));
    const checkResults = await Promise.all(checkPromises);
    results.push(...checkResults);

    // Determine overall status
    let overallStatus: HealthStatus = 'healthy';
    let hasCriticalFailure = false;

    for (const result of results) {
      if (result.status === 'unhealthy') {
        const check = this.checks.get(result.name);
        if (check?.critical) {
          hasCriticalFailure = true;
          break;
        } else {
          // Non-critical unhealthy check means degraded
          overallStatus = 'degraded';
        }
      } else if (result.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }

    if (hasCriticalFailure) {
      overallStatus = 'unhealthy';
    }

    const report: HealthReport = {
      status: overallStatus,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      checks: results,
    };

    // Cache the report
    if (this.cacheTTL > 0) {
      this.cachedReport = report;
      this.cachedAt = Date.now();
    }

    return report;
  }

  /**
   * Run a single check by name
   */
  async checkOne(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      return {
        name,
        status: 'unhealthy',
        message: 'Check not found',
        timestamp: Date.now(),
      };
    }
    return this.runCheck(check);
  }

  /**
   * Get liveness status (is the app running?)
   */
  async isLive(): Promise<boolean> {
    return true; // If we can execute this, we're live
  }

  /**
   * Get readiness status (is the app ready to serve traffic?)
   */
  async isReady(): Promise<boolean> {
    const report = await this.check();
    return report.status !== 'unhealthy';
  }

  /**
   * Get the last result for a check
   */
  getLastResult(name: string): HealthCheckResult | undefined {
    return this.checks.get(name)?.lastResult;
  }

  /**
   * Get all last results
   */
  getLastResults(): Map<string, HealthCheckResult | undefined> {
    const results = new Map<string, HealthCheckResult | undefined>();
    for (const [name, check] of this.checks) {
      results.set(name, check.lastResult);
    }
    return results;
  }

  /**
   * Get registered check names
   */
  getCheckNames(): string[] {
    return Array.from(this.checks.keys());
  }

  /**
   * Clear all checks
   */
  clear(): this {
    for (const name of this.checks.keys()) {
      this.stopPeriodicCheck(name);
    }
    this.checks.clear();
    this.cachedReport = undefined;
    this.cachedAt = undefined;
    return this;
  }

  /**
   * Stop all periodic checks
   */
  stop(): this {
    for (const timer of this.intervalTimers.values()) {
      clearInterval(timer);
    }
    this.intervalTimers.clear();
    return this;
  }

  private async runCheck(check: RegisteredCheck): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Run with timeout
      const result = await this.withTimeout(check.fn(), check.timeout);
      const duration = Date.now() - startTime;

      let checkResult: HealthCheckResult;

      if (typeof result === 'boolean') {
        checkResult = {
          name: check.name,
          status: result ? 'healthy' : 'unhealthy',
          duration,
          timestamp: Date.now(),
        };
      } else if (typeof result === 'string') {
        checkResult = {
          name: check.name,
          status: result as HealthStatus,
          duration,
          timestamp: Date.now(),
        };
      } else {
        checkResult = {
          ...result,
          name: check.name,
          duration: result.duration ?? duration,
          timestamp: result.timestamp ?? Date.now(),
        };
      }

      check.lastResult = checkResult;
      check.lastRun = Date.now();
      return checkResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const checkResult: HealthCheckResult = {
        name: check.name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: Date.now(),
      };
      check.lastResult = checkResult;
      check.lastRun = Date.now();
      return checkResult;
    }
  }

  private async withTimeout<T>(promise: Promise<T> | T, timeout: number): Promise<T> {
    if (!(promise instanceof Promise)) {
      return promise;
    }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Health check timed out after ${timeout}ms`));
      }, timeout);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private startPeriodicCheck(name: string, interval: number): void {
    this.stopPeriodicCheck(name);
    const timer = setInterval(async () => {
      const check = this.checks.get(name);
      if (check) {
        await this.runCheck(check);
      }
    }, interval);
    this.intervalTimers.set(name, timer);
  }

  private stopPeriodicCheck(name: string): void {
    const timer = this.intervalTimers.get(name);
    if (timer) {
      clearInterval(timer);
      this.intervalTimers.delete(name);
    }
  }
}

/**
 * Predefined health checks
 */
export const healthChecks = {
  /**
   * Check if a URL is reachable
   */
  http(
    url: string,
    options: { timeout?: number; expectedStatus?: number } = {}
  ): HealthCheckFn {
    return async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? 5000);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        const expectedStatus = options.expectedStatus ?? 200;
        if (response.status === expectedStatus) {
          return true;
        }
        return {
          name: 'http',
          status: 'unhealthy' as HealthStatus,
          message: `Expected status ${expectedStatus}, got ${response.status}`,
          timestamp: Date.now(),
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
  },

  /**
   * Check TCP connectivity (via HTTP)
   */
  tcp(host: string, port: number, options: { timeout?: number } = {}): HealthCheckFn {
    return async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? 5000);

      try {
        // Use fetch to test TCP connectivity
        const url = `http://${host}:${port}`;
        await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        // Connection refused means the port is reachable but nothing is listening
        // Abort error means timeout
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Connection to ${host}:${port} timed out`);
        }
        throw new Error(`Cannot connect to ${host}:${port}`);
      }
    };
  },

  /**
   * Check memory usage
   */
  memory(options: { maxUsagePercent?: number } = {}): HealthCheckFn {
    const maxUsage = options.maxUsagePercent ?? 90;
    return () => {
      const used = process.memoryUsage();
      const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;

      return {
        name: 'memory',
        status: heapUsedPercent < maxUsage ? 'healthy' : 'unhealthy',
        message: `Heap usage: ${heapUsedPercent.toFixed(1)}%`,
        timestamp: Date.now(),
        details: {
          heapUsed: used.heapUsed,
          heapTotal: used.heapTotal,
          rss: used.rss,
          external: used.external,
          heapUsedPercent,
        },
      };
    };
  },

  /**
   * Check disk space (requires fs access)
   */
  disk(options: { path?: string; minFreePercent?: number } = {}): HealthCheckFn {
    return () => {
      // Note: This is a placeholder - actual disk check requires native bindings
      // In Node.js, you'd typically use a package like 'check-disk-space'
      return {
        name: 'disk',
        status: 'healthy' as HealthStatus,
        message: 'Disk check not implemented (requires native bindings)',
        timestamp: Date.now(),
      };
    };
  },

  /**
   * Custom check with a function
   */
  custom(fn: () => Promise<boolean> | boolean): HealthCheckFn {
    return fn;
  },

  /**
   * Always healthy (for testing)
   */
  alwaysHealthy(): HealthCheckFn {
    return () => true;
  },

  /**
   * Always unhealthy (for testing)
   */
  alwaysUnhealthy(message?: string): HealthCheckFn {
    return () => ({
      name: 'always-unhealthy',
      status: 'unhealthy' as HealthStatus,
      message: message ?? 'Always unhealthy',
      timestamp: Date.now(),
    });
  },
};

/**
 * Create health check middleware response
 */
export function healthResponse(report: HealthReport): {
  status: number;
  body: object;
} {
  const statusCode = report.status === 'healthy' ? 200 : report.status === 'degraded' ? 200 : 503;

  return {
    status: statusCode,
    body: {
      status: report.status,
      timestamp: new Date(report.timestamp).toISOString(),
      duration: `${report.duration}ms`,
      checks: report.checks.map((check) => ({
        name: check.name,
        status: check.status,
        message: check.message,
        duration: check.duration ? `${check.duration}ms` : undefined,
        details: check.details,
      })),
    },
  };
}

// Factory function
export function createHealthChecker(options?: HealthCheckerOptions): HealthChecker {
  return new HealthChecker(options);
}

// Default instance
export const health = createHealthChecker();

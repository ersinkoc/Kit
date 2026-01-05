/**
 * @oxog/kit - Zero-Dependency Standard Library for Node.js
 *
 * A comprehensive, batteries-included toolkit with 50+ utilities,
 * all with zero runtime dependencies.
 *
 * @example
 * ```typescript
 * import { createKit } from '@oxog/kit';
 *
 * const app = createKit({
 *   name: 'my-app',
 *   modules: ['log', 'config', 'http']
 * });
 *
 * await app.start();
 * app.log.info('Application started');
 * ```
 */

// Re-export all error classes
export {
  KitError,
  ValidationError,
  NetworkError,
  TimeoutError,
  ConfigError,
  NotFoundError,
  AuthError,
  RateLimitError,
  CircuitOpenError,
} from './errors.js';

// Re-export all types
export type * from './types.js';

// Re-export kernel
export { MicroKernel, createKernel, type Kernel, type Plugin, type Context } from './kernel.js';

import { createKernel, type Kernel, type Context } from './kernel.js';
import type { LogLevel, MetaData } from './types.js';

/**
 * Kit configuration options
 */
export interface KitOptions {
  /** Application name */
  name: string;
  /** Version */
  version?: string;
  /** Modules to enable (all if not specified) */
  modules?: string[];
  /** Log level */
  logLevel?: LogLevel;
  /** Enable pretty logging */
  prettyLog?: boolean;
  /** Enable timestamps in logs */
  logTimestamp?: boolean;
}

/**
 * Kit instance - main API surface
 */
export interface Kit {
  /** Kernel instance */
  readonly kernel: Kernel;
  /** Kit name */
  readonly name: string;
  /** Kit version */
  readonly version: string;

  // Core modules
  /** Logging module */
  log: import('./core/log.js').Logger;
  /** Configuration module */
  config: import('./core/config.js').Config;
  /** Environment module */
  env: import('./core/env.js').Env;
  /** Error handling module */
  errors: import('./core/errors.js').ErrorHandler;
  /** Event emitter module */
  events: import('./core/events.js').Emitter;
  /** Lifecycle hooks module */
  hooks: import('./core/hooks.js').Hooks;
  /** Async context module */
  context: import('./core/context.js').Context;

  // Network modules
  /** HTTP client module */
  http: import('./network/http.js').HttpClient;
  /** WebSocket client module */
  ws: import('./network/ws.js').WebSocketClient;
  /** SSE client module */
  sse: import('./network/sse.js').SSEClient;

  // Data modules
  /** Cache module */
  cache: import('./data/cache.js').Cache;
  /** Persistent store module */
  store: import('./data/store.js').Store;
  /** Session module */
  session: import('./data/session.js').SessionManager;

  // Validation modules
  /** Schema validation module */
  validate: import('./validation/validate.js').Validator;
  /** Data transformation module */
  transform: import('./validation/transform.js').Transformer;
  /** Input sanitization module */
  sanitize: import('./validation/sanitize.js').Sanitizer;

  // Parsing modules
  /** Multi-format parser module */
  parse: typeof import('./parsing/parse.js');
  /** Data formatting module */
  format: typeof import('./parsing/format.js');

  // Async modules
  /** Job queue module */
  queue: import('./async/queue.js').Queue;
  /** Scheduler module */
  scheduler: import('./async/scheduler.js').Scheduler;
  /** Retry module */
  retry: import('./async/retry.js').Retry;
  /** Rate limiter module */
  rateLimit: import('./async/rateLimit.js').RateLimiter;
  /** Circuit breaker module */
  circuit: import('./async/circuit.js').CircuitBreaker;
  /** Resource pool module */
  pool: import('./async/pool.js').Pool<unknown>;
  /** Timeout module */
  timeout: typeof import('./async/timeout.js').Timeout;
  /** Debounce module */
  debounce: typeof import('./async/debounce.js').Debounce;
  /** Mutex module */
  mutex: import('./async/mutex.js').Mutex;

  // Security modules
  /** Crypto module */
  crypto: import('./security/crypto.js').Crypto;
  /** JWT module */
  jwt: import('./security/jwt.js').JWT;
  /** Password hashing module */
  hash: import('./security/hash.js').PasswordHash;

  // Utility modules
  /** ID generation module */
  id: import('./utils/id.js').IDGenerator;
  /** String utilities module */
  string: typeof import('./utils/string.js');
  /** Array utilities module */
  array: typeof import('./utils/array.js');
  /** Object utilities module */
  object: typeof import('./utils/object.js');
  /** Date utilities module */
  date: typeof import('./utils/date.js');
  /** Math utilities module */
  math: typeof import('./utils/math.js');
  /** Color utilities module */
  color: typeof import('./utils/color.js');
  /** Path utilities module */
  path: typeof import('./utils/path.js');
  /** URL utilities module */
  url: typeof import('./utils/url.js');
  /** MIME type module */
  mime: typeof import('./utils/mime.js');
  /** Size formatting module */
  size: typeof import('./utils/size.js');
  /** Slug module */
  slug: typeof import('./utils/slug.js');
  /** Timer module */
  timer: typeof import('./utils/timer.js');
  /** Diff module */
  diff: typeof import('./utils/diff.js');
  /** Clone module */
  clone: typeof import('./utils/clone.js');
  /** Template module */
  template: typeof import('./utils/template.js');
  /** Random module */
  random: typeof import('./utils/random.js');
  /** RegExp module */
  regexp: typeof import('./utils/regexp.js');
  /** Encoding module */
  encoding: typeof import('./utils/encoding.js');

  // Observability modules
  /** Metrics module */
  metrics: import('./observability/metrics.js').Metrics;
  /** Health check module */
  health: import('./observability/health.js').HealthChecker;
  /** Tracing module */
  trace: import('./observability/trace.js').Tracer;

  // Lifecycle methods
  /** Initialize the kit */
  init(): Promise<void>;
  /** Start the kit */
  start(): Promise<void>;
  /** Stop the kit */
  stop(): Promise<void>;
}

/**
 * Kit implementation class
 */
class KitImplementation implements Kit {
  readonly kernel: Kernel;
  readonly name: string;
  readonly version: string;

  // Module placeholders - will be initialized in constructor
  log!: import('./core/log.js').Logger;
  config!: import('./core/config.js').Config;
  env!: import('./core/env.js').Env;
  errors!: import('./core/errors.js').ErrorHandler;
  events!: import('./core/events.js').Emitter;
  hooks!: import('./core/hooks.js').Hooks;
  context!: import('./core/context.js').Context;
  http!: import('./network/http.js').HttpClient;
  ws!: import('./network/ws.js').WebSocketClient;
  sse!: import('./network/sse.js').SSEClient;
  cache!: import('./data/cache.js').Cache;
  store!: import('./data/store.js').Store;
  session!: import('./data/session.js').SessionManager;
  validate!: import('./validation/validate.js').Validator;
  transform!: import('./validation/transform.js').Transformer;
  sanitize!: import('./validation/sanitize.js').Sanitizer;
  parse!: typeof import('./parsing/parse.js');
  format!: typeof import('./parsing/format.js');
  queue!: import('./async/queue.js').Queue;
  scheduler!: import('./async/scheduler.js').Scheduler;
  retry!: import('./async/retry.js').Retry;
  rateLimit!: import('./async/rateLimit.js').RateLimiter;
  circuit!: import('./async/circuit.js').CircuitBreaker;
  pool!: import('./async/pool.js').Pool<unknown>;
  timeout!: typeof import('./async/timeout.js').Timeout;
  debounce!: typeof import('./async/debounce.js').Debounce;
  mutex!: import('./async/mutex.js').Mutex;
  crypto!: import('./security/crypto.js').Crypto;
  jwt!: import('./security/jwt.js').JWT;
  hash!: import('./security/hash.js').PasswordHash;
  id!: import('./utils/id.js').IDGenerator;
  string!: typeof import('./utils/string.js');
  array!: typeof import('./utils/array.js');
  object!: typeof import('./utils/object.js');
  date!: typeof import('./utils/date.js');
  math!: typeof import('./utils/math.js');
  color!: typeof import('./utils/color.js');
  path!: typeof import('./utils/path.js');
  url!: typeof import('./utils/url.js');
  mime!: typeof import('./utils/mime.js');
  size!: typeof import('./utils/size.js');
  slug!: typeof import('./utils/slug.js');
  timer!: typeof import('./utils/timer.js');
  diff!: typeof import('./utils/diff.js');
  clone!: typeof import('./utils/clone.js');
  template!: typeof import('./utils/template.js');
  random!: typeof import('./utils/random.js');
  regexp!: typeof import('./utils/regexp.js');
  encoding!: typeof import('./utils/encoding.js');
  metrics!: import('./observability/metrics.js').Metrics;
  health!: import('./observability/health.js').HealthChecker;
  trace!: import('./observability/trace.js').Tracer;

  constructor(options: KitOptions) {
    this.name = options.name;
    this.version = options.version || '1.0.0';
    this.kernel = createKernel();

    // Initialize modules (will be implemented as modules are created)
    // For now, we'll create stub implementations
    this.initializeModules(options);
  }

  private async initializeModules(options: KitOptions): Promise<void> {
    // Import parsing modules
    this.parse = await import('./parsing/parse.js');
    this.format = await import('./parsing/format.js');
  }

  async init(): Promise<void> {
    await this.kernel.init();
  }

  async start(): Promise<void> {
    await this.kernel.start();
  }

  async stop(): Promise<void> {
    await this.kernel.stop();
  }
}

/**
 * Create a new Kit instance
 *
 * @example
 * ```typescript
 * // Create a kit with all modules
 * const app = createKit({ name: 'my-app' });
 *
 * // Create a kit with specific modules
 * const app = createKit({
 *   name: 'my-app',
 *   modules: ['log', 'config', 'http']
 * });
 *
 * // Create with custom log level
 * const app = createKit({
 *   name: 'my-app',
 *   logLevel: 'debug',
 *   prettyLog: true
 * });
 *
 * await app.start();
 * app.log.info('Application started!');
 * ```
 */
export function createKit(options: KitOptions): Kit {
  return new KitImplementation(options);
}

/**
 * Default export for convenience
 */
export default createKit;

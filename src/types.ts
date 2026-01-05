/**
 * Shared type definitions for @oxog/kit
 */

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * HTTP methods supported by the HTTP client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Response types for HTTP requests
 */
export type ResponseType = 'json' | 'text' | 'buffer' | 'stream';

/**
 * Duration format (string or milliseconds)
 */
export type Duration = string | number;

/**
 * Generic function type
 */
export type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Async function type
 */
export type AsyncFunction = (...args: unknown[]) => Promise<unknown>;

/**
 * Constructor type
 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Promise value type
 */
export type PromiseValue<T> = T extends Promise<infer U> ? U : T;

/**
 * Make specific keys readonly
 */
export type ReadonlyKeys<T, K extends keyof T> = Omit<T, K> & {
  readonly [P in K]: T[P];
};

/**
 * Make specific keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Label type for metrics
 */
export type Labels = Record<string, string | number>;

/**
 * Metadata type for logging and tracing
 */
export type MetaData = Record<string, unknown>;

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Priority type for queued jobs
 */
export type Priority = number;

/**
 * Circuit state for circuit breaker
 */
export type CircuitState = 'closed' | 'open' | 'half-open';

/**
 * Storage backend type for sessions
 */
export type StorageBackend = 'memory' | 'file';

/**
 * MIME type string
 */
export type MimeType = string;

/**
 * File extension with dot
 */
export type Extension = string;

/**
 * UUID string
 */
export type UUID = string;

/**
 * URL string
 */
export type URLString = string;

/**
 * Email string
 */
export type EmailString = string;

/**
 * ISO 8601 date string
 */
export type ISODateString = string;

/**
 * Unix timestamp in seconds
 */
export type UnixTimestamp = number;

/**
 * Hex color code
 */
export type HexColor = string;

/**
 * RGB color tuple
 */
export type RGBColor = [number, number, number];

/**
 * RGBA color tuple
 */
export type RGBAColor = [number, number, number, number];

/**
 * HSL color tuple
 */
export type HSLColor = [number, number, number];

/**
 * Path separator (platform-specific)
 */
export type PathSeparator = '\\' | '/';

/**
 * Environment
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Cache entry with expiration
 */
export interface CacheEntry<T> {
  value: T;
  expires: number | null;
  access: number;
  key: string;
}

/**
 * Retry options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  attempts: number;
  /** Initial delay in milliseconds */
  delay: number;
  /** Exponential backoff multiplier */
  factor: number;
  /** Maximum delay between retries */
  maxDelay: number;
  /** Timeout per attempt */
  timeout: number;
  /** Function to determine if error is retryable */
  retryIf: (error: Error) => boolean;
  /** Callback on each retry attempt */
  onRetry: (error: Error, attempt: number) => void;
}

/**
 * Job options for queue
 */
export interface JobOptions {
  /** Delay before job starts (ms) */
  delay: number;
  /** Job priority (lower = higher priority) */
  priority: number;
  /** Maximum retry attempts */
  attempts: number;
  /** Backoff delay between retries (ms) */
  backoff: number;
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  /** Request headers */
  headers: Record<string, string>;
  /** Query parameters */
  query: Record<string, string | number>;
  /** Request body */
  body: unknown;
  /** Request timeout (ms) */
  timeout: number;
  /** Retry configuration */
  retry: Partial<RetryOptions>;
  /** Expected response type */
  responseType: ResponseType;
  /** Status code validation */
  validateStatus: (status: number) => boolean;
  /** Download progress callback */
  onDownloadProgress: (progress: { loaded: number; total: number }) => void;
  /** Upload progress callback */
  onUploadProgress: (progress: { loaded: number; total: number }) => void;
  /** Abort signal for cancellation */
  signal: AbortSignal;
}

/**
 * WebSocket options
 */
export interface WebSocketOptions {
  /** WebSocket subprotocols */
  protocols: string[];
  /** Enable auto-reconnect */
  reconnect: boolean;
  /** Maximum reconnect attempts */
  reconnectAttempts: number;
  /** Delay between reconnects (ms) */
  reconnectDelay: number;
  /** Ping interval (ms) */
  pingInterval: number;
}

/**
 * SSE options
 */
export interface SSEOptions {
  /** Include credentials */
  withCredentials: boolean;
  /** Custom headers */
  headers: Record<string, string>;
  /** Default retry delay (ms) */
  retry: number;
  /** Connection open callback */
  onOpen: () => void;
  /** Error callback */
  onError: (error: Error) => void;
}

/**
 * Cache options
 */
export interface CacheOptions {
  /** Time-to-live (e.g., '5m', '1h', or milliseconds) */
  ttl: Duration;
  /** Maximum cache size */
  maxSize: number;
  /** Eviction callback */
  onEvict: (key: string, value: unknown) => void;
}

/**
 * Store options
 */
export interface StoreOptions {
  /** Path to store file */
  path: string;
  /** Pretty print JSON */
  pretty: boolean;
  /** Debounce write delay (ms) */
  debounce: number;
}

/**
 * Session options
 */
export interface SessionOptions {
  /** Default session TTL (e.g., '24h') */
  ttl: Duration;
  /** Session ID prefix */
  prefix: string;
  /** Storage backend */
  store: StorageBackend;
  /** Store options for file backend */
  storeOptions: Partial<StoreOptions>;
}

/**
 * Validate options
 */
export interface ValidateOptions {
  /** Enable strict type checking */
  strict: boolean;
  /** Abort on first error */
  abortEarly: boolean;
  /** Strip unknown keys */
  stripUnknown: boolean;
}

/**
 * Transform options
 */
export interface TransformOptions {
  /** Deep transform */
  deep: boolean;
  /** Preserve array indices */
  preserveArrays: boolean;
}

/**
 * Template options
 */
export interface TemplateOptions {
  /** Opening delimiter */
  open: string;
  /** Closing delimiter */
  close: string;
  /** Escape HTML */
  escape: boolean;
}

/**
 * Metrics collection options
 */
export interface MetricsOptions {
  /** Default label values */
  labels: Labels;
  /** Buckets for histograms */
  buckets: number[];
  /** Objectives for summaries */
  objectives: number[];
}

/**
 * Health check options
 */
export interface HealthOptions {
  /** Check timeout (ms) */
  timeout: number;
  /** Check interval (ms) */
  interval: number;
}

/**
 * Trace options
 */
export interface TraceOptions {
  /** Sample rate (0-1) */
  sampleRate: number;
  /** Enable tracing */
  enabled: boolean;
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  /** Maximum tokens */
  limit: number;
  /** Window duration */
  window: Duration;
  /** Refill rate */
  refill: number;
}

/**
 * Circuit breaker options
 */
export interface CircuitOptions {
  /** Failure threshold */
  failureThreshold: number;
  /** Success threshold for recovery */
  successThreshold: number;
  /** Timeout for open state (ms) */
  timeout: number;
  /** Reset timeout (ms) */
  resetTimeout: number;
}

/**
 * Pool options
 */
export interface PoolOptions {
  /** Minimum pool size */
  min: number;
  /** Maximum pool size */
  max: number;
  /** Acquire timeout (ms) */
  acquireTimeout: number;
  /** Idle timeout (ms) */
  idleTimeout: number;
}

/**
 * Debounce options
 */
export interface DebounceOptions {
  /** Wait before invoking (ms) */
  wait: number;
  /** Invoke on leading edge */
  leading: boolean;
  /** Invoke on trailing edge */
  trailing: boolean;
  /** Maximum wait time (ms) */
  maxWait: number;
}

/**
 * Mutex options
 */
export interface MutexOptions {
  /** Acquire timeout (ms) */
  timeout: number;
}

/**
 * Semaphore options
 */
export interface SemaphoreOptions extends MutexOptions {
  /** Maximum concurrent locks */
  concurrency: number;
}

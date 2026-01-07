# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-07

### Added

#### Core Module (`@oxog/kit/core`)
- `createLogger` - Structured logging with levels, child loggers, and custom formatters
- `createEventEmitter` - Type-safe event emitter with wildcard support
- `createConfig` - Configuration management with dot notation access
- `createContext` - Async context tracking for request tracing

#### Utils Module (`@oxog/kit/utils`)
- `string` - String manipulation (slugify, truncate, capitalize, template, etc.)
- `array` - Array operations (chunk, unique, groupBy, shuffle, etc.)
- `object` - Object utilities (pick, omit, merge, clone, etc.)
- `date` - Date parsing, formatting, and arithmetic
- `math` - Math operations (clamp, round, statistics)
- `random` - Random value generation (int, float, string, uuid)

#### Validation Module (`@oxog/kit/validation`)
- `validate.string()` - String validation with email, url, regex patterns
- `validate.number()` - Number validation with min, max, integer checks
- `validate.boolean()` - Boolean validation
- `validate.object()` - Object schema validation with nested support
- `validate.array()` - Array validation with item schemas
- `validate.enum()` - Enum validation
- `validate.union()` - Union type validation

#### Security Module (`@oxog/kit/security`)
- `jwt.sign()` / `jwt.verify()` - JWT token creation and verification
- `password.hash()` / `password.verify()` - Secure password hashing
- `crypto.encrypt()` / `crypto.decrypt()` - AES encryption/decryption
- `crypto.hmac()` - HMAC generation
- `crypto.randomBytes()` - Cryptographically secure random bytes

#### Async Module (`@oxog/kit/async`)
- `createQueue` - Task queue with concurrency control
- `retry` - Retry with exponential backoff
- `circuitBreaker` - Circuit breaker pattern implementation
- `debounce` / `throttle` - Function debouncing and throttling
- `rateLimit` - Rate limiting with token bucket algorithm
- `mutex` / `semaphore` - Concurrency primitives

#### Observability Module (`@oxog/kit/observability`)
- `metrics.counter()` - Prometheus-style counter metrics
- `metrics.gauge()` - Gauge metrics
- `metrics.histogram()` - Histogram metrics with configurable buckets
- `healthCheck` - Health check registry with timeout support
- `trace` - Distributed tracing with span support

#### Network Module (`@oxog/kit/network`)
- `createHttpClient` - HTTP client with interceptors, retry, and timeout
- `createWebSocket` - WebSocket client with auto-reconnect
- `createSSEClient` - Server-Sent Events client

#### Data Module (`@oxog/kit/data`)
- `createCache` - In-memory cache with TTL and LRU eviction
- `createStore` - Persistent key-value store
- `createSession` - Session management with expiration

#### Parsing Module (`@oxog/kit/parsing`)
- `json.parse()` / `json.stringify()` - Safe JSON operations
- `url.parse()` / `url.format()` - URL parsing and formatting
- `queryString.parse()` / `queryString.stringify()` - Query string utilities
- `mime.lookup()` / `mime.extension()` - MIME type detection

#### Framework Adapters
- Express adapter (`@oxog/kit/adapters/express`)
- Fastify adapter (`@oxog/kit/adapters/fastify`)
- Hono adapter (`@oxog/kit/adapters/hono`)
- Koa adapter (`@oxog/kit/adapters/koa`)
- Native HTTP adapter (`@oxog/kit/adapters/http`)

### Technical Details
- Zero runtime dependencies
- Full TypeScript support with comprehensive type definitions
- Tree-shakeable ES modules
- CommonJS and ESM dual package support
- Node.js 18+ required
- 100% test coverage

[1.0.0]: https://github.com/ersinkoc/kit/releases/tag/v1.0.0

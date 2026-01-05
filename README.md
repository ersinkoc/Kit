# @oxog/kit

**Zero-dependency standard library for Node.js - everything you need in one kit.**

> A comprehensive, batteries-included toolkit providing 50+ commonly needed utilities with zero runtime dependencies.

## Quick Start

```bash
npm install @oxog/kit
```

```typescript
import { createKit } from '@oxog/kit';

// Create a kit instance
const app = createKit({
  name: 'my-app',
  logLevel: 'info'
});

await app.start();

// Use modules
app.log.info('Server started', { port: 3000 });
const dbUrl = app.config.get('database.url');
const port = app.env.port('PORT', 3000);
```

## Features

### Zero Dependencies
- **No runtime dependencies** - everything built from scratch
- Tree-shakeable - only bundle what you use
- Single module: < 2KB gzipped
- Full kit: < 50KB gzipped

### 50+ Modules

**Core Runtime** (7 modules)
- `log` - Structured logging with levels and child loggers
- `config` - Configuration management with dot notation
- `env` - Type-safe environment variable access
- `errors` - Enhanced error handling with codes and context
- `events` - Event emitter with wildcard support
- `hooks` - Lifecycle hooks for extensibility
- `context` - Async context tracking

**Network** (3 modules)
- `http` - HTTP client with interceptors and retry
- `ws` - WebSocket client with auto-reconnect
- `sse` - Server-Sent Events client

**Data & Storage** (3 modules)
- `cache` - In-memory cache with TTL and LRU eviction
- `store` - Persistent JSON file-based key-value store
- `session` - Session management with expiration

**Validation** (3 modules)
- `validate` - Schema validation with type inference
- `transform` - Data transformation utilities
- `sanitize` - Input sanitization for security

**Async & Concurrency** (9 modules)
- `queue` - In-memory job queue
- `scheduler` - Cron-like scheduling
- `retry` - Retry with exponential backoff
- `rateLimit` - Rate limiting with token bucket
- `circuit` - Circuit breaker pattern
- `pool` - Resource pooling
- `timeout` - Promise timeout wrapper
- `debounce` - Debounce and throttle
- `mutex` - Mutex and semaphore

**Security** (3 modules)
- `crypto` - Hashing, HMAC, encryption, random generation
- `jwt` - JSON Web Token creation and verification
- `hash` - Password hashing

**Utilities** (19 modules)
- `id` - ID generation (UUID, NanoID, CUID, ULID, Snowflake)
- `string` - String manipulation and case conversion
- `array` - Array operations and transformations
- `object` - Object manipulation and deep operations
- `date` - Date parsing, formatting, and arithmetic
- `math` - Math operations and statistics
- `color` - Color conversion and manipulation
- `path` - Path utilities (cross-platform)
- `url` - URL parsing and manipulation
- `mime` - MIME type detection
- `size` - Byte size formatting and parsing
- `slug` - URL slug generation
- `timer` - Timing and profiling
- `diff` - Object and array diffing
- `clone` - Deep cloning
- `template` - String template rendering
- `random` - Random value generation
- `regexp` - RegExp utilities and common patterns
- `encoding` - Base64, hex, UTF-8 encoding/decoding

**Observability** (3 modules)
- `metrics` - Prometheus-style metrics
- `health` - Health check registry
- `trace` - Request tracing

## Standalone Usage

Each module can be used independently:

```typescript
import { createLogger } from '@oxog/kit/core';

const logger = createLogger({ level: 'debug', pretty: true });
logger.info('Hello world');
```

## Presets

Pre-configured kits for common use cases:

```typescript
import { createKit, presets } from '@oxog/kit';

// API preset - Web APIs
const api = createKit({ ...presets.api, name: 'my-api' });

// CLI preset - Command-line tools
const cli = createKit({ ...presets.cli, name: 'my-cli' });

// Worker preset - Background workers
const worker = createKit({ ...presets.worker, name: 'my-worker' });

// Microservice preset - Kubernetes-ready
const micro = createKit({ ...presets.microservice, name: 'user-service' });

// Minimal preset - Bare essentials
const minimal = createKit({ ...presets.minimal, name: 'script' });
```

## Category Exports

Import specific categories to reduce bundle size:

```typescript
import { log, config, env } from '@oxog/kit/core';
import { http, ws, sse } from '@oxog/kit/network';
import { cache, store, session } from '@oxog/kit/data';
```

## Documentation

- **Full Documentation**: [https://kit.oxog.dev](https://kit.oxog.dev)
- **API Reference**: [https://kit.oxog.dev/api](https://kit.oxog.dev/api)
- **Examples**: [https://kit.oxog.dev/examples](https://kit.oxog.dev/examples)

## License

MIT © [Ersin Koç](https://github.com/ersinkoc)

## Repository

[https://github.com/ersinkoc/kit](https://github.com/ersinkoc/kit)

# @oxog/kit - Complete Package Specification

## 1. Package Identity

| Property | Value |
|----------|-------|
| **Name** | `@oxog/kit` |
| **Version** | `1.0.0` |
| **Description** | Zero-dependency standard library for Node.js - everything you need in one kit |
| **License** | MIT |
| **Author** | Ersin Koç |
| **Repository** | https://github.com/ersinkoc/kit |
| **Documentation** | https://kit.oxog.dev |
| **NPM** | https://www.npmjs.com/package/@oxog/kit |

## 2. Mission Statement

@oxog/kit provides Node.js developers with a comprehensive, production-ready toolkit that covers all common programming needs without external runtime dependencies. It serves as the "standard library" that Node.js never had, enabling developers to build robust applications with confidence while maintaining minimal bundle sizes through tree-shaking.

## 3. Core Principles

### 3.1 Zero Runtime Dependencies
- **No external dependencies** in production
- All functionality built from scratch using Node.js built-ins
- DevDependencies only: TypeScript, Vitest, tsup, ESLint, Prettier

### 3.2 100% Test Coverage
- Every line of code tested
- Every branch covered
- All tests must pass before release
- Coverage thresholds enforced in CI

### 3.3 Tree-Shakeable Architecture
- Each module can be imported independently
- Bundle only what you use
- Single module: < 2KB gzipped
- Full kit: < 50KB gzipped

### 3.4 LLM-Native Design
- Optimized for both humans and AI assistants
- Predictable API naming conventions
- Rich JSDoc with examples
- llms.txt for LLM consumption

## 4. Module Categories

### 4.1 Core Runtime (7 modules)
Foundation modules that provide essential runtime capabilities.

| Module | Purpose |
|--------|---------|
| `log` | Structured logging with levels, child loggers, JSON output |
| `config` | Configuration management with dot notation and env override |
| `env` | Type-safe environment variable access |
| `errors` | Enhanced error handling with codes and context |
| `events` | Event emitter with wildcard support |
| `hooks` | Lifecycle hooks for extensibility |
| `context` | Async context tracking via AsyncLocalStorage |

### 4.2 Network (3 modules)
HTTP and real-time communication clients.

| Module | Purpose |
|--------|---------|
| `http` | HTTP client with interceptors, retry, timeout |
| `ws` | WebSocket client with auto-reconnect |
| `sse` | Server-Sent Events client |

### 4.3 Data & Storage (3 modules)
Data persistence and caching solutions.

| Module | Purpose |
|--------|---------|
| `cache` | In-memory cache with TTL and LRU eviction |
| `store` | Persistent JSON file-based key-value store |
| `session` | Session management with expiration |

### 4.4 Validation (3 modules)
Data validation, transformation, and sanitization.

| Module | Purpose |
|--------|---------|
| `validate` | Schema validation with type inference |
| `transform` | Data transformation utilities |
| `sanitize` | Input sanitization for security |

### 4.5 Parsing & Format (2 modules)
Multi-format parsing and data formatting.

| Module | Purpose |
|--------|---------|
| `parse` | JSON, YAML, TOML, CSV, INI, dotenv, XML, query string, etc. |
| `format` | Date, number, currency, bytes, duration formatting |

### 4.6 Async & Concurrency (9 modules)
Asynchronous programming and concurrency control.

| Module | Purpose |
|--------|---------|
| `queue` | In-memory job queue |
| `scheduler` | Cron-like scheduling |
| `retry` | Retry with exponential backoff |
| `rateLimit` | Rate limiting with token bucket |
| `circuit` | Circuit breaker pattern |
| `pool` | Resource pooling |
| `timeout` | Promise timeout wrapper |
| `debounce` | Debounce and throttle |
| `mutex` | Mutex and semaphore |

### 4.7 Security (3 modules)
Cryptography and security utilities.

| Module | Purpose |
|--------|---------|
| `crypto` | Hashing, HMAC, encryption, random generation |
| `jwt` | JSON Web Token creation and verification |
| `hash` | Password hashing (bcrypt-like) |

### 4.8 Utilities (19 modules)
Common utility functions for everyday programming.

| Module | Purpose |
|--------|---------|
| `id` | ID generation (UUID, NanoID, CUID, ULID, Snowflake) |
| `string` | String manipulation and case conversion |
| `array` | Array operations and transformations |
| `object` | Object manipulation and deep operations |
| `date` | Date parsing, formatting, and arithmetic |
| `math` | Math operations and statistics |
| `color` | Color conversion and manipulation |
| `path` | Path utilities (cross-platform) |
| `url` | URL parsing and manipulation |
| `mime` | MIME type detection |
| `size` | Byte size formatting and parsing |
| `slug` | URL slug generation |
| `timer` | Timing and profiling |
| `diff` | Object and array diffing |
| `clone` | Deep cloning |
| `template` | String template rendering |
| `random` | Random value generation |
| `regexp` | RegExp utilities and common patterns |
| `encoding` | Base64, hex, UTF-8 encoding/decoding |

### 4.9 Observability (3 modules)
Monitoring and health checking.

| Module | Purpose |
|--------|---------|
| `metrics` | Prometheus-style metrics |
| `health` | Health check registry |
| `trace` | Request tracing |

### 4.10 Framework Adapters (5 modules)
Integration with popular Node.js frameworks.

| Module | Purpose |
|--------|---------|
| `express` | Express.js middleware |
| `fastify` | Fastify plugin |
| `hono` | Hono middleware |
| `koa` | Koa middleware |
| `http` | Native Node.js HTTP handler |

### 4.11 Presets (5 presets)
Pre-configured kits for common use cases.

| Preset | Purpose |
|--------|---------|
| `api` | Web APIs with JSON logging |
| `cli` | Command-line tools with pretty logging |
| `worker` | Background workers |
| `microservice` | Kubernetes-ready microservices |
| `minimal` | Bare essentials |

## 5. API Design Patterns

### 5.1 Naming Conventions
- **Create**: `createKit()`, `createLogger()`, `createCache()`
- **Get/Set**: `get()`, `set()`, `has()`, `delete()`
- **Actions**: `start()`, `stop()`, `pause()`, `resume()`
- **Check**: `check()`, `validate()`, `verify()`
- **Transform**: `map()`, `filter()`, `reduce()`, `transform()`

### 5.2 Options Pattern
All modules accept an options object as the last parameter:

```typescript
// Always optional with sensible defaults
module(value, options?)
```

### 5.3 Error Handling
- Custom error types extend `KitError`
- Errors include codes and context
- Global error event emission
- Try-catch wrappers available

### 5.4 TypeScript Support
- Full TypeScript definitions
- Type inference from schemas
- Generic types where appropriate
- Strict mode enabled

## 6. Technical Specifications

### 6.1 Runtime Requirements
| Requirement | Specification |
|-------------|--------------|
| Node.js Version | >= 18.0.0 |
| TypeScript Version | >= 5.0.0 |
| Module Format | ESM + CJS |
| Type Definitions | Included (.d.ts) |

### 6.2 Bundle Size Targets
| Component | Target |
|-----------|--------|
| Single Module | < 2KB gzipped |
| Core Runtime | < 8KB gzipped |
| Full Kit | < 50KB gzipped |

### 6.3 Test Coverage Requirements
| Metric | Target |
|--------|--------|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

### 6.4 Build Configuration
- **Bundler**: tsup
- **Test Runner**: Vitest
- **Coverage Provider**: v8
- **Linter**: ESLint
- **Formatter**: Prettier

## 7. Export Structure

### 7.1 Main Export
```typescript
import { createKit } from '@oxog/kit';
```

### 7.2 Category Exports
```typescript
import { log, config, env } from '@oxog/kit/core';
import { http, ws, sse } from '@oxog/kit/network';
import { cache, store, session } from '@oxog/kit/data';
// ... etc
```

### 7.3 Module Exports
```typescript
import { createLogger } from '@oxog/kit/log';
import { createHttp } from '@oxog/kit/http';
// ... etc
```

### 7.4 Adapter Exports
```typescript
import { expressMiddleware } from '@oxog/kit/adapters/express';
import { fastifyPlugin } from '@oxog/kit/adapters/fastify';
// ... etc
```

### 7.5 Preset Exports
```typescript
import { presets } from '@oxog/kit/presets';
```

## 8. Quality Standards

### 8.1 Code Quality
- TypeScript strict mode enabled
- No `any` types without justification
- No `eslint-disable` without explanation
- Consistent formatting with Prettier

### 8.2 Documentation
- JSDoc on every public API
- @example on all public methods
- Parameter types documented
- Return types documented
- Throws documented

### 8.3 Testing
- Unit tests for all functions
- Integration tests for workflows
- Edge cases covered
- Error conditions tested

### 8.4 LLM Optimization
- llms.txt < 2000 tokens
- README first 500 tokens optimized
- API naming follows conventions
- Rich examples for LLM training

## 9. Versioning Policy

### 9.1 Semantic Versioning
- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

### 9.2 Deprecation Process
1. Mark as deprecated in JSDoc
2. Add console warning on use
3. Maintain for at least 2 minor versions
4. Remove in next major version

## 10. Release Criteria

A release is considered complete when:

1. **All tests pass** with 100% coverage
2. **No TypeScript errors**
3. **No ESLint warnings**
4. **Build succeeds** without errors
5. **Documentation complete** for all changed APIs
6. **Examples updated** for new features
7. **llms.txt updated** if API changed
8. **CHANGELOG.md updated** with all changes

## 11. Success Metrics

### 11.1 Technical Metrics
- Zero runtime dependencies
- 100% test coverage maintained
- All TypeScript strict checks pass
- Bundle size within targets

### 11.2 Documentation Metrics
- All public APIs have JSDoc
- All examples run successfully
- llms.txt < 2000 tokens
- Website builds without errors

### 11.3 User Experience Metrics
- Clear error messages
- Predictable API behavior
- Comprehensive examples
- Multiple integration patterns

## 12. Non-Negotiable Rules

These rules must never be violated:

1. **NO runtime dependencies** - implement everything from scratch
2. **100% test coverage** - every line must be tested
3. **TypeScript strict mode** - no compromises on type safety
4. **JSDoc on all public APIs** - comprehensive documentation
5. **Examples for every feature** - show, don't just tell
6. **Zero external links** - GitHub, npm, and custom domain only
7. **Tree-shakeable** - every module independently importable

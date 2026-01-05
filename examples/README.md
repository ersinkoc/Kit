# @oxog/kit Examples

This directory contains runnable examples demonstrating the features of @oxog/kit.

## Quick Start

```bash
# Run any example with ts-node or tsx
npx tsx examples/basic/quick-start.ts
```

## Examples by Category

### Basic
- **[quick-start.ts](basic/quick-start.ts)** - Get started with the most common utilities

### Validation
- **[form-validation.ts](validation/form-validation.ts)** - Form validation with schemas and custom rules

### Security
- **[auth-example.ts](security/auth-example.ts)** - JWT tokens, password hashing, and encryption

### Async
- **[queue-example.ts](async/queue-example.ts)** - Task queue with concurrency control
- **[retry-circuit.ts](async/retry-circuit.ts)** - Retry logic and circuit breaker patterns
- **[scheduler.ts](async/scheduler.ts)** - Cron-like task scheduling
- **[pool.ts](async/pool.ts)** - Connection pooling and resource management
- **[mutex-debounce.ts](async/mutex-debounce.ts)** - Mutex, semaphore, debounce, and throttle

### Observability
- **[metrics-health.ts](observability/metrics-health.ts)** - Metrics collection and health checks
- **[tracing.ts](observability/tracing.ts)** - Distributed tracing with spans

### Network
- **[http-client.ts](network/http-client.ts)** - HTTP client with interceptors

### Core
- **[events-config.ts](core/events-config.ts)** - Event emitters, configuration, and context
- **[logging.ts](core/logging.ts)** - Structured logging with levels and formatters

### Utils
- **[string-array.ts](utils/string-array.ts)** - String and array manipulation utilities
- **[object-date.ts](utils/object-date.ts)** - Object operations and date utilities

## Running Examples

Each example is self-contained and can be run independently:

```bash
# Using tsx (recommended)
npx tsx examples/async/queue-example.ts

# Using ts-node
npx ts-node examples/async/queue-example.ts

# Using bun
bun examples/async/queue-example.ts
```

## Notes

- Some examples use `await` at the top level (requires ES modules)
- Network examples may require an internet connection
- Async examples include timing demonstrations with `delay()`

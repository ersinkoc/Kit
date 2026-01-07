# @oxog/kit

[![npm version](https://img.shields.io/npm/v/@oxog/kit.svg)](https://www.npmjs.com/package/@oxog/kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

**Zero-dependency standard library for Node.js - everything you need in one kit.**

> A comprehensive, batteries-included toolkit providing 50+ commonly needed utilities with zero runtime dependencies.

## Installation

```bash
npm install @oxog/kit
```

## Quick Start

```typescript
import { string, array } from '@oxog/kit/utils';
import { validate } from '@oxog/kit/validation';
import { jwt } from '@oxog/kit/security';
import { createQueue, retry } from '@oxog/kit/async';
import { metrics } from '@oxog/kit/observability';

// String utilities
const slug = string.slugify('Hello World!'); // 'hello-world'

// Array operations
const chunks = array.chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Validation
const userSchema = validate.object({
  email: validate.string().required().email(),
  age: validate.number().min(0).max(150),
});

const result = userSchema.validate({ email: 'user@example.com', age: 25 });

// JWT
const token = jwt.sign({ userId: '123' }, 'secret', { expiresIn: '1h' });
const decoded = jwt.verify(token, 'secret');

// Async queue with concurrency control
const queue = createQueue({ concurrency: 3 });
await queue.add(() => processItem());

// Retry with exponential backoff
const data = await retry(() => fetchData(), { retries: 3, delay: 1000 });

// Metrics
const counter = metrics.counter({ name: 'requests_total' });
counter.inc();
```

## Features

- **Zero Dependencies** - No external packages required
- **TypeScript-First** - Full type safety with comprehensive type definitions
- **Tree-Shakeable** - Import only what you need for optimal bundle size
- **Production-Ready** - Battle-tested with comprehensive error handling
- **Modern Patterns** - Async/await, ES modules, and latest JavaScript features
- **Fully Tested** - 100% test coverage across all modules

## Modules

### Utils (`@oxog/kit/utils`)

String, array, object, date, math, and random utilities.

```typescript
import { string, array, object, date, math, random } from '@oxog/kit/utils';

string.slugify('Hello World');     // 'hello-world'
string.truncate('Long text', 5);   // 'Long...'
array.chunk([1, 2, 3, 4], 2);      // [[1, 2], [3, 4]]
array.unique([1, 2, 2, 3]);        // [1, 2, 3]
object.pick({ a: 1, b: 2 }, ['a']);// { a: 1 }
date.format(new Date(), 'YYYY-MM-DD');
math.clamp(15, 0, 10);             // 10
random.int(1, 100);                // Random integer 1-100
```

### Validation (`@oxog/kit/validation`)

Schema validation, sanitization, and transformation.

```typescript
import { validate } from '@oxog/kit/validation';

const schema = validate.object({
  name: validate.string().required().min(2).max(50),
  email: validate.string().required().email(),
  age: validate.number().optional().min(0).max(150),
  role: validate.enum(['user', 'admin']).default('user'),
  tags: validate.array(validate.string()).optional(),
});

const result = schema.validate(data);
if (result.success) {
  console.log(result.data); // Typed data
} else {
  console.log(result.errors); // Validation errors
}
```

### Security (`@oxog/kit/security`)

JWT, password hashing, encryption, and crypto utilities.

```typescript
import { jwt, password, crypto } from '@oxog/kit/security';

// JWT
const token = jwt.sign({ userId: '123' }, 'secret', { expiresIn: '1h' });
const payload = jwt.verify(token, 'secret');

// Password hashing
const hash = await password.hash('myPassword');
const isValid = await password.verify('myPassword', hash);

// Crypto utilities
const encrypted = crypto.encrypt('data', 'key');
const decrypted = crypto.decrypt(encrypted, 'key');
const hmac = crypto.hmac('data', 'key');
```

### Async (`@oxog/kit/async`)

Queue, retry, circuit breaker, rate limiter, mutex.

```typescript
import { createQueue, retry, circuitBreaker, debounce, throttle } from '@oxog/kit/async';

// Queue with concurrency
const queue = createQueue({ concurrency: 5 });
await queue.add(() => processJob());

// Retry with backoff
const result = await retry(
  () => fetchData(),
  { retries: 3, delay: 1000, backoff: 'exponential' }
);

// Circuit breaker
const breaker = circuitBreaker(unreliableService, {
  failureThreshold: 5,
  resetTimeout: 30000,
});

// Debounce & throttle
const debouncedFn = debounce(fn, 300);
const throttledFn = throttle(fn, 1000);
```

### Core (`@oxog/kit/core`)

Logging, events, configuration, context, and errors.

```typescript
import { createLogger, createEventEmitter, createConfig } from '@oxog/kit/core';

// Structured logging
const logger = createLogger({ level: 'info', prefix: 'App' });
logger.info('Server started', { port: 3000 });
logger.error('Request failed', { error, requestId });

// Event emitter
const events = createEventEmitter();
events.on('user:created', (user) => console.log(user));
events.emit('user:created', { id: '123', name: 'John' });

// Configuration
const config = createConfig({ port: 3000, db: { host: 'localhost' } });
const port = config.get('port');
const dbHost = config.get('db.host');
```

### Observability (`@oxog/kit/observability`)

Metrics, health checks, and distributed tracing.

```typescript
import { metrics, healthCheck, trace } from '@oxog/kit/observability';

// Prometheus-style metrics
const counter = metrics.counter({ name: 'http_requests_total', labels: ['method', 'path'] });
counter.inc({ method: 'GET', path: '/api' });

const histogram = metrics.histogram({ name: 'http_request_duration', buckets: [0.1, 0.5, 1] });
histogram.observe(0.25);

// Health checks
const health = healthCheck({
  database: () => db.ping(),
  redis: () => redis.ping(),
});
const status = await health.check();

// Distributed tracing
const span = trace.startSpan('handleRequest');
// ... do work
span.end();
```

### Network (`@oxog/kit/network`)

HTTP client, WebSocket, and SSE clients.

```typescript
import { createHttpClient, createWebSocket, createSSEClient } from '@oxog/kit/network';

// HTTP client
const http = createHttpClient({ baseUrl: 'https://api.example.com', timeout: 5000 });
const users = await http.get('/users');
const newUser = await http.post('/users', { body: { name: 'John' } });

// WebSocket
const ws = createWebSocket('wss://api.example.com/ws');
ws.on('message', (data) => console.log(data));
ws.send({ type: 'subscribe', channel: 'updates' });

// Server-Sent Events
const sse = createSSEClient('https://api.example.com/events');
sse.on('message', (event) => console.log(event.data));
```

### Data (`@oxog/kit/data`)

Cache, store, and session management.

```typescript
import { createCache, createStore, createSession } from '@oxog/kit/data';

// In-memory cache with TTL
const cache = createCache({ ttl: 60000 });
await cache.set('key', 'value');
const value = await cache.get('key');

// Persistent key-value store
const store = createStore({ path: './data' });
await store.set('user:123', { name: 'John' });

// Session management
const session = createSession({ secret: 'your-secret', ttl: 3600 });
const sid = await session.create({ userId: '123' });
const data = await session.get(sid);
```

### Parsing (`@oxog/kit/parsing`)

JSON, URL, query string, and MIME type parsing.

```typescript
import { json, url, queryString, mime } from '@oxog/kit/parsing';

// Safe JSON parsing
const data = json.parse(jsonString, { default: {} });
const str = json.stringify(data, { pretty: true });

// URL parsing
const parsed = url.parse('https://example.com/path?q=test');

// Query string
const qs = queryString.parse('name=John&age=30');
const str = queryString.stringify({ name: 'John', age: 30 });

// MIME types
const type = mime.lookup('file.pdf'); // 'application/pdf'
const ext = mime.extension('image/png'); // 'png'
```

## Category Exports

Import specific categories to reduce bundle size:

```typescript
import { string, array } from '@oxog/kit/utils';
import { validate } from '@oxog/kit/validation';
import { jwt, password } from '@oxog/kit/security';
import { createQueue, retry } from '@oxog/kit/async';
import { createLogger } from '@oxog/kit/core';
import { metrics, healthCheck } from '@oxog/kit/observability';
import { createHttpClient } from '@oxog/kit/network';
import { createCache, createStore } from '@oxog/kit/data';
import { json, url } from '@oxog/kit/parsing';
```

## Documentation

- **Full Documentation**: [https://kit.oxog.dev](https://kit.oxog.dev)
- **API Reference**: [https://kit.oxog.dev/api](https://kit.oxog.dev/api)
- **Examples**: [/examples](/examples)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Ersin Koç](https://github.com/ersinkoc)

## Links

- [GitHub Repository](https://github.com/ersinkoc/kit)
- [npm Package](https://www.npmjs.com/package/@oxog/kit)
- [Documentation](https://kit.oxog.dev)
- [Changelog](CHANGELOG.md)

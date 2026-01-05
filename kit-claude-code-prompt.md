# @oxog/kit - Zero-Dependency Standard Library for Node.js

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/kit` |
| **GitHub Repository** | `https://github.com/ersinkoc/kit` |
| **Documentation Site** | `https://kit.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

> **NO social media, Discord, email, or external links allowed.**

---

## Package Description

**One-line:** Zero-dependency standard library for Node.js - everything you need in one kit.

@oxog/kit is a comprehensive, batteries-included toolkit that provides 50+ commonly needed utilities, all with zero runtime dependencies. It's designed to be the "standard library" that Node.js never had - covering logging, configuration, HTTP, validation, caching, crypto, date handling, and much more. Tree-shakeable architecture ensures you only bundle what you use.

---

## NON-NEGOTIABLE RULES

These rules are **ABSOLUTE** and must be followed without exception.

### 1. ZERO RUNTIME DEPENDENCIES

```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```

- Implement EVERYTHING from scratch
- No lodash, no axios, no moment, no date-fns - nothing
- Write your own utilities, parsers, validators
- If you think you need a dependency, you don't

**Allowed devDependencies only:**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0"
  }
}
```

### 2. 100% TEST COVERAGE

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- **All tests must pass** (100% success rate)
- Use Vitest for testing
- Coverage thresholds enforced in config

### 3. MICRO-KERNEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Code                               │
├─────────────────────────────────────────────────────────────────┤
│                      createKit() Factory                         │
├─────────────────────────────────────────────────────────────────┤
│  CORE        │  NETWORK    │  DATA       │  VALIDATION          │
│  log         │  http       │  cache      │  validate            │
│  config      │  ws         │  store      │  transform           │
│  env         │  sse        │  session    │  sanitize            │
│  errors      │             │             │                      │
│  events      │             │             │                      │
│  hooks       │             │             │                      │
│  context     │             │             │                      │
├─────────────────────────────────────────────────────────────────┤
│  ASYNC       │  SECURITY   │  UTILITIES  │  OBSERVABILITY       │
│  queue       │  crypto     │  id         │  metrics             │
│  scheduler   │  jwt        │  string     │  health              │
│  retry       │  hash       │  array      │  trace               │
│  rateLimit   │             │  object     │                      │
│  circuit     │             │  date       │                      │
│  pool        │             │  math       │                      │
│  timeout     │             │  ...+13     │                      │
│  debounce    │             │             │                      │
│  mutex       │             │             │                      │
├─────────────────────────────────────────────────────────────────┤
│  PARSING     │  FRAMEWORK ADAPTERS       │  PRESETS             │
│  parse       │  express · fastify        │  api · cli           │
│  format      │  hono · koa · node-http   │  worker · micro      │
├─────────────────────────────────────────────────────────────────┤
│                         Micro Kernel                             │
│        Plugin Registry · Lifecycle · Event Bus · Context         │
└─────────────────────────────────────────────────────────────────┘
```

### 4. DEVELOPMENT WORKFLOW

Create these documents **FIRST**, before any code:

1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions  
3. **TASKS.md** - Ordered task list with dependencies

Only after all three documents are complete, implement code following TASKS.md sequentially.

### 5. TYPESCRIPT STRICT MODE

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### 6. LLM-NATIVE DESIGN

Package must be designed for both humans AND AI assistants:

- **llms.txt** file in root (< 2000 tokens)
- **Predictable API** naming (`create`, `get`, `set`, `use`, `remove`)
- **Rich JSDoc** with @example on every public API
- **15+ examples** organized by category
- **README** optimized for LLM consumption

### 7. NO EXTERNAL LINKS

- ✅ GitHub repository URL
- ✅ Custom domain (kit.oxog.dev)
- ✅ npm package URL
- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## COMPLETE MODULE SPECIFICATIONS

### Category 1: CORE RUNTIME (7 modules)

#### 1.1 `log` - Structured Logging

```typescript
// API
app.log.debug(message, meta?)
app.log.info(message, meta?)
app.log.warn(message, meta?)
app.log.error(message, meta?)
app.log.fatal(message, meta?)
app.log.child(meta) // Returns new logger with merged meta
app.log.setLevel(level)
app.log.silent() // Disable all output

// Standalone
import { log, createLogger } from '@oxog/kit';
const logger = createLogger({ level: 'info', pretty: true, timestamp: true });
```

**Features:**
- Log levels: debug, info, warn, error, fatal
- JSON output (default) or pretty print
- Timestamps (ISO 8601)
- Child loggers with inherited context
- Meta object merging
- Silent mode for testing
- Custom formatters

#### 1.2 `config` - Configuration Management

```typescript
// API
app.config.get(key, defaultValue?)
app.config.set(key, value)
app.config.has(key)
app.config.require(key) // Throws if missing
app.config.merge(object)
app.config.load(path) // Load from file
app.config.all() // Get entire config

// Standalone
import { config, createConfig } from '@oxog/kit';
const cfg = createConfig({ path: './config', env: true });
```

**Features:**
- Dot notation access (`db.host`)
- Default values
- Environment variable override
- Multiple file formats (JSON, YAML, TOML via parse module)
- Nested object support
- Type-safe getters
- Required key validation

#### 1.3 `env` - Environment Variables

```typescript
// API
app.env.get(key, defaultValue?)
app.env.require(key) // Throws if missing
app.env.string(key, default?)
app.env.number(key, default?)
app.env.boolean(key, default?)
app.env.array(key, separator?, default?)
app.env.json(key, default?)
app.env.url(key, default?)
app.env.port(key, default?)
app.env.isDev()
app.env.isProd()
app.env.isTest()

// Standalone
import { env } from '@oxog/kit';
```

**Features:**
- Typed getters (string, number, boolean, array, JSON, URL, port)
- Required validation
- Default values
- NODE_ENV helpers
- Dotenv parsing (via parse.dotenv)

#### 1.4 `errors` - Error Handling

```typescript
// API
app.errors.create(message, code, context?)
app.errors.wrap(error, context?)
app.errors.isKitError(error)
app.errors.capture(fn) // Try-catch wrapper
app.errors.captureAsync(fn) // Async try-catch
app.errors.on('error', handler) // Global error listener

// Error classes
import { KitError, ValidationError, NetworkError, TimeoutError, ConfigError } from '@oxog/kit';

throw new KitError('Something failed', 'ERR_SOMETHING', { userId: 123 });
```

**Features:**
- Base KitError class with code and context
- Specific error types: ValidationError, NetworkError, TimeoutError, ConfigError, NotFoundError, AuthError
- Error wrapping with context
- Global error event emission
- Stack trace capture
- Serialization to JSON

#### 1.5 `events` - Event Emitter

```typescript
// API
app.events.on(event, handler)
app.events.once(event, handler)
app.events.off(event, handler?)
app.events.emit(event, ...args)
app.events.emitAsync(event, ...args) // Await all handlers
app.events.listenerCount(event)
app.events.removeAllListeners(event?)

// Wildcard support
app.events.on('user:*', (event, data) => {}) // Matches user:created, user:deleted, etc.

// Standalone
import { events, createEmitter } from '@oxog/kit';
```

**Features:**
- Standard on/once/off/emit
- Async emit (wait for all handlers)
- Wildcard patterns (`user:*`, `*`)
- Listener count
- Remove all listeners
- Max listeners warning
- Typed events support

#### 1.6 `hooks` - Lifecycle Hooks

```typescript
// API
app.hooks.on('init', handler)
app.hooks.on('start', handler)
app.hooks.on('stop', handler)
app.hooks.on('error', handler)
app.hooks.on('request:before', handler)
app.hooks.on('request:after', handler)
app.hooks.on('shutdown', handler)
app.hooks.trigger(hookName, context?)

// Standalone
import { hooks, createHooks } from '@oxog/kit';
```

**Features:**
- Predefined lifecycle hooks
- Custom hook registration
- Async hook handlers
- Hook execution order (priority)
- Context passing
- Error handling in hooks

#### 1.7 `context` - Async Context (AsyncLocalStorage)

```typescript
// API
app.context.run(store, fn)
app.context.get(key)
app.context.set(key, value)
app.context.getStore()
app.context.with(values, fn) // Merge values and run

// Standalone
import { context, createContext } from '@oxog/kit';

context.run({ requestId: 'abc-123' }, async () => {
  // Anywhere in this async chain:
  context.get('requestId'); // 'abc-123'
});
```

**Features:**
- AsyncLocalStorage wrapper
- Type-safe get/set
- Automatic propagation through async calls
- Integration with log (auto-include context in logs)
- Nestable contexts

---

### Category 2: NETWORK (3 modules)

#### 2.1 `http` - HTTP Client

```typescript
// API
app.http.get(url, options?)
app.http.post(url, body?, options?)
app.http.put(url, body?, options?)
app.http.patch(url, body?, options?)
app.http.delete(url, options?)
app.http.head(url, options?)
app.http.request(options)

// Options
{
  headers: {},
  query: {},
  body: {},
  timeout: 30000,
  retry: { attempts: 3, delay: 1000 },
  responseType: 'json' | 'text' | 'buffer' | 'stream',
  validateStatus: (status) => boolean,
  onDownloadProgress: (progress) => void,
  onUploadProgress: (progress) => void,
  signal: AbortSignal
}

// Interceptors
app.http.interceptors.request.use(fn)
app.http.interceptors.response.use(fn)

// Standalone
import { http, createHttp } from '@oxog/kit';
```

**Features:**
- All HTTP methods
- Query string building
- JSON body serialization
- Timeout support
- Retry with backoff
- Request/response interceptors
- AbortController support
- Progress callbacks
- Response type handling
- Base URL support
- Default headers

#### 2.2 `ws` - WebSocket Client

```typescript
// API
const socket = app.ws.connect(url, options?)
socket.send(data)
socket.sendJson(object)
socket.close(code?, reason?)
socket.on('open', handler)
socket.on('message', handler)
socket.on('close', handler)
socket.on('error', handler)
socket.reconnect()

// Options
{
  protocols: [],
  reconnect: true,
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  pingInterval: 30000
}

// Standalone
import { ws, createWebSocket } from '@oxog/kit';
```

**Features:**
- Auto-reconnection
- Ping/pong heartbeat
- JSON send helper
- Connection state management
- Event-based API
- Binary support

#### 2.3 `sse` - Server-Sent Events Client

```typescript
// API
const source = app.sse.connect(url, options?)
source.on('message', handler)
source.on('event-name', handler)
source.close()
source.reconnect()

// Options
{
  withCredentials: false,
  headers: {},
  retry: 3000,
  onOpen: () => {},
  onError: (err) => {}
}

// Standalone
import { sse, createSSE } from '@oxog/kit';
```

**Features:**
- Named event support
- Auto-reconnection
- Last-Event-ID tracking
- Custom headers (via fetch fallback)
- Connection state

---

### Category 3: DATA & STORAGE (3 modules)

#### 3.1 `cache` - In-Memory Cache

```typescript
// API
app.cache.get(key)
app.cache.set(key, value, options?)
app.cache.has(key)
app.cache.delete(key)
app.cache.clear()
app.cache.keys()
app.cache.values()
app.cache.size()
app.cache.getOrSet(key, factory, options?) // Get or compute
app.cache.mget(keys) // Multi-get
app.cache.mset(entries, options?) // Multi-set
app.cache.wrap(key, fn, options?) // Memoization wrapper

// Options
{ ttl: '5m' | 5000, maxSize: 1000, onEvict: (key, value) => {} }

// TTL formats: '5s', '5m', '5h', '5d' or milliseconds

// Standalone
import { cache, createCache } from '@oxog/kit';
```

**Features:**
- TTL support (string or ms)
- Max size with LRU eviction
- Multi-get/set
- getOrSet for lazy loading
- Wrap for memoization
- Eviction callback
- Size tracking
- Key iteration

#### 3.2 `store` - Persistent Key-Value Store

```typescript
// API
app.store.get(key)
app.store.set(key, value)
app.store.has(key)
app.store.delete(key)
app.store.clear()
app.store.keys()
app.store.all()
app.store.path // File path

// Options (in createKit)
{ store: { path: './data/store.json', pretty: true } }

// Standalone
import { store, createStore } from '@oxog/kit';
const myStore = createStore({ path: './my-data.json' });
```

**Features:**
- File-based JSON persistence
- Atomic writes (write to temp, rename)
- Pretty print option
- Auto-create directory
- Sync and async APIs
- Debounced writes (batch rapid updates)

#### 3.3 `session` - Session Management

```typescript
// API
app.session.create(data?, options?)
app.session.get(sessionId)
app.session.set(sessionId, key, value)
app.session.destroy(sessionId)
app.session.refresh(sessionId)
app.session.isValid(sessionId)

// Options
{ ttl: '24h', prefix: 'sess:', store: 'memory' | 'file' }

// Standalone
import { session, createSessionManager } from '@oxog/kit';
```

**Features:**
- Session ID generation
- TTL-based expiration
- Memory or file storage
- Session refresh (extend TTL)
- Data get/set per session
- Validation

---

### Category 4: VALIDATION (3 modules)

#### 4.1 `validate` - Schema Validation

```typescript
// API
const schema = app.validate.schema({
  name: app.validate.string().min(1).max(100),
  email: app.validate.string().email(),
  age: app.validate.number().min(0).max(150).optional(),
  role: app.validate.enum(['admin', 'user']),
  tags: app.validate.array(app.validate.string()),
  meta: app.validate.object({ key: app.validate.string() })
});

const result = schema.parse(data); // Throws on error
const result = schema.safeParse(data); // Returns { success, data?, error? }

// Validators
app.validate.string()
app.validate.number()
app.validate.boolean()
app.validate.array(itemSchema)
app.validate.object(shape)
app.validate.enum(values)
app.validate.literal(value)
app.validate.union(schemas)
app.validate.optional()
app.validate.nullable()
app.validate.any()

// String modifiers
.min(n).max(n).length(n).email().url().uuid().regex(r).trim().lowercase().uppercase()

// Number modifiers
.min(n).max(n).int().positive().negative().finite()

// Standalone
import { validate, v } from '@oxog/kit';
const schema = v.object({ name: v.string() });
```

**Features:**
- Chainable schema builder (Zod-like)
- Type inference from schema
- Safe parse (no throw)
- Custom error messages
- Nested object/array validation
- String, number, boolean, array, object, enum, union types
- Optional/nullable
- Transform in validation

#### 4.2 `transform` - Data Transformation

```typescript
// API
app.transform.pipe(value, ...transformers)
app.transform.map(array, fn)
app.transform.filter(array, fn)
app.transform.reduce(array, fn, initial)
app.transform.flatten(array, depth?)
app.transform.unique(array, key?)
app.transform.groupBy(array, key)
app.transform.sortBy(array, key, order?)
app.transform.keyBy(array, key)
app.transform.pick(object, keys)
app.transform.omit(object, keys)
app.transform.rename(object, mapping)
app.transform.defaults(object, defaults)
app.transform.compact(arrayOrObject) // Remove falsy
app.transform.pluck(array, key)

// Standalone
import { transform, pipe } from '@oxog/kit';
```

**Features:**
- Pipe for chaining
- Array transformers (map, filter, reduce, flatten, unique, groupBy, sortBy)
- Object transformers (pick, omit, rename, defaults)
- Compact (remove nullish)
- Pluck values from array of objects

#### 4.3 `sanitize` - Input Sanitization

```typescript
// API
app.sanitize.html(input) // Escape HTML entities
app.sanitize.sql(input) // Escape SQL special chars
app.sanitize.regex(input) // Escape regex special chars
app.sanitize.filename(input) // Safe filename
app.sanitize.path(input) // Prevent path traversal
app.sanitize.url(input) // Validate and clean URL
app.sanitize.email(input) // Normalize email
app.sanitize.alphanumeric(input) // Keep only alphanumeric
app.sanitize.trim(input) // Trim whitespace
app.sanitize.normalize(input) // Unicode normalization

// Standalone
import { sanitize } from '@oxog/kit';
```

**Features:**
- XSS prevention (HTML escape)
- SQL injection prevention
- Path traversal prevention
- Filename sanitization
- URL validation and cleaning
- Email normalization
- Various character filters

---

### Category 5: PARSING & FORMAT (2 modules)

#### 5.1 `parse` - Multi-Format Parser

```typescript
// API
app.parse.json(string)
app.parse.yaml(string)
app.parse.toml(string)
app.parse.csv(string, options?)
app.parse.ini(string)
app.parse.dotenv(string)
app.parse.xml(string) // Basic XML to object
app.parse.qs(string) // Query string
app.parse.url(string)
app.parse.semver(string)
app.parse.bytes(string) // '1.5 MB' -> bytes
app.parse.duration(string) // '5m 30s' -> ms
app.parse.color(string) // '#fff' -> { r, g, b }
app.parse.cron(string) // Cron expression
app.parse.date(string, format?)

// Standalone
import { parse } from '@oxog/kit';
```

**Features:**
- JSON with comments support
- YAML subset (most common features)
- TOML full support
- CSV with options (delimiter, headers, quote)
- INI format
- Dotenv format
- Basic XML
- Query string
- URL parsing
- Semantic version
- Human-readable bytes
- Duration strings
- Color formats
- Cron expressions
- Date parsing

#### 5.2 `format` - Data Formatting

```typescript
// API
app.format.date(date, pattern) // 'YYYY-MM-DD HH:mm:ss'
app.format.number(num, options?) // Localized number
app.format.currency(num, currency, locale?)
app.format.percent(num, decimals?)
app.format.bytes(num, options?) // 1536 -> '1.5 KB'
app.format.duration(ms, options?) // 90000 -> '1m 30s'
app.format.relative(date) // '5 minutes ago'
app.format.ordinal(num) // 1 -> '1st'
app.format.plural(num, singular, plural?)
app.format.list(array, options?) // 'a, b, and c'
app.format.json(object, options?) // Pretty JSON
app.format.table(data) // ASCII table
app.format.truncate(string, length, suffix?)
app.format.pad(string, length, char?, side?)
app.format.mask(string, char?, visible?) // '****1234'

// Standalone
import { format } from '@oxog/kit';
```

**Features:**
- Date formatting with patterns
- Number localization
- Currency formatting
- Percentage
- Human-readable bytes
- Duration formatting
- Relative time
- Ordinal numbers
- Pluralization
- List formatting
- Pretty JSON
- ASCII table
- String truncation
- Padding
- Masking (credit cards, etc.)

---

### Category 6: ASYNC & CONCURRENCY (9 modules)

#### 6.1 `queue` - In-Memory Job Queue

```typescript
// API
app.queue.add(name, data, options?)
app.queue.process(name, handler)
app.queue.pause(name?)
app.queue.resume(name?)
app.queue.clear(name?)
app.queue.getJob(jobId)
app.queue.getJobs(name, status?)
app.queue.on('completed', handler)
app.queue.on('failed', handler)
app.queue.on('progress', handler)

// Options
{ delay: 5000, priority: 1, attempts: 3, backoff: 1000 }

// Standalone
import { queue, createQueue } from '@oxog/kit';
```

**Features:**
- Named queues
- Job priorities
- Delayed jobs
- Retry with backoff
- Job events (completed, failed, progress)
- Pause/resume
- Job status tracking
- Concurrency control

#### 6.2 `scheduler` - Cron-like Scheduling

```typescript
// API
app.scheduler.every(interval, handler) // '5m', '1h', '1d'
app.scheduler.cron(expression, handler) // '0 * * * *'
app.scheduler.at(date, handler) // One-time
app.scheduler.cancel(taskId)
app.scheduler.pause(taskId)
app.scheduler.resume(taskId)
app.scheduler.list()
app.scheduler.next(taskId) // Next run time

// Standalone
import { scheduler, createScheduler } from '@oxog/kit';
```

**Features:**
- Interval scheduling
- Cron expression support
- One-time scheduling
- Task management (cancel, pause, resume)
- Next run time calculation
- Timezone support

#### 6.3 `retry` - Retry with Backoff

```typescript
// API
app.retry(fn, options?)
app.retry.async(fn, options?)
app.retry.wrap(fn, options?) // Returns wrapped function

// Options
{
  attempts: 3,
  delay: 1000,
  factor: 2, // Exponential backoff
  maxDelay: 30000,
  timeout: 60000,
  retryIf: (error) => boolean,
  onRetry: (error, attempt) => void
}

// Standalone
import { retry } from '@oxog/kit';
```

**Features:**
- Configurable attempts
- Exponential backoff
- Max delay cap
- Timeout per attempt
- Conditional retry
- Retry callback

#### 6.4 `rateLimit` - Rate Limiting

```typescript
// API
app.rateLimit.check(key) // Returns { allowed, remaining, resetAt }
app.rateLimit.consume(key, tokens?)
app.rateLimit.reset(key)
app.rateLimit.get(key) // Get current state

// Configure per key pattern
app.rateLimit.configure('api:*', { limit: 100, window: '1m' })
app.rateLimit.configure('auth:*', { limit: 5, window: '15m' })

// Standalone
import { rateLimit, createRateLimiter } from '@oxog/kit';
```

**Features:**
- Token bucket algorithm
- Sliding window
- Per-key limits
- Pattern-based configuration
- Remaining tokens
- Reset time

#### 6.5 `circuit` - Circuit Breaker

```typescript
// API
app.circuit.call(name, fn)
app.circuit.getState(name) // 'closed' | 'open' | 'half-open'
app.circuit.reset(name)
app.circuit.on('open', handler)
app.circuit.on('close', handler)
app.circuit.on('half-open', handler)

// Configure
app.circuit.configure(name, {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  resetTimeout: 60000
})

// Standalone
import { circuit, createCircuitBreaker } from '@oxog/kit';
```

**Features:**
- Three states: closed, open, half-open
- Failure threshold
- Success threshold for recovery
- Automatic reset timeout
- State events
- Per-operation configuration

#### 6.6 `pool` - Resource Pooling

```typescript
// API
const pool = app.pool.create({
  create: () => createConnection(),
  destroy: (conn) => conn.close(),
  validate: (conn) => conn.isAlive(),
  min: 2,
  max: 10,
  acquireTimeout: 5000,
  idleTimeout: 30000
});

const conn = await pool.acquire();
// use connection
pool.release(conn);

pool.drain(); // Close all
pool.stats(); // { size, available, pending }

// Standalone
import { pool, createPool } from '@oxog/kit';
```

**Features:**
- Min/max pool size
- Resource creation/destruction
- Validation before use
- Acquire timeout
- Idle timeout
- Drain all resources
- Pool statistics

#### 6.7 `timeout` - Promise Timeout

```typescript
// API
app.timeout(promise, ms, message?)
app.timeout.fn(fn, ms) // Wrap function
app.timeout.race(promises, ms) // Race with timeout

// Standalone
import { timeout } from '@oxog/kit';
await timeout(fetchData(), 5000, 'Fetch timed out');
```

**Features:**
- Promise timeout wrapper
- Function wrapper
- Custom error message
- Race helper

#### 6.8 `debounce` - Debounce & Throttle

```typescript
// API
app.debounce(fn, wait, options?)
app.debounce.throttle(fn, wait, options?)
app.debounce.cancel(debouncedFn)
app.debounce.flush(debouncedFn)

// Options
{ leading: false, trailing: true, maxWait: undefined }

// Standalone
import { debounce, throttle } from '@oxog/kit';
```

**Features:**
- Debounce with leading/trailing
- Throttle
- Max wait
- Cancel pending
- Flush immediately

#### 6.9 `mutex` - Mutex & Semaphore

```typescript
// API
const lock = app.mutex.create()
await lock.acquire()
lock.release()
await lock.runExclusive(fn)

const semaphore = app.mutex.semaphore(3) // 3 concurrent
await semaphore.acquire()
semaphore.release()

// Standalone
import { mutex, semaphore, createMutex, createSemaphore } from '@oxog/kit';
```

**Features:**
- Mutex (single lock)
- Semaphore (counted locks)
- runExclusive helper
- Timeout on acquire
- Queue management

---

### Category 7: SECURITY (3 modules)

#### 7.1 `crypto` - Cryptographic Utilities

```typescript
// API
app.crypto.hash(algorithm, data) // 'sha256', 'sha512', 'md5'
app.crypto.hmac(algorithm, data, key)
app.crypto.randomBytes(size)
app.crypto.randomString(length, charset?)
app.crypto.randomInt(min, max)
app.crypto.randomUUID()
app.crypto.encrypt(data, key, algorithm?) // AES-256-GCM
app.crypto.decrypt(data, key, algorithm?)
app.crypto.timingSafeEqual(a, b)

// Standalone
import { crypto } from '@oxog/kit';
```

**Features:**
- Hash algorithms (SHA-256, SHA-512, MD5)
- HMAC
- Random bytes/string/int/UUID
- AES encryption/decryption
- Timing-safe comparison

#### 7.2 `jwt` - JSON Web Tokens

```typescript
// API
app.jwt.sign(payload, secret, options?)
app.jwt.verify(token, secret, options?)
app.jwt.decode(token) // No verification
app.jwt.isExpired(token)

// Options
{ expiresIn: '1h', algorithm: 'HS256', issuer: '', audience: '' }

// Standalone
import { jwt } from '@oxog/kit';
```

**Features:**
- Sign with HS256, HS384, HS512
- Verify with options
- Decode without verification
- Expiration check
- Standard claims (iss, aud, exp, iat, nbf)

#### 7.3 `hash` - Password Hashing

```typescript
// API
app.hash.password(password, options?) // Returns hash
app.hash.verify(password, hash) // Returns boolean
app.hash.needsRehash(hash, options?) // Check if outdated

// Options
{ algorithm: 'argon2' | 'bcrypt' | 'scrypt', cost: 10 }

// Standalone
import { hash } from '@oxog/kit';
```

**Features:**
- bcrypt-like password hashing (using native crypto)
- PBKDF2-based implementation
- Configurable cost/iterations
- Verify password
- Rehash detection

---

### Category 8: UTILITIES (19 modules)

#### 8.1 `id` - ID Generation

```typescript
// API
app.id.uuid() // UUID v4
app.id.uuidv7() // UUID v7 (time-sortable)
app.id.nanoid(size?) // NanoID
app.id.cuid() // CUID
app.id.ulid() // ULID
app.id.snowflake() // Snowflake ID
app.id.objectId() // MongoDB-style
app.id.short(size?) // Short unique ID
app.id.sequential(prefix?) // Sequential with prefix

// Standalone
import { id, uuid, nanoid, ulid } from '@oxog/kit';
```

**Features:**
- UUID v4 and v7
- NanoID (URL-safe)
- CUID (collision-resistant)
- ULID (sortable)
- Snowflake (distributed)
- ObjectId (MongoDB-style)
- Short IDs
- Sequential IDs

#### 8.2 `string` - String Utilities

```typescript
// API
app.string.camelCase(str)
app.string.pascalCase(str)
app.string.snakeCase(str)
app.string.kebabCase(str)
app.string.titleCase(str)
app.string.capitalize(str)
app.string.slugify(str)
app.string.truncate(str, length, suffix?)
app.string.pad(str, length, char?, side?)
app.string.repeat(str, times)
app.string.reverse(str)
app.string.words(str)
app.string.lines(str)
app.string.chars(str)
app.string.template(str, data) // Simple interpolation
app.string.escape(str, type?) // 'html' | 'regex'
app.string.unescape(str, type?)
app.string.trim(str, chars?)
app.string.contains(str, search)
app.string.startsWith(str, search)
app.string.endsWith(str, search)
app.string.count(str, search)
app.string.replace(str, search, replace, all?)
app.string.split(str, separator, limit?)
app.string.join(array, separator?)

// Standalone
import { string } from '@oxog/kit';
```

#### 8.3 `array` - Array Utilities

```typescript
// API
app.array.chunk(array, size)
app.array.unique(array, key?)
app.array.flatten(array, depth?)
app.array.compact(array) // Remove falsy
app.array.groupBy(array, key)
app.array.keyBy(array, key)
app.array.sortBy(array, key, order?)
app.array.shuffle(array)
app.array.sample(array, n?)
app.array.first(array, n?)
app.array.last(array, n?)
app.array.nth(array, n)
app.array.range(start, end, step?)
app.array.zip(...arrays)
app.array.unzip(array)
app.array.intersection(...arrays)
app.array.union(...arrays)
app.array.difference(array, ...others)
app.array.without(array, ...values)
app.array.move(array, from, to)
app.array.insert(array, index, ...items)
app.array.remove(array, predicate)
app.array.partition(array, predicate)
app.array.pluck(array, key)
app.array.sum(array, key?)
app.array.average(array, key?)
app.array.min(array, key?)
app.array.max(array, key?)
app.array.isEmpty(array)
app.array.isNotEmpty(array)

// Standalone
import { array } from '@oxog/kit';
```

#### 8.4 `object` - Object Utilities

```typescript
// API
app.object.get(obj, path, default?)
app.object.set(obj, path, value)
app.object.has(obj, path)
app.object.delete(obj, path)
app.object.pick(obj, keys)
app.object.omit(obj, keys)
app.object.merge(...objects)
app.object.deepMerge(...objects)
app.object.clone(obj)
app.object.deepClone(obj)
app.object.freeze(obj)
app.object.deepFreeze(obj)
app.object.keys(obj)
app.object.values(obj)
app.object.entries(obj)
app.object.fromEntries(entries)
app.object.invert(obj)
app.object.mapKeys(obj, fn)
app.object.mapValues(obj, fn)
app.object.filter(obj, predicate)
app.object.isEmpty(obj)
app.object.isNotEmpty(obj)
app.object.isPlain(value)
app.object.equals(a, b)
app.object.diff(a, b)
app.object.defaults(obj, ...defaults)
app.object.compact(obj) // Remove nullish
app.object.flatten(obj, separator?)
app.object.unflatten(obj, separator?)

// Standalone
import { object } from '@oxog/kit';
```

#### 8.5 `date` - Date Utilities

```typescript
// API
app.date.now()
app.date.parse(input, format?)
app.date.format(date, pattern)
app.date.isValid(date)
app.date.isBefore(date, other)
app.date.isAfter(date, other)
app.date.isSame(date, other, unit?)
app.date.isBetween(date, start, end)
app.date.add(date, amount, unit)
app.date.subtract(date, amount, unit)
app.date.startOf(date, unit)
app.date.endOf(date, unit)
app.date.diff(date, other, unit?)
app.date.relative(date) // '5 minutes ago'
app.date.calendar(date) // 'Today', 'Yesterday'
app.date.toUnix(date)
app.date.fromUnix(timestamp)
app.date.toISO(date)
app.date.toUTC(date)
app.date.toLocal(date)
app.date.getYear(date)
app.date.getMonth(date)
app.date.getDay(date)
app.date.getDayOfWeek(date)
app.date.getHour(date)
app.date.getMinute(date)
app.date.getSecond(date)
app.date.isLeapYear(year)
app.date.daysInMonth(year, month)

// Units: 'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'ms'

// Standalone
import { date } from '@oxog/kit';
```

#### 8.6 `math` - Math Utilities

```typescript
// API
app.math.clamp(value, min, max)
app.math.round(value, precision?)
app.math.floor(value, precision?)
app.math.ceil(value, precision?)
app.math.random(min?, max?)
app.math.randomInt(min, max)
app.math.sum(...values)
app.math.average(...values)
app.math.median(...values)
app.math.mode(...values)
app.math.min(...values)
app.math.max(...values)
app.math.range(values)
app.math.variance(values)
app.math.stdDev(values)
app.math.percentage(value, total)
app.math.percentChange(oldVal, newVal)
app.math.lerp(start, end, t)
app.math.map(value, inMin, inMax, outMin, outMax)
app.math.inRange(value, min, max)
app.math.isPrime(n)
app.math.factorial(n)
app.math.fibonacci(n)
app.math.gcd(a, b)
app.math.lcm(a, b)

// Standalone
import { math } from '@oxog/kit';
```

#### 8.7 `color` - Color Utilities

```typescript
// API
app.color.parse(input) // '#fff', 'rgb()', 'hsl()'
app.color.toHex(color)
app.color.toRgb(color)
app.color.toHsl(color)
app.color.toRgba(color, alpha)
app.color.lighten(color, amount)
app.color.darken(color, amount)
app.color.saturate(color, amount)
app.color.desaturate(color, amount)
app.color.invert(color)
app.color.grayscale(color)
app.color.complement(color)
app.color.mix(color1, color2, weight?)
app.color.contrast(color1, color2)
app.color.isLight(color)
app.color.isDark(color)
app.color.random()

// Standalone
import { color } from '@oxog/kit';
```

#### 8.8 `path` - Path Utilities

```typescript
// API
app.path.join(...parts)
app.path.resolve(...parts)
app.path.normalize(path)
app.path.relative(from, to)
app.path.dirname(path)
app.path.basename(path, ext?)
app.path.extname(path)
app.path.parse(path)
app.path.format(pathObject)
app.path.isAbsolute(path)
app.path.isRelative(path)
app.path.sep // Path separator
app.path.delimiter // Path delimiter

// Standalone
import { path } from '@oxog/kit';
```

#### 8.9 `url` - URL Utilities

```typescript
// API
app.url.parse(url)
app.url.format(urlObject)
app.url.resolve(base, path)
app.url.join(base, ...paths)
app.url.isValid(url)
app.url.isAbsolute(url)
app.url.getOrigin(url)
app.url.getHost(url)
app.url.getPath(url)
app.url.getQuery(url)
app.url.getHash(url)
app.url.setQuery(url, params)
app.url.addQuery(url, key, value)
app.url.removeQuery(url, key)
app.url.encode(string)
app.url.decode(string)
app.url.encodeComponent(string)
app.url.decodeComponent(string)

// Standalone
import { url } from '@oxog/kit';
```

#### 8.10 `mime` - MIME Types

```typescript
// API
app.mime.lookup(path) // 'image/png'
app.mime.extension(mimeType) // 'png'
app.mime.contentType(input) // With charset
app.mime.isText(mimeType)
app.mime.isImage(mimeType)
app.mime.isVideo(mimeType)
app.mime.isAudio(mimeType)
app.mime.isFont(mimeType)
app.mime.isCompressed(mimeType)

// Standalone
import { mime } from '@oxog/kit';
```

#### 8.11 `size` - Size Formatting

```typescript
// API
app.size.format(bytes, options?) // 1536 -> '1.5 KB'
app.size.parse(string) // '1.5 KB' -> 1536
app.size.bytes(value, unit) // Convert to bytes
app.size.toKB(bytes)
app.size.toMB(bytes)
app.size.toGB(bytes)
app.size.toTB(bytes)

// Options
{ decimals: 2, space: true, unit: 'binary' | 'decimal' }

// Standalone
import { size } from '@oxog/kit';
```

#### 8.12 `slug` - Slugify

```typescript
// API
app.slug.create(string, options?)
app.slug.isValid(slug)
app.slug.sanitize(slug)

// Options
{ separator: '-', lowercase: true, trim: true, strict: false }

// Standalone
import { slug, slugify } from '@oxog/kit';
```

#### 8.13 `timer` - Timing & Profiling

```typescript
// API
const t = app.timer.start(label?)
t.stop() // Returns duration in ms
t.elapsed() // Current elapsed
t.lap(label?) // Record lap time
t.reset()

app.timer.time(fn) // Returns [result, duration]
app.timer.timeAsync(fn)

app.timer.sleep(ms) // Promise-based delay
app.timer.defer(fn) // setImmediate-like
app.timer.nextTick(fn)

// Standalone
import { timer, sleep } from '@oxog/kit';
```

#### 8.14 `diff` - Object/Array Diff

```typescript
// API
app.diff.object(a, b) // Returns changes
app.diff.array(a, b) // Returns { added, removed, common }
app.diff.deep(a, b) // Deep comparison
app.diff.patch(obj, changes) // Apply changes

// Standalone
import { diff } from '@oxog/kit';
```

#### 8.15 `clone` - Deep Clone

```typescript
// API
app.clone(value) // Deep clone
app.clone.shallow(value)
app.clone.with(value, changes) // Clone and modify

// Standalone
import { clone, deepClone } from '@oxog/kit';
```

#### 8.16 `template` - String Templates

```typescript
// API
app.template.render(str, data)
app.template.compile(str) // Returns render function
app.template.escape(str)

// Syntax: {{variable}}, {{nested.path}}, {{#if}}, {{#each}}
const result = app.template.render('Hello {{name}}!', { name: 'World' });

// Standalone
import { template } from '@oxog/kit';
```

#### 8.17 `random` - Random Utilities

```typescript
// API
app.random.int(min, max)
app.random.float(min?, max?)
app.random.boolean(probability?)
app.random.string(length, charset?)
app.random.pick(array)
app.random.sample(array, n)
app.random.shuffle(array)
app.random.weighted(items) // [{ value, weight }]
app.random.color()
app.random.hex(length)

// Standalone
import { random } from '@oxog/kit';
```

#### 8.18 `regexp` - RegExp Utilities

```typescript
// API
app.regexp.escape(string)
app.regexp.isValid(pattern)
app.regexp.create(pattern, flags?)
app.regexp.match(string, pattern)
app.regexp.matchAll(string, pattern)
app.regexp.test(string, pattern)
app.regexp.replace(string, pattern, replacement)
app.regexp.split(string, pattern)

// Common patterns
app.regexp.patterns.email
app.regexp.patterns.url
app.regexp.patterns.uuid
app.regexp.patterns.phone
app.regexp.patterns.ip
app.regexp.patterns.ipv6
app.regexp.patterns.hex
app.regexp.patterns.slug
app.regexp.patterns.semver

// Standalone
import { regexp } from '@oxog/kit';
```

#### 8.19 `encoding` - Encoding Utilities

```typescript
// API
app.encoding.base64.encode(input)
app.encoding.base64.decode(input)
app.encoding.base64url.encode(input)
app.encoding.base64url.decode(input)
app.encoding.hex.encode(input)
app.encoding.hex.decode(input)
app.encoding.utf8.encode(input)
app.encoding.utf8.decode(input)
app.encoding.ascii.encode(input)
app.encoding.ascii.decode(input)

// Standalone
import { encoding, base64, hex } from '@oxog/kit';
```

---

### Category 9: OBSERVABILITY (3 modules)

#### 9.1 `metrics` - Prometheus-Style Metrics

```typescript
// API
app.metrics.counter(name, help?)
app.metrics.gauge(name, help?)
app.metrics.histogram(name, help?, buckets?)
app.metrics.summary(name, help?, percentiles?)

// Counter
const counter = app.metrics.counter('http_requests_total');
counter.inc()
counter.inc(5)
counter.inc({ method: 'GET' })

// Gauge
const gauge = app.metrics.gauge('active_connections');
gauge.set(100)
gauge.inc()
gauge.dec()

// Histogram
const histogram = app.metrics.histogram('request_duration_seconds');
histogram.observe(0.5)
histogram.startTimer() // Returns stop function

// Summary
const summary = app.metrics.summary('payload_size_bytes');
summary.observe(1024)

// Export
app.metrics.collect() // Prometheus format
app.metrics.toJSON()

// Standalone
import { metrics, createMetrics } from '@oxog/kit';
```

#### 9.2 `health` - Health Checks

```typescript
// API
app.health.register(name, check)
app.health.unregister(name)
app.health.check(name?)
app.health.status() // { healthy, checks }
app.health.serve(port, path?) // HTTP endpoint

// Check function returns boolean or throws
app.health.register('database', async () => {
  await db.ping();
  return true;
});

app.health.register('redis', () => redis.isConnected);

// Standalone
import { health, createHealthChecker } from '@oxog/kit';
```

#### 9.3 `trace` - Request Tracing

```typescript
// API
app.trace.start(name, meta?)
app.trace.end(traceId)
app.trace.span(name, fn)
app.trace.current() // Current trace/span
app.trace.addMeta(key, value)
app.trace.getTraceId()

// Auto-generates trace IDs, integrates with context

// Standalone
import { trace, createTracer } from '@oxog/kit';
```

---

### Category 10: FRAMEWORK ADAPTERS (5 modules)

#### 10.1 Express Middleware

```typescript
import { expressMiddleware } from '@oxog/kit';

const app = createKit({ name: 'my-api' });
const express = require('express');
const server = express();

server.use(expressMiddleware(app));

// Now in routes:
server.get('/users', (req, res) => {
  req.kit.log.info('Fetching users');
  req.kit.context.get('requestId');
});
```

#### 10.2 Fastify Plugin

```typescript
import { fastifyPlugin } from '@oxog/kit';

const app = createKit({ name: 'my-api' });
const fastify = require('fastify')();

fastify.register(fastifyPlugin(app));

fastify.get('/users', (request, reply) => {
  request.kit.log.info('Fetching users');
});
```

#### 10.3 Hono Middleware

```typescript
import { honoMiddleware } from '@oxog/kit';
import { Hono } from 'hono';

const app = createKit({ name: 'my-api' });
const hono = new Hono();

hono.use(honoMiddleware(app));

hono.get('/users', (c) => {
  c.kit.log.info('Fetching users');
});
```

#### 10.4 Koa Middleware

```typescript
import { koaMiddleware } from '@oxog/kit';
import Koa from 'koa';

const app = createKit({ name: 'my-api' });
const koa = new Koa();

koa.use(koaMiddleware(app));

koa.use(async (ctx) => {
  ctx.kit.log.info('Request received');
});
```

#### 10.5 Node HTTP Handler

```typescript
import { httpHandler } from '@oxog/kit';
import { createServer } from 'http';

const app = createKit({ name: 'my-api' });

const server = createServer(httpHandler(app, (req, res, kit) => {
  kit.log.info('Request received');
  res.end('Hello');
}));
```

---

### Category 11: PRESETS (5 presets)

```typescript
import { createKit, presets } from '@oxog/kit';

// API preset - Web APIs
const api = createKit({
  ...presets.api,
  name: 'my-api'
});
// Includes: log (json), config, env, errors, events, cache, http, 
// validate, metrics, health, context

// CLI preset - Command-line tools
const cli = createKit({
  ...presets.cli,
  name: 'my-cli'
});
// Includes: log (pretty), config, env, errors

// Worker preset - Background workers
const worker = createKit({
  ...presets.worker,
  name: 'my-worker'
});
// Includes: log, config, env, errors, events, queue, scheduler, retry

// Microservice preset - Kubernetes-ready
const micro = createKit({
  ...presets.microservice,
  name: 'user-service'
});
// Includes: everything in api + metrics (prefixed), health (k8s probes), trace

// Minimal preset - Bare essentials
const minimal = createKit({
  ...presets.minimal,
  name: 'script'
});
// Includes: log, config, env, errors
```

---

## TECHNICAL REQUIREMENTS

| Requirement | Value |
|-------------|-------|
| Runtime | Node.js (primary), Browser (partial) |
| Module Format | ESM + CJS |
| Node.js Version | >= 18 |
| TypeScript Version | >= 5.0 |
| Bundle Size (single module) | < 2KB gzipped |
| Bundle Size (core runtime) | < 8KB gzipped |
| Bundle Size (full kit) | < 50KB gzipped |

---

## PROJECT STRUCTURE

```
kit/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── index.ts                    # Main entry, createKit factory
│   ├── kernel.ts                   # Micro kernel core
│   ├── types.ts                    # Shared type definitions
│   ├── errors.ts                   # Base error classes
│   ├── core/
│   │   ├── log.ts
│   │   ├── config.ts
│   │   ├── env.ts
│   │   ├── errors.ts
│   │   ├── events.ts
│   │   ├── hooks.ts
│   │   └── context.ts
│   ├── network/
│   │   ├── http.ts
│   │   ├── ws.ts
│   │   └── sse.ts
│   ├── data/
│   │   ├── cache.ts
│   │   ├── store.ts
│   │   └── session.ts
│   ├── validation/
│   │   ├── validate.ts
│   │   ├── transform.ts
│   │   └── sanitize.ts
│   ├── parsing/
│   │   ├── parse.ts
│   │   └── format.ts
│   ├── async/
│   │   ├── queue.ts
│   │   ├── scheduler.ts
│   │   ├── retry.ts
│   │   ├── rateLimit.ts
│   │   ├── circuit.ts
│   │   ├── pool.ts
│   │   ├── timeout.ts
│   │   ├── debounce.ts
│   │   └── mutex.ts
│   ├── security/
│   │   ├── crypto.ts
│   │   ├── jwt.ts
│   │   └── hash.ts
│   ├── utils/
│   │   ├── id.ts
│   │   ├── string.ts
│   │   ├── array.ts
│   │   ├── object.ts
│   │   ├── date.ts
│   │   ├── math.ts
│   │   ├── color.ts
│   │   ├── path.ts
│   │   ├── url.ts
│   │   ├── mime.ts
│   │   ├── size.ts
│   │   ├── slug.ts
│   │   ├── timer.ts
│   │   ├── diff.ts
│   │   ├── clone.ts
│   │   ├── template.ts
│   │   ├── random.ts
│   │   ├── regexp.ts
│   │   └── encoding.ts
│   ├── observability/
│   │   ├── metrics.ts
│   │   ├── health.ts
│   │   └── trace.ts
│   ├── adapters/
│   │   ├── express.ts
│   │   ├── fastify.ts
│   │   ├── hono.ts
│   │   ├── koa.ts
│   │   └── http.ts
│   └── presets/
│       ├── index.ts
│       ├── api.ts
│       ├── cli.ts
│       ├── worker.ts
│       ├── microservice.ts
│       └── minimal.ts
├── tests/
│   ├── unit/
│   │   ├── core/
│   │   ├── network/
│   │   ├── data/
│   │   ├── validation/
│   │   ├── parsing/
│   │   ├── async/
│   │   ├── security/
│   │   ├── utils/
│   │   ├── observability/
│   │   └── adapters/
│   ├── integration/
│   └── fixtures/
├── examples/
│   ├── 01-basic/
│   ├── 02-core-modules/
│   ├── 03-network/
│   ├── 04-validation/
│   ├── 05-async/
│   ├── 06-security/
│   ├── 07-utilities/
│   ├── 08-observability/
│   ├── 09-frameworks/
│   ├── 10-presets/
│   └── 11-real-world/
├── website/
│   ├── public/
│   │   ├── CNAME                   # kit.oxog.dev
│   │   └── llms.txt
│   ├── src/
│   └── ...
├── llms.txt
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── .gitignore
```

---

## EXPORTS CONFIGURATION

```json
{
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    },
    "./core": { ... },
    "./network": { ... },
    "./data": { ... },
    "./validation": { ... },
    "./parsing": { ... },
    "./async": { ... },
    "./security": { ... },
    "./utils": { ... },
    "./observability": { ... },
    "./adapters/express": { ... },
    "./adapters/fastify": { ... },
    "./adapters/hono": { ... },
    "./adapters/koa": { ... },
    "./adapters/http": { ... },
    "./presets": { ... }
  }
}
```

---

## TSUP CONFIGURATION

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/network/index.ts',
    'src/data/index.ts',
    'src/validation/index.ts',
    'src/parsing/index.ts',
    'src/async/index.ts',
    'src/security/index.ts',
    'src/utils/index.ts',
    'src/observability/index.ts',
    'src/adapters/express.ts',
    'src/adapters/fastify.ts',
    'src/adapters/hono.ts',
    'src/adapters/koa.ts',
    'src/adapters/http.ts',
    'src/presets/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
```

---

## PACKAGE.JSON

```json
{
  "name": "@oxog/kit",
  "version": "1.0.0",
  "description": "Zero-dependency standard library for Node.js - everything you need in one kit",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:coverage"
  },
  "keywords": [
    "kit",
    "toolkit",
    "stdlib",
    "standard-library",
    "zero-dependency",
    "utilities",
    "helpers",
    "typescript",
    "node",
    "logging",
    "validation",
    "crypto"
  ],
  "author": "Ersin Koç",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ersinkoc/kit.git"
  },
  "bugs": {
    "url": "https://github.com/ersinkoc/kit/issues"
  },
  "homepage": "https://kit.oxog.dev",
  "engines": {
    "node": ">=18"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

---

## VITEST CONFIGURATION

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        '*.config.*',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

---

## GITHUB ACTIONS

```yaml
# .github/workflows/deploy.yml
name: Deploy Website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Build package
        run: npm run build
      
      - name: Build website
        working-directory: ./website
        run: |
          npm ci
          npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './website/dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## WEBSITE REQUIREMENTS

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Syntax Highlighting**: Prism React Renderer
- **Icons**: Lucide React
- **Domain**: kit.oxog.dev

### Required Pages

1. **Home** - Hero with feature grid (52 modules!), install command, quick example
2. **Getting Started** - Installation, basic usage, presets
3. **API Reference** - All 52 modules documented with examples
4. **Examples** - 15+ organized examples
5. **Presets** - api, cli, worker, microservice, minimal
6. **Playground** - Interactive editor

### Footer

- @oxog/kit
- MIT License
- © 2025 Ersin Koç
- GitHub link only

---

## IMPLEMENTATION CHECKLIST

### Before Starting
- [ ] Create SPECIFICATION.md with complete spec
- [ ] Create IMPLEMENTATION.md with architecture
- [ ] Create TASKS.md with ordered task list
- [ ] All three documents reviewed and complete

### During Implementation
- [ ] Follow TASKS.md sequentially
- [ ] Write tests before or with each feature
- [ ] Maintain 100% coverage throughout
- [ ] JSDoc on every public API with @example
- [ ] Create examples as features are built

### Package Completion
- [ ] All tests passing (100%)
- [ ] Coverage at 100% (lines, branches, functions)
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Package builds without errors

### LLM-Native Completion
- [ ] llms.txt created (< 2000 tokens)
- [ ] llms.txt copied to website/public/
- [ ] README first 500 tokens optimized
- [ ] All public APIs have JSDoc + @example
- [ ] 15+ examples in organized folders
- [ ] package.json has keywords
- [ ] API uses standard naming patterns

### Website Completion
- [ ] All pages implemented
- [ ] IDE-style code blocks with line numbers
- [ ] Copy buttons working
- [ ] Dark/Light theme toggle
- [ ] CNAME file with kit.oxog.dev
- [ ] Mobile responsive
- [ ] Footer correct

### Final Verification
- [ ] `npm run build` succeeds
- [ ] `npm run test:coverage` shows 100%
- [ ] Website builds without errors
- [ ] All examples run successfully
- [ ] README is complete and accurate

---

## BEGIN IMPLEMENTATION

Start by creating **SPECIFICATION.md** with the complete package specification based on everything above.

Then create **IMPLEMENTATION.md** with architecture decisions.

Then create **TASKS.md** with ordered, numbered tasks.

Only after all three documents are complete, begin implementing code by following TASKS.md sequentially.

**Remember:**
- This package will be published to npm as @oxog/kit
- It must be production-ready
- Zero runtime dependencies
- 100% test coverage
- Professionally documented
- LLM-native design
- Beautiful documentation website
- 52 modules, all tree-shakeable

# @oxog/kit - Implementation Architecture

## 1. Architecture Overview

@oxog/kit implements a **micro-kernel architecture** with a plugin-based module system. This design enables:

- **Tree-shaking**: Each module is independently importable
- **Composability**: Modules can be combined as needed
- **Extensibility**: New modules can be added without breaking existing code
- **Testability**: Each module can be tested in isolation

## 2. Micro-Kernel Design

### 2.1 Kernel Responsibilities

The micro-kernel (`kernel.ts`) provides:

1. **Plugin Registry**: Dynamic module registration and resolution
2. **Lifecycle Management**: init, start, stop phases for all modules
3. **Event Bus**: Cross-module communication
4. **Context Propagation**: Shared state across modules

### 2.2 Kernel Architecture

```typescript
interface Kernel {
  // Plugin management
  register(name: string, plugin: Plugin): void;
  get(name: string): Plugin | undefined;
  has(name: string): boolean;

  // Lifecycle
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;

  // Event bus
  emit(event: string, ...args: unknown[]): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler?: (...args: unknown[]) => void): void;

  // Context
  context: AsyncLocalStorage<Context>;
}

interface Plugin {
  name: string;
  version: string;
  init?(kernel: Kernel): Promise<void> | void;
  start?(): Promise<void> | void;
  stop?(): Promise<void> | void;
}
```

### 2.3 Module Initialization Order

1. **Core Runtime** (no dependencies)
   - log, config, env, errors, events, hooks, context

2. **Foundational** (depend on core)
   - validate, transform, sanitize, parse, format

3. **Feature** (depend on foundational)
   - network, data, async, security, utils

4. **Integration** (depend on features)
   - observability, adapters, presets

## 3. Module Implementation Pattern

### 3.1 Standard Module Structure

Every module follows this structure:

```typescript
// src/modules/[category]/[module].ts

import type { Kernel } from '../kernel.js';

// Module state (private)
interface State {
  // Module-specific state
}

// Create function
export function create[Module](options: [Module]Options = {}): [Module]API {
  const state: State = {
    // Initialize state
  };

  return {
    // Public API methods
    method1() { /* ... */ },
    method2() { /* ... */ },
  };
}

// Plugin wrapper (optional)
export const [Module]Plugin = {
  name: '[module]',
  version: '1.0.0',
  async init(kernel: Kernel) {
    const module = create[Module](kernel.config.get('[module]'));
    kernel.register('[module]', module);
  }
};
```

### 3.2 API Design Principles

1. **Factory Pattern**: `create[Module](options?)` for standalone use
2. **Fluent API**: Chain methods where appropriate
3. **Options Last**: Optional options object as last parameter
4. **Immutability**: Don't mutate input parameters
5. **Error Handling**: Throw typed errors with context

### 3.3 Type Definitions

```typescript
// src/types/modules.ts

export interface [Module]Options {
  // Configuration options
}

export interface [Module]API {
  // Public methods
}
```

## 4. Category-Specific Architecture

### 4.1 Core Runtime Modules

#### Log Module
- **Architecture**: Hierarchical logger with child contexts
- **State**: Level, formatters, transports
- **Pattern**: Builder for child loggers

#### Config Module
- **Architecture**: Layered configuration (defaults → file → env)
- **State**: Config object, watchers
- **Pattern**: Proxy for dot notation access

#### Events Module
- **Architecture**: EventEmitter with wildcard support
- **State**: Listener registry, wildcard patterns
- **Pattern**: Event delegation for wildcards

#### Context Module
- **Architecture**: AsyncLocalStorage wrapper
- **State**: None (uses Node.js ALS)
- **Pattern**: Implicit context propagation

### 4.2 Network Modules

#### HTTP Module
- **Architecture**: Interceptor chain around fetch API
- **State**: Default config, interceptors
- **Pattern**: Middleware pipeline for request/response

```typescript
interface Interceptor {
  request?(config: RequestConfig): RequestConfig | Promise<RequestConfig>;
  response?(response: Response): Response | Promise<Response>;
  error?(error: Error): void | Promise<void>;
}
```

#### WebSocket Module
- **Architecture**: Reconnecting WebSocket wrapper
- **State**: Connection state, reconnect timers
- **Pattern**: State machine (connecting → open → closed → reconnecting)

#### SSE Module
- **Architecture**: EventSource with reconnection
- **State**: Connection, event handlers
- **Pattern**: Event delegation

### 4.3 Data Modules

#### Cache Module
- **Architecture**: LRU cache with TTL
- **State**: Map storage, index, max size
- **Pattern**: Map with access tracking for eviction

```typescript
interface CacheEntry<T> {
  value: T;
  expires: number | null;
  access: number;
  key: string;
}
```

#### Store Module
- **Architecture**: File-based JSON with atomic writes
- **State**: In-memory cache, file path, dirty flag
- **Pattern**: Write-behind caching with debouncing

#### Session Module
- **Architecture**: Session store with TTL
- **State**: Sessions map, storage backend
- **Pattern**: Token-based session ID

### 4.4 Validation Modules

#### Validate Module
- **Architecture**: Chainable schema builder
- **State**: Schema definition, validators
- **Pattern**: Fluent builder for schemas

```typescript
interface Schema<T> {
  parse(data: unknown): T;
  safeParse(data: unknown): Result<T>;
}
```

#### Transform Module
- **Architecture**: Pure functional transformations
- **State**: None (stateless utilities)
- **Pattern**: Function composition via pipe

#### Sanitize Module
- **Architecture**: Input sanitization utilities
- **State**: None (stateless utilities)
- **Pattern**: Pure functions

### 4.5 Async Modules

#### Queue Module
- **Architecture**: In-memory job queue
- **State**: Jobs map, processors, active jobs
- **Pattern**: Producer-consumer with job states

```typescript
interface Job {
  id: string;
  name: string;
  data: unknown;
  status: 'pending' | 'active' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
}
```

#### Scheduler Module
- **Architecture**: Cron-like scheduler
- **State**: Scheduled tasks map, timers
- **Pattern**: Timer registry with cron parsing

#### Retry Module
- **Architecture**: Retry wrapper with exponential backoff
- **State**: None (stateless wrapper)
- **Pattern**: Higher-order function

#### RateLimit Module
- **Architecture**: Token bucket algorithm
- **State**: Buckets map, refill timers
- **Pattern**: Sliding window with tokens

#### Circuit Module
- **Architecture**: Circuit breaker state machine
- **State**: Circuit states map, failure counts
- **Pattern**: State machine (closed → open → half-open)

```typescript
type CircuitState = 'closed' | 'open' | 'half-open';

interface Circuit {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  successes: number;
}
```

#### Pool Module
- **Architecture**: Resource pool
- **State**: Available resources, pending requests
- **Pattern**: Semaphore-like acquisition

#### Timeout Module
- **Architecture**: Promise.race wrapper
- **State**: None (stateless wrapper)
- **Pattern**: Race condition

#### Debounce Module
- **Architecture**: Timer-based debouncing
- **State**: Timers map, pending values
- **Pattern**: Timer management

#### Mutex Module
- **Architecture**: Async mutex and semaphore
- **State**: Lock queue, owner
- **Pattern**: Queue-based lock acquisition

### 4.6 Security Modules

#### Crypto Module
- **Architecture**: Wrapper around Node.js crypto API
- **State**: None (uses Node.js crypto)
- **Pattern**: Functional utilities

#### JWT Module
- **Architecture**: JWT signing and verification
- **State**: None (stateless functions)
- **Pattern**: Pure functions

#### Hash Module
- **Architecture**: Password hashing using Node.js crypto
- **State**: Algorithm config
- **Pattern**: PBKDF2-based hashing

### 4.7 Utility Modules

All utility modules follow a **stateless functional pattern**:

- **No internal state**
- **Pure functions**
- **Immutable operations**
- **Composable utilities**

### 4.8 Observability Modules

#### Metrics Module
- **Architecture**: Prometheus-style metrics registry
- **State**: Metrics map (counters, gauges, histograms)
- **Pattern**: Registry with metric types

```typescript
interface Counter {
  inc(value?: number, labels?: Labels): void;
  reset(): void;
}

interface Gauge {
  set(value: number, labels?: Labels): void;
  inc(value?: number, labels?: Labels): void;
  dec(value?: number, labels?: Labels): void;
}

interface Histogram {
  observe(value: number, labels?: Labels): void;
  startTimer(labels?: Labels): () => void;
}
```

#### Health Module
- **Architecture**: Health check registry
- **State**: Checks map, last results
- **Pattern**: Registry with async check functions

#### Trace Module
- **Architecture**: Request tracing with span tracking
- **State**: Active traces map, current span
- **Pattern**: Stack-based span management

### 4.9 Framework Adapters

All adapters follow the **middleware pattern**:

- **Attach kit instance** to request object
- **Create async context** for request
- **Integrate with framework lifecycle**
- **Auto-generate request IDs**

```typescript
// Express adapter
interface RequestWithKit extends Request {
  kit: Kit;
}

function expressMiddleware(kit: Kit) {
  return (req: RequestWithKit, res: Response, next: NextFunction) => {
    req.kit = kit;
    kit.context.run({ requestId: generateId() }, next);
  };
}
```

### 4.10 Presets

Presets are **configuration objects** that:

1. Define which modules to include
2. Configure module options
3. Set up integrations
4. Provide defaults

```typescript
const apiPreset = {
  log: { level: 'info', pretty: false },
  config: { env: true },
  env: {},
  errors: {},
  events: {},
  cache: { maxSize: 1000 },
  http: { timeout: 30000 },
  // ...
};
```

## 5. Implementation Strategies

### 5.1 Zero-Dependency Implementation

For every external dependency we might need, we implement from scratch:

| Instead of | We implement |
|------------|--------------|
| lodash | Our own array/object utilities |
| axios | Our own HTTP client using fetch |
| moment | Our own date utilities |
| date-fns | Our own date utilities |
| uuid | Our own UUID generation |
| bcrypt | Our own password hashing (crypto) |
| ws | Our own WebSocket wrapper |
| zod | Our own validation |
| yaml | Our own YAML parser |
| toml | Our own TOML parser |

### 5.2 Test-Driven Development

1. Write test first
2. See it fail
3. Implement minimal code to pass
4. Refactor
5. Ensure coverage at 100%

### 5.3 TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### 5.4 Tree-Shaking Strategy

1. **Pure functions**: No side effects at module level
2. **Explicit exports**: Named exports only
3. **Side effects**: false in package.json
4. **Splitting**: Enable code splitting in tsup

### 5.5 Error Handling Pattern

```typescript
// All errors extend KitError
export class KitError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'KitError';
  }
}

// Specific error types
export class ValidationError extends KitError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}
```

## 6. Performance Considerations

### 6.1 Cache Design

- **O(1) get/set**: Use Map for storage
- **Efficient eviction**: Doubly-linked list for LRU
- **Memory bounded**: Max size enforcement
- **TTL tracking**: Sorted by expiration for cleanup

### 6.2 Event System

- **O(n) emission**: Direct listener iteration
- **Wildcard optimization**: Pattern matching cache
- **Memory management**: Auto-remove weak references

### 6.3 Validation

- **Fast path**: Type checking before validation
- **Lazy evaluation**: Don't validate unless needed
- **Error aggregation**: Collect all errors at once

### 6.4 Parsing

- **Streaming**: Process large inputs in chunks
- **Early exit**: Stop parsing on error
- **Memory efficient**: Use generators where possible

## 7. Build Strategy

### 7.1 Bundler Configuration (tsup)

```typescript
export default defineConfig({
  entry: ['src/index.ts', 'src/*/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false, // Let users minify
});
```

### 7.2 Package Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./core": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.js"
    }
  }
}
```

### 7.3 Dual Package (ESM + CJS)

- **ESM first**: Primary target is ES modules
- **CJS compatibility**: Use tsup for dual build
- **Import conditions**: Node.js resolves automatically

## 8. Documentation Strategy

### 8.1 JSDoc Pattern

```typescript
/**
 * Creates a new logger instance.
 *
 * @example
 * ```typescript
 * const logger = createLogger({ level: 'info' });
 * logger.info('Hello world');
 * ```
 *
 * @param options - Logger configuration options
 * @returns A logger instance with methods for all log levels
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  // ...
}
```

### 8.2 Example Organization

```
examples/
├── 01-basic/          # Getting started
├── 02-core-modules/   # log, config, env, errors
├── 03-network/        # http, ws, sse
├── 04-validation/     # validate, transform, sanitize
├── 05-async/          # queue, scheduler, retry
├── 06-security/       # crypto, jwt, hash
├── 07-utilities/      # string, array, object, date
├── 08-observability/  # metrics, health, trace
├── 09-frameworks/     # Express, Fastify, Hono, Koa
├── 10-presets/        # api, cli, worker presets
└── 11-real-world/     # Complete applications
```

### 8.3 LLM Optimization

**llms.txt** structure:

```
# @oxog/kit

Zero-dependency standard library for Node.js.

## Quick Start
npm install @oxog/kit

## Core API
createKit() -> Kit app
app.log.info()
app.config.get()
app.http.get()
...

## All Modules
[52 module listings with one-line each]

## Patterns
- Factory: createX()
- Options: fn(value, options?)
- Events: on/emit
- Lifecycle: init/start/stop
```

## 9. Testing Strategy

### 9.1 Test Organization

```
tests/
├── unit/
│   ├── core/
│   ├── network/
│   └── ...
├── integration/
│   ├── full-kit.spec.ts
│   └── presets.spec.ts
└── fixtures/
    ├── test-data.json
    └── mock-server.ts
```

### 9.2 Coverage Requirements

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
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

### 9.3 Test Patterns

```typescript
// Unit test
describe('module.method', () => {
  it('should do X', () => {
    const result = module.method(input);
    expect(result).toEqual(expected);
  });

  it('should throw on invalid input', () => {
    expect(() => module.method(invalid)).toThrow(ValidationError);
  });
});

// Integration test
describe('createKit', () => {
  it('should initialize all modules', async () => {
    const kit = createKit({ modules: ['log', 'config'] });
    await kit.init();
    expect(kit.log).toBeDefined();
    expect(kit.config).toBeDefined();
  });
});
```

## 10. Deployment Strategy

### 10.1 NPM Publishing

```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm run test:coverage"
  }
}
```

### 10.2 Website Deployment

- **GitHub Pages**: Automatic deployment on main branch push
- **Domain**: kit.oxog.dev via CNAME
- **Build**: Vite build in GitHub Actions

### 10.3 CI/CD Pipeline

1. **On PR**: Run tests, lint, typecheck
2. **On main**: Deploy website
3. **On tag**: Publish to npm

## 11. Success Metrics

### 11.1 Technical Metrics
- ✅ Zero runtime dependencies
- ✅ 100% test coverage
- ✅ All TypeScript strict checks pass
- ✅ Bundle size < 50KB full kit

### 11.2 Documentation Metrics
- ✅ JSDoc on all public APIs
- ✅ 15+ examples
- ✅ llms.txt < 2000 tokens
- ✅ Complete website

### 11.3 Quality Metrics
- ✅ No ESLint warnings
- ✅ Consistent formatting
- ✅ All tests passing
- ✅ Zero security vulnerabilities

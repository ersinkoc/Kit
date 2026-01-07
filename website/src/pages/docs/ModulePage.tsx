import { useParams, Link, Navigate } from 'react-router-dom';
import { MODULES } from '@/lib/constants';
import { ArrowLeft, Package, FileCode, Book } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const MODULE_CONTENT: Record<string, {
  examples: { title: string; code: string; language?: string }[];
  functions: { name: string; description: string; signature: string }[];
}> = {
  utils: {
    examples: [
      {
        title: 'String Utilities',
        code: `import { string } from '@oxog/kit/utils';

// Slugify
const slug = string.slugify('Hello World!'); // 'hello-world'

// Truncate
const short = string.truncate('Long text here', 10); // 'Long te...'

// Capitalize
const cap = string.capitalize('hello'); // 'Hello'

// Template literals
const result = string.template('Hello {name}!', { name: 'World' });`,
      },
      {
        title: 'Array Utilities',
        code: `import { array } from '@oxog/kit/utils';

// Chunk array
const chunks = array.chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Unique values
const unique = array.unique([1, 2, 2, 3]); // [1, 2, 3]

// Group by
const grouped = array.groupBy(users, 'role');

// Shuffle
const shuffled = array.shuffle([1, 2, 3, 4, 5]);`,
      },
    ],
    functions: [
      { name: 'string.slugify', description: 'Convert string to URL-safe slug', signature: '(input: string) => string' },
      { name: 'string.truncate', description: 'Truncate string with ellipsis', signature: '(str: string, length: number) => string' },
      { name: 'array.chunk', description: 'Split array into chunks', signature: '<T>(arr: T[], size: number) => T[][]' },
      { name: 'array.unique', description: 'Remove duplicate values', signature: '<T>(arr: T[]) => T[]' },
    ],
  },
  validation: {
    examples: [
      {
        title: 'Schema Validation',
        code: `import { validate } from '@oxog/kit/validation';

const userSchema = validate.object({
  email: validate.string().required().email(),
  age: validate.number().min(0).max(150),
  role: validate.enum(['user', 'admin']).default('user'),
});

const result = userSchema.validate({
  email: 'user@example.com',
  age: 25,
});

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.errors);
}`,
      },
    ],
    functions: [
      { name: 'validate.string', description: 'String validation schema', signature: '() => StringSchema' },
      { name: 'validate.number', description: 'Number validation schema', signature: '() => NumberSchema' },
      { name: 'validate.object', description: 'Object validation schema', signature: '<T>(shape: T) => ObjectSchema<T>' },
      { name: 'validate.array', description: 'Array validation schema', signature: '<T>(schema: Schema<T>) => ArraySchema<T>' },
    ],
  },
  security: {
    examples: [
      {
        title: 'JWT Operations',
        code: `import { jwt, password } from '@oxog/kit/security';

// Create JWT token
const token = jwt.sign(
  { userId: '123', role: 'admin' },
  'your-secret-key',
  { expiresIn: '1h' }
);

// Verify token
const decoded = jwt.verify(token, 'your-secret-key');

// Password hashing
const hash = await password.hash('myPassword123');
const isValid = await password.verify('myPassword123', hash);`,
      },
    ],
    functions: [
      { name: 'jwt.sign', description: 'Create JWT token', signature: '(payload: object, secret: string, options?: JwtOptions) => string' },
      { name: 'jwt.verify', description: 'Verify and decode JWT', signature: '(token: string, secret: string) => JwtPayload' },
      { name: 'password.hash', description: 'Hash password with bcrypt', signature: '(password: string) => Promise<string>' },
      { name: 'password.verify', description: 'Verify password against hash', signature: '(password: string, hash: string) => Promise<boolean>' },
    ],
  },
  async: {
    examples: [
      {
        title: 'Queue & Retry',
        code: `import { createQueue, retry, circuitBreaker } from '@oxog/kit/async';

// Create a queue with concurrency control
const queue = createQueue({ concurrency: 3 });

await queue.add(() => processItem(1));
await queue.add(() => processItem(2));

// Retry with exponential backoff
const data = await retry(
  () => fetchData(),
  { retries: 3, delay: 1000, backoff: 'exponential' }
);

// Circuit breaker for fault tolerance
const breaker = circuitBreaker(unreliableService, {
  failureThreshold: 5,
  resetTimeout: 30000,
});`,
      },
    ],
    functions: [
      { name: 'createQueue', description: 'Create async task queue', signature: '(options: QueueOptions) => Queue' },
      { name: 'retry', description: 'Retry function with backoff', signature: '<T>(fn: () => Promise<T>, options: RetryOptions) => Promise<T>' },
      { name: 'circuitBreaker', description: 'Wrap function with circuit breaker', signature: '<T>(fn: Function, options: CircuitBreakerOptions) => Function' },
      { name: 'debounce', description: 'Debounce function calls', signature: '<T>(fn: Function, delay: number) => Function' },
    ],
  },
  core: {
    examples: [
      {
        title: 'Logging & Events',
        code: `import { createLogger, createEventEmitter } from '@oxog/kit/core';

// Create a logger
const logger = createLogger({ level: 'info', prefix: 'App' });
logger.info('Application started');
logger.error('Something went wrong', { error });

// Event emitter
const events = createEventEmitter();
events.on('user:created', (user) => {
  logger.info('User created', { userId: user.id });
});
events.emit('user:created', { id: '123', name: 'John' });`,
      },
    ],
    functions: [
      { name: 'createLogger', description: 'Create structured logger', signature: '(options: LoggerOptions) => Logger' },
      { name: 'createEventEmitter', description: 'Create typed event emitter', signature: '<T>() => EventEmitter<T>' },
      { name: 'createConfig', description: 'Create configuration manager', signature: '<T>(schema: T) => ConfigManager<T>' },
    ],
  },
  observability: {
    examples: [
      {
        title: 'Metrics & Health',
        code: `import { metrics, healthCheck } from '@oxog/kit/observability';

// Create metrics
const requestCounter = metrics.counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labels: ['method', 'path', 'status'],
});

requestCounter.inc({ method: 'GET', path: '/api', status: '200' });

// Health checks
const health = healthCheck({
  database: () => db.ping(),
  redis: () => redis.ping(),
  external: () => fetch('https://api.example.com/health'),
});

const status = await health.check();`,
      },
    ],
    functions: [
      { name: 'metrics.counter', description: 'Create counter metric', signature: '(options: MetricOptions) => Counter' },
      { name: 'metrics.gauge', description: 'Create gauge metric', signature: '(options: MetricOptions) => Gauge' },
      { name: 'metrics.histogram', description: 'Create histogram metric', signature: '(options: HistogramOptions) => Histogram' },
      { name: 'healthCheck', description: 'Create health check endpoint', signature: '(checks: HealthChecks) => HealthChecker' },
    ],
  },
  network: {
    examples: [
      {
        title: 'HTTP Client',
        code: `import { createHttpClient } from '@oxog/kit/network';

const client = createHttpClient({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  headers: { 'Authorization': 'Bearer token' },
});

// GET request
const users = await client.get('/users');

// POST request
const newUser = await client.post('/users', {
  body: { name: 'John', email: 'john@example.com' },
});

// With interceptors
client.interceptors.request.use((config) => {
  config.headers['X-Request-Id'] = generateId();
  return config;
});`,
      },
    ],
    functions: [
      { name: 'createHttpClient', description: 'Create HTTP client instance', signature: '(options: HttpClientOptions) => HttpClient' },
      { name: 'createWebSocket', description: 'Create WebSocket client', signature: '(url: string, options?: WsOptions) => WebSocketClient' },
      { name: 'createSSEClient', description: 'Create SSE client', signature: '(url: string) => SSEClient' },
    ],
  },
  data: {
    examples: [
      {
        title: 'Cache & Store',
        code: `import { createCache, createStore } from '@oxog/kit/data';

// In-memory cache with TTL
const cache = createCache<string>({ ttl: 60000 });
await cache.set('key', 'value');
const value = await cache.get('key');

// Key-value store
const store = createStore({
  adapter: 'memory', // or 'file', 'redis'
});

await store.set('user:123', { name: 'John' });
const user = await store.get('user:123');

// Session management
const session = createSession({
  secret: 'your-secret',
  ttl: 3600,
});`,
      },
    ],
    functions: [
      { name: 'createCache', description: 'Create cache instance', signature: '<T>(options: CacheOptions) => Cache<T>' },
      { name: 'createStore', description: 'Create key-value store', signature: '(options: StoreOptions) => Store' },
      { name: 'createSession', description: 'Create session manager', signature: '(options: SessionOptions) => SessionManager' },
    ],
  },
  parsing: {
    examples: [
      {
        title: 'JSON & URL Parsing',
        code: `import { json, url, queryString } from '@oxog/kit/parsing';

// Safe JSON parsing
const data = json.parse(jsonString, { default: {} });
const str = json.stringify(data, { pretty: true });

// URL parsing
const parsed = url.parse('https://example.com/path?q=test');
console.log(parsed.hostname, parsed.query);

// Query string
const qs = queryString.parse('name=John&age=30');
const str = queryString.stringify({ name: 'John', age: 30 });`,
      },
    ],
    functions: [
      { name: 'json.parse', description: 'Safe JSON parse with fallback', signature: '<T>(str: string, options?: ParseOptions) => T' },
      { name: 'json.stringify', description: 'JSON stringify with options', signature: '(data: unknown, options?: StringifyOptions) => string' },
      { name: 'url.parse', description: 'Parse URL string', signature: '(url: string) => ParsedUrl' },
      { name: 'queryString.parse', description: 'Parse query string', signature: '(qs: string) => Record<string, string>' },
    ],
  },
};

export function ModulePage() {
  const { moduleName } = useParams<{ moduleName: string }>();

  const module = MODULES.find((m) => m.name === moduleName);

  if (!module) {
    return <Navigate to="/docs/modules" replace />;
  }

  const content = MODULE_CONTENT[moduleName || ''] || { examples: [], functions: [] };

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/docs/modules"
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Modules
        </Link>
        <h1 className="text-4xl font-bold mb-2">{module.title}</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))] mb-4">
          {module.description}
        </p>
        <code className="text-sm bg-[hsl(var(--muted))] px-3 py-1.5 rounded-md">
          import {'{ ... }'} from '@oxog/kit/{module.name}'
        </code>
      </div>

      {/* Installation */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Installation
        </h2>
        <CodeBlock
          code={`npm install @oxog/kit`}
          language="bash"
          showLineNumbers={false}
        />
      </section>

      {/* Examples */}
      {content.examples.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Examples
          </h2>
          <div className="space-y-6">
            {content.examples.map((example, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium mb-2">{example.title}</h3>
                <CodeBlock
                  code={example.code}
                  language={example.language || 'typescript'}
                  filename={`${example.title.toLowerCase().replace(/\s+/g, '-')}.ts`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* API Reference */}
      {content.functions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Book className="h-5 w-5" />
            API Reference
          </h2>
          <div className="space-y-4">
            {content.functions.map((fn, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <code className="text-[hsl(var(--primary))] font-semibold">
                    {fn.name}
                  </code>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                  {fn.description}
                </p>
                <code className="text-xs bg-[hsl(var(--muted))] px-2 py-1 rounded">
                  {fn.signature}
                </code>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

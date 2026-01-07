import { useState } from 'react';
import { Search } from 'lucide-react';
import { MODULES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ApiFunction {
  name: string;
  signature: string;
  description: string;
  example?: string;
}

interface ModuleApi {
  module: string;
  title: string;
  functions: ApiFunction[];
}

const API_DATA: ModuleApi[] = [
  {
    module: 'utils',
    title: 'Utilities',
    functions: [
      { name: 'string.slugify', signature: '(str: string): string', description: 'Convert string to URL-friendly slug' },
      { name: 'string.camelCase', signature: '(str: string): string', description: 'Convert string to camelCase' },
      { name: 'string.truncate', signature: '(str: string, length: number, suffix?: string): string', description: 'Truncate string to specified length' },
      { name: 'array.chunk', signature: '<T>(arr: T[], size: number): T[][]', description: 'Split array into chunks' },
      { name: 'array.unique', signature: '<T>(arr: T[]): T[]', description: 'Remove duplicate values' },
      { name: 'array.groupBy', signature: '<T>(arr: T[], key: keyof T): Record<string, T[]>', description: 'Group array items by key' },
      { name: 'object.get', signature: '(obj: any, path: string, defaultValue?: any): any', description: 'Get value at path' },
      { name: 'object.set', signature: '(obj: any, path: string, value: any): any', description: 'Set value at path' },
      { name: 'object.pick', signature: '<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>', description: 'Pick specified keys' },
      { name: 'random.uuid', signature: '(): string', description: 'Generate UUID v4' },
      { name: 'date.format', signature: '(date: Date, pattern: string): string', description: 'Format date using pattern' },
    ],
  },
  {
    module: 'validation',
    title: 'Validation',
    functions: [
      { name: 'validate.string', signature: '(): StringValidator', description: 'Create string validator' },
      { name: 'validate.number', signature: '(): NumberValidator', description: 'Create number validator' },
      { name: 'validate.object', signature: '(shape: Schema): ObjectValidator', description: 'Create object validator' },
      { name: 'validate.array', signature: '(itemSchema: Validator): ArrayValidator', description: 'Create array validator' },
      { name: 'sanitize.stripTags', signature: '(html: string): string', description: 'Remove HTML tags' },
      { name: 'sanitize.escape', signature: '(str: string): string', description: 'Escape HTML entities' },
      { name: 'transform.trim', signature: '(str: string): string', description: 'Trim whitespace' },
      { name: 'transform.toNumber', signature: '(val: any): number | null', description: 'Convert to number' },
    ],
  },
  {
    module: 'security',
    title: 'Security',
    functions: [
      { name: 'jwt.sign', signature: '(payload: object, secret: string, options?: JWTOptions): string', description: 'Create signed JWT' },
      { name: 'jwt.verify', signature: '<T>(token: string, secret: string): T', description: 'Verify JWT token' },
      { name: 'jwt.decode', signature: '(token: string): object | null', description: 'Decode JWT without verification' },
      { name: 'hash.password', signature: '(password: string, options?: HashOptions): Promise<string>', description: 'Hash password' },
      { name: 'hash.verify', signature: '(password: string, hash: string): Promise<boolean>', description: 'Verify password' },
      { name: 'crypto.encrypt', signature: '(data: string, key: string): string', description: 'Encrypt data with AES-256' },
      { name: 'crypto.decrypt', signature: '(encrypted: string, key: string): string', description: 'Decrypt data' },
      { name: 'crypto.generateKey', signature: '(size?: number): string', description: 'Generate secure key' },
    ],
  },
  {
    module: 'async',
    title: 'Async',
    functions: [
      { name: 'createQueue', signature: '(options?: QueueOptions): Queue', description: 'Create task queue' },
      { name: 'retry', signature: '<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>', description: 'Retry with backoff' },
      { name: 'createCircuitBreaker', signature: '(options?: CircuitBreakerOptions): CircuitBreaker', description: 'Create circuit breaker' },
      { name: 'createRateLimiter', signature: '(options: RateLimiterOptions): RateLimiter', description: 'Create rate limiter' },
      { name: 'createMutex', signature: '(): Mutex', description: 'Create mutex lock' },
      { name: 'debounce', signature: '<T>(fn: (...args: any[]) => T, wait: number): DebouncedFunction<T>', description: 'Create debounced function' },
      { name: 'throttle', signature: '<T>(fn: (...args: any[]) => T, wait: number): ThrottledFunction<T>', description: 'Create throttled function' },
      { name: 'createPool', signature: '<T>(options: PoolOptions<T>): Pool<T>', description: 'Create resource pool' },
    ],
  },
  {
    module: 'observability',
    title: 'Observability',
    functions: [
      { name: 'metrics.counter', signature: '(options: CounterOptions): Counter', description: 'Create counter metric' },
      { name: 'metrics.gauge', signature: '(options: GaugeOptions): Gauge', description: 'Create gauge metric' },
      { name: 'metrics.histogram', signature: '(options: HistogramOptions): Histogram', description: 'Create histogram metric' },
      { name: 'metrics.toPrometheus', signature: '(): string', description: 'Export metrics to Prometheus format' },
      { name: 'createHealthChecker', signature: '(options?: HealthOptions): HealthChecker', description: 'Create health checker' },
      { name: 'createTracer', signature: '(options?: TracerOptions): Tracer', description: 'Create distributed tracer' },
    ],
  },
  {
    module: 'network',
    title: 'Network',
    functions: [
      { name: 'http.get', signature: '<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>', description: 'HTTP GET request' },
      { name: 'http.post', signature: '<T>(url: string, body?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>', description: 'HTTP POST request' },
      { name: 'createWebSocket', signature: '(url: string, options?: WebSocketOptions): WebSocketClient', description: 'Create WebSocket client' },
      { name: 'createSSE', signature: '(url: string, options?: SSEOptions): SSEClient', description: 'Create SSE client' },
    ],
  },
];

export function ApiOverview() {
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const filteredApi = API_DATA.filter((mod) => {
    if (activeModule && mod.module !== activeModule) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      mod.title.toLowerCase().includes(searchLower) ||
      mod.functions.some(
        (fn) =>
          fn.name.toLowerCase().includes(searchLower) ||
          fn.description.toLowerCase().includes(searchLower)
      )
    );
  }).map((mod) => ({
    ...mod,
    functions: search
      ? mod.functions.filter(
          (fn) =>
            fn.name.toLowerCase().includes(search.toLowerCase()) ||
            fn.description.toLowerCase().includes(search.toLowerCase())
        )
      : mod.functions,
  }));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">API Reference</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))]">
          Complete API documentation for all @oxog/kit modules.
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search functions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveModule(null)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeModule === null
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            )}
          >
            All
          </button>
          {MODULES.slice(0, 6).map((mod) => (
            <button
              key={mod.name}
              onClick={() => setActiveModule(mod.name)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeModule === mod.name
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              {mod.title}
            </button>
          ))}
        </div>
      </div>

      {/* API list */}
      <div className="space-y-8">
        {filteredApi.map((mod) => (
          <div key={mod.module}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold">{mod.title}</h2>
              <code className="text-sm px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                @oxog/kit/{mod.module}
              </code>
            </div>

            <div className="grid gap-3">
              {mod.functions.map((fn) => (
                <div
                  key={fn.name}
                  className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <code className="text-[hsl(var(--primary))] font-semibold">
                        {fn.name}
                      </code>
                      <code className="text-[hsl(var(--muted-foreground))] text-sm ml-1">
                        {fn.signature}
                      </code>
                    </div>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                    {fn.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

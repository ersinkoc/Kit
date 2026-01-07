import { useState } from 'react';
import { CodeBlock } from '@/components/code/CodeBlock';
import { cn } from '@/lib/utils';

interface Example {
  id: string;
  title: string;
  description: string;
  category: string;
  code: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'form-validation',
    title: 'Form Validation',
    description: 'Validate user input with schema-based validation',
    category: 'Validation',
    code: `import { validate } from '@oxog/kit/validation';

const userSchema = validate.object({
  email: validate.string().required().email(),
  password: validate.string().required().min(8),
  age: validate.number().optional().min(18),
});

const result = userSchema.validate({
  email: 'user@example.com',
  password: 'securepass123',
  age: 25,
});

if (result.valid) {
  console.log('User data:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}`,
  },
  {
    id: 'jwt-auth',
    title: 'JWT Authentication',
    description: 'Create and verify JWT tokens for authentication',
    category: 'Security',
    code: `import { jwt, hash } from '@oxog/kit/security';

// Hash password for storage
const hashedPassword = await hash.password('userPassword');

// Later, verify the password
const isValid = await hash.verify('userPassword', hashedPassword);

// Create JWT token
const token = jwt.sign(
  { userId: '123', role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify JWT token
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  console.log('User ID:', payload.userId);
} catch (error) {
  console.log('Invalid token');
}`,
  },
  {
    id: 'task-queue',
    title: 'Task Queue',
    description: 'Process tasks with controlled concurrency',
    category: 'Async',
    code: `import { createQueue } from '@oxog/kit/async';

const queue = createQueue({ concurrency: 3 });

async function processItems(items) {
  const results = await Promise.all(
    items.map(item =>
      queue.add(async () => {
        // Process item
        const result = await processItem(item);
        return result;
      })
    )
  );

  return results;
}

// Monitor queue status
console.log('Pending:', queue.size);
console.log('Running:', queue.pending);

// Wait for all tasks to complete
await queue.onIdle();`,
  },
  {
    id: 'retry-circuit',
    title: 'Retry & Circuit Breaker',
    description: 'Handle failures with retry and circuit breaker patterns',
    category: 'Async',
    code: `import { retry, createCircuitBreaker } from '@oxog/kit/async';

// Retry with exponential backoff
const data = await retry(
  async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  {
    retries: 3,
    delay: 1000,
    factor: 2,
    onRetry: (error, attempt) => {
      console.log(\`Retry \${attempt}: \${error.message}\`);
    },
  }
);

// Circuit breaker for failure protection
const breaker = createCircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
});

const result = await breaker.execute(async () => {
  return await riskyApiCall();
});

console.log('Circuit state:', breaker.state);`,
  },
  {
    id: 'metrics',
    title: 'Application Metrics',
    description: 'Collect and export metrics in Prometheus format',
    category: 'Observability',
    code: `import { metrics } from '@oxog/kit/observability';

// Create metrics
const requestCounter = metrics.counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labels: ['method', 'path', 'status'],
});

const requestDuration = metrics.histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration',
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Record metrics
requestCounter.inc({ method: 'GET', path: '/api', status: '200' });

const timer = requestDuration.startTimer();
await handleRequest();
timer(); // Records duration

// Export to Prometheus format
app.get('/metrics', (req, res) => {
  res.type('text/plain').send(metrics.toPrometheus());
});`,
  },
  {
    id: 'health-checks',
    title: 'Health Checks',
    description: 'Monitor application health with custom checks',
    category: 'Observability',
    code: `import { createHealthChecker } from '@oxog/kit/observability';

const health = createHealthChecker();

// Register database check
health.register('database', async () => {
  const latency = await db.ping();
  return {
    status: latency < 100 ? 'healthy' : 'degraded',
    latency,
  };
}, { critical: true, timeout: 5000 });

// Register cache check
health.register('cache', async () => {
  await redis.ping();
  return { status: 'healthy' };
}, { critical: false });

// Health endpoint
app.get('/health', async (req, res) => {
  const report = await health.check();
  res.status(report.status === 'healthy' ? 200 : 503).json(report);
});`,
  },
  {
    id: 'http-client',
    title: 'HTTP Client',
    description: 'Make HTTP requests with interceptors',
    category: 'Network',
    code: `import { createHttpClient, createAuthInterceptor } from '@oxog/kit/network';

const api = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// Add auth interceptor
api.addRequestInterceptor(createAuthInterceptor({
  type: 'bearer',
  token: () => localStorage.getItem('accessToken'),
}));

// Add logging interceptor
api.addResponseInterceptor((response) => {
  console.log(\`\${response.status} \${response.config.url}\`);
  return response;
});

// Make requests
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });`,
  },
];

const CATEGORIES = ['All', ...new Set(EXAMPLES.map((e) => e.category))];

export function Examples() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeExample, setActiveExample] = useState(EXAMPLES[0]);

  const filteredExamples = activeCategory === 'All'
    ? EXAMPLES
    : EXAMPLES.filter((e) => e.category === activeCategory);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Examples</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))]">
          Practical examples to help you get started with @oxog/kit.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeCategory === category
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Example list */}
        <div className="lg:col-span-1 space-y-2">
          {filteredExamples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                activeExample.id === example.id
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)]'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  {example.category}
                </span>
              </div>
              <h3 className="font-semibold">{example.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                {example.description}
              </p>
            </button>
          ))}
        </div>

        {/* Code display */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <h2 className="text-xl font-bold mb-2">{activeExample.title}</h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-4">
              {activeExample.description}
            </p>
            <CodeBlock
              code={activeExample.code}
              language="typescript"
              filename={`${activeExample.id}.ts`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

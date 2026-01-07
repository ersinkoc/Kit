import { CodeBlock } from '@/components/code/CodeBlock';

const validationExample = `import { validate } from '@oxog/kit/validation';

// Define a schema
const userSchema = validate.object({
  email: validate.string().required().email(),
  password: validate.string().required().min(8),
  age: validate.number().optional().min(0).max(150),
  roles: validate.array(validate.string()).default([]),
});

// Validate data
const result = userSchema.validate({
  email: 'user@example.com',
  password: 'securepassword123',
  age: 25,
});

if (result.valid) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.errors);
}`;

const securityExample = `import { jwt, hash } from '@oxog/kit/security';

// Hash a password
const hashedPassword = await hash.password('mySecurePassword');

// Verify password
const isValid = await hash.verify('mySecurePassword', hashedPassword);

// Create JWT token
const token = jwt.sign(
  { userId: '123', role: 'admin' },
  'your-secret-key',
  { expiresIn: '1h' }
);

// Verify JWT token
const payload = jwt.verify(token, 'your-secret-key');
console.log(payload.userId); // '123'`;

const asyncExample = `import { createQueue, retry, createCircuitBreaker } from '@oxog/kit/async';

// Task queue with concurrency control
const queue = createQueue({ concurrency: 3 });

const results = await Promise.all([
  queue.add(() => processItem(1)),
  queue.add(() => processItem(2)),
  queue.add(() => processItem(3)),
]);

// Retry with exponential backoff
const data = await retry(
  async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  { retries: 3, delay: 1000, factor: 2 }
);

// Circuit breaker for failure protection
const breaker = createCircuitBreaker({
  failureThreshold: 5,
  timeout: 30000,
});

const result = await breaker.execute(() => riskyApiCall());`;

const observabilityExample = `import { metrics, createHealthChecker, createTracer } from '@oxog/kit/observability';

// Metrics
const requestCounter = metrics.counter({
  name: 'http_requests_total',
  labels: ['method', 'path', 'status'],
});

requestCounter.inc({ method: 'GET', path: '/api/users', status: '200' });

// Health checks
const health = createHealthChecker();
health.register('database', async () => {
  await db.ping();
  return { status: 'healthy' };
}, { critical: true });

const report = await health.check();

// Distributed tracing
const tracer = createTracer({ serviceName: 'my-service' });
const span = tracer.startSpan('http-request');
// ... do work
span.end();`;

export function QuickStart() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))]">
          Learn the basics of @oxog/kit with practical examples.
        </p>
      </div>

      {/* Validation */}
      <div>
        <h2 className="text-2xl font-bold mb-4">1. Validation</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          Build type-safe validation schemas with a fluent API:
        </p>
        <CodeBlock code={validationExample} language="typescript" filename="validation.ts" />
      </div>

      {/* Security */}
      <div>
        <h2 className="text-2xl font-bold mb-4">2. Security</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          Handle authentication with JWT and password hashing:
        </p>
        <CodeBlock code={securityExample} language="typescript" filename="security.ts" />
      </div>

      {/* Async */}
      <div>
        <h2 className="text-2xl font-bold mb-4">3. Async Patterns</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          Manage concurrent operations with queues, retry, and circuit breakers:
        </p>
        <CodeBlock code={asyncExample} language="typescript" filename="async.ts" />
      </div>

      {/* Observability */}
      <div>
        <h2 className="text-2xl font-bold mb-4">4. Observability</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-4">
          Monitor your application with metrics, health checks, and tracing:
        </p>
        <CodeBlock code={observabilityExample} language="typescript" filename="observability.ts" />
      </div>

      {/* Next steps */}
      <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h3 className="font-semibold mb-2">Next Steps</h3>
        <ul className="space-y-2 text-[hsl(var(--muted-foreground))]">
          <li>• Explore the <a href="/api" className="text-[hsl(var(--primary))] hover:underline">API Reference</a> for complete documentation</li>
          <li>• Check out the <a href="/examples" className="text-[hsl(var(--primary))] hover:underline">Examples</a> for real-world use cases</li>
          <li>• Try the <a href="/playground" className="text-[hsl(var(--primary))] hover:underline">Playground</a> to experiment with the APIs</li>
        </ul>
      </div>
    </div>
  );
}

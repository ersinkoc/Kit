/**
 * Distributed Tracing Example
 * Track requests across services
 */
import { createTracer, InMemorySpanExporter, propagation } from '@oxog/kit/observability';

// Create a tracer with in-memory exporter
const exporter = new InMemorySpanExporter();
const tracer = createTracer({
  serviceName: 'api-gateway',
  serviceVersion: '1.0.0',
  exporter,
});

// Simulated services
async function userService(userId: string): Promise<object> {
  return tracer.startActiveSpan('userService.getUser', async (span) => {
    span.setAttribute('user.id', userId);

    // Simulate DB query
    await tracer.startActiveSpan('db.query', async (dbSpan) => {
      dbSpan.setAttribute('db.type', 'postgresql');
      dbSpan.setAttribute('db.statement', 'SELECT * FROM users WHERE id = ?');
      await new Promise(r => setTimeout(r, 50));
    });

    return { id: userId, name: 'John Doe', email: 'john@example.com' };
  });
}

async function orderService(userId: string): Promise<object[]> {
  return tracer.startActiveSpan('orderService.getOrders', async (span) => {
    span.setAttribute('user.id', userId);

    // Simulate cache check
    const cached = await tracer.startActiveSpan('cache.get', async (cacheSpan) => {
      cacheSpan.setAttribute('cache.key', `orders:${userId}`);
      await new Promise(r => setTimeout(r, 5));
      cacheSpan.addEvent('cache_miss');
      return null;
    });

    if (!cached) {
      // Simulate DB query
      await tracer.startActiveSpan('db.query', async (dbSpan) => {
        dbSpan.setAttribute('db.type', 'mongodb');
        dbSpan.setAttribute('db.collection', 'orders');
        await new Promise(r => setTimeout(r, 80));
      });
    }

    return [
      { id: 'order-1', product: 'Widget', amount: 29.99 },
      { id: 'order-2', product: 'Gadget', amount: 49.99 },
    ];
  });
}

// Main request handler
async function handleRequest(userId: string): Promise<object> {
  return tracer.startActiveSpan('handleRequest', { kind: 'server' }, async (span) => {
    span.setAttribute('http.method', 'GET');
    span.setAttribute('http.url', `/api/users/${userId}/profile`);
    span.setAttribute('user.id', userId);

    try {
      // Fetch user and orders in parallel
      const [user, orders] = await Promise.all([
        userService(userId),
        orderService(userId),
      ]);

      span.setStatus('ok');
      span.setAttribute('http.status_code', 200);

      return { user, orders, timestamp: new Date().toISOString() };
    } catch (error) {
      span.recordException(error as Error);
      span.setAttribute('http.status_code', 500);
      throw error;
    }
  });
}

// Run the example
console.log('=== Distributed Tracing Example ===\n');
console.log('Handling request...\n');

const result = await handleRequest('user-123');
console.log('Result:', JSON.stringify(result, null, 2));

// Print collected spans
console.log('\n--- Collected Spans ---\n');

const spans = exporter.getSpans();
for (const span of spans) {
  const indent = span.parentSpanId ? '  └─ ' : '';
  console.log(`${indent}${span.name}`);
  console.log(`${indent}   TraceID: ${span.context.traceId.slice(0, 8)}...`);
  console.log(`${indent}   Duration: ${span.duration}ms`);
  console.log(`${indent}   Status: ${span.status}`);

  const attrs = Object.entries(span.attributes);
  if (attrs.length > 0) {
    console.log(`${indent}   Attributes:`);
    for (const [key, value] of attrs) {
      console.log(`${indent}     ${key}: ${value}`);
    }
  }

  if (span.events.length > 0) {
    console.log(`${indent}   Events:`);
    for (const event of span.events) {
      console.log(`${indent}     ${event.name}`);
    }
  }

  console.log();
}

// Context propagation example
console.log('=== Context Propagation ===\n');

const parentSpan = tracer.startSpan('parent-request');
const headers: Record<string, string> = {};

// Inject trace context into headers (for HTTP request)
propagation.inject(parentSpan.context, headers);
console.log('Injected headers:', headers);

// Extract trace context from headers (in downstream service)
const extractedContext = propagation.extract(headers);
console.log('Extracted context:', extractedContext);

parentSpan.end();

// Shutdown
await tracer.shutdown();

console.log('\n✅ Distributed tracing example completed!');

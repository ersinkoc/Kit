/**
 * Metrics and Health Check Example
 * Application observability and monitoring
 */
import { createMetrics, createHealthChecker, healthChecks } from '@oxog/kit/observability';

// Create a metrics registry
const metrics = createMetrics({ prefix: 'myapp_' });

// Create counters
const httpRequests = metrics.counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labels: ['method', 'path', 'status'],
});

const activeConnections = metrics.gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

const requestDuration = metrics.histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labels: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

// Simulate some requests
console.log('=== Metrics Example ===\n');
console.log('Simulating HTTP requests...\n');

function simulateRequest(method: string, path: string, status: number, duration: number) {
  httpRequests.inc({ method, path, status: String(status) });
  requestDuration.observe(duration, { method, path });
}

// Simulate various requests
simulateRequest('GET', '/api/users', 200, 0.05);
simulateRequest('GET', '/api/users', 200, 0.08);
simulateRequest('POST', '/api/users', 201, 0.15);
simulateRequest('GET', '/api/users/1', 200, 0.03);
simulateRequest('GET', '/api/users/999', 404, 0.02);
simulateRequest('DELETE', '/api/users/1', 200, 0.1);
simulateRequest('GET', '/api/products', 200, 0.12);
simulateRequest('GET', '/api/products', 500, 0.25);

// Update gauge
activeConnections.set(42);

// Print metrics in Prometheus format
console.log('--- Prometheus Format ---');
console.log(metrics.toPrometheus());

// Health Checks Example
console.log('\n=== Health Check Example ===\n');

const health = createHealthChecker({ timeout: 5000 });

// Register health checks
health.register('database', healthChecks.custom(async () => {
  // Simulate database check
  await new Promise(r => setTimeout(r, 50));
  return true; // Database is healthy
}));

health.register('cache', healthChecks.custom(async () => {
  // Simulate cache check
  await new Promise(r => setTimeout(r, 30));
  return true; // Cache is healthy
}));

health.register('memory', healthChecks.memory({ maxUsagePercent: 90 }));

health.register({
  name: 'external-api',
  timeout: 3000,
  critical: false, // Non-critical - degraded if fails
}, healthChecks.custom(async () => {
  // Simulate external API check
  await new Promise(r => setTimeout(r, 100));
  // Randomly fail 30% of the time
  if (Math.random() < 0.3) {
    throw new Error('External API unavailable');
  }
  return true;
}));

// Run health checks
const report = await health.check();

console.log('Health Report:');
console.log('Status:', report.status);
console.log('Duration:', report.duration + 'ms');
console.log('\nChecks:');
for (const check of report.checks) {
  const icon = check.status === 'healthy' ? '✅' : check.status === 'degraded' ? '⚠️' : '❌';
  console.log(`  ${icon} ${check.name}: ${check.status} (${check.duration}ms)`);
  if (check.message) console.log(`      ${check.message}`);
  if (check.details) console.log(`      Details:`, check.details);
}

// Liveness and readiness
console.log('\n--- Kubernetes Probes ---');
console.log('Liveness:', await health.isLive());
console.log('Readiness:', await health.isReady());

// Timer example
console.log('\n=== Request Timer Example ===');

const timer = metrics.timer({
  name: 'api_call_duration_seconds',
  help: 'API call duration',
  labels: ['service'],
});

// Time some operations
async function simulateApiCall(service: string, duration: number) {
  const end = timer.start({ service });
  await new Promise(r => setTimeout(r, duration));
  const elapsed = end();
  console.log(`${service} call took ${(elapsed * 1000).toFixed(2)}ms`);
}

await simulateApiCall('user-service', 50);
await simulateApiCall('product-service', 120);
await simulateApiCall('payment-service', 200);

// Stop health check periodic timers
health.stop();

console.log('\n✅ Metrics and health check example completed!');

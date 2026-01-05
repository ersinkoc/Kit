/**
 * Retry and Circuit Breaker Example
 * Resilient API calls with automatic retry and circuit breaker
 */
import { retry, createCircuitBreaker, createRateLimiter } from '@oxog/kit/async';

// Simulated flaky API that fails sometimes
let callCount = 0;
async function flakyApi(): Promise<string> {
  callCount++;
  console.log(`  API call attempt #${callCount}`);

  // Fail 70% of the time
  if (Math.random() < 0.7) {
    throw new Error('API temporarily unavailable');
  }

  return 'Success!';
}

// Retry Example
console.log('=== Retry Example ===');
console.log('Calling flaky API with retry (max 5 attempts, exponential backoff)...\n');

try {
  const result = await retry(flakyApi, {
    retries: 5,
    delay: 100,
    backoff: 'exponential',
    onRetry: (error, attempt) => {
      console.log(`  Retry ${attempt}: ${error.message}`);
    },
  });
  console.log('Result:', result);
} catch (error) {
  console.log('All retries failed:', (error as Error).message);
}

// Circuit Breaker Example
console.log('\n=== Circuit Breaker Example ===');

const circuitBreaker = createCircuitBreaker({
  failureThreshold: 3, // Open after 3 failures
  resetTimeout: 5000,  // Try to recover after 5 seconds
});

// Simulated service
let serviceCallCount = 0;
async function unreliableService(): Promise<string> {
  serviceCallCount++;
  console.log(`  Service call #${serviceCallCount}`);

  // Fail for first 5 calls
  if (serviceCallCount <= 5) {
    throw new Error('Service unavailable');
  }

  return 'Service response';
}

console.log('Making multiple calls to unreliable service...\n');

for (let i = 1; i <= 10; i++) {
  try {
    const result = await circuitBreaker.execute(unreliableService);
    console.log(`Call ${i}: ${result} (Circuit: ${circuitBreaker.getState()})`);
  } catch (error) {
    console.log(`Call ${i}: ${(error as Error).message} (Circuit: ${circuitBreaker.getState()})`);
  }

  // Small delay between calls
  await new Promise(r => setTimeout(r, 200));
}

console.log('\nCircuit Breaker Stats:', circuitBreaker.getStats());

// Rate Limiter Example
console.log('\n=== Rate Limiter Example ===');

const rateLimiter = createRateLimiter({
  limit: 3,       // 3 requests
  window: 2000,   // per 2 seconds
});

console.log('Rate limit: 3 requests per 2 seconds\n');

async function makeRequest(id: number): Promise<void> {
  try {
    await rateLimiter.execute(async () => {
      console.log(`Request ${id}: Executed at ${Date.now() % 10000}`);
      return id;
    });
  } catch (error) {
    console.log(`Request ${id}: Rate limited`);
  }
}

// Make 6 rapid requests
console.log('Making 6 rapid requests...');
await Promise.all([
  makeRequest(1),
  makeRequest(2),
  makeRequest(3),
  makeRequest(4),
  makeRequest(5),
  makeRequest(6),
]);

console.log('\nRate Limiter Stats:', rateLimiter.getStats());

// Clean up
rateLimiter.destroy();

console.log('\n✅ Retry and circuit breaker example completed!');

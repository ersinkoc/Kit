/**
 * Mutex, Debounce and Throttle Example
 * Synchronization and rate limiting utilities
 */
import { createMutex, createSemaphore, debounce, throttle, delay } from '@oxog/kit/async';

// Mutex Example
console.log('=== Mutex Example ===\n');

const mutex = createMutex();
let sharedCounter = 0;

async function incrementCounter(id: number): Promise<void> {
  console.log(`Worker ${id}: Waiting for lock...`);
  await mutex.acquire();

  try {
    console.log(`Worker ${id}: Acquired lock, counter = ${sharedCounter}`);
    const value = sharedCounter;
    await delay(100); // Simulate async work
    sharedCounter = value + 1;
    console.log(`Worker ${id}: Updated counter to ${sharedCounter}`);
  } finally {
    mutex.release();
    console.log(`Worker ${id}: Released lock`);
  }
}

// Without mutex, this would cause race conditions
console.log('Starting 3 workers concurrently...\n');
await Promise.all([
  incrementCounter(1),
  incrementCounter(2),
  incrementCounter(3),
]);
console.log(`\nFinal counter: ${sharedCounter} (expected: 3)`);

// Run exclusive
console.log('\n--- Run Exclusive ---');
const result = await mutex.runExclusive(async () => {
  console.log('Running exclusive operation...');
  await delay(50);
  return 'completed';
});
console.log('Result:', result);

// Semaphore Example
console.log('\n\n=== Semaphore Example ===\n');

const semaphore = createSemaphore(2); // Allow 2 concurrent

async function limitedTask(id: number): Promise<void> {
  console.log(`Task ${id}: Waiting for permit...`);
  await semaphore.acquire();

  try {
    console.log(`Task ${id}: Running (permits: ${semaphore.getPermits()})`);
    await delay(200);
    console.log(`Task ${id}: Done`);
  } finally {
    semaphore.release();
  }
}

console.log('Starting 5 tasks with semaphore limit of 2...\n');
await Promise.all([
  limitedTask(1),
  limitedTask(2),
  limitedTask(3),
  limitedTask(4),
  limitedTask(5),
]);

// Debounce Example
console.log('\n\n=== Debounce Example ===\n');

let searchCallCount = 0;
const search = debounce((query: string) => {
  searchCallCount++;
  console.log(`Searching for: "${query}" (call #${searchCallCount})`);
}, 300);

console.log('Simulating rapid typing "hello"...');
search('h');
search('he');
search('hel');
search('hell');
search('hello');

// Wait for debounce to trigger
await delay(400);
console.log(`Total search calls: ${searchCallCount} (expected: 1)`);

// Debounce with leading edge
console.log('\n--- Debounce with Leading Edge ---');
let leadingCount = 0;
const leadingDebounce = debounce((x: number) => {
  leadingCount++;
  console.log(`Called with: ${x} (call #${leadingCount})`);
}, { wait: 200, leading: true });

leadingDebounce(1); // Called immediately
leadingDebounce(2); // Ignored
leadingDebounce(3); // Ignored
await delay(250);
leadingDebounce(4); // Called (after timeout)
await delay(250);
console.log(`Total calls: ${leadingCount}`);

// Throttle Example
console.log('\n\n=== Throttle Example ===\n');

let scrollCount = 0;
let throttledScrollCount = 0;

const handleScroll = throttle(() => {
  throttledScrollCount++;
  console.log(`Throttled scroll handler called (call #${throttledScrollCount})`);
}, 100);

console.log('Simulating 20 rapid scroll events over 500ms...');
for (let i = 0; i < 20; i++) {
  scrollCount++;
  handleScroll();
  await delay(25);
}

await delay(150); // Wait for final throttle

console.log(`\nTotal scroll events: ${scrollCount}`);
console.log(`Throttled calls: ${throttledScrollCount}`);

// Flush and cancel
console.log('\n--- Flush and Cancel ---');
let flushCount = 0;
const debouncedFn = debounce(() => {
  flushCount++;
  console.log('Debounced function executed');
}, 1000);

debouncedFn();
console.log('Called, waiting...');
await delay(500);

// Flush immediately instead of waiting
console.log('Flushing...');
debouncedFn.flush();
console.log(`Flush count: ${flushCount}`);

// Cancel pending
debouncedFn();
console.log('Called again...');
debouncedFn.cancel();
console.log('Cancelled pending call');
await delay(1100);
console.log(`Final count: ${flushCount} (no additional calls)`);

console.log('\n✅ Mutex and debounce example completed!');

/**
 * Resource Pool Example
 * Connection pooling and resource management
 */
import { createPool, delay } from '@oxog/kit/async';

// Simulated database connection
interface DbConnection {
  id: number;
  query: (sql: string) => Promise<unknown>;
  close: () => Promise<void>;
}

let connectionIdCounter = 0;

// Create a connection pool
const pool = createPool<DbConnection>({
  // Factory function to create new connections
  create: async () => {
    const id = ++connectionIdCounter;
    console.log(`[Pool] Creating connection #${id}`);
    await delay(100); // Simulate connection time

    return {
      id,
      query: async (sql: string) => {
        await delay(50); // Simulate query time
        return { sql, rows: [], connectionId: id };
      },
      close: async () => {
        await delay(20);
        console.log(`[Pool] Connection #${id} closed`);
      },
    };
  },

  // Destroy function for cleanup
  destroy: async (conn) => {
    await conn.close();
  },

  // Validate connection before use
  validate: async (conn) => {
    // Simulate health check
    return conn.id > 0;
  },

  // Pool configuration
  min: 2,       // Minimum connections
  max: 5,       // Maximum connections
  idleTimeout: 30000, // Close idle connections after 30s
  acquireTimeout: 5000, // Timeout for acquiring a connection
});

console.log('=== Resource Pool Example ===\n');
console.log('Pool configuration: min=2, max=5\n');

// Wait for initial connections
await delay(300);
console.log('Initial pool stats:', pool.getStats());

// Simple query using the pool
console.log('\n--- Single Query ---');
const conn1 = await pool.acquire();
console.log(`Acquired connection #${conn1.id}`);
const result1 = await conn1.query('SELECT * FROM users');
console.log('Query result:', result1);
await pool.release(conn1);
console.log('Connection released');

// Using the convenience method
console.log('\n--- Using pool.use() ---');
const result2 = await pool.use(async (conn) => {
  console.log(`Using connection #${conn.id}`);
  return await conn.query('SELECT * FROM products LIMIT 10');
});
console.log('Result:', result2);

// Concurrent queries
console.log('\n--- Concurrent Queries ---');
console.log('Running 8 concurrent queries with max 5 connections...\n');

const startTime = Date.now();
const queries = Array.from({ length: 8 }, (_, i) =>
  pool.use(async (conn) => {
    const queryStart = Date.now() - startTime;
    console.log(`Query ${i + 1} started at ${queryStart}ms using connection #${conn.id}`);
    await delay(200); // Simulate longer query
    const queryEnd = Date.now() - startTime;
    console.log(`Query ${i + 1} finished at ${queryEnd}ms`);
    return { queryId: i + 1, connectionId: conn.id };
  })
);

const results = await Promise.all(queries);
console.log('\nAll queries completed:', results.map(r => r.queryId));
console.log(`Total time: ${Date.now() - startTime}ms`);

// Pool stats
console.log('\n--- Pool Statistics ---');
console.log(pool.getStats());

// Acquire with timeout
console.log('\n--- Acquire with Timeout ---');
// Fill the pool
const connections: DbConnection[] = [];
for (let i = 0; i < 5; i++) {
  connections.push(await pool.acquire());
}
console.log('All connections acquired, pool is full');
console.log('Stats:', pool.getStats());

// Try to acquire with timeout (will fail)
console.log('\nTrying to acquire another connection (will timeout)...');
try {
  await pool.acquire();
} catch (error) {
  console.log('Error:', (error as Error).message);
}

// Release all connections
for (const conn of connections) {
  await pool.release(conn);
}
console.log('All connections released');

// Drain and close the pool
console.log('\n--- Draining Pool ---');
await pool.drain();
console.log('Pool drained, final stats:', pool.getStats());

// Close the pool
await pool.close();
console.log('Pool closed');

console.log('\n✅ Resource pool example completed!');

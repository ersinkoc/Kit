/**
 * Events and Config Example
 * Event-driven architecture and configuration management
 */
import { events, config, context, createHooks } from '@oxog/kit/core';

// Event Emitter Example
console.log('=== Event Emitter Example ===\n');

// Create a typed event emitter for user events
const userEvents = events.create();

// Subscribe to events
userEvents.on('user:created', (user: { id: string; email: string }) => {
  console.log('User created:', user);
});

userEvents.on('user:updated', (user: { id: string; changes: object }) => {
  console.log('User updated:', user);
});

userEvents.on('user:deleted', (userId: string) => {
  console.log('User deleted:', userId);
});

// One-time listener
userEvents.once('user:verified', (userId: string) => {
  console.log('User verified (one-time):', userId);
});

// Emit events
userEvents.emit('user:created', { id: '1', email: 'john@example.com' });
userEvents.emit('user:updated', { id: '1', changes: { name: 'John Doe' } });
userEvents.emit('user:verified', '1');
userEvents.emit('user:verified', '2'); // Won't trigger (once listener removed)
userEvents.emit('user:deleted', '1');

// Wildcard listener
userEvents.on('user:*', (event, data) => {
  console.log(`[Wildcard] Event: ${event}`, data);
});
userEvents.emit('user:login', { userId: '1', timestamp: Date.now() });

// Configuration Example
console.log('\n=== Configuration Example ===\n');

// Set configuration values
config.merge({
  app: {
    name: 'MyApp',
    version: '1.0.0',
    port: 3000,
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp_db',
  },
  features: {
    darkMode: true,
    notifications: true,
  },
});

// Access configuration
console.log('App name:', config.get('app.name'));
console.log('App version:', config.get('app.version'));
console.log('DB host:', config.get('database.host'));
console.log('Dark mode:', config.get('features.darkMode'));

// Default values
console.log('Missing key:', config.get('missing.key', 'default-value'));

// Check if key exists
console.log('Has app.name:', config.has('app.name'));
console.log('Has missing:', config.has('missing.key'));

// Get entire config
console.log('\nAll config:', config.all());

// Require (throws if missing)
try {
  const dbHost = config.require('database.host');
  console.log('Required DB host:', dbHost);
} catch (error) {
  console.log('Error:', error);
}

// Context Example
console.log('\n=== Context Example ===\n');

// Run code with context
context.run({ requestId: 'req-123', userId: 'user-456' }, () => {
  console.log('Inside context:');
  console.log('  Request ID:', context.get('requestId'));
  console.log('  User ID:', context.get('userId'));

  // Nested context
  context.with({ locale: 'en-US' }, () => {
    console.log('\n  Inside nested context:');
    console.log('    Request ID:', context.get('requestId'));
    console.log('    User ID:', context.get('userId'));
    console.log('    Locale:', context.get('locale'));
  });

  console.log('\n  Back to outer context:');
  console.log('    Locale:', context.get('locale')); // undefined
});

console.log('\nOutside context:');
console.log('  Request ID:', context.get('requestId')); // undefined

// Hooks Example
console.log('\n=== Hooks Example ===\n');

const hooks = createHooks();

// Register hooks
hooks.register('beforeSave', async (data: object) => {
  console.log('beforeSave hook 1:', data);
  return { ...data, timestamp: Date.now() };
});

hooks.register('beforeSave', async (data: object) => {
  console.log('beforeSave hook 2:', data);
  return { ...data, validated: true };
});

hooks.register('afterSave', async (result: object) => {
  console.log('afterSave hook:', result);
});

// Call hooks
const userData = { name: 'John', email: 'john@example.com' };
const enrichedData = await hooks.call('beforeSave', userData);
console.log('\nFinal data after hooks:', enrichedData);

await hooks.call('afterSave', enrichedData);

console.log('\n✅ Events and config example completed!');

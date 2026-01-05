/**
 * Logging Example
 * Structured logging with levels and formatters
 */
import { createLogger, log } from '@oxog/kit/core';

console.log('=== Logging Example ===\n');

// Default logger (JSON format)
console.log('--- Default Logger (JSON) ---');
log.info('Application started', { version: '1.0.0', pid: process.pid });
log.debug('Debug message (hidden by default)');
log.warn('Warning message', { category: 'performance' });
log.error('Error occurred', { error: 'Something went wrong', code: 500 });

// Create logger with pretty format
console.log('\n--- Pretty Logger ---');
const prettyLog = createLogger({
  level: 'debug',
  pretty: true,
});

prettyLog.debug('This is a debug message');
prettyLog.info('Info message with context', { user: 'john', action: 'login' });
prettyLog.warn('Warning: resource usage high', { memory: '85%' });
prettyLog.error('Failed to connect to database', { host: 'localhost', error: 'ECONNREFUSED' });
prettyLog.fatal('Critical system failure');

// Child logger with context
console.log('\n--- Child Logger with Context ---');
const requestLogger = prettyLog.child({
  requestId: 'req-abc123',
  service: 'user-api',
});

requestLogger.info('Processing request');
requestLogger.info('User authenticated', { userId: '123' });
requestLogger.info('Request completed', { duration: '45ms', status: 200 });

// Log levels
console.log('\n--- Log Levels ---');
const warnLogger = createLogger({ level: 'warn', pretty: true });

console.log('Logger level: warn (debug and info are filtered)');
warnLogger.debug('Debug - not shown');
warnLogger.info('Info - not shown');
warnLogger.warn('Warning - shown');
warnLogger.error('Error - shown');

// Silent mode
console.log('\n--- Silent Mode ---');
const silentLogger = createLogger({ level: 'info', pretty: true });
console.log('Before silent:');
silentLogger.info('This message is shown');

silentLogger.silent();
console.log('After silent():');
silentLogger.info('This message is NOT shown');
silentLogger.error('Even errors are NOT shown');

silentLogger.loud();
console.log('After loud():');
silentLogger.info('Messages are shown again');

// Custom formatter
console.log('\n--- Custom Formatter ---');
const customLogger = createLogger({
  level: 'info',
  formatter: (entry) => {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌',
      fatal: '💀',
    }[entry.level] || '📝';

    const time = new Date(entry.timestamp).toLocaleTimeString();
    let msg = `${emoji} [${time}] ${entry.message}`;

    if (Object.keys(entry.context).length > 0) {
      msg += ` ${JSON.stringify(entry.context)}`;
    }

    return msg;
  },
});

customLogger.info('Server started', { port: 3000 });
customLogger.warn('High CPU usage detected', { cpu: '95%' });
customLogger.error('Request failed', { url: '/api/users', status: 500 });

// Structured logging for production
console.log('\n--- Structured Logging (Production) ---');
const prodLogger = createLogger({
  level: 'info',
  timestamp: true,
});

prodLogger.info('http_request', {
  method: 'GET',
  path: '/api/users',
  status: 200,
  duration_ms: 45,
  user_id: 'user_123',
});

prodLogger.error('database_error', {
  operation: 'insert',
  table: 'users',
  error: 'duplicate key',
  query_time_ms: 12,
});

console.log('\n✅ Logging example completed!');

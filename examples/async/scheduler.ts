/**
 * Task Scheduler Example
 * Cron-like scheduling for background tasks
 */
import { createScheduler } from '@oxog/kit/async';

console.log('=== Task Scheduler Example ===\n');

const scheduler = createScheduler();

// Schedule task with cron expression
// Note: In this example, we use short intervals for demonstration

console.log('--- Scheduling Tasks ---\n');

// Every 2 seconds (for demo)
const taskId1 = scheduler.schedule('*/2 * * * * *', () => {
  console.log(`[${new Date().toLocaleTimeString()}] Heartbeat check`);
}, { name: 'heartbeat' });

// Every 5 seconds
const taskId2 = scheduler.schedule('*/5 * * * * *', async () => {
  console.log(`[${new Date().toLocaleTimeString()}] Cleanup job started...`);
  await new Promise(r => setTimeout(r, 100));
  console.log(`[${new Date().toLocaleTimeString()}] Cleanup job completed`);
}, { name: 'cleanup' });

// Using interval shorthand
const taskId3 = scheduler.every(3000, () => {
  console.log(`[${new Date().toLocaleTimeString()}] Metrics collection`);
}, { name: 'metrics' });

// One-time task
scheduler.at(Date.now() + 4000, () => {
  console.log(`[${new Date().toLocaleTimeString()}] One-time task executed!`);
}, { name: 'one-time' });

// Print scheduled tasks
console.log('Scheduled tasks:');
for (const task of scheduler.getTasks()) {
  console.log(`  - ${task.id}: ${task.name ?? 'unnamed'} (enabled: ${task.enabled})`);
}

// Start the scheduler
console.log('\nStarting scheduler...\n');
scheduler.start();

// Run for 10 seconds
await new Promise(r => setTimeout(r, 10000));

// Disable a task
console.log('\n--- Disabling heartbeat task ---');
scheduler.disable(taskId1);

await new Promise(r => setTimeout(r, 5000));

// Re-enable
console.log('\n--- Re-enabling heartbeat task ---');
scheduler.enable(taskId1);

await new Promise(r => setTimeout(r, 5000));

// Manual run
console.log('\n--- Manual run of cleanup task ---');
await scheduler.run(taskId2);

// Stop the scheduler
console.log('\n--- Stopping scheduler ---');
scheduler.stop();

// Parse cron expressions
console.log('\n\n=== Cron Expression Parsing ===\n');

const expressions = [
  '0 0 * * *',      // Every day at midnight
  '0 */2 * * *',    // Every 2 hours
  '0 9-17 * * 1-5', // Weekdays 9am-5pm
  '0 0 1 * *',      // First day of month
  '0 0 * * 0',      // Every Sunday
];

for (const expr of expressions) {
  try {
    const parts = scheduler.parseCron(expr);
    const nextRun = scheduler.getNextRun(expr);
    console.log(`"${expr}":`);
    console.log(`  Parts: minute=${parts.minute}, hour=${parts.hour}, day=${parts.dayOfMonth}, month=${parts.month}, dow=${parts.dayOfWeek}`);
    console.log(`  Next run: ${nextRun.toLocaleString()}`);
    console.log();
  } catch (error) {
    console.log(`"${expr}": Invalid expression`);
  }
}

console.log('✅ Scheduler example completed!');

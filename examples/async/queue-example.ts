/**
 * Task Queue Example
 * Process jobs with concurrency control
 */
import { createQueue } from '@oxog/kit/async';

// Create a queue with concurrency of 3
const queue = createQueue({ concurrency: 3 });

// Simulated async task
async function processJob(jobId: number): Promise<string> {
  const delay = Math.random() * 2000 + 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  return `Job ${jobId} completed in ${delay.toFixed(0)}ms`;
}

// Add event listeners
queue.on('taskComplete', (result) => {
  console.log('✅', result);
});

queue.on('taskError', (error) => {
  console.log('❌ Task error:', error.message);
});

queue.on('idle', () => {
  console.log('\n🎉 Queue is idle - all tasks completed!');
  console.log('Stats:', queue.getStats());
});

console.log('=== Adding 10 jobs to queue ===');

// Add 10 jobs
for (let i = 1; i <= 10; i++) {
  queue.add(async () => processJob(i));
}

console.log(`Queue size: ${queue.size}`);
console.log(`Pending: ${queue.pending}`);
console.log('Processing with concurrency of 3...\n');

// Wait for all tasks to complete
await queue.onIdle();

// Example with priority
console.log('\n=== Priority Queue Example ===');

const priorityQueue = createQueue({ concurrency: 1 });

priorityQueue.on('taskComplete', (result) => {
  console.log('Completed:', result);
});

// Add tasks with different priorities (higher = more priority)
priorityQueue.add(async () => 'Low priority task', 1);
priorityQueue.add(async () => 'High priority task', 10);
priorityQueue.add(async () => 'Medium priority task', 5);
priorityQueue.add(async () => 'Urgent task', 100);

await priorityQueue.onIdle();

console.log('\n✅ Queue example completed!');

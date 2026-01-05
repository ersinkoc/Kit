/**
 * Async Queue - Task queue with concurrency control
 * Zero dependencies, pure TypeScript implementation
 */

export type Task<T> = () => Promise<T>;

export interface QueueOptions {
  /** Maximum concurrent tasks (default: 1) */
  concurrency?: number;
  /** Auto-start processing (default: true) */
  autoStart?: boolean;
  /** Timeout per task in ms (default: none) */
  timeout?: number;
}

export interface QueueTask<T> {
  id: string;
  task: Task<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  addedAt: number;
}

export interface QueueStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  total: number;
}

type QueueEvent = 'task:start' | 'task:complete' | 'task:error' | 'idle' | 'drain';
type QueueListener = (data: unknown) => void;

/**
 * Async task queue with concurrency control
 */
export class Queue<T = unknown> {
  private queue: QueueTask<T>[] = [];
  private running: Set<string> = new Set();
  private concurrency: number;
  private autoStart: boolean;
  private timeout?: number;
  private paused: boolean = false;
  private stats = { completed: 0, failed: 0, total: 0 };
  private listeners: Map<QueueEvent, Set<QueueListener>> = new Map();
  private idCounter: number = 0;
  private processing: boolean = false;

  constructor(options: QueueOptions = {}) {
    this.concurrency = options.concurrency ?? 1;
    this.autoStart = options.autoStart ?? true;
    this.timeout = options.timeout;
  }

  /**
   * Add a task to the queue
   */
  add(task: Task<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `task_${++this.idCounter}`;
      const queueTask: QueueTask<T> = {
        id,
        task,
        resolve,
        reject,
        priority,
        addedAt: Date.now(),
      };

      // Insert by priority (higher priority first)
      const insertIndex = this.queue.findIndex(t => t.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(queueTask);
      } else {
        this.queue.splice(insertIndex, 0, queueTask);
      }

      this.stats.total++;

      if (this.autoStart && !this.paused) {
        this.process();
      }
    });
  }

  /**
   * Add multiple tasks
   */
  addAll(tasks: Task<T>[], priority: number = 0): Promise<T[]> {
    return Promise.all(tasks.map(task => this.add(task, priority)));
  }

  /**
   * Start processing the queue
   */
  start(): this {
    this.paused = false;
    this.process();
    return this;
  }

  /**
   * Pause processing
   */
  pause(): this {
    this.paused = true;
    return this;
  }

  /**
   * Clear all pending tasks
   */
  clear(): this {
    // Reject all pending tasks
    for (const task of this.queue) {
      task.reject(new Error('Queue cleared'));
    }
    this.queue = [];
    return this;
  }

  /**
   * Get queue size (pending + running)
   */
  get size(): number {
    return this.queue.length + this.running.size;
  }

  /**
   * Get number of pending tasks
   */
  get pending(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is idle
   */
  get idle(): boolean {
    return this.queue.length === 0 && this.running.size === 0;
  }

  /**
   * Check if queue is paused
   */
  get isPaused(): boolean {
    return this.paused;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      pending: this.queue.length,
      running: this.running.size,
      completed: this.stats.completed,
      failed: this.stats.failed,
      total: this.stats.total,
    };
  }

  /**
   * Set concurrency
   */
  setConcurrency(concurrency: number): this {
    this.concurrency = Math.max(1, concurrency);
    this.process();
    return this;
  }

  /**
   * Register event listener
   */
  on(event: QueueEvent, listener: QueueListener): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return this;
  }

  /**
   * Remove event listener
   */
  off(event: QueueEvent, listener: QueueListener): this {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  /**
   * Wait for the queue to become idle
   */
  onIdle(): Promise<void> {
    if (this.idle) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      const listener = () => {
        this.off('idle', listener);
        resolve();
      };
      this.on('idle', listener);
    });
  }

  /**
   * Wait for the queue to drain (all current tasks complete)
   */
  onDrain(): Promise<void> {
    if (this.queue.length === 0) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      const listener = () => {
        this.off('drain', listener);
        resolve();
      };
      this.on('drain', listener);
    });
  }

  private emit(event: QueueEvent, data?: unknown): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch {
          // Ignore listener errors
        }
      }
    }
  }

  private async process(): Promise<void> {
    if (this.paused || this.processing) {
      return;
    }

    this.processing = true;

    while (!this.paused && this.queue.length > 0 && this.running.size < this.concurrency) {
      const task = this.queue.shift()!;
      this.running.add(task.id);
      this.emit('task:start', { id: task.id });
      this.runTask(task);
    }

    this.processing = false;

    // Check if queue drained
    if (this.queue.length === 0 && this.running.size > 0) {
      // Will emit drain when all running complete
    }
  }

  private async runTask(queueTask: QueueTask<T>): Promise<void> {
    const { id, task, resolve, reject } = queueTask;

    try {
      let result: T;

      if (this.timeout) {
        result = await this.withTimeout(task(), this.timeout);
      } else {
        result = await task();
      }

      this.stats.completed++;
      this.emit('task:complete', { id, result });
      resolve(result);
    } catch (error) {
      this.stats.failed++;
      this.emit('task:error', { id, error });
      reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.running.delete(id);

      // Check for idle/drain
      if (this.running.size === 0) {
        if (this.queue.length === 0) {
          this.emit('idle');
        } else {
          this.emit('drain');
        }
      }

      // Continue processing
      if (!this.paused) {
        this.process();
      }
    }
  }

  private withTimeout<R>(promise: Promise<R>, ms: number): Promise<R> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task timed out after ${ms}ms`));
      }, ms);

      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

/**
 * Create a new queue
 */
export function createQueue<T = unknown>(options?: QueueOptions): Queue<T> {
  return new Queue<T>(options);
}

/**
 * Default queue instance
 */
export const queue = createQueue();

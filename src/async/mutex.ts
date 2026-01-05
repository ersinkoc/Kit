/**
 * Mutex - Mutual exclusion lock
 * Zero dependencies, pure TypeScript implementation
 */

export interface MutexOptions {
  /** Acquire timeout in ms (default: 30000) */
  timeout?: number;
}

interface WaitingAcquire {
  resolve: () => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * Mutual exclusion lock for async operations
 */
export class Mutex {
  private locked: boolean = false;
  private queue: WaitingAcquire[] = [];
  private timeout: number;

  constructor(options: MutexOptions = {}) {
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * Acquire the lock
   */
  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.queue.findIndex(w => w.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        reject(new Error('Mutex acquire timeout'));
      }, this.timeout);

      this.queue.push({ resolve, reject, timeoutId });
    });
  }

  /**
   * Release the lock
   */
  release(): void {
    if (!this.locked) {
      return;
    }

    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      clearTimeout(next.timeoutId);
      next.resolve();
    } else {
      this.locked = false;
    }
  }

  /**
   * Try to acquire the lock (non-blocking)
   */
  tryAcquire(): boolean {
    if (!this.locked) {
      this.locked = true;
      return true;
    }
    return false;
  }

  /**
   * Check if mutex is locked
   */
  isLocked(): boolean {
    return this.locked;
  }

  /**
   * Execute a function with the lock held
   */
  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

/**
 * Read-Write Lock (allows multiple readers, single writer)
 */
export class RWMutex {
  private readers: number = 0;
  private writer: boolean = false;
  private writerQueue: WaitingAcquire[] = [];
  private readerQueue: WaitingAcquire[] = [];
  private timeout: number;

  constructor(options: MutexOptions = {}) {
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * Acquire read lock
   */
  async acquireRead(): Promise<void> {
    // If no writer is waiting or active, allow read
    if (!this.writer && this.writerQueue.length === 0) {
      this.readers++;
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.readerQueue.findIndex(w => w.resolve === resolve);
        if (index !== -1) {
          this.readerQueue.splice(index, 1);
        }
        reject(new Error('Read lock acquire timeout'));
      }, this.timeout);

      this.readerQueue.push({ resolve, reject, timeoutId });
    });
  }

  /**
   * Release read lock
   */
  releaseRead(): void {
    if (this.readers > 0) {
      this.readers--;
    }

    // If no more readers and writers are waiting, grant writer
    if (this.readers === 0 && this.writerQueue.length > 0) {
      const next = this.writerQueue.shift()!;
      clearTimeout(next.timeoutId);
      this.writer = true;
      next.resolve();
    }
  }

  /**
   * Acquire write lock
   */
  async acquireWrite(): Promise<void> {
    if (!this.writer && this.readers === 0) {
      this.writer = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.writerQueue.findIndex(w => w.resolve === resolve);
        if (index !== -1) {
          this.writerQueue.splice(index, 1);
        }
        reject(new Error('Write lock acquire timeout'));
      }, this.timeout);

      this.writerQueue.push({ resolve, reject, timeoutId });
    });
  }

  /**
   * Release write lock
   */
  releaseWrite(): void {
    if (!this.writer) {
      return;
    }

    this.writer = false;

    // Prefer waiting writers over readers
    if (this.writerQueue.length > 0) {
      const next = this.writerQueue.shift()!;
      clearTimeout(next.timeoutId);
      this.writer = true;
      next.resolve();
    } else {
      // Grant all waiting readers
      while (this.readerQueue.length > 0) {
        const next = this.readerQueue.shift()!;
        clearTimeout(next.timeoutId);
        this.readers++;
        next.resolve();
      }
    }
  }

  /**
   * Execute a function with read lock held
   */
  async runRead<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquireRead();
    try {
      return await fn();
    } finally {
      this.releaseRead();
    }
  }

  /**
   * Execute a function with write lock held
   */
  async runWrite<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquireWrite();
    try {
      return await fn();
    } finally {
      this.releaseWrite();
    }
  }
}

/**
 * Semaphore - Counting semaphore
 */
export class Semaphore {
  private permits: number;
  private maxPermits: number;
  private queue: WaitingAcquire[] = [];
  private timeout: number;

  constructor(permits: number, options: MutexOptions = {}) {
    this.permits = permits;
    this.maxPermits = permits;
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * Acquire a permit
   */
  async acquire(count: number = 1): Promise<void> {
    if (this.permits >= count) {
      this.permits -= count;
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.queue.findIndex(w => w.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        reject(new Error('Semaphore acquire timeout'));
      }, this.timeout);

      this.queue.push({ resolve, reject, timeoutId });
    });
  }

  /**
   * Release a permit
   */
  release(count: number = 1): void {
    this.permits = Math.min(this.maxPermits, this.permits + count);

    // Grant waiting acquires
    while (this.queue.length > 0 && this.permits > 0) {
      const next = this.queue.shift()!;
      clearTimeout(next.timeoutId);
      this.permits--;
      next.resolve();
    }
  }

  /**
   * Try to acquire a permit (non-blocking)
   */
  tryAcquire(count: number = 1): boolean {
    if (this.permits >= count) {
      this.permits -= count;
      return true;
    }
    return false;
  }

  /**
   * Get available permits
   */
  available(): number {
    return this.permits;
  }

  /**
   * Execute a function with a permit held
   */
  async run<T>(fn: () => Promise<T> | T): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

/**
 * Create a mutex
 */
export function createMutex(options?: MutexOptions): Mutex {
  return new Mutex(options);
}

/**
 * Create a read-write mutex
 */
export function createRWMutex(options?: MutexOptions): RWMutex {
  return new RWMutex(options);
}

/**
 * Create a semaphore
 */
export function createSemaphore(permits: number, options?: MutexOptions): Semaphore {
  return new Semaphore(permits, options);
}

/**
 * Default mutex instance
 */
export const mutex = createMutex();

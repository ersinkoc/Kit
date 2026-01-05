/**
 * Scheduler - Task scheduling with cron-like patterns
 * Zero dependencies, pure TypeScript implementation
 */

export interface SchedulerOptions {
  /** Timezone offset in hours (default: local timezone) */
  timezoneOffset?: number;
}

export interface ScheduledTask {
  id: string;
  name?: string;
  schedule: string;
  fn: () => Promise<void> | void;
  enabled: boolean;
  nextRun?: Date;
  lastRun?: Date;
  runCount: number;
}

export interface CronParts {
  minute: number[];
  hour: number[];
  dayOfMonth: number[];
  month: number[];
  dayOfWeek: number[];
}

/**
 * Task scheduler with cron-like scheduling
 */
export class Scheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private timezoneOffset: number;
  private running: boolean = false;
  private idCounter: number = 0;

  constructor(options: SchedulerOptions = {}) {
    this.timezoneOffset = options.timezoneOffset ?? -(new Date().getTimezoneOffset() / 60);
  }

  /**
   * Schedule a task with cron expression
   * Cron format: minute hour dayOfMonth month dayOfWeek
   * Examples:
   *   "0 * * * *" - every hour
   *   "0,30 * * * *" - every 30 minutes
   *   "0 9 * * 1-5" - 9 AM on weekdays
   *   "0 0 1 * *" - midnight on first of month
   */
  schedule(
    schedule: string,
    fn: () => Promise<void> | void,
    options: { name?: string; enabled?: boolean } = {}
  ): string {
    const id = `task_${++this.idCounter}`;

    const task: ScheduledTask = {
      id,
      name: options.name,
      schedule,
      fn,
      enabled: options.enabled ?? true,
      runCount: 0,
    };

    this.tasks.set(id, task);

    if (this.running && task.enabled) {
      this.scheduleNextRun(task);
    }

    return id;
  }

  /**
   * Schedule a task to run at a specific interval
   */
  every(
    interval: number | string,
    fn: () => Promise<void> | void,
    options: { name?: string; enabled?: boolean } = {}
  ): string {
    const ms = typeof interval === 'string' ? this.parseInterval(interval) : interval;
    const id = `task_${++this.idCounter}`;

    const task: ScheduledTask = {
      id,
      name: options.name,
      schedule: `every ${interval}`,
      fn,
      enabled: options.enabled ?? true,
      runCount: 0,
    };

    this.tasks.set(id, task);

    if (this.running && task.enabled) {
      this.scheduleInterval(task, ms);
    }

    return id;
  }

  /**
   * Schedule a task to run once at a specific time
   */
  at(
    time: Date | number,
    fn: () => Promise<void> | void,
    options: { name?: string } = {}
  ): string {
    const id = `task_${++this.idCounter}`;
    const runAt = typeof time === 'number' ? new Date(time) : time;

    const task: ScheduledTask = {
      id,
      name: options.name,
      schedule: `at ${runAt.toISOString()}`,
      fn,
      enabled: true,
      nextRun: runAt,
      runCount: 0,
    };

    this.tasks.set(id, task);

    if (this.running) {
      this.scheduleOnce(task, runAt.getTime() - Date.now());
    }

    return id;
  }

  /**
   * Start the scheduler
   */
  start(): this {
    if (this.running) return this;
    this.running = true;

    for (const task of this.tasks.values()) {
      if (task.enabled) {
        if (task.schedule.startsWith('every ')) {
          const interval = task.schedule.replace('every ', '');
          const ms = typeof interval === 'string' ? this.parseInterval(interval) : parseInt(interval);
          this.scheduleInterval(task, ms);
        } else if (task.schedule.startsWith('at ')) {
          const dateStr = task.schedule.replace('at ', '');
          const runAt = new Date(dateStr);
          this.scheduleOnce(task, runAt.getTime() - Date.now());
        } else {
          this.scheduleNextRun(task);
        }
      }
    }

    return this;
  }

  /**
   * Stop the scheduler
   */
  stop(): this {
    this.running = false;

    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    return this;
  }

  /**
   * Enable a task
   */
  enable(id: string): this {
    const task = this.tasks.get(id);
    if (task) {
      task.enabled = true;
      if (this.running) {
        this.scheduleNextRun(task);
      }
    }
    return this;
  }

  /**
   * Disable a task
   */
  disable(id: string): this {
    const task = this.tasks.get(id);
    if (task) {
      task.enabled = false;
      const timer = this.timers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(id);
      }
    }
    return this;
  }

  /**
   * Remove a task
   */
  remove(id: string): this {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.tasks.delete(id);
    return this;
  }

  /**
   * Manually run a task
   */
  async run(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      await this.executeTask(task);
    }
  }

  /**
   * Get all tasks
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a specific task
   */
  getTask(id: string): ScheduledTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * Parse cron expression to parts
   */
  parseCron(expression: string): CronParts {
    const parts = expression.trim().split(/\s+/);

    if (parts.length !== 5) {
      throw new Error('Invalid cron expression: must have 5 parts');
    }

    return {
      minute: this.parseCronPart(parts[0]!, 0, 59),
      hour: this.parseCronPart(parts[1]!, 0, 23),
      dayOfMonth: this.parseCronPart(parts[2]!, 1, 31),
      month: this.parseCronPart(parts[3]!, 1, 12),
      dayOfWeek: this.parseCronPart(parts[4]!, 0, 6),
    };
  }

  /**
   * Get next run time for a cron expression
   */
  getNextRun(expression: string, after: Date = new Date()): Date {
    const parts = this.parseCron(expression);
    const date = new Date(after.getTime() + 60000); // Start from next minute
    date.setSeconds(0, 0);

    // Try up to 4 years of minutes
    const maxIterations = 4 * 365 * 24 * 60;

    for (let i = 0; i < maxIterations; i++) {
      if (this.matchesCron(date, parts)) {
        return date;
      }
      date.setTime(date.getTime() + 60000);
    }

    throw new Error('Could not find next run time');
  }

  private parseCronPart(part: string, min: number, max: number): number[] {
    const values: number[] = [];

    for (const segment of part.split(',')) {
      if (segment === '*') {
        for (let i = min; i <= max; i++) values.push(i);
      } else if (segment.includes('/')) {
        const splitResult = segment.split('/');
        const range = splitResult[0] ?? '*';
        const step = splitResult[1] ?? '1';
        const stepNum = parseInt(step);
        let start = min;
        let end = max;

        if (range !== '*') {
          if (range.includes('-')) {
            const rangeParts = range.split('-').map(Number);
            start = rangeParts[0] ?? min;
            end = rangeParts[1] ?? max;
          } else {
            start = parseInt(range);
          }
        }

        for (let i = start; i <= end; i += stepNum) values.push(i);
      } else if (segment.includes('-')) {
        const rangeParts = segment.split('-').map(Number);
        const start = rangeParts[0] ?? min;
        const end = rangeParts[1] ?? max;
        for (let i = start; i <= end; i++) values.push(i);
      } else {
        values.push(parseInt(segment));
      }
    }

    return [...new Set(values)].sort((a, b) => a - b);
  }

  private matchesCron(date: Date, parts: CronParts): boolean {
    return (
      parts.minute.includes(date.getMinutes()) &&
      parts.hour.includes(date.getHours()) &&
      parts.dayOfMonth.includes(date.getDate()) &&
      parts.month.includes(date.getMonth() + 1) &&
      parts.dayOfWeek.includes(date.getDay())
    );
  }

  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)\s*(ms|s|m|h|d)$/i);
    if (!match || !match[1] || !match[2]) {
      throw new Error(`Invalid interval: ${interval}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'ms': return value;
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Unknown unit: ${unit}`);
    }
  }

  private scheduleNextRun(task: ScheduledTask): void {
    if (!task.enabled || task.schedule.startsWith('every ') || task.schedule.startsWith('at ')) {
      return;
    }

    try {
      const nextRun = this.getNextRun(task.schedule);
      task.nextRun = nextRun;
      const delay = nextRun.getTime() - Date.now();

      if (delay > 0) {
        const timer = setTimeout(() => this.runTask(task), delay);
        this.timers.set(task.id, timer);
      }
    } catch {
      // Invalid cron expression
    }
  }

  private scheduleInterval(task: ScheduledTask, ms: number): void {
    const timer = setTimeout(() => this.runIntervalTask(task, ms), ms);
    this.timers.set(task.id, timer);
    task.nextRun = new Date(Date.now() + ms);
  }

  private scheduleOnce(task: ScheduledTask, delay: number): void {
    if (delay <= 0) {
      this.executeTask(task);
      return;
    }

    const timer = setTimeout(async () => {
      await this.executeTask(task);
      this.tasks.delete(task.id);
      this.timers.delete(task.id);
    }, delay);
    this.timers.set(task.id, timer);
  }

  private async runTask(task: ScheduledTask): Promise<void> {
    this.timers.delete(task.id);

    if (!this.running || !task.enabled) return;

    await this.executeTask(task);
    this.scheduleNextRun(task);
  }

  private async runIntervalTask(task: ScheduledTask, ms: number): Promise<void> {
    this.timers.delete(task.id);

    if (!this.running || !task.enabled) return;

    await this.executeTask(task);
    this.scheduleInterval(task, ms);
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    task.lastRun = new Date();
    task.runCount++;

    try {
      await task.fn();
    } catch {
      // Task errors are silently ignored
    }
  }
}

/**
 * Create a scheduler
 */
export function createScheduler(options?: SchedulerOptions): Scheduler {
  return new Scheduler(options);
}

/**
 * Default scheduler instance
 */
export const scheduler = createScheduler();

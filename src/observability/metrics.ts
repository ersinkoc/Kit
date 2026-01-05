/**
 * Metrics collection module
 * Counters, gauges, histograms for application observability
 */

export interface MetricLabels {
  [key: string]: string | number;
}

export interface MetricOptions {
  name: string;
  help?: string;
  labels?: string[];
}

export interface CounterOptions extends MetricOptions {}

export interface GaugeOptions extends MetricOptions {}

export interface HistogramOptions extends MetricOptions {
  buckets?: number[];
}

export interface SummaryOptions extends MetricOptions {
  percentiles?: number[];
  maxAge?: number;
}

export interface TimerOptions extends MetricOptions {
  buckets?: number[];
}

export interface MetricValue {
  value: number;
  labels: MetricLabels;
  timestamp: number;
}

export interface HistogramValue {
  count: number;
  sum: number;
  buckets: Map<number, number>;
  labels: MetricLabels;
  timestamp: number;
}

export interface SummaryValue {
  count: number;
  sum: number;
  percentiles: Map<number, number>;
  labels: MetricLabels;
  timestamp: number;
}

/**
 * Counter - monotonically increasing metric
 */
export class Counter {
  readonly name: string;
  readonly help: string;
  readonly labelNames: string[];
  private values: Map<string, MetricValue> = new Map();

  constructor(options: CounterOptions) {
    this.name = options.name;
    this.help = options.help ?? '';
    this.labelNames = options.labels ?? [];
  }

  /**
   * Increment counter
   */
  inc(labels: MetricLabels = {}, value: number = 1): this {
    if (value < 0) {
      throw new Error('Counter can only be incremented');
    }
    const key = this.labelsToKey(labels);
    const existing = this.values.get(key);
    if (existing) {
      existing.value += value;
      existing.timestamp = Date.now();
    } else {
      this.values.set(key, {
        value,
        labels,
        timestamp: Date.now(),
      });
    }
    return this;
  }

  /**
   * Get current value
   */
  get(labels: MetricLabels = {}): number {
    const key = this.labelsToKey(labels);
    return this.values.get(key)?.value ?? 0;
  }

  /**
   * Reset counter
   */
  reset(labels?: MetricLabels): this {
    if (labels) {
      const key = this.labelsToKey(labels);
      this.values.delete(key);
    } else {
      this.values.clear();
    }
    return this;
  }

  /**
   * Get all values
   */
  getAll(): MetricValue[] {
    return Array.from(this.values.values());
  }

  /**
   * Create child counter with preset labels
   */
  labels(labels: MetricLabels): { inc: (value?: number) => void; get: () => number } {
    return {
      inc: (value = 1) => this.inc(labels, value),
      get: () => this.get(labels),
    };
  }

  private labelsToKey(labels: MetricLabels): string {
    if (this.labelNames.length === 0) return '';
    return this.labelNames.map((name) => `${name}=${labels[name] ?? ''}`).join(',');
  }
}

/**
 * Gauge - metric that can go up or down
 */
export class Gauge {
  readonly name: string;
  readonly help: string;
  readonly labelNames: string[];
  private values: Map<string, MetricValue> = new Map();

  constructor(options: GaugeOptions) {
    this.name = options.name;
    this.help = options.help ?? '';
    this.labelNames = options.labels ?? [];
  }

  /**
   * Set gauge value
   */
  set(value: number, labels: MetricLabels = {}): this {
    const key = this.labelsToKey(labels);
    this.values.set(key, {
      value,
      labels,
      timestamp: Date.now(),
    });
    return this;
  }

  /**
   * Increment gauge
   */
  inc(labels: MetricLabels = {}, value: number = 1): this {
    const key = this.labelsToKey(labels);
    const existing = this.values.get(key);
    const current = existing?.value ?? 0;
    return this.set(current + value, labels);
  }

  /**
   * Decrement gauge
   */
  dec(labels: MetricLabels = {}, value: number = 1): this {
    return this.inc(labels, -value);
  }

  /**
   * Get current value
   */
  get(labels: MetricLabels = {}): number {
    const key = this.labelsToKey(labels);
    return this.values.get(key)?.value ?? 0;
  }

  /**
   * Reset gauge
   */
  reset(labels?: MetricLabels): this {
    if (labels) {
      const key = this.labelsToKey(labels);
      this.values.delete(key);
    } else {
      this.values.clear();
    }
    return this;
  }

  /**
   * Get all values
   */
  getAll(): MetricValue[] {
    return Array.from(this.values.values());
  }

  /**
   * Set to current timestamp
   */
  setToCurrentTime(labels: MetricLabels = {}): this {
    return this.set(Date.now(), labels);
  }

  /**
   * Track in progress (increment on start, decrement on end)
   */
  trackInProgress<T>(fn: () => T | Promise<T>, labels: MetricLabels = {}): T | Promise<T> {
    this.inc(labels);
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => this.dec(labels)) as Promise<T>;
    }
    this.dec(labels);
    return result;
  }

  /**
   * Create child gauge with preset labels
   */
  labels(
    labels: MetricLabels
  ): {
    set: (value: number) => void;
    inc: (value?: number) => void;
    dec: (value?: number) => void;
    get: () => number;
  } {
    return {
      set: (value) => this.set(value, labels),
      inc: (value = 1) => this.inc(labels, value),
      dec: (value = 1) => this.dec(labels, value),
      get: () => this.get(labels),
    };
  }

  private labelsToKey(labels: MetricLabels): string {
    if (this.labelNames.length === 0) return '';
    return this.labelNames.map((name) => `${name}=${labels[name] ?? ''}`).join(',');
  }
}

/**
 * Default histogram buckets
 */
export const DEFAULT_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

/**
 * Histogram - distribution of values
 */
export class Histogram {
  readonly name: string;
  readonly help: string;
  readonly labelNames: string[];
  readonly buckets: number[];
  private values: Map<string, HistogramValue> = new Map();

  constructor(options: HistogramOptions) {
    this.name = options.name;
    this.help = options.help ?? '';
    this.labelNames = options.labels ?? [];
    this.buckets = [...(options.buckets ?? DEFAULT_BUCKETS)].sort((a, b) => a - b);
  }

  /**
   * Observe a value
   */
  observe(value: number, labels: MetricLabels = {}): this {
    const key = this.labelsToKey(labels);
    let existing = this.values.get(key);

    if (!existing) {
      existing = {
        count: 0,
        sum: 0,
        buckets: new Map(this.buckets.map((b) => [b, 0])),
        labels,
        timestamp: Date.now(),
      };
      this.values.set(key, existing);
    }

    existing.count++;
    existing.sum += value;
    existing.timestamp = Date.now();

    // Increment all buckets where value <= bucket boundary
    for (const bucket of this.buckets) {
      if (value <= bucket) {
        existing.buckets.set(bucket, (existing.buckets.get(bucket) ?? 0) + 1);
      }
    }

    return this;
  }

  /**
   * Get histogram data
   */
  get(labels: MetricLabels = {}): HistogramValue | undefined {
    const key = this.labelsToKey(labels);
    return this.values.get(key);
  }

  /**
   * Get all values
   */
  getAll(): HistogramValue[] {
    return Array.from(this.values.values());
  }

  /**
   * Reset histogram
   */
  reset(labels?: MetricLabels): this {
    if (labels) {
      const key = this.labelsToKey(labels);
      this.values.delete(key);
    } else {
      this.values.clear();
    }
    return this;
  }

  /**
   * Start a timer
   */
  startTimer(labels: MetricLabels = {}): () => number {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e9; // Convert to seconds
      this.observe(duration, labels);
      return duration;
    };
  }

  /**
   * Time a function
   */
  async time<T>(fn: () => T | Promise<T>, labels: MetricLabels = {}): Promise<T> {
    const end = this.startTimer(labels);
    try {
      const result = await fn();
      return result;
    } finally {
      end();
    }
  }

  /**
   * Create child histogram with preset labels
   */
  labels(labels: MetricLabels): {
    observe: (value: number) => void;
    startTimer: () => () => number;
  } {
    return {
      observe: (value) => this.observe(value, labels),
      startTimer: () => this.startTimer(labels),
    };
  }

  private labelsToKey(labels: MetricLabels): string {
    if (this.labelNames.length === 0) return '';
    return this.labelNames.map((name) => `${name}=${labels[name] ?? ''}`).join(',');
  }
}

/**
 * Default summary percentiles
 */
export const DEFAULT_PERCENTILES = [0.5, 0.9, 0.95, 0.99];

/**
 * Summary - calculates percentiles over sliding time window
 */
export class Summary {
  readonly name: string;
  readonly help: string;
  readonly labelNames: string[];
  readonly percentiles: number[];
  readonly maxAge: number;
  private values: Map<string, { observations: { value: number; timestamp: number }[]; labels: MetricLabels }> =
    new Map();

  constructor(options: SummaryOptions) {
    this.name = options.name;
    this.help = options.help ?? '';
    this.labelNames = options.labels ?? [];
    this.percentiles = options.percentiles ?? DEFAULT_PERCENTILES;
    this.maxAge = options.maxAge ?? 600000; // 10 minutes default
  }

  /**
   * Observe a value
   */
  observe(value: number, labels: MetricLabels = {}): this {
    const key = this.labelsToKey(labels);
    let existing = this.values.get(key);

    if (!existing) {
      existing = { observations: [], labels };
      this.values.set(key, existing);
    }

    existing.observations.push({ value, timestamp: Date.now() });
    return this;
  }

  /**
   * Get summary data
   */
  get(labels: MetricLabels = {}): SummaryValue | undefined {
    const key = this.labelsToKey(labels);
    const data = this.values.get(key);
    if (!data) return undefined;

    // Filter to only observations within maxAge
    const cutoff = Date.now() - this.maxAge;
    const validObservations = data.observations.filter((o) => o.timestamp >= cutoff);
    data.observations = validObservations; // Prune old observations

    if (validObservations.length === 0) return undefined;

    const values = validObservations.map((o) => o.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    const percentileValues = new Map<number, number>();
    for (const p of this.percentiles) {
      const index = Math.ceil(p * count) - 1;
      percentileValues.set(p, values[Math.max(0, index)]!);
    }

    return {
      count,
      sum,
      percentiles: percentileValues,
      labels: data.labels,
      timestamp: Date.now(),
    };
  }

  /**
   * Get all values
   */
  getAll(): SummaryValue[] {
    const result: SummaryValue[] = [];
    for (const [, data] of this.values) {
      const summary = this.get(data.labels);
      if (summary) result.push(summary);
    }
    return result;
  }

  /**
   * Reset summary
   */
  reset(labels?: MetricLabels): this {
    if (labels) {
      const key = this.labelsToKey(labels);
      this.values.delete(key);
    } else {
      this.values.clear();
    }
    return this;
  }

  /**
   * Start a timer
   */
  startTimer(labels: MetricLabels = {}): () => number {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e9;
      this.observe(duration, labels);
      return duration;
    };
  }

  /**
   * Create child summary with preset labels
   */
  labels(labels: MetricLabels): {
    observe: (value: number) => void;
    startTimer: () => () => number;
  } {
    return {
      observe: (value) => this.observe(value, labels),
      startTimer: () => this.startTimer(labels),
    };
  }

  private labelsToKey(labels: MetricLabels): string {
    if (this.labelNames.length === 0) return '';
    return this.labelNames.map((name) => `${name}=${labels[name] ?? ''}`).join(',');
  }
}

/**
 * Timer - convenience class for timing operations
 */
export class Timer {
  readonly name: string;
  readonly help: string;
  private histogram: Histogram;

  constructor(options: TimerOptions) {
    this.name = options.name;
    this.help = options.help ?? '';
    this.histogram = new Histogram({
      name: options.name,
      help: options.help,
      labels: options.labels,
      buckets: options.buckets ?? [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });
  }

  /**
   * Start timing
   */
  start(labels: MetricLabels = {}): () => number {
    return this.histogram.startTimer(labels);
  }

  /**
   * Time a function
   */
  async time<T>(fn: () => T | Promise<T>, labels: MetricLabels = {}): Promise<T> {
    return this.histogram.time(fn, labels);
  }

  /**
   * Record a duration manually
   */
  record(duration: number, labels: MetricLabels = {}): this {
    this.histogram.observe(duration, labels);
    return this;
  }

  /**
   * Get histogram data
   */
  get(labels: MetricLabels = {}): HistogramValue | undefined {
    return this.histogram.get(labels);
  }

  /**
   * Get all values
   */
  getAll(): HistogramValue[] {
    return this.histogram.getAll();
  }

  /**
   * Reset timer
   */
  reset(labels?: MetricLabels): this {
    this.histogram.reset(labels);
    return this;
  }
}

/**
 * Metrics registry - holds all metrics
 */
export class Metrics {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private summaries: Map<string, Summary> = new Map();
  private timers: Map<string, Timer> = new Map();
  private prefix: string;

  constructor(options: { prefix?: string } = {}) {
    this.prefix = options.prefix ?? '';
  }

  /**
   * Create or get a counter
   */
  counter(options: CounterOptions | string): Counter {
    const opts = typeof options === 'string' ? { name: options } : options;
    const name = this.prefix + opts.name;

    let counter = this.counters.get(name);
    if (!counter) {
      counter = new Counter({ ...opts, name });
      this.counters.set(name, counter);
    }
    return counter;
  }

  /**
   * Create or get a gauge
   */
  gauge(options: GaugeOptions | string): Gauge {
    const opts = typeof options === 'string' ? { name: options } : options;
    const name = this.prefix + opts.name;

    let gauge = this.gauges.get(name);
    if (!gauge) {
      gauge = new Gauge({ ...opts, name });
      this.gauges.set(name, gauge);
    }
    return gauge;
  }

  /**
   * Create or get a histogram
   */
  histogram(options: HistogramOptions | string): Histogram {
    const opts = typeof options === 'string' ? { name: options } : options;
    const name = this.prefix + opts.name;

    let histogram = this.histograms.get(name);
    if (!histogram) {
      histogram = new Histogram({ ...opts, name });
      this.histograms.set(name, histogram);
    }
    return histogram;
  }

  /**
   * Create or get a summary
   */
  summary(options: SummaryOptions | string): Summary {
    const opts = typeof options === 'string' ? { name: options } : options;
    const name = this.prefix + opts.name;

    let summary = this.summaries.get(name);
    if (!summary) {
      summary = new Summary({ ...opts, name });
      this.summaries.set(name, summary);
    }
    return summary;
  }

  /**
   * Create or get a timer
   */
  timer(options: TimerOptions | string): Timer {
    const opts = typeof options === 'string' ? { name: options } : options;
    const name = this.prefix + opts.name;

    let timer = this.timers.get(name);
    if (!timer) {
      timer = new Timer({ ...opts, name });
      this.timers.set(name, timer);
    }
    return timer;
  }

  /**
   * Get all metrics data
   */
  getAll(): {
    counters: { name: string; values: MetricValue[] }[];
    gauges: { name: string; values: MetricValue[] }[];
    histograms: { name: string; values: HistogramValue[] }[];
    summaries: { name: string; values: SummaryValue[] }[];
    timers: { name: string; values: HistogramValue[] }[];
  } {
    return {
      counters: Array.from(this.counters.entries()).map(([name, c]) => ({
        name,
        values: c.getAll(),
      })),
      gauges: Array.from(this.gauges.entries()).map(([name, g]) => ({
        name,
        values: g.getAll(),
      })),
      histograms: Array.from(this.histograms.entries()).map(([name, h]) => ({
        name,
        values: h.getAll(),
      })),
      summaries: Array.from(this.summaries.entries()).map(([name, s]) => ({
        name,
        values: s.getAll(),
      })),
      timers: Array.from(this.timers.entries()).map(([name, t]) => ({
        name,
        values: t.getAll(),
      })),
    };
  }

  /**
   * Reset all metrics
   */
  reset(): this {
    this.counters.forEach((c) => c.reset());
    this.gauges.forEach((g) => g.reset());
    this.histograms.forEach((h) => h.reset());
    this.summaries.forEach((s) => s.reset());
    this.timers.forEach((t) => t.reset());
    return this;
  }

  /**
   * Clear all metrics
   */
  clear(): this {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.summaries.clear();
    this.timers.clear();
    return this;
  }

  /**
   * Export metrics in Prometheus format
   */
  toPrometheus(): string {
    const lines: string[] = [];

    // Counters
    for (const [name, counter] of this.counters) {
      if (counter.help) lines.push(`# HELP ${name} ${counter.help}`);
      lines.push(`# TYPE ${name} counter`);
      for (const value of counter.getAll()) {
        const labels = this.formatLabels(value.labels);
        lines.push(`${name}${labels} ${value.value}`);
      }
      if (counter.getAll().length === 0) {
        lines.push(`${name} 0`);
      }
    }

    // Gauges
    for (const [name, gauge] of this.gauges) {
      if (gauge.help) lines.push(`# HELP ${name} ${gauge.help}`);
      lines.push(`# TYPE ${name} gauge`);
      for (const value of gauge.getAll()) {
        const labels = this.formatLabels(value.labels);
        lines.push(`${name}${labels} ${value.value}`);
      }
    }

    // Histograms
    for (const [name, histogram] of this.histograms) {
      if (histogram.help) lines.push(`# HELP ${name} ${histogram.help}`);
      lines.push(`# TYPE ${name} histogram`);
      for (const value of histogram.getAll()) {
        const baseLabels = this.formatLabels(value.labels);
        for (const [bucket, count] of value.buckets) {
          const bucketLabel = baseLabels ? `${baseLabels.slice(0, -1)},le="${bucket}"}` : `{le="${bucket}"}`;
          lines.push(`${name}_bucket${bucketLabel} ${count}`);
        }
        const infLabel = baseLabels ? `${baseLabels.slice(0, -1)},le="+Inf"}` : `{le="+Inf"}`;
        lines.push(`${name}_bucket${infLabel} ${value.count}`);
        lines.push(`${name}_sum${baseLabels} ${value.sum}`);
        lines.push(`${name}_count${baseLabels} ${value.count}`);
      }
    }

    // Summaries
    for (const [name, summary] of this.summaries) {
      if (summary.help) lines.push(`# HELP ${name} ${summary.help}`);
      lines.push(`# TYPE ${name} summary`);
      for (const value of summary.getAll()) {
        const baseLabels = this.formatLabels(value.labels);
        for (const [quantile, quantileValue] of value.percentiles) {
          const quantileLabel = baseLabels
            ? `${baseLabels.slice(0, -1)},quantile="${quantile}"}`
            : `{quantile="${quantile}"}`;
          lines.push(`${name}${quantileLabel} ${quantileValue}`);
        }
        lines.push(`${name}_sum${baseLabels} ${value.sum}`);
        lines.push(`${name}_count${baseLabels} ${value.count}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export metrics as JSON
   */
  toJSON(): object {
    return this.getAll();
  }

  private formatLabels(labels: MetricLabels): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    return '{' + entries.map(([k, v]) => `${k}="${v}"`).join(',') + '}';
  }
}

// Factory function
export function createMetrics(options?: { prefix?: string }): Metrics {
  return new Metrics(options);
}

// Default instance
export const metrics = createMetrics();

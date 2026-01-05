/**
 * Distributed tracing module
 * Spans, traces, and context propagation
 */

import { randomBytes } from 'node:crypto';

export type SpanStatus = 'ok' | 'error' | 'unset';
export type SpanKind = 'internal' | 'server' | 'client' | 'producer' | 'consumer';

export interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
  traceState?: string;
}

export interface SpanAttributes {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: SpanAttributes;
}

export interface SpanLink {
  context: SpanContext;
  attributes?: SpanAttributes;
}

export interface SpanOptions {
  kind?: SpanKind;
  attributes?: SpanAttributes;
  links?: SpanLink[];
  startTime?: number;
  root?: boolean;
}

export interface SpanData {
  name: string;
  context: SpanContext;
  parentSpanId?: string;
  kind: SpanKind;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: SpanStatus;
  statusMessage?: string;
  attributes: SpanAttributes;
  events: SpanEvent[];
  links: SpanLink[];
}

/**
 * Generate a random trace ID (16 bytes, 32 hex chars)
 */
function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Generate a random span ID (8 bytes, 16 hex chars)
 */
function generateSpanId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Represents a single operation within a trace
 */
export class Span {
  readonly name: string;
  readonly context: SpanContext;
  readonly parentSpanId?: string;
  readonly kind: SpanKind;
  readonly startTime: number;
  private _endTime?: number;
  private _status: SpanStatus = 'unset';
  private _statusMessage?: string;
  private _attributes: SpanAttributes = {};
  private _events: SpanEvent[] = [];
  private _links: SpanLink[] = [];
  private _ended = false;
  private tracer: Tracer;

  constructor(tracer: Tracer, name: string, options: SpanOptions & { parentSpanId?: string; context: SpanContext }) {
    this.tracer = tracer;
    this.name = name;
    this.context = options.context;
    this.parentSpanId = options.parentSpanId;
    this.kind = options.kind ?? 'internal';
    this.startTime = options.startTime ?? Date.now();
    if (options.attributes) {
      this._attributes = { ...options.attributes };
    }
    if (options.links) {
      this._links = [...options.links];
    }
  }

  /**
   * Set an attribute on the span
   */
  setAttribute(key: string, value: string | number | boolean | string[] | number[] | boolean[]): this {
    if (!this._ended) {
      this._attributes[key] = value;
    }
    return this;
  }

  /**
   * Set multiple attributes on the span
   */
  setAttributes(attributes: SpanAttributes): this {
    if (!this._ended) {
      Object.assign(this._attributes, attributes);
    }
    return this;
  }

  /**
   * Get an attribute value
   */
  getAttribute(key: string): string | number | boolean | string[] | number[] | boolean[] | undefined {
    return this._attributes[key];
  }

  /**
   * Get all attributes
   */
  getAttributes(): SpanAttributes {
    return { ...this._attributes };
  }

  /**
   * Add an event to the span
   */
  addEvent(name: string, attributes?: SpanAttributes, timestamp?: number): this {
    if (!this._ended) {
      this._events.push({
        name,
        timestamp: timestamp ?? Date.now(),
        attributes,
      });
    }
    return this;
  }

  /**
   * Get all events
   */
  getEvents(): SpanEvent[] {
    return [...this._events];
  }

  /**
   * Add a link to the span
   */
  addLink(context: SpanContext, attributes?: SpanAttributes): this {
    if (!this._ended) {
      this._links.push({ context, attributes });
    }
    return this;
  }

  /**
   * Get all links
   */
  getLinks(): SpanLink[] {
    return [...this._links];
  }

  /**
   * Set the span status
   */
  setStatus(status: SpanStatus, message?: string): this {
    if (!this._ended) {
      this._status = status;
      this._statusMessage = message;
    }
    return this;
  }

  /**
   * Get the span status
   */
  getStatus(): { status: SpanStatus; message?: string } {
    return { status: this._status, message: this._statusMessage };
  }

  /**
   * Record an exception
   */
  recordException(exception: Error | string, timestamp?: number): this {
    const error = typeof exception === 'string' ? new Error(exception) : exception;
    this.addEvent(
      'exception',
      {
        'exception.type': error.name,
        'exception.message': error.message,
        'exception.stacktrace': error.stack ?? '',
      },
      timestamp
    );
    this.setStatus('error', error.message);
    return this;
  }

  /**
   * End the span
   */
  end(endTime?: number): void {
    if (this._ended) return;

    this._endTime = endTime ?? Date.now();
    this._ended = true;
    this.tracer.onSpanEnd(this);
  }

  /**
   * Check if span has ended
   */
  isEnded(): boolean {
    return this._ended;
  }

  /**
   * Get span duration in milliseconds
   */
  getDuration(): number | undefined {
    if (!this._endTime) return undefined;
    return this._endTime - this.startTime;
  }

  /**
   * Get end time
   */
  getEndTime(): number | undefined {
    return this._endTime;
  }

  /**
   * Export span data
   */
  toJSON(): SpanData {
    return {
      name: this.name,
      context: this.context,
      parentSpanId: this.parentSpanId,
      kind: this.kind,
      startTime: this.startTime,
      endTime: this._endTime,
      duration: this.getDuration(),
      status: this._status,
      statusMessage: this._statusMessage,
      attributes: { ...this._attributes },
      events: [...this._events],
      links: [...this._links],
    };
  }
}

/**
 * Span exporter interface
 */
export interface SpanExporter {
  export(spans: SpanData[]): Promise<void>;
  shutdown(): Promise<void>;
}

/**
 * Console exporter - logs spans to console
 */
export class ConsoleSpanExporter implements SpanExporter {
  async export(spans: SpanData[]): Promise<void> {
    for (const span of spans) {
      console.log(JSON.stringify(span, null, 2));
    }
  }

  async shutdown(): Promise<void> {}
}

/**
 * In-memory exporter - stores spans in memory
 */
export class InMemorySpanExporter implements SpanExporter {
  private spans: SpanData[] = [];

  async export(spans: SpanData[]): Promise<void> {
    this.spans.push(...spans);
  }

  async shutdown(): Promise<void> {
    this.spans = [];
  }

  getSpans(): SpanData[] {
    return [...this.spans];
  }

  clear(): void {
    this.spans = [];
  }
}

/**
 * Batch span processor - batches spans for export
 */
export class BatchSpanProcessor {
  private queue: SpanData[] = [];
  private exporter: SpanExporter;
  private maxBatchSize: number;
  private maxQueueSize: number;
  private scheduledDelayMs: number;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    exporter: SpanExporter,
    options: {
      maxBatchSize?: number;
      maxQueueSize?: number;
      scheduledDelayMs?: number;
    } = {}
  ) {
    this.exporter = exporter;
    this.maxBatchSize = options.maxBatchSize ?? 512;
    this.maxQueueSize = options.maxQueueSize ?? 2048;
    this.scheduledDelayMs = options.scheduledDelayMs ?? 5000;
  }

  onEnd(span: SpanData): void {
    if (this.queue.length >= this.maxQueueSize) {
      // Drop oldest spans if queue is full
      this.queue.shift();
    }
    this.queue.push(span);

    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, this.scheduledDelayMs);
    }
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.maxBatchSize);
    try {
      await this.exporter.export(batch);
    } catch (error) {
      // Re-queue failed spans (up to max queue size)
      const availableSpace = this.maxQueueSize - this.queue.length;
      this.queue.unshift(...batch.slice(0, availableSpace));
    }
  }

  async shutdown(): Promise<void> {
    await this.flush();
    await this.exporter.shutdown();
  }
}

export interface TracerOptions {
  serviceName?: string;
  serviceVersion?: string;
  exporter?: SpanExporter;
  processor?: BatchSpanProcessor;
}

/**
 * Tracer - creates and manages spans
 */
export class Tracer {
  private serviceName: string;
  private serviceVersion: string;
  private processor?: BatchSpanProcessor;
  private exporter?: SpanExporter;
  private activeSpans: Map<string, Span> = new Map();
  private currentSpan?: Span;
  private listeners: ((span: SpanData) => void)[] = [];

  constructor(options: TracerOptions = {}) {
    this.serviceName = options.serviceName ?? 'unknown';
    this.serviceVersion = options.serviceVersion ?? '0.0.0';
    this.exporter = options.exporter;
    this.processor = options.processor;
  }

  /**
   * Start a new span
   */
  startSpan(name: string, options: SpanOptions = {}): Span {
    let parentSpanId: string | undefined;
    let traceId: string;

    if (options.root || !this.currentSpan) {
      // Start a new trace
      traceId = generateTraceId();
    } else {
      // Continue existing trace
      traceId = this.currentSpan.context.traceId;
      parentSpanId = this.currentSpan.context.spanId;
    }

    const context: SpanContext = {
      traceId,
      spanId: generateSpanId(),
      traceFlags: 1, // Sampled
    };

    const span = new Span(this, name, {
      ...options,
      context,
      parentSpanId,
    });

    // Add service attributes
    span.setAttributes({
      'service.name': this.serviceName,
      'service.version': this.serviceVersion,
    });

    this.activeSpans.set(context.spanId, span);

    return span;
  }

  /**
   * Start a span and set it as the current span
   */
  startActiveSpan<T>(name: string, fn: (span: Span) => T): T;
  startActiveSpan<T>(name: string, options: SpanOptions, fn: (span: Span) => T): T;
  startActiveSpan<T>(name: string, optionsOrFn: SpanOptions | ((span: Span) => T), maybeFn?: (span: Span) => T): T {
    const options = typeof optionsOrFn === 'function' ? {} : optionsOrFn;
    const fn = typeof optionsOrFn === 'function' ? optionsOrFn : maybeFn!;

    const span = this.startSpan(name, options);
    const previousSpan = this.currentSpan;
    this.currentSpan = span;

    try {
      const result = fn(span);
      if (result instanceof Promise) {
        return result
          .then((value) => {
            if (!span.isEnded()) span.setStatus('ok');
            span.end();
            return value;
          })
          .catch((error) => {
            span.recordException(error);
            span.end();
            throw error;
          })
          .finally(() => {
            this.currentSpan = previousSpan;
          }) as T;
      }

      if (!span.isEnded()) span.setStatus('ok');
      span.end();
      this.currentSpan = previousSpan;
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.end();
      this.currentSpan = previousSpan;
      throw error;
    }
  }

  /**
   * Get the current active span
   */
  getActiveSpan(): Span | undefined {
    return this.currentSpan;
  }

  /**
   * Set the current active span
   */
  setActiveSpan(span: Span | undefined): void {
    this.currentSpan = span;
  }

  /**
   * Create a new context with the given span
   */
  withSpan<T>(span: Span, fn: () => T): T {
    const previousSpan = this.currentSpan;
    this.currentSpan = span;

    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => {
          this.currentSpan = previousSpan;
        }) as T;
      }
      this.currentSpan = previousSpan;
      return result;
    } catch (error) {
      this.currentSpan = previousSpan;
      throw error;
    }
  }

  /**
   * Called when a span ends
   */
  onSpanEnd(span: Span): void {
    this.activeSpans.delete(span.context.spanId);
    const data = span.toJSON();

    // Notify listeners
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch {
        // Ignore listener errors
      }
    }

    // Send to processor
    if (this.processor) {
      this.processor.onEnd(data);
    } else if (this.exporter) {
      this.exporter.export([data]).catch(() => {
        // Ignore export errors
      });
    }
  }

  /**
   * Add a span listener
   */
  onSpan(listener: (span: SpanData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  /**
   * Get all active spans
   */
  getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  /**
   * Flush pending spans
   */
  async flush(): Promise<void> {
    if (this.processor) {
      await this.processor.flush();
    }
  }

  /**
   * Shutdown the tracer
   */
  async shutdown(): Promise<void> {
    // End all active spans
    for (const span of this.activeSpans.values()) {
      span.end();
    }

    if (this.processor) {
      await this.processor.shutdown();
    } else if (this.exporter) {
      await this.exporter.shutdown();
    }
  }
}

/**
 * Context propagation utilities
 */
export const propagation = {
  /**
   * Inject trace context into carrier (e.g., HTTP headers)
   */
  inject(context: SpanContext, carrier: Record<string, string>): void {
    // W3C Trace Context format
    carrier['traceparent'] = `00-${context.traceId}-${context.spanId}-${context.traceFlags.toString(16).padStart(2, '0')}`;
    if (context.traceState) {
      carrier['tracestate'] = context.traceState;
    }
  },

  /**
   * Extract trace context from carrier
   */
  extract(carrier: Record<string, string>): SpanContext | undefined {
    const traceparent = carrier['traceparent'];
    if (!traceparent) return undefined;

    // Parse W3C Trace Context format: 00-traceId-spanId-flags
    const parts = traceparent.split('-');
    if (parts.length !== 4) return undefined;

    const version = parts[0];
    const traceId = parts[1];
    const spanId = parts[2];
    const flags = parts[3];

    if (!version || !traceId || !spanId || !flags) return undefined;
    if (version !== '00') return undefined;
    if (traceId.length !== 32 || spanId.length !== 16) return undefined;

    return {
      traceId,
      spanId,
      traceFlags: parseInt(flags, 16),
      traceState: carrier['tracestate'],
    };
  },

  /**
   * Create a child context from a parent
   */
  childContext(parent: SpanContext): SpanContext {
    return {
      traceId: parent.traceId,
      spanId: generateSpanId(),
      traceFlags: parent.traceFlags,
      traceState: parent.traceState,
    };
  },
};

/**
 * Decorator for tracing methods
 */
export function traced(name?: string, options?: SpanOptions) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const spanName = name ?? `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: unknown[]) {
      return trace.startActiveSpan(spanName, options ?? {}, (span) => {
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}

/**
 * Utility to trace a function
 */
export function traceFunction<T extends (...args: unknown[]) => unknown>(
  name: string,
  fn: T,
  options?: SpanOptions
): T {
  return function (...args: Parameters<T>) {
    return trace.startActiveSpan(name, options ?? {}, () => {
      return fn(...args);
    });
  } as T;
}

// Factory function
export function createTracer(options?: TracerOptions): Tracer {
  return new Tracer(options);
}

// Default instance
export const trace = createTracer();

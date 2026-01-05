/**
 * Observability modules - metrics, health, trace
 */

// Metrics exports
export {
  Metrics,
  Counter,
  Gauge,
  Histogram,
  Summary,
  Timer,
  createMetrics,
  metrics,
  DEFAULT_BUCKETS,
  DEFAULT_PERCENTILES,
} from './metrics.js';

export type {
  MetricLabels,
  MetricOptions,
  CounterOptions,
  GaugeOptions,
  HistogramOptions,
  SummaryOptions,
  TimerOptions,
  MetricValue,
  HistogramValue,
  SummaryValue,
} from './metrics.js';

// Health exports
export {
  HealthChecker,
  createHealthChecker,
  health,
  healthChecks,
  healthResponse,
} from './health.js';

export type {
  HealthStatus,
  HealthCheckResult,
  HealthCheckOptions,
  HealthCheckFn,
  HealthReport,
  HealthCheckerOptions,
} from './health.js';

// Trace exports
export {
  Tracer,
  Span,
  ConsoleSpanExporter,
  InMemorySpanExporter,
  BatchSpanProcessor,
  createTracer,
  trace,
  propagation,
  traced,
  traceFunction,
} from './trace.js';

export type {
  SpanStatus,
  SpanKind,
  SpanContext,
  SpanAttributes,
  SpanEvent,
  SpanLink,
  SpanOptions,
  SpanData,
  SpanExporter,
  TracerOptions,
} from './trace.js';

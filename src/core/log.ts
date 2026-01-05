import type { LogLevel, MetaData } from '../types.js';

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  meta?: MetaData;
  timestamp: string;
  context?: MetaData;
}

/**
 * Log formatter type
 */
type LogFormatter = (entry: LogEntry) => string;

/**
 * Logger options
 */
export interface LoggerOptions {
  /** Minimum log level */
  level?: LogLevel;
  /** Enable pretty printing */
  pretty?: boolean;
  /** Include timestamps */
  timestamp?: boolean;
  /** Custom formatter */
  formatter?: LogFormatter;
}

/**
 * Logger class for structured logging
 *
 * @example
 * ```typescript
 * const logger = createLogger({ level: 'info', pretty: true });
 * logger.info('Server started', { port: 3000 });
 * logger.error('Failed to connect', { error: err });
 * ```
 */
export class Logger {
  private level: LogLevel;
  private pretty: boolean;
  private timestamp: boolean;
  private formatter?: LogFormatter;
  private childContext: MetaData = {};
  private isSilent = false;
  private startTime: number;

  readonly levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
  private levelWeights: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
    fatal: 50,
  };

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.pretty = options.pretty || false;
    this.timestamp = options.timestamp !== false;
    this.formatter = options.formatter;
    this.startTime = Date.now();
  }

  /**
   * Log a debug message
   */
  debug(message: string, meta?: MetaData): void {
    this.log('debug', message, meta);
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: MetaData): void {
    this.log('info', message, meta);
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: MetaData): void {
    this.log('warn', message, meta);
  }

  /**
   * Log an error message
   */
  error(message: string, meta?: MetaData): void {
    this.log('error', message, meta);
  }

  /**
   * Log a fatal message
   */
  fatal(message: string, meta?: MetaData): void {
    this.log('fatal', message, meta);
  }

  /**
   * Create a child logger with merged context
   */
  child(meta: MetaData): Logger {
    const child = new Logger({
      level: this.level,
      pretty: this.pretty,
      timestamp: this.timestamp,
      formatter: this.formatter,
    });
    child.childContext = { ...this.childContext, ...meta };
    return child;
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    if (!this.levels.includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Disable all output
   */
  silent(): void {
    this.isSilent = true;
  }

  /**
   * Enable output
   */
  loud(): void {
    this.isSilent = false;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, meta?: MetaData): void {
    if (this.isSilent) {
      return;
    }

    if (this.levelWeights[level] < this.levelWeights[this.level]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      meta: { ...this.childContext, ...meta },
      timestamp: this.timestamp ? new Date().toISOString() : '',
    };

    const formatted = this.format(entry);
    this.write(formatted, level);
  }

  /**
   * Format log entry
   */
  private format(entry: LogEntry): string {
    if (this.formatter) {
      return this.formatter(entry);
    }

    if (this.pretty) {
      return this.formatPretty(entry);
    }

    return this.formatJSON(entry);
  }

  /**
   * Format as JSON
   */
  private formatJSON(entry: LogEntry): string {
    const obj: Record<string, unknown> = {
      level: entry.level,
      message: entry.message,
    };

    if (entry.timestamp) {
      obj.timestamp = entry.timestamp;
    }

    if (entry.meta && Object.keys(entry.meta).length > 0) {
      obj.meta = entry.meta;
    }

    return JSON.stringify(obj);
  }

  /**
   * Format for pretty printing
   */
  private formatPretty(entry: LogEntry): string {
    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      fatal: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = levelColors[entry.level];
    const levelUpper = entry.level.toUpperCase().padEnd(5);

    let output = '';

    if (entry.timestamp) {
      output += `${entry.timestamp} `;
    }

    output += `${color}${levelUpper}${reset} ${entry.message}`;

    if (entry.meta && Object.keys(entry.meta).length > 0) {
      output += ` ${JSON.stringify(entry.meta)}`;
    }

    return output;
  }

  /**
   * Write formatted output
   */
  private write(formatted: string, level: LogLevel): void {
    const stream = level === 'error' || level === 'fatal' ? console.error : console.log;
    stream(formatted);
  }
}

/**
 * Create a new logger instance
 *
 * @example
 * ```typescript
 * // Basic logger
 * const logger = createLogger();
 *
 * // With options
 * const logger = createLogger({
 *   level: 'debug',
 *   pretty: true,
 *   timestamp: true
 * });
 *
 * // Child logger with context
 * const childLogger = logger.child({ requestId: '123' });
 * childLogger.info('Processing request');
 * ```
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

/**
 * Default logger instance
 */
export const log = createLogger();

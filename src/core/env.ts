import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { ConfigError } from '../errors.js';

/**
 * Environment variable utilities
 *
 * @example
 * ```typescript
 * import { env } from '@oxog/kit';
 *
 * const port = env.number('PORT', 3000);
 * const dbUrl = env.require('DATABASE_URL');
 * const isDev = env.isDev();
 * ```
 */
export class Env {
  /**
   * Get environment variable value
   */
  get(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue;
  }

  /**
   * Get required environment variable or throw
   */
  require(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
      throw new ConfigError(`Missing required environment variable: ${key}`, { key });
    }
    return value;
  }

  /**
   * Get environment variable as string
   */
  string(key: string, defaultValue?: string): string | undefined {
    return this.get(key, defaultValue);
  }

  /**
   * Get environment variable as number
   */
  number(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new ConfigError(`Invalid number for environment variable: ${key}`, {
        key,
        value,
      });
    }
    return num;
  }

  /**
   * Get environment variable as boolean
   */
  boolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
    throw new ConfigError(`Invalid boolean for environment variable: ${key}`, {
      key,
      value,
    });
  }

  /**
   * Get environment variable as array
   */
  array(key: string, separator: string = ',', defaultValue?: string[]): string[] | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    return value.split(separator).map((s) => s.trim()).filter(Boolean);
  }

  /**
   * Get environment variable as JSON
   */
  json<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new ConfigError(`Invalid JSON for environment variable: ${key}`, {
        key,
        value,
        error,
      });
    }
  }

  /**
   * Get environment variable as URL
   */
  url(key: string, defaultValue?: string): URL | undefined {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue ? new URL(defaultValue) : undefined;
    }
    try {
      return new URL(value);
    } catch (error) {
      throw new ConfigError(`Invalid URL for environment variable: ${key}`, {
        key,
        value,
        error,
      });
    }
  }

  /**
   * Get environment variable as port number
   */
  port(key: string, defaultValue: number = 3000): number {
    const port = this.number(key, defaultValue);
    if (port === undefined) {
      return defaultValue;
    }
    if (port < 1 || port > 65535) {
      throw new ConfigError(`Invalid port number for environment variable: ${key}`, {
        key,
        value: port,
      });
    }
    return port;
  }

  /**
   * Check if running in development
   */
  isDev(): boolean {
    return this.nodeEnv() === 'development';
  }

  /**
   * Check if running in production
   */
  isProd(): boolean {
    return this.nodeEnv() === 'production';
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.nodeEnv() === 'test';
  }

  /**
   * Get NODE_ENV value
   */
  nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * Load environment variables from .env file
   */
  loadDotenv(path: string = '.env'): void {
    if (!existsSync(path)) {
      return;
    }

    const content = readFileSync(path, 'utf-8');
    this.parseDotenv(content);
  }

  /**
   * Parse dotenv content and set environment variables
   */
  parseDotenv(content: string): void {
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse KEY=VALUE or KEY='VALUE' or KEY="VALUE"
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (!match) {
        continue;
      }

      const [, key, value] = match;
      if (!key || !value) {
        continue;
      }
      const cleanKey = key.trim();

      // Handle quoted values
      if ((value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))) {
        process.env[cleanKey] = value.slice(1, -1);
      } else {
        // Remove inline comments
        const unquoted = value.trim();
        const commentIndex = unquoted.indexOf('#');
        const cleanValue = commentIndex >= 0
          ? unquoted.slice(0, commentIndex).trim()
          : unquoted;
        process.env[cleanKey] = cleanValue;
      }
    }
  }

  /**
   * Get all environment variables
   */
  all(): Record<string, string | undefined> {
    return { ...process.env };
  }
}

/**
 * Create a new env instance
 *
 * @example
 * ```typescript
 * const env = createEnv();
 * env.loadDotenv();
 * const port = env.port('PORT', 3000);
 * ```
 */
export function createEnv(): Env {
  return new Env();
}

/**
 * Default env instance
 */
export const env = createEnv();

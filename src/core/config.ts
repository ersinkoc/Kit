import { readFileSync, existsSync, mkdirSync, writeFileSync, watchFile } from 'node:fs';
import { dirname } from 'node:path';
import { ConfigError } from '../errors.js';
import type { MetaData } from '../types.js';

/**
 * Config options
 */
export interface ConfigOptions {
  /** Config file path */
  path?: string;
  /** Enable environment variable override */
  env?: boolean;
  /** Environment variable prefix */
  envPrefix?: string;
}

/**
 * Configuration manager with dot notation access
 *
 * @example
 * ```typescript
 * const config = createConfig({ path: './config', env: true });
 *
 * // Get value with dot notation
 * const dbHost = config.get('db.host');
 * const port = config.get('server.port', 3000);
 *
 * // Set value
 * config.set('debug', true);
 *
 * // Check if key exists
 * if (config.has('api.key')) {
 *   const apiKey = config.require('api.key');
 * }
 * ```
 */
export class Config {
  private data: Record<string, unknown> = {};
  private envPrefix: string;
  private enableEnv: boolean;
  private watchers = new Map<string, () => void>();

  constructor(options: ConfigOptions = {}) {
    this.envPrefix = options.envPrefix || '';
    this.enableEnv = options.env !== false;

    if (options.path) {
      this.load(options.path);
    }
  }

  /**
   * Get a config value with dot notation
   */
  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    // Try env var first if enabled
    if (this.enableEnv) {
      const envKey = this.keyToEnv(key);
      const envValue = process.env[envKey];
      if (envValue !== undefined) {
        return this.parseValue(envValue) as T;
      }
    }

    // Try config data
    const value = this.getByPath(this.data, key);
    if (value !== undefined) {
      return value as T;
    }

    return defaultValue;
  }

  /**
   * Set a config value with dot notation
   */
  set<T>(key: string, value: T): void {
    this.setByPath(this.data, key, value);
  }

  /**
   * Check if a key exists
   */
  has(key: string): boolean {
    if (this.enableEnv) {
      const envKey = this.keyToEnv(key);
      if (process.env[envKey] !== undefined) {
        return true;
      }
    }
    return this.getByPath(this.data, key) !== undefined;
  }

  /**
   * Get a required value or throw
   */
  require<T = unknown>(key: string): T {
    const value = this.get<T>(key);
    if (value === undefined) {
      throw new ConfigError(`Missing required config: ${key}`, { key });
    }
    return value;
  }

  /**
   * Merge an object into config
   */
  merge(object: Record<string, unknown>): void {
    this.data = this.deepMerge(this.data, object);
  }

  /**
   * Load config from file (JSON only for now)
   */
  load(path: string): void {
    const jsonPath = path.endsWith('.json') ? path : `${path}.json`;

    if (!existsSync(jsonPath)) {
      throw new ConfigError(`Config file not found: ${jsonPath}`, { path: jsonPath });
    }

    try {
      const content = readFileSync(jsonPath, 'utf-8');
      const data = JSON.parse(content);
      this.merge(data as Record<string, unknown>);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ConfigError(`Invalid JSON in config file: ${jsonPath}`, {
          path: jsonPath,
          error: error.message,
        });
      }
      throw error;
    }
  }

  /**
   * Get all config as object
   */
  all(): Record<string, unknown> {
    return { ...this.data };
  }

  /**
   * Clear all config
   */
  clear(): void {
    this.data = {};
  }

  /**
   * Delete a key
   */
  delete(key: string): void {
    this.deleteByPath(this.data, key);
  }

  /**
   * Watch config file for changes
   */
  watch(path: string, callback: () => void): void {
    if (this.watchers.has(path)) {
      return;
    }

    const jsonPath = path.endsWith('.json') ? path : `${path}.json`;

    if (!existsSync(jsonPath)) {
      return;
    }

    watchFile(jsonPath, { interval: 1000 }, () => {
      try {
        this.load(path);
        callback();
      } catch {
        // Ignore errors during reload
      }
    });

    this.watchers.set(path, callback);
  }

  /**
   * Unwatch config file
   */
  unwatch(path: string): void {
    this.watchers.delete(path);
  }

  /**
   * Get value by path (dot notation)
   */
  private getByPath(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Set value by path (dot notation)
   */
  private setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    if (!lastKey) {
      return;
    }

    let current: Record<string, unknown> = obj;

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
  }

  /**
   * Delete value by path (dot notation)
   */
  private deleteByPath(obj: Record<string, unknown>, path: string): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    if (!lastKey) {
      return;
    }

    let current: Record<string, unknown> = obj;

    for (const key of keys) {
      if (current[key] && typeof current[key] === 'object') {
        current = current[key] as Record<string, unknown>;
      } else {
        return;
      }
    }

    delete current[lastKey];
  }

  /**
   * Deep merge objects
   */
  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = this.deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else {
        result[key] = sourceValue;
      }
    }

    return result;
  }

  /**
   * Convert config key to env var name
   */
  private keyToEnv(key: string): string {
    const envKey = key.replace(/\./g, '_').toUpperCase();
    return this.envPrefix + envKey;
  }

  /**
   * Parse environment variable value
   */
  private parseValue(value: string): unknown {
    // Try parsing as JSON first
    if ((value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch {
        // Not valid JSON, return as string
      }
    }

    // Try parsing as number
    if (/^\d+$/.test(value)) {
      return Number(value);
    }

    // Try parsing as boolean
    const lower = value.toLowerCase();
    if (lower === 'true') {
      return true;
    }
    if (lower === 'false') {
      return false;
    }

    // Return as string
    return value;
  }
}

/**
 * Create a new config instance
 *
 * @example
 * ```typescript
 * // Basic config
 * const config = createConfig();
 *
 * // With file loading
 * const config = createConfig({ path: './config/app.json' });
 *
 * // With environment override
 * const config = createConfig({
 *   path: './config',
 *   env: true,
 *   envPrefix: 'APP_'
 * });
 * ```
 */
export function createConfig(options?: ConfigOptions): Config {
  return new Config(options);
}

/**
 * Default config instance
 */
export const config = createConfig();

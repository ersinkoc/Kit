/**
 * Tests for config utility module
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Config, createConfig, config } from '@oxog/kit/core';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Config', () => {
  const testDir = join(tmpdir(), 'kit-config-test');
  const testConfigPath = join(testDir, 'test-config.json');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    // Clean up env vars
    delete process.env.TEST_KEY;
    delete process.env.APP_DB_HOST;
  });

  describe('createConfig', () => {
    it('creates a Config instance', () => {
      const cfg = createConfig();
      expect(cfg).toBeInstanceOf(Config);
    });
  });

  describe('get/set', () => {
    it('sets and gets simple values', () => {
      const cfg = createConfig();
      cfg.set('key', 'value');
      expect(cfg.get('key')).toBe('value');
    });

    it('gets with default value', () => {
      const cfg = createConfig();
      expect(cfg.get('missing', 'default')).toBe('default');
    });

    it('sets and gets nested values', () => {
      const cfg = createConfig();
      cfg.set('db.host', 'localhost');
      cfg.set('db.port', 5432);
      expect(cfg.get('db.host')).toBe('localhost');
      expect(cfg.get('db.port')).toBe(5432);
    });

    it('creates nested structure on set', () => {
      const cfg = createConfig();
      cfg.set('a.b.c.d', 'deep');
      expect(cfg.get('a.b.c.d')).toBe('deep');
    });
  });

  describe('has', () => {
    it('returns true for existing keys', () => {
      const cfg = createConfig();
      cfg.set('exists', true);
      expect(cfg.has('exists')).toBe(true);
    });

    it('returns false for missing keys', () => {
      const cfg = createConfig();
      expect(cfg.has('missing')).toBe(false);
    });

    it('works with nested keys', () => {
      const cfg = createConfig();
      cfg.set('nested.key', 'value');
      expect(cfg.has('nested.key')).toBe(true);
      expect(cfg.has('nested.missing')).toBe(false);
    });
  });

  describe('require', () => {
    it('returns value for existing keys', () => {
      const cfg = createConfig();
      cfg.set('required', 'value');
      expect(cfg.require('required')).toBe('value');
    });

    it('throws for missing keys', () => {
      const cfg = createConfig();
      expect(() => cfg.require('missing')).toThrow('Missing required config');
    });
  });

  describe('merge', () => {
    it('merges object into config', () => {
      const cfg = createConfig();
      cfg.set('a', 1);
      cfg.merge({ b: 2, c: 3 });
      expect(cfg.get('a')).toBe(1);
      expect(cfg.get('b')).toBe(2);
      expect(cfg.get('c')).toBe(3);
    });

    it('deep merges nested objects', () => {
      const cfg = createConfig();
      cfg.merge({ db: { host: 'localhost', port: 5432 } });
      cfg.merge({ db: { name: 'mydb' } });
      expect(cfg.get('db.host')).toBe('localhost');
      expect(cfg.get('db.name')).toBe('mydb');
    });
  });

  describe('load', () => {
    it('loads JSON config file', () => {
      writeFileSync(testConfigPath, JSON.stringify({ key: 'value', nested: { a: 1 } }));
      const cfg = createConfig();
      cfg.load(testConfigPath);
      expect(cfg.get('key')).toBe('value');
      expect(cfg.get('nested.a')).toBe(1);
    });

    it('throws for missing file', () => {
      const cfg = createConfig();
      expect(() => cfg.load('/nonexistent/path.json')).toThrow('Config file not found');
    });

    it('throws for invalid JSON', () => {
      writeFileSync(testConfigPath, 'invalid json');
      const cfg = createConfig();
      expect(() => cfg.load(testConfigPath)).toThrow('Invalid JSON');
    });

    it('adds .json extension if missing', () => {
      const pathWithoutExt = testConfigPath.replace('.json', '');
      writeFileSync(testConfigPath, JSON.stringify({ key: 'value' }));
      const cfg = createConfig();
      cfg.load(pathWithoutExt);
      expect(cfg.get('key')).toBe('value');
    });
  });

  describe('all/clear', () => {
    it('all returns entire config', () => {
      const cfg = createConfig();
      cfg.set('a', 1);
      cfg.set('b', 2);
      expect(cfg.all()).toEqual({ a: 1, b: 2 });
    });

    it('clear removes all config', () => {
      const cfg = createConfig();
      cfg.set('a', 1);
      cfg.clear();
      expect(cfg.all()).toEqual({});
    });
  });

  describe('delete', () => {
    it('deletes a key', () => {
      const cfg = createConfig();
      cfg.set('a', 1);
      cfg.set('b', 2);
      cfg.delete('a');
      expect(cfg.has('a')).toBe(false);
      expect(cfg.has('b')).toBe(true);
    });

    it('deletes nested keys', () => {
      const cfg = createConfig();
      cfg.set('nested.a', 1);
      cfg.set('nested.b', 2);
      cfg.delete('nested.a');
      expect(cfg.has('nested.a')).toBe(false);
      expect(cfg.has('nested.b')).toBe(true);
    });
  });

  describe('environment override', () => {
    it('reads from environment variable', () => {
      process.env.TEST_KEY = 'env_value';
      const cfg = createConfig({ env: true });
      expect(cfg.get('test.key')).toBe('env_value');
    });

    it('env takes precedence over config', () => {
      process.env.TEST_KEY = 'env_value';
      const cfg = createConfig({ env: true });
      cfg.set('test.key', 'config_value');
      expect(cfg.get('test.key')).toBe('env_value');
    });

    it('uses env prefix', () => {
      process.env.APP_DB_HOST = 'env_host';
      const cfg = createConfig({ env: true, envPrefix: 'APP_' });
      expect(cfg.get('db.host')).toBe('env_host');
    });

    it('parses numeric env values', () => {
      process.env.TEST_KEY = '3000';
      const cfg = createConfig({ env: true });
      expect(cfg.get('test.key')).toBe(3000);
    });

    it('parses boolean env values', () => {
      process.env.TEST_KEY = 'true';
      const cfg = createConfig({ env: true });
      expect(cfg.get('test.key')).toBe(true);
    });

    it('has checks env vars', () => {
      process.env.TEST_KEY = 'value';
      const cfg = createConfig({ env: true });
      expect(cfg.has('test.key')).toBe(true);
    });
  });

  describe('default instance', () => {
    it('config is a Config instance', () => {
      expect(config).toBeInstanceOf(Config);
    });
  });
});

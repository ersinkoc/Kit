/**
 * Tests for env utility module
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Env, createEnv, env } from '@oxog/kit/core';

describe('Env', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createEnv', () => {
    it('creates an Env instance', () => {
      const e = createEnv();
      expect(e).toBeInstanceOf(Env);
    });
  });

  describe('get', () => {
    it('gets environment variable', () => {
      process.env.TEST_VAR = 'test_value';
      const e = createEnv();
      expect(e.get('TEST_VAR')).toBe('test_value');
    });

    it('returns default for missing var', () => {
      const e = createEnv();
      expect(e.get('MISSING_VAR', 'default')).toBe('default');
    });

    it('returns undefined if no default', () => {
      const e = createEnv();
      expect(e.get('MISSING_VAR')).toBe(undefined);
    });
  });

  describe('require', () => {
    it('returns value for existing var', () => {
      process.env.REQUIRED_VAR = 'value';
      const e = createEnv();
      expect(e.require('REQUIRED_VAR')).toBe('value');
    });

    it('throws for missing var', () => {
      const e = createEnv();
      expect(() => e.require('MISSING_VAR')).toThrow('Missing required environment variable');
    });
  });

  describe('string', () => {
    it('gets string value', () => {
      process.env.STRING_VAR = 'hello';
      const e = createEnv();
      expect(e.string('STRING_VAR')).toBe('hello');
    });

    it('returns default for missing', () => {
      const e = createEnv();
      expect(e.string('MISSING', 'default')).toBe('default');
    });
  });

  describe('number', () => {
    it('parses integer', () => {
      process.env.NUM_VAR = '42';
      const e = createEnv();
      expect(e.number('NUM_VAR')).toBe(42);
    });

    it('parses float', () => {
      process.env.NUM_VAR = '3.14';
      const e = createEnv();
      expect(e.number('NUM_VAR')).toBe(3.14);
    });

    it('returns default for missing', () => {
      const e = createEnv();
      expect(e.number('MISSING', 100)).toBe(100);
    });

    it('throws for invalid number', () => {
      process.env.NUM_VAR = 'not-a-number';
      const e = createEnv();
      expect(() => e.number('NUM_VAR')).toThrow('Invalid number');
    });
  });

  describe('boolean', () => {
    it('parses true values', () => {
      const e = createEnv();
      process.env.BOOL_VAR = 'true';
      expect(e.boolean('BOOL_VAR')).toBe(true);
      process.env.BOOL_VAR = '1';
      expect(e.boolean('BOOL_VAR')).toBe(true);
      process.env.BOOL_VAR = 'yes';
      expect(e.boolean('BOOL_VAR')).toBe(true);
    });

    it('parses false values', () => {
      const e = createEnv();
      process.env.BOOL_VAR = 'false';
      expect(e.boolean('BOOL_VAR')).toBe(false);
      process.env.BOOL_VAR = '0';
      expect(e.boolean('BOOL_VAR')).toBe(false);
      process.env.BOOL_VAR = 'no';
      expect(e.boolean('BOOL_VAR')).toBe(false);
    });

    it('returns default for missing', () => {
      const e = createEnv();
      expect(e.boolean('MISSING', true)).toBe(true);
    });

    it('throws for invalid boolean', () => {
      process.env.BOOL_VAR = 'maybe';
      const e = createEnv();
      expect(() => e.boolean('BOOL_VAR')).toThrow('Invalid boolean');
    });
  });

  describe('array', () => {
    it('splits by comma by default', () => {
      process.env.ARRAY_VAR = 'a,b,c';
      const e = createEnv();
      expect(e.array('ARRAY_VAR')).toEqual(['a', 'b', 'c']);
    });

    it('uses custom separator', () => {
      process.env.ARRAY_VAR = 'a|b|c';
      const e = createEnv();
      expect(e.array('ARRAY_VAR', '|')).toEqual(['a', 'b', 'c']);
    });

    it('trims whitespace', () => {
      process.env.ARRAY_VAR = 'a, b, c';
      const e = createEnv();
      expect(e.array('ARRAY_VAR')).toEqual(['a', 'b', 'c']);
    });

    it('filters empty values', () => {
      process.env.ARRAY_VAR = 'a,,b,';
      const e = createEnv();
      expect(e.array('ARRAY_VAR')).toEqual(['a', 'b']);
    });

    it('returns default for missing', () => {
      const e = createEnv();
      expect(e.array('MISSING', ',', ['default'])).toEqual(['default']);
    });
  });

  describe('json', () => {
    it('parses JSON object', () => {
      process.env.JSON_VAR = '{"key":"value"}';
      const e = createEnv();
      expect(e.json('JSON_VAR')).toEqual({ key: 'value' });
    });

    it('parses JSON array', () => {
      process.env.JSON_VAR = '[1,2,3]';
      const e = createEnv();
      expect(e.json('JSON_VAR')).toEqual([1, 2, 3]);
    });

    it('returns default for missing', () => {
      const e = createEnv();
      expect(e.json('MISSING', { def: true })).toEqual({ def: true });
    });

    it('throws for invalid JSON', () => {
      process.env.JSON_VAR = 'invalid';
      const e = createEnv();
      expect(() => e.json('JSON_VAR')).toThrow('Invalid JSON');
    });
  });

  describe('url', () => {
    it('parses valid URL', () => {
      process.env.URL_VAR = 'https://example.com/path';
      const e = createEnv();
      const url = e.url('URL_VAR');
      expect(url).toBeInstanceOf(URL);
      expect(url?.hostname).toBe('example.com');
    });

    it('returns default URL for missing', () => {
      const e = createEnv();
      const url = e.url('MISSING', 'https://default.com');
      expect(url?.hostname).toBe('default.com');
    });

    it('throws for invalid URL', () => {
      process.env.URL_VAR = 'not-a-url';
      const e = createEnv();
      expect(() => e.url('URL_VAR')).toThrow('Invalid URL');
    });
  });

  describe('port', () => {
    it('parses valid port', () => {
      process.env.PORT = '8080';
      const e = createEnv();
      expect(e.port('PORT')).toBe(8080);
    });

    it('returns default for missing', () => {
      const e = createEnv();
      expect(e.port('MISSING', 3000)).toBe(3000);
    });

    it('throws for invalid port (too low)', () => {
      process.env.PORT = '0';
      const e = createEnv();
      expect(() => e.port('PORT')).toThrow('Invalid port');
    });

    it('throws for invalid port (too high)', () => {
      process.env.PORT = '70000';
      const e = createEnv();
      expect(() => e.port('PORT')).toThrow('Invalid port');
    });
  });

  describe('environment checks', () => {
    it('isDev checks development', () => {
      const e = createEnv();
      process.env.NODE_ENV = 'development';
      expect(e.isDev()).toBe(true);
      process.env.NODE_ENV = 'production';
      expect(e.isDev()).toBe(false);
    });

    it('isProd checks production', () => {
      const e = createEnv();
      process.env.NODE_ENV = 'production';
      expect(e.isProd()).toBe(true);
      process.env.NODE_ENV = 'development';
      expect(e.isProd()).toBe(false);
    });

    it('isTest checks test', () => {
      const e = createEnv();
      process.env.NODE_ENV = 'test';
      expect(e.isTest()).toBe(true);
      process.env.NODE_ENV = 'production';
      expect(e.isTest()).toBe(false);
    });

    it('nodeEnv returns NODE_ENV', () => {
      const e = createEnv();
      process.env.NODE_ENV = 'staging';
      expect(e.nodeEnv()).toBe('staging');
    });

    it('nodeEnv defaults to development', () => {
      const e = createEnv();
      delete process.env.NODE_ENV;
      expect(e.nodeEnv()).toBe('development');
    });
  });

  describe('parseDotenv', () => {
    it('parses KEY=VALUE', () => {
      const e = createEnv();
      e.parseDotenv('MY_KEY=my_value');
      expect(process.env.MY_KEY).toBe('my_value');
    });

    it('parses quoted values', () => {
      const e = createEnv();
      e.parseDotenv('QUOTED="quoted value"');
      expect(process.env.QUOTED).toBe('quoted value');
    });

    it('parses single-quoted values', () => {
      const e = createEnv();
      e.parseDotenv("SINGLE='single value'");
      expect(process.env.SINGLE).toBe('single value');
    });

    it('skips comments', () => {
      const e = createEnv();
      e.parseDotenv('# This is a comment\nKEY=value');
      expect(process.env.KEY).toBe('value');
    });

    it('skips empty lines', () => {
      const e = createEnv();
      e.parseDotenv('\n\nKEY=value\n\n');
      expect(process.env.KEY).toBe('value');
    });

    it('handles inline comments', () => {
      const e = createEnv();
      e.parseDotenv('KEY=value # comment');
      expect(process.env.KEY).toBe('value');
    });
  });

  describe('all', () => {
    it('returns all environment variables', () => {
      const e = createEnv();
      const all = e.all();
      expect(typeof all).toBe('object');
      expect(all.PATH || all.path).toBeDefined(); // PATH or path depending on OS
    });
  });

  describe('default instance', () => {
    it('env is an Env instance', () => {
      expect(env).toBeInstanceOf(Env);
    });
  });
});

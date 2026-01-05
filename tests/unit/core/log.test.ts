/**
 * Tests for log utility module
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, createLogger, log } from '@oxog/kit/core';

describe('Logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('createLogger', () => {
    it('creates a Logger instance', () => {
      const logger = createLogger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('creates with default options', () => {
      const logger = createLogger();
      expect(logger.getLevel()).toBe('info');
    });

    it('creates with custom options', () => {
      const logger = createLogger({ level: 'debug', pretty: true });
      expect(logger.getLevel()).toBe('debug');
    });
  });

  describe('log methods', () => {
    it('logs debug messages', () => {
      const logger = createLogger({ level: 'debug' });
      logger.debug('test debug');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('logs info messages', () => {
      const logger = createLogger({ level: 'info' });
      logger.info('test info');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('logs warn messages', () => {
      const logger = createLogger({ level: 'warn' });
      logger.warn('test warn');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('logs error messages to stderr', () => {
      const logger = createLogger({ level: 'error' });
      logger.error('test error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('logs fatal messages to stderr', () => {
      const logger = createLogger({ level: 'debug' });
      logger.fatal('test fatal');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('logs with metadata', () => {
      const logger = createLogger({ level: 'info' });
      logger.info('test', { key: 'value' });
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];
      expect(output).toContain('key');
    });
  });

  describe('log levels', () => {
    it('filters logs below level', () => {
      const logger = createLogger({ level: 'warn' });
      logger.debug('should not appear');
      logger.info('should not appear');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('allows logs at or above level', () => {
      const logger = createLogger({ level: 'info' });
      logger.info('should appear');
      logger.warn('should appear');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('setLevel changes level', () => {
      const logger = createLogger({ level: 'info' });
      logger.setLevel('debug');
      expect(logger.getLevel()).toBe('debug');
    });

    it('setLevel throws for invalid level', () => {
      const logger = createLogger();
      expect(() => logger.setLevel('invalid' as any)).toThrow('Invalid log level');
    });
  });

  describe('silent/loud', () => {
    it('silent disables all output', () => {
      const logger = createLogger({ level: 'debug' });
      logger.silent();
      logger.debug('test');
      logger.info('test');
      logger.error('test');
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('loud enables output after silent', () => {
      const logger = createLogger({ level: 'info' });
      logger.silent();
      logger.info('silent');
      logger.loud();
      logger.info('loud');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('child logger', () => {
    it('creates child with merged context', () => {
      const logger = createLogger({ level: 'info' });
      const child = logger.child({ requestId: '123' });
      child.info('test');
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];
      expect(output).toContain('requestId');
    });

    it('child inherits level', () => {
      const logger = createLogger({ level: 'debug' });
      const child = logger.child({ service: 'api' });
      expect(child.getLevel()).toBe('debug');
    });
  });

  describe('formatting', () => {
    it('formats as JSON by default', () => {
      const logger = createLogger({ level: 'info' });
      logger.info('test message');
      const output = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
    });

    it('formats pretty when enabled', () => {
      const logger = createLogger({ level: 'info', pretty: true });
      logger.info('test message');
      const output = consoleSpy.mock.calls[0][0];
      expect(output).toContain('INFO');
      expect(output).toContain('test message');
    });

    it('includes timestamp by default', () => {
      const logger = createLogger({ level: 'info' });
      logger.info('test');
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.timestamp).toBeDefined();
    });

    it('excludes timestamp when disabled', () => {
      const logger = createLogger({ level: 'info', timestamp: false });
      logger.info('test');
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.timestamp).toBeUndefined();
    });

    it('uses custom formatter', () => {
      const formatter = vi.fn().mockReturnValue('custom output');
      const logger = createLogger({ level: 'info', formatter });
      logger.info('test');
      expect(formatter).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('custom output');
    });
  });

  describe('default instance', () => {
    it('log is a Logger instance', () => {
      expect(log).toBeInstanceOf(Logger);
    });
  });
});

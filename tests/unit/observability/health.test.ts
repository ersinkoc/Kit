import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HealthChecker, createHealthChecker, healthChecker } from '../../../src/observability/health';

describe('HealthChecker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createHealthChecker', () => {
    it('should create a health checker', () => {
      const checker = createHealthChecker();
      expect(checker).toBeInstanceOf(HealthChecker);
    });

    it('should accept options', () => {
      const checker = createHealthChecker({ timeout: 10000, cacheTTL: 5000 });
      expect(checker).toBeInstanceOf(HealthChecker);
    });
  });

  describe('register', () => {
    it('should register a health check with string name', () => {
      const checker = createHealthChecker();
      checker.register('database', () => true);
      expect(checker.has('database')).toBe(true);
    });

    it('should register a health check with options', () => {
      const checker = createHealthChecker();
      checker.register({ name: 'database', timeout: 3000, critical: false }, () => true);
      expect(checker.has('database')).toBe(true);
    });

    it('should unregister a health check', () => {
      const checker = createHealthChecker();
      checker.register('database', () => true);
      checker.unregister('database');
      expect(checker.has('database')).toBe(false);
    });
  });

  describe('check', () => {
    it('should return healthy status when all checks pass', async () => {
      const checker = createHealthChecker();
      checker.register('database', () => true);
      checker.register('redis', () => Promise.resolve(true));

      const report = await checker.check();

      expect(report.status).toBe('healthy');
      expect(report.checks).toHaveLength(2);
      expect(report.checks.every(c => c.status === 'healthy')).toBe(true);
    });

    it('should return unhealthy status when critical check fails', async () => {
      const checker = createHealthChecker();
      checker.register({ name: 'database', critical: true }, () => false);

      const report = await checker.check();

      expect(report.status).toBe('unhealthy');
    });

    it('should return degraded status when non-critical check fails', async () => {
      const checker = createHealthChecker();
      checker.register({ name: 'database', critical: true }, () => true);
      checker.register({ name: 'cache', critical: false }, () => false);

      const report = await checker.check();

      expect(report.status).toBe('degraded');
    });

    it('should handle check returning HealthStatus', async () => {
      const checker = createHealthChecker();
      checker.register('database', () => 'healthy');
      checker.register('cache', () => 'degraded');

      const report = await checker.check();

      expect(report.checks.find(c => c.name === 'database')?.status).toBe('healthy');
      expect(report.checks.find(c => c.name === 'cache')?.status).toBe('degraded');
    });

    it('should handle check returning HealthCheckResult', async () => {
      const checker = createHealthChecker();
      checker.register('database', () => ({
        name: 'database',
        status: 'healthy' as const,
        message: 'Connected',
        timestamp: Date.now(),
        details: { version: '5.7' },
      }));

      const report = await checker.check();

      const dbCheck = report.checks.find(c => c.name === 'database');
      expect(dbCheck?.status).toBe('healthy');
      expect(dbCheck?.message).toBe('Connected');
      expect(dbCheck?.details?.version).toBe('5.7');
    });

    it('should handle check throwing error', async () => {
      const checker = createHealthChecker();
      checker.register('database', () => { throw new Error('Connection refused'); });

      const report = await checker.check();

      expect(report.status).toBe('unhealthy');
      expect(report.checks[0].message).toContain('Connection refused');
    });

    it('should handle check timeout', async () => {
      const checker = createHealthChecker({ timeout: 100 });
      checker.register('slow', async () => {
        await new Promise(r => setTimeout(r, 500));
        return true;
      });

      const promise = checker.check();
      await vi.runAllTimersAsync();
      const report = await promise;

      expect(report.status).toBe('unhealthy');
      expect(report.checks[0].message).toContain('timed out');
    });

    it('should include duration in results', async () => {
      const checker = createHealthChecker();
      checker.register('database', () => true);

      const report = await checker.check();

      expect(report.duration).toBeGreaterThanOrEqual(0);
      expect(report.checks[0].duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkOne', () => {
    it('should run a single health check', async () => {
      const checker = createHealthChecker();
      checker.register('database', () => true);
      checker.register('redis', () => false);

      const result = await checker.checkOne('database');

      expect(result.status).toBe('healthy');
    });

    it('should throw if check not found', async () => {
      const checker = createHealthChecker();

      await expect(checker.checkOne('unknown')).rejects.toThrow('Health check not found');
    });
  });

  describe('caching', () => {
    it('should cache results when cacheTTL is set', async () => {
      const checker = createHealthChecker({ cacheTTL: 1000 });
      const fn = vi.fn().mockReturnValue(true);
      checker.register('database', fn);

      await checker.check();
      await checker.check();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache after TTL expires', async () => {
      const checker = createHealthChecker({ cacheTTL: 1000 });
      const fn = vi.fn().mockReturnValue(true);
      checker.register('database', fn);

      await checker.check();
      vi.advanceTimersByTime(1500);
      await checker.check();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('getNames', () => {
    it('should return registered check names', () => {
      const checker = createHealthChecker();
      checker.register('database', () => true);
      checker.register('redis', () => true);

      const names = checker.getNames();

      expect(names).toContain('database');
      expect(names).toContain('redis');
    });
  });

  describe('healthChecker singleton', () => {
    it('should be available', () => {
      expect(healthChecker).toBeDefined();
      expect(healthChecker).toBeInstanceOf(HealthChecker);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { Counter, Gauge, Histogram, createMetrics, metrics } from '../../../src/observability/metrics';

describe('Metrics', () => {
  describe('Counter', () => {
    it('should create a counter', () => {
      const counter = new Counter({ name: 'test_counter', help: 'Test counter' });
      expect(counter.name).toBe('test_counter');
      expect(counter.help).toBe('Test counter');
    });

    it('should increment counter', () => {
      const counter = new Counter({ name: 'test_counter' });
      counter.inc();
      expect(counter.get()).toBe(1);

      counter.inc({}, 5);
      expect(counter.get()).toBe(6);
    });

    it('should support labels', () => {
      const counter = new Counter({ name: 'test_counter', labels: ['method', 'path'] });
      counter.inc({ method: 'GET', path: '/api' });
      counter.inc({ method: 'POST', path: '/api' });

      expect(counter.get({ method: 'GET', path: '/api' })).toBe(1);
      expect(counter.get({ method: 'POST', path: '/api' })).toBe(1);
    });

    it('should throw on negative increment', () => {
      const counter = new Counter({ name: 'test_counter' });
      expect(() => counter.inc({}, -1)).toThrow('Counter can only be incremented');
    });

    it('should reset counter', () => {
      const counter = new Counter({ name: 'test_counter' });
      counter.inc({}, 10);
      counter.reset();
      expect(counter.get()).toBe(0);
    });

    it('should get all values', () => {
      const counter = new Counter({ name: 'test_counter' });
      counter.inc({ method: 'GET' });
      counter.inc({ method: 'POST' });

      const values = counter.getAll();
      expect(values.length).toBe(2);
    });
  });

  describe('Gauge', () => {
    it('should create a gauge', () => {
      const gauge = new Gauge({ name: 'test_gauge', help: 'Test gauge' });
      expect(gauge.name).toBe('test_gauge');
    });

    it('should set gauge value', () => {
      const gauge = new Gauge({ name: 'test_gauge' });
      gauge.set({}, 42);
      expect(gauge.get()).toBe(42);
    });

    it('should increment gauge', () => {
      const gauge = new Gauge({ name: 'test_gauge' });
      gauge.set({}, 10);
      gauge.inc();
      expect(gauge.get()).toBe(11);

      gauge.inc({}, 5);
      expect(gauge.get()).toBe(16);
    });

    it('should decrement gauge', () => {
      const gauge = new Gauge({ name: 'test_gauge' });
      gauge.set({}, 10);
      gauge.dec();
      expect(gauge.get()).toBe(9);

      gauge.dec({}, 5);
      expect(gauge.get()).toBe(4);
    });

    it('should support labels', () => {
      const gauge = new Gauge({ name: 'test_gauge', labels: ['status'] });
      gauge.set({ status: 'active' }, 5);
      gauge.set({ status: 'idle' }, 3);

      expect(gauge.get({ status: 'active' })).toBe(5);
      expect(gauge.get({ status: 'idle' })).toBe(3);
    });

    it('should set to current time', () => {
      const gauge = new Gauge({ name: 'test_gauge' });
      const before = Date.now();
      gauge.setToCurrentTime();
      const after = Date.now();

      const value = gauge.get();
      expect(value).toBeGreaterThanOrEqual(before);
      expect(value).toBeLessThanOrEqual(after);
    });
  });

  describe('Histogram', () => {
    it('should create a histogram', () => {
      const histogram = new Histogram({ name: 'test_histogram', help: 'Test histogram' });
      expect(histogram.name).toBe('test_histogram');
    });

    it('should observe values', () => {
      const histogram = new Histogram({
        name: 'test_histogram',
        buckets: [0.1, 0.5, 1, 5, 10],
      });

      histogram.observe({}, 0.3);
      histogram.observe({}, 0.7);
      histogram.observe({}, 2);

      const value = histogram.get();
      expect(value.count).toBe(3);
      expect(value.sum).toBeCloseTo(3);
    });

    it('should use default buckets', () => {
      const histogram = new Histogram({ name: 'test_histogram' });
      histogram.observe({}, 0.5);

      const value = histogram.get();
      expect(value.count).toBe(1);
    });

    it('should support labels', () => {
      const histogram = new Histogram({
        name: 'test_histogram',
        labels: ['method'],
      });

      histogram.observe({ method: 'GET' }, 0.1);
      histogram.observe({ method: 'POST' }, 0.2);

      expect(histogram.get({ method: 'GET' }).count).toBe(1);
      expect(histogram.get({ method: 'POST' }).count).toBe(1);
    });

    it('should track buckets correctly', () => {
      const histogram = new Histogram({
        name: 'test_histogram',
        buckets: [1, 5, 10],
      });

      histogram.observe({}, 0.5);  // <= 1
      histogram.observe({}, 3);    // <= 5
      histogram.observe({}, 7);    // <= 10
      histogram.observe({}, 15);   // > 10

      const value = histogram.get();
      const buckets = value.buckets;

      expect(buckets.get(1)).toBe(1);
      expect(buckets.get(5)).toBe(2);
      expect(buckets.get(10)).toBe(3);
      expect(buckets.get(Infinity)).toBe(4);
    });

    it('should time functions', async () => {
      const histogram = new Histogram({ name: 'test_histogram' });

      const result = await histogram.time(async () => {
        await new Promise(r => setTimeout(r, 10));
        return 'done';
      });

      expect(result).toBe('done');
      expect(histogram.get().count).toBe(1);
    });
  });

  describe('createMetrics', () => {
    it('should create metrics instance', () => {
      const m = createMetrics();
      expect(m.counter).toBeDefined();
      expect(m.gauge).toBeDefined();
      expect(m.histogram).toBeDefined();
    });
  });

  describe('metrics singleton', () => {
    it('should be available', () => {
      expect(metrics).toBeDefined();
      expect(metrics.counter).toBeDefined();
    });
  });
});

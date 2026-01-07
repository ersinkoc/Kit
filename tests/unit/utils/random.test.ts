/**
 * Tests for random utility module
 */
import { describe, it, expect } from 'vitest';
import { random } from '@oxog/kit/utils';

describe('random utilities', () => {
  describe('float', () => {
    it('generates float between min and max', () => {
      for (let i = 0; i < 100; i++) {
        const result = random.float(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('uses default range 0-1', () => {
      for (let i = 0; i < 100; i++) {
        const result = random.float();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('int', () => {
    it('generates integer between min and max (inclusive)', () => {
      for (let i = 0; i < 100; i++) {
        const result = random.int(1, 10);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it('uses default range 0-1', () => {
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        results.add(random.int());
      }
      // Should eventually hit both 0 and 1
      expect(results.has(0) || results.has(1)).toBe(true);
    });
  });

  describe('element', () => {
    it('returns random element from array', () => {
      const arr = [1, 2, 3, 4, 5];
      for (let i = 0; i < 100; i++) {
        const result = random.element(arr);
        expect(arr).toContain(result);
      }
    });

    it('returns undefined for empty array', () => {
      // The function might return undefined or throw, let's test the behavior
      const arr: number[] = [];
      const result = random.element(arr);
      expect(result).toBe(undefined);
    });
  });

  describe('elements', () => {
    it('returns multiple random elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = random.elements(arr, 3);
      expect(result).toHaveLength(3);
      for (const item of result) {
        expect(arr).toContain(item);
      }
    });

    it('returns all elements if count exceeds length', () => {
      const arr = [1, 2, 3];
      const result = random.elements(arr, 5);
      expect(result).toHaveLength(3);
    });

    it('returns empty for count 0', () => {
      const result = random.elements([1, 2, 3], 0);
      expect(result).toHaveLength(0);
    });
  });

  describe('boolean', () => {
    it('returns true or false', () => {
      const results = new Set<boolean>();
      for (let i = 0; i < 100; i++) {
        results.add(random.boolean());
      }
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });
  });

  describe('string', () => {
    it('generates string of specified length', () => {
      const result = random.string(10);
      expect(result).toHaveLength(10);
    });

    it('uses default charset', () => {
      const result = random.string(100);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('uses custom charset', () => {
      const result = random.string(10, 'abc');
      expect(result).toMatch(/^[abc]+$/);
    });

    it('uses default length', () => {
      const result = random.string();
      expect(result).toHaveLength(10);
    });
  });

  describe('hex', () => {
    it('generates hex string', () => {
      const result = random.hex(10);
      expect(result).toHaveLength(10);
      expect(result).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('base64', () => {
    it('generates base64 string', () => {
      const result = random.base64(10);
      expect(result).toHaveLength(10);
      expect(result).toMatch(/^[A-Za-z0-9+/]+$/);
    });
  });

  describe('alphanumeric', () => {
    it('generates alphanumeric string', () => {
      const result = random.alphanumeric(10);
      expect(result).toHaveLength(10);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('alpha', () => {
    it('generates alphabetic string', () => {
      const result = random.alpha(10);
      expect(result).toHaveLength(10);
      expect(result).toMatch(/^[A-Za-z]+$/);
    });
  });

  describe('numeric', () => {
    it('generates numeric string', () => {
      const result = random.numeric(10);
      expect(result).toHaveLength(10);
      expect(result).toMatch(/^[0-9]+$/);
    });
  });

  describe('keys/values/entries', () => {
    it('keys picks random keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = random.keys(obj, 2);
      expect(result).toHaveLength(2);
      for (const key of result) {
        expect(key in obj).toBe(true);
      }
    });

    it('values picks random values', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = random.values(obj, 2);
      expect(result).toHaveLength(2);
      for (const val of result) {
        expect(Object.values(obj)).toContain(val);
      }
    });

    it('entries picks random entries', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = random.entries(obj, 2);
      expect(result).toHaveLength(2);
      for (const [key, value] of result) {
        expect(obj[key]).toBe(value);
      }
    });
  });

  describe('shuffle', () => {
    it('shuffles array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = random.shuffle(arr);
      expect(shuffled).toHaveLength(5);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not modify original', () => {
      const arr = [1, 2, 3, 4, 5];
      random.shuffle(arr);
      expect(arr).toEqual([1, 2, 3, 4, 5]);
    });

    it('produces different orders', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        results.add(random.shuffle(arr).join(','));
      }
      // Should have at least a few different orders
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('uuid', () => {
    it('generates valid UUID v4 format', () => {
      const result = random.uuid();
      expect(result).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });

    it('generates unique UUIDs', () => {
      const uuids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        uuids.add(random.uuid());
      }
      expect(uuids.size).toBe(100);
    });
  });

  describe('color', () => {
    it('generates hex color', () => {
      const result = random.color();
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe('date', () => {
    it('generates date in range', () => {
      const start = new Date('2020-01-01');
      const end = new Date('2025-12-31');
      for (let i = 0; i < 100; i++) {
        const result = random.date(start, end);
        expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
      }
    });
  });

  describe('ip', () => {
    it('generates valid IP address', () => {
      const result = random.ip();
      const parts = result.split('.');
      expect(parts).toHaveLength(4);
      for (const part of parts) {
        const num = parseInt(part);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('mac', () => {
    it('generates valid MAC address', () => {
      const result = random.mac();
      expect(result).toMatch(/^[0-9a-f]{2}(:[0-9a-f]{2}){5}$/);
    });
  });
});

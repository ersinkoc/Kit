/**
 * Tests for date utility module
 */
import { describe, it, expect } from 'vitest';
import { date } from '@oxog/kit/utils';

describe('date utilities', () => {
  describe('now/create/parse', () => {
    it('now returns current timestamp', () => {
      const before = Date.now();
      const result = date.now();
      const after = Date.now();
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });

    it('create returns Date from timestamp', () => {
      const timestamp = 1704067200000; // 2025-01-01
      const result = date.create(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(timestamp);
    });

    it('create without args returns current date', () => {
      const before = Date.now();
      const result = date.create();
      const after = Date.now();
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });

    it('parse parses date string', () => {
      const result = date.parse('2025-01-01');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
    });
  });

  describe('format', () => {
    it('formats with default pattern', () => {
      const d = new Date(2025, 0, 15, 10, 30, 45);
      const result = date.format(d);
      expect(result).toContain('2025');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    it('formats with custom pattern', () => {
      const d = new Date(2025, 5, 15);
      expect(date.format(d, 'YYYY-MM-DD')).toBe('2025-06-15');
    });

    it('formats with time components', () => {
      const d = new Date(2025, 0, 1, 10, 30, 45, 123);
      expect(date.format(d, 'HH:mm:ss.SSS')).toBe('10:30:45.123');
    });
  });

  describe('add/sub operations', () => {
    it('addDays adds days', () => {
      const d = new Date(2025, 0, 1);
      const result = date.addDays(d, 7);
      expect(result.getDate()).toBe(8);
    });

    it('subDays subtracts days', () => {
      const d = new Date(2025, 0, 8);
      const result = date.subDays(d, 7);
      expect(result.getDate()).toBe(1);
    });

    it('addMonths adds months', () => {
      const d = new Date(2025, 0, 15);
      const result = date.addMonths(d, 2);
      expect(result.getMonth()).toBe(2);
    });

    it('subMonths subtracts months', () => {
      const d = new Date(2025, 2, 15);
      const result = date.subMonths(d, 2);
      expect(result.getMonth()).toBe(0);
    });

    it('addYears adds years', () => {
      const d = new Date(2025, 0, 1);
      const result = date.addYears(d, 1);
      expect(result.getFullYear()).toBe(2026);
    });

    it('subYears subtracts years', () => {
      const d = new Date(2026, 0, 1);
      const result = date.subYears(d, 1);
      expect(result.getFullYear()).toBe(2025);
    });
  });

  describe('start/end of period', () => {
    it('startOfDay returns midnight', () => {
      const d = new Date(2025, 0, 15, 15, 30, 45);
      const result = date.startOfDay(d);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('endOfDay returns end of day', () => {
      const d = new Date(2025, 0, 15, 10, 0, 0);
      const result = date.endOfDay(d);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });

    it('startOfMonth returns first day', () => {
      const d = new Date(2025, 5, 15);
      const result = date.startOfMonth(d);
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(5);
    });

    it('endOfMonth returns last day', () => {
      const d = new Date(2025, 0, 15);
      const result = date.endOfMonth(d);
      expect(result.getDate()).toBe(31);
    });

    it('startOfYear returns Jan 1', () => {
      const d = new Date(2025, 5, 15);
      const result = date.startOfYear(d);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(1);
    });

    it('endOfYear returns Dec 31', () => {
      const d = new Date(2025, 5, 15);
      const result = date.endOfYear(d);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(31);
    });
  });

  describe('diff operations', () => {
    it('diffDays calculates day difference', () => {
      const d1 = new Date(2025, 0, 8);
      const d2 = new Date(2025, 0, 1);
      expect(date.diffDays(d1, d2)).toBe(7);
    });

    it('diffHours calculates hour difference', () => {
      const d1 = new Date(2025, 0, 1, 12, 0);
      const d2 = new Date(2025, 0, 1, 8, 0);
      expect(date.diffHours(d1, d2)).toBe(4);
    });

    it('diffMinutes calculates minute difference', () => {
      const d1 = new Date(2025, 0, 1, 8, 30);
      const d2 = new Date(2025, 0, 1, 8, 0);
      expect(date.diffMinutes(d1, d2)).toBe(30);
    });

    it('diffSeconds calculates second difference', () => {
      const d1 = new Date(2025, 0, 1, 8, 0, 30);
      const d2 = new Date(2025, 0, 1, 8, 0, 0);
      expect(date.diffSeconds(d1, d2)).toBe(30);
    });

    it('diffMs calculates millisecond difference', () => {
      const d1 = new Date(2025, 0, 1, 8, 0, 0, 500);
      const d2 = new Date(2025, 0, 1, 8, 0, 0, 0);
      expect(date.diffMs(d1, d2)).toBe(500);
    });
  });

  describe('date checks', () => {
    it('isToday checks if today', () => {
      expect(date.isToday(new Date())).toBe(true);
      expect(date.isToday(new Date(2020, 0, 1))).toBe(false);
    });

    it('isPast checks if in past', () => {
      expect(date.isPast(new Date(2020, 0, 1))).toBe(true);
      expect(date.isPast(new Date(2050, 0, 1))).toBe(false);
    });

    it('isFuture checks if in future', () => {
      expect(date.isFuture(new Date(2050, 0, 1))).toBe(true);
      expect(date.isFuture(new Date(2020, 0, 1))).toBe(false);
    });

    it('isLeapYear checks leap year', () => {
      expect(date.isLeapYear(2025)).toBe(true);
      expect(date.isLeapYear(2023)).toBe(false);
      expect(date.isLeapYear(2000)).toBe(true);
      expect(date.isLeapYear(1900)).toBe(false);
    });

    it('isValid checks date validity', () => {
      expect(date.isValid(new Date('2025-01-01'))).toBe(true);
      expect(date.isValid(new Date('invalid'))).toBe(false);
    });
  });

  describe('calendar info', () => {
    it('daysInMonth returns days in month', () => {
      expect(date.daysInMonth(2025, 2)).toBe(29); // Feb leap year
      expect(date.daysInMonth(2023, 2)).toBe(28); // Feb non-leap
      expect(date.daysInMonth(2025, 1)).toBe(31); // Jan
    });

    it('dayOfYear returns day number', () => {
      expect(date.dayOfYear(new Date(2025, 0, 1))).toBe(1);
      expect(date.dayOfYear(new Date(2025, 1, 1))).toBe(32);
    });

    it('weekOfYear returns week number', () => {
      expect(date.weekOfYear(new Date(2025, 0, 1))).toBeGreaterThanOrEqual(1);
    });

    it('quarterOfYear returns quarter', () => {
      expect(date.quarterOfYear(new Date(2025, 0, 15))).toBe(1);
      expect(date.quarterOfYear(new Date(2025, 3, 15))).toBe(2);
      expect(date.quarterOfYear(new Date(2025, 6, 15))).toBe(3);
      expect(date.quarterOfYear(new Date(2025, 9, 15))).toBe(4);
    });
  });

  describe('comparison', () => {
    it('compare compares dates', () => {
      const d1 = new Date(2025, 0, 2);
      const d2 = new Date(2025, 0, 1);
      expect(date.compare(d1, d2)).toBe(1);
      expect(date.compare(d2, d1)).toBe(-1);
      expect(date.compare(d1, d1)).toBe(0);
    });

    it('isEqual checks equality', () => {
      const d1 = new Date(2025, 0, 1, 12, 0);
      const d2 = new Date(2025, 0, 1, 12, 0);
      const d3 = new Date(2025, 0, 2, 12, 0);
      expect(date.isEqual(d1, d2)).toBe(true);
      expect(date.isEqual(d1, d3)).toBe(false);
    });

    it('min returns earliest date', () => {
      const d1 = new Date(2025, 0, 2);
      const d2 = new Date(2025, 0, 1);
      const result = date.min(d1, d2);
      expect(result.getTime()).toBe(d2.getTime());
    });

    it('max returns latest date', () => {
      const d1 = new Date(2025, 0, 2);
      const d2 = new Date(2025, 0, 1);
      const result = date.max(d1, d2);
      expect(result.getTime()).toBe(d1.getTime());
    });

    it('clamp clamps date', () => {
      const min = new Date(2025, 0, 1);
      const max = new Date(2025, 11, 31);
      const inside = new Date(2025, 5, 15);
      const before = new Date(2023, 5, 15);
      const after = new Date(2026, 5, 15);

      expect(date.clamp(inside, min, max).getTime()).toBe(inside.getTime());
      expect(date.clamp(before, min, max).getTime()).toBe(min.getTime());
      expect(date.clamp(after, min, max).getTime()).toBe(max.getTime());
    });
  });

  describe('conversions', () => {
    it('toUnix converts to unix timestamp', () => {
      const d = new Date(1704067200000);
      expect(date.toUnix(d)).toBe(1704067200);
    });

    it('fromUnix creates from unix timestamp', () => {
      const result = date.fromUnix(1704067200);
      expect(result.getTime()).toBe(1704067200000);
    });

    it('toISOString formats as ISO', () => {
      const d = new Date(Date.UTC(2025, 0, 1, 12, 0, 0));
      expect(date.toISOString(d)).toBe('2025-01-01T12:00:00.000Z');
    });

    it('toLocaleString formats with locale', () => {
      const d = new Date(2025, 0, 1, 12, 0, 0);
      const result = date.toLocaleString(d, 'en-US');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('relativeTime', () => {
    it('returns just now for recent', () => {
      const now = new Date();
      expect(date.relativeTime(now, now)).toBe('just now');
    });

    it('returns minutes ago', () => {
      const base = new Date();
      const past = new Date(base.getTime() - 5 * 60 * 1000);
      expect(date.relativeTime(past, base)).toBe('5 minutes ago');
    });

    it('returns hours ago', () => {
      const base = new Date();
      const past = new Date(base.getTime() - 3 * 60 * 60 * 1000);
      expect(date.relativeTime(past, base)).toBe('3 hours ago');
    });

    it('returns days ago', () => {
      const base = new Date();
      const past = new Date(base.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(date.relativeTime(past, base)).toBe('5 days ago');
    });
  });

  describe('weekdayName/monthName', () => {
    it('weekdayName returns day name', () => {
      const monday = new Date(2025, 0, 1); // Jan 1 2025 was Monday
      expect(date.weekdayName(monday)).toBe('Monday');
      expect(date.weekdayName(monday, 'short')).toBe('Mon');
    });

    it('monthName returns month name', () => {
      const jan = new Date(2025, 0, 1);
      expect(date.monthName(jan)).toBe('January');
      expect(date.monthName(jan, 'short')).toBe('Jan');
    });
  });

  describe('daysBetween', () => {
    it('returns array of dates between', () => {
      const start = new Date(2025, 0, 1);
      const end = new Date(2025, 0, 3);
      const result = date.daysBetween(start, end);
      expect(result).toHaveLength(3);
    });
  });
});

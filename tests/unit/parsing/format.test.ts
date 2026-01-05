/**
 * Tests for format.ts - Formatting utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatPercent,
  formatCurrency,
  formatSize,
  formatDuration,
  formatDate,
  formatRelativeTime,
  formatTimeAgo,
  formatPhone,
  formatCreditCard,
  formatSSN,
  formatEmail,
  formatURL,
  formatJSON,
  formatQueryString,
  formatTemplate,
  formatList,
  formatOrdinal,
  formatRoman,
  formatWordWrap,
  formatTruncate,
  formatCase,
  formatIndent,
  type NumberFormatOptions,
  type DateFormatOptions,
  type SizeFormatOptions,
  type DurationFormatOptions,
} from '../../../src/parsing/format';

describe('formatNumber', () => {
  it('should format integer with default options', () => {
    const result = formatNumber(1234567);
    expect(result).toBe('1,234,567');
  });

  it('should format negative number', () => {
    const result = formatNumber(-1234567);
    expect(result).toBe('-1,234,567');
  });

  it('should format with decimal places', () => {
    const result = formatNumber(1234.5678, { decimals: 2 });
    expect(result).toBe('1,234.57');
  });

  it('should format with custom thousands separator', () => {
    const result = formatNumber(1234567, { thousandsSeparator: '.' });
    expect(result).toBe('1.234.567');
  });

  it('should format with custom decimal separator', () => {
    const result = formatNumber(1234.56, { decimalSeparator: ',', decimals: 2, thousandsSeparator: '.' });
    expect(result).toBe('1.234,56');
  });

  it('should format with prefix', () => {
    const result = formatNumber(100, { prefix: '$' });
    expect(result).toBe('$100');
  });

  it('should format with suffix', () => {
    const result = formatNumber(100, { suffix: 'kg' });
    expect(result).toBe('100kg');
  });

  it('should format with both prefix and suffix', () => {
    const result = formatNumber(100, { prefix: '$', suffix: '.00' });
    expect(result).toBe('$100.00');
  });

  it('should format with min integer digits', () => {
    const result = formatNumber(5, { minIntegerDigits: 4 });
    expect(result).toBe('0005');
  });

  it('should format zero', () => {
    const result = formatNumber(0);
    expect(result).toBe('0');
  });

  it('should format small number with decimals', () => {
    const result = formatNumber(0.123, { decimals: 3 });
    expect(result).toBe('0.123');
  });

  it('should round correctly', () => {
    const result = formatNumber(2.675, { decimals: 2 });
    expect(result).toBe('2.68');
  });

  it('should handle large numbers', () => {
    const result = formatNumber(999999999999);
    expect(result).toBe('999,999,999,999');
  });

  it('should format without thousands separator', () => {
    const result = formatNumber(1234567, { thousandsSeparator: '' });
    expect(result).toBe('1234567');
  });
});

describe('formatPercent', () => {
  it('should format as percentage with multiply', () => {
    const result = formatPercent(0.1234, { decimals: 2 });
    expect(result).toBe('12.34%');
  });

  it('should format with custom decimals', () => {
    const result = formatPercent(0.123456, { decimals: 4 });
    expect(result).toBe('12.3456%');
  });

  it('should format without multiply', () => {
    const result = formatPercent(50, { multiply: false });
    expect(result).toBe('50%');
  });

  it('should format negative percentage', () => {
    const result = formatPercent(-0.25);
    expect(result).toBe('-25%');
  });

  it('should format zero', () => {
    const result = formatPercent(0);
    expect(result).toBe('0%');
  });

  it('should format 100%', () => {
    const result = formatPercent(1);
    expect(result).toBe('100%');
  });

  it('should handle values greater than 1', () => {
    const result = formatPercent(1.5);
    expect(result).toBe('150%');
  });
});

describe('formatCurrency', () => {
  it('should format as USD with default options', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('should format negative amount', () => {
    const result = formatCurrency(-100);
    expect(result).toBe('$-100.00');
  });

  it('should format with custom currency symbol', () => {
    const result = formatCurrency(100, { currency: '€' });
    expect(result).toBe('€100.00');
  });

  it('should format with symbol after', () => {
    const result = formatCurrency(100, { symbolPosition: 'after' });
    expect(result).toBe('100.00 $');
  });

  it('should format with custom decimals', () => {
    const result = formatCurrency(100, { decimals: 0 });
    expect(result).toBe('$100');
  });

  it('should format zero', () => {
    const result = formatCurrency(0);
    expect(result).toBe('$0.00');
  });

  it('should format large amounts', () => {
    const result = formatCurrency(1000000);
    expect(result).toBe('$1,000,000.00');
  });

  it('should format with GBP', () => {
    const result = formatCurrency(100, { currency: '£' });
    expect(result).toBe('£100.00');
  });
});

describe('formatSize', () => {
  it('should auto format bytes', () => {
    const result = formatSize(500);
    expect(result).toBe('500.00 B');
  });

  it('should auto format kilobytes', () => {
    const result = formatSize(2048);
    expect(result).toBe('2.00 KB');
  });

  it('should auto format megabytes', () => {
    const result = formatSize(1048576 * 5);
    expect(result).toBe('5.00 MB');
  });

  it('should auto format gigabytes', () => {
    const result = formatSize(1073741824 * 2);
    expect(result).toBe('2.00 GB');
  });

  it('should auto format terabytes', () => {
    const result = formatSize(1099511627776);
    expect(result).toBe('1.00 TB');
  });

  it('should auto format petabytes', () => {
    const result = formatSize(1125899906842624);
    expect(result).toBe('1.00 PB');
  });

  it('should format with specific unit', () => {
    const result = formatSize(1048576, { unit: 'MB' });
    expect(result).toBe('1.00 MB');
  });

  it('should format with custom decimals', () => {
    const result = formatSize(1536, { decimals: 3 });
    expect(result).toBe('1.500 KB');
  });

  it('should use decimal units (1000)', () => {
    const result = formatSize(1500, { binary: false });
    expect(result).toBe('1.50 KB');
  });

  it('should format zero', () => {
    const result = formatSize(0);
    expect(result).toBe('0.00 B');
  });

  it('should handle exact boundaries', () => {
    const result = formatSize(1024);
    expect(result).toBe('1.00 KB');
  });

  it('should format without decimals when specified', () => {
    const result = formatSize(1024, { decimals: 0 });
    expect(result).toBe('1 KB');
  });
});

describe('formatDuration', () => {
  it('should auto format milliseconds', () => {
    const result = formatDuration(500);
    expect(result).toBe('500ms');
  });

  it('should auto format seconds', () => {
    const result = formatDuration(5000);
    expect(result).toBe('5s');
  });

  it('should auto format minutes', () => {
    const result = formatDuration(120000);
    expect(result).toBe('2m');
  });

  it('should auto format hours', () => {
    const result = formatDuration(7200000);
    expect(result).toBe('2h');
  });

  it('should auto format days', () => {
    const result = formatDuration(172800000);
    expect(result).toBe('2d');
  });

  it('should format with specific unit', () => {
    const result = formatDuration(120000, { unit: 's' });
    expect(result).toBe('120s');
  });

  it('should format with decimals', () => {
    const result = formatDuration(1500, { decimals: 1 });
    expect(result).toBe('1.5s');
  });

  it('should format zero', () => {
    const result = formatDuration(0);
    expect(result).toBe('0ms');
  });

  it('should handle very short durations', () => {
    const result = formatDuration(1);
    expect(result).toBe('1ms');
  });

  it('should handle very long durations', () => {
    const result = formatDuration(86400000 * 7);
    expect(result).toBe('7d');
  });
});

describe('formatDate', () => {
  const testDate = new Date('2024-01-15T10:30:00Z');

  it('should format as ISO string', () => {
    const result = formatDate(testDate, { format: 'ISO' });
    expect(result).toBe('2024-01-15T10:30:00.000Z');
  });

  it('should format as locale string', () => {
    const result = formatDate(testDate, { format: 'locale' });
    expect(result).toContain('2024');
  });

  it('should format as date only', () => {
    const result = formatDate(testDate, { format: 'date' });
    expect(result).toBeDefined();
  });

  it('should format as time only', () => {
    const result = formatDate(testDate, { format: 'time' });
    expect(result).toBeDefined();
  });

  it('should format as YYYY-MM-DD', () => {
    const result = formatDate(testDate, { format: 'YYYY-MM-DD' });
    expect(result).toBe('2024-01-15');
  });

  it('should format as MM/DD/YYYY', () => {
    const result = formatDate(testDate, { format: 'MM/DD/YYYY' });
    expect(result).toBe('01/15/2024');
  });

  it('should format as DD.MM.YYYY', () => {
    const result = formatDate(testDate, { format: 'DD.MM.YYYY' });
    expect(result).toBe('15.01.2024');
  });

  it('should format as HH:mm:ss', () => {
    const result = formatDate(testDate, { format: 'HH:mm:ss' });
    expect(result).toBe('10:30:00');
  });

  it('should format as relative time', () => {
    const pastDate = new Date(Date.now() - 3600000);
    const result = formatDate(pastDate, { format: 'relative' });
    expect(result).toContain('ago');
  });

  it('should use custom template', () => {
    const result = formatDate(testDate, { format: 'YYYY-MM-DD HH:mm' });
    expect(result).toBe('2024-01-15 10:30');
  });

  it('should handle string date input', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBeDefined();
  });

  it('should handle timestamp input', () => {
    const result = formatDate(1705306200000);
    expect(result).toBeDefined();
  });
});

describe('formatRelativeTime', () => {
  it('should format seconds ago', () => {
    const past = new Date(Date.now() - 30000);
    const result = formatRelativeTime(past);
    expect(result).toBe('30 seconds ago');
  });

  it('should format minutes ago', () => {
    const past = new Date(Date.now() - 180000);
    const result = formatRelativeTime(past);
    expect(result).toBe('3 minutes ago');
  });

  it('should format hours ago', () => {
    const past = new Date(Date.now() - 7200000);
    const result = formatRelativeTime(past);
    expect(result).toBe('2 hours ago');
  });

  it('should format days ago', () => {
    const past = new Date(Date.now() - 172800000);
    const result = formatRelativeTime(past);
    expect(result).toBe('2 days ago');
  });

  it('should format weeks ago', () => {
    const past = new Date(Date.now() - 1209600000);
    const result = formatRelativeTime(past);
    expect(result).toBe('2 weeks ago');
  });

  it('should format months ago', () => {
    const past = new Date(Date.now() - 5184000000);
    const result = formatRelativeTime(past);
    expect(result).toBe('2 months ago');
  });

  it('should format years ago', () => {
    const past = new Date(Date.now() - 63072000000);
    const result = formatRelativeTime(past);
    expect(result).toBe('2 years ago');
  });

  it('should format future time', () => {
    const future = new Date(Date.now() + 3600000);
    const result = formatRelativeTime(future);
    expect(result).toBe('1 hour from now');
  });

  it('should format just now', () => {
    const now = new Date();
    const result = formatRelativeTime(now);
    expect(result).toBe('just now');
  });

  it('should handle singular units', () => {
    const past = new Date(Date.now() - 1000);
    const result = formatRelativeTime(past);
    expect(result).toBe('1 second ago');
  });

  it('should handle string input', () => {
    const result = formatRelativeTime('2024-01-01');
    expect(result).toBeDefined();
  });
});

describe('formatTimeAgo', () => {
  it('should be alias for formatRelativeTime', () => {
    const past = new Date(Date.now() - 3600000);
    const result1 = formatTimeAgo(past);
    const result2 = formatRelativeTime(past);
    expect(result1).toBe(result2);
  });
});

describe('formatPhone', () => {
  it('should format US phone number', () => {
    const result = formatPhone('1234567890', 'US');
    expect(result).toBe('(123) 456-7890');
  });

  it('should format US phone with leading 1', () => {
    const result = formatPhone('11234567890', 'US');
    expect(result).toBe('+1 (123) 456-7890');
  });

  it('should format to E.164', () => {
    const result = formatPhone('1234567890', 'E.164');
    expect(result).toBe('+11234567890');
  });

  it('should format to international', () => {
    const result = formatPhone('11234567890', 'international');
    expect(result).toBe('+1 123 456 7890');
  });

  it('should handle already formatted number', () => {
    const result = formatPhone('(123) 456-7890', 'US');
    expect(result).toBe('(123) 456-7890');
  });

  it('should handle invalid input', () => {
    const result = formatPhone('123', 'US');
    expect(result).toBe('123');
  });
});

describe('formatCreditCard', () => {
  it('should format Visa card', () => {
    const result = formatCreditCard('4111111111111111');
    expect(result).toBe('4111 1111 1111 1111');
  });

  it('should format MasterCard', () => {
    const result = formatCreditCard('5500000000000004');
    expect(result).toBe('5500 0000 0000 0004');
  });

  it('should format Amex', () => {
    const result = formatCreditCard('340000000000009');
    expect(result).toBe('3400 0000 0000 009');
  });

  it('should handle cards with spaces', () => {
    const result = formatCreditCard('4111 1111 1111 1111');
    expect(result).toBe('4111 1111 1111 1111');
  });

  it('should handle cards with dashes', () => {
    const result = formatCreditCard('4111-1111-1111-1111');
    expect(result).toBe('4111 1111 1111 1111');
  });
});

describe('formatSSN', () => {
  it('should format SSN', () => {
    const result = formatSSN('123456789');
    expect(result).toBe('123-45-6789');
  });

  it('should handle already formatted SSN', () => {
    const result = formatSSN('123-45-6789');
    expect(result).toBe('123-45-6789');
  });

  it('should handle invalid SSN', () => {
    const result = formatSSN('123456');
    expect(result).toBe('123456');
  });
});

describe('formatEmail', () => {
  it('should not mask by default', () => {
    const result = formatEmail('user@example.com');
    expect(result).toBe('user@example.com');
  });

  it('should mask email', () => {
    const result = formatEmail('user@example.com', { mask: true });
    expect(result).toBe('us**@example.com');
  });

  it('should use custom mask character', () => {
    const result = formatEmail('user@example.com', { mask: true, maskChar: '?' });
    expect(result).toBe('us??@example.com');
  });

  it('should show custom characters at start', () => {
    const result = formatEmail('user@example.com', { mask: true, showStart: 1 });
    expect(result).toBe('u***@example.com');
  });

  it('should show custom characters at end', () => {
    const result = formatEmail('user@example.com', { mask: true, showStart: 0, showEnd: 2 });
    expect(result).toBe('***er@example.com');
  });

  it('should handle short email', () => {
    const result = formatEmail('ab@example.com', { mask: true });
    expect(result).toBe('**@example.com');
  });
});

describe('formatURL', () => {
  it('should not modify by default', () => {
    const result = formatURL('https://www.example.com/path/');
    expect(result).toBe('https://www.example.com/path/');
  });

  it('should remove protocol', () => {
    const result = formatURL('https://example.com', { removeProtocol: true });
    expect(result).toBe('example.com');
  });

  it('should remove www', () => {
    const result = formatURL('https://www.example.com', { removeWWW: true });
    expect(result).toBe('https://example.com');
  });

  it('should remove trailing slash', () => {
    const result = formatURL('https://example.com/', { removeTrailingSlash: true });
    expect(result).toBe('https://example.com');
  });

  it('should apply all options', () => {
    const result = formatURL('https://www.example.com/path/', {
      removeProtocol: true,
      removeWWW: true,
      removeTrailingSlash: true,
    });
    expect(result).toBe('example.com/path');
  });

  it('should handle HTTP URLs', () => {
    const result = formatURL('http://example.com', { removeProtocol: true });
    expect(result).toBe('example.com');
  });
});

describe('formatJSON', () => {
  it('should format JSON with default indentation', () => {
    const result = formatJSON({ key: 'value', number: 123 });
    expect(result).toContain('\n');
    expect(result).toContain('  ');
  });

  it('should format with custom spaces', () => {
    const result = formatJSON({ key: 'value' }, { indent: 4 });
    expect(result).toContain('    ');
  });

  it('should format with tabs', () => {
    const result = formatJSON({ key: 'value' }, { indent: '\t' });
    expect(result).toContain('\t');
  });

  it('should sort keys', () => {
    const result = formatJSON({ b: 2, a: 1, c: 3 }, { sortKeys: true });
    const aIndex = result.indexOf('"a"');
    const bIndex = result.indexOf('"b"');
    expect(aIndex).toBeLessThan(bIndex);
  });

  it('should format nested objects', () => {
    const result = formatJSON({ user: { name: 'John', age: 30 } });
    expect(result).toContain('user');
    expect(result).toContain('name');
  });

  it('should format arrays', () => {
    const result = formatJSON([1, 2, 3]);
    expect(result).toContain('[');
    expect(result).toContain(']');
  });
});

describe('formatQueryString', () => {
  it('should format object to query string', () => {
    const result = formatQueryString({ key: 'value', foo: 'bar' });
    expect(result).toBe('key=value&foo=bar');
  });

  it('should add leading question mark', () => {
    const result = formatQueryString({ key: 'value' }, { leadingQuestionMark: true });
    expect(result).toBe('?key=value');
  });

  it('should encode special characters', () => {
    const result = formatQueryString({ search: 'hello world' });
    expect(result).toBe('search=hello+world');
  });

  it('should handle numbers', () => {
    const result = formatQueryString({ count: 5, page: 2 });
    expect(result).toBe('count=5&page=2');
  });

  it('should handle booleans', () => {
    const result = formatQueryString({ active: true, deleted: false });
    expect(result).toBe('active=true&deleted=false');
  });

  it('should skip undefined values', () => {
    const result = formatQueryString({ a: '1', b: undefined, c: '3' });
    expect(result).toBe('a=1&c=3');
  });

  it('should handle empty object', () => {
    const result = formatQueryString({});
    expect(result).toBe('');
  });
});

describe('formatTemplate', () => {
  it('should replace variables', () => {
    const result = formatTemplate('Hello ${name}!', { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  it('should replace multiple variables', () => {
    const result = formatTemplate('${a} + ${b} = ${c}', { a: 1, b: 2, c: 3 });
    expect(result).toBe('1 + 2 = 3');
  });

  it('should handle missing variables', () => {
    const result = formatTemplate('Hello ${name}!', {});
    expect(result).toBe('Hello !');
  });

  it('should use custom delimiters', () => {
    const result = formatTemplate('Hello {{name}}!', { name: 'World' }, { open: '{{', close: '}}' });
    expect(result).toBe('Hello World!');
  });

  it('should handle empty template', () => {
    const result = formatTemplate('', { key: 'value' });
    expect(result).toBe('');
  });
});

describe('formatList', () => {
  it('should format empty list', () => {
    const result = formatList([]);
    expect(result).toBe('');
  });

  it('should format single item', () => {
    const result = formatList(['apple']);
    expect(result).toBe('apple');
  });

  it('should format two items', () => {
    const result = formatList(['apple', 'banana']);
    expect(result).toBe('apple and banana');
  });

  it('should format three items with Oxford comma', () => {
    const result = formatList(['apple', 'banana', 'cherry']);
    expect(result).toBe('apple, banana, and cherry');
  });

  it('should format three items without Oxford comma', () => {
    const result = formatList(['apple', 'banana', 'cherry'], { oxfordComma: false });
    expect(result).toBe('apple, banana and cherry');
  });

  it('should use custom conjunction', () => {
    const result = formatList(['apple', 'banana', 'cherry'], { conjunction: 'or' });
    expect(result).toBe('apple, banana, or cherry');
  });

  it('should format many items', () => {
    const result = formatList(['a', 'b', 'c', 'd', 'e']);
    expect(result).toBe('a, b, c, d, and e');
  });
});

describe('formatOrdinal', () => {
  it('should format 1st', () => {
    expect(formatOrdinal(1)).toBe('1st');
  });

  it('should format 2nd', () => {
    expect(formatOrdinal(2)).toBe('2nd');
  });

  it('should format 3rd', () => {
    expect(formatOrdinal(3)).toBe('3rd');
  });

  it('should format 4th', () => {
    expect(formatOrdinal(4)).toBe('4th');
  });

  it('should format 11th', () => {
    expect(formatOrdinal(11)).toBe('11th');
  });

  it('should format 12th', () => {
    expect(formatOrdinal(12)).toBe('12th');
  });

  it('should format 13th', () => {
    expect(formatOrdinal(13)).toBe('13th');
  });

  it('should format 21st', () => {
    expect(formatOrdinal(21)).toBe('21st');
  });

  it('should format 22nd', () => {
    expect(formatOrdinal(22)).toBe('22nd');
  });

  it('should format 23rd', () => {
    expect(formatOrdinal(23)).toBe('23rd');
  });

  it('should format 100th', () => {
    expect(formatOrdinal(100)).toBe('100th');
  });

  it('should format 101st', () => {
    expect(formatOrdinal(101)).toBe('101st');
  });
});

describe('formatRoman', () => {
  it('should format 1', () => {
    expect(formatRoman(1)).toBe('I');
  });

  it('should format 4', () => {
    expect(formatRoman(4)).toBe('IV');
  });

  it('should format 5', () => {
    expect(formatRoman(5)).toBe('V');
  });

  it('should format 9', () => {
    expect(formatRoman(9)).toBe('IX');
  });

  it('should format 10', () => {
    expect(formatRoman(10)).toBe('X');
  });

  it('should format 40', () => {
    expect(formatRoman(40)).toBe('XL');
  });

  it('should format 50', () => {
    expect(formatRoman(50)).toBe('L');
  });

  it('should format 90', () => {
    expect(formatRoman(90)).toBe('XC');
  });

  it('should format 100', () => {
    expect(formatRoman(100)).toBe('C');
  });

  it('should format 400', () => {
    expect(formatRoman(400)).toBe('CD');
  });

  it('should format 500', () => {
    expect(formatRoman(500)).toBe('D');
  });

  it('should format 900', () => {
    expect(formatRoman(900)).toBe('CM');
  });

  it('should format 1000', () => {
    expect(formatRoman(1000)).toBe('M');
  });

  it('should format 1987', () => {
    expect(formatRoman(1987)).toBe('MCMLXXXVII');
  });

  it('should format 3999', () => {
    expect(formatRoman(3999)).toBe('MMMCMXCIX');
  });

  it('should throw for 0', () => {
    expect(() => formatRoman(0)).toThrow();
  });

  it('should throw for negative', () => {
    expect(() => formatRoman(-1)).toThrow();
  });

  it('should throw for > 3999', () => {
    expect(() => formatRoman(4000)).toThrow();
  });
});

describe('formatWordWrap', () => {
  it('should wrap text at default width', () => {
    const result = formatWordWrap('The quick brown fox jumps over the lazy dog');
    expect(result).toContain('\n');
  });

  it('should wrap text at custom width', () => {
    const result = formatWordWrap('Hello world', { width: 8 });
    expect(result).toBe('Hello\nworld');
  });

  it('should break long words', () => {
    const result = formatWordWrap('Supercalifragilisticexpialidocious', {
      width: 10,
      breakWords: true,
    });
    expect(result).toContain('\n');
  });

  it('should use custom separator', () => {
    const result = formatWordWrap('The quick brown fox', { width: 10, separator: '<br>' });
    expect(result).toContain('<br>');
  });

  it('should handle width of 0', () => {
    const result = formatWordWrap('Hello world', { width: 0 });
    expect(result).toBe('Hello world');
  });

  it('should handle empty string', () => {
    const result = formatWordWrap('');
    expect(result).toBe('');
  });
});

describe('formatTruncate', () => {
  it('should truncate at default length', () => {
    const result = formatTruncate('This is a very long string that should be truncated');
    expect(result.length).toBeLessThan(50);
    expect(result).toContain('...');
  });

  it('should truncate at custom length', () => {
    const result = formatTruncate('Hello world', { length: 8 });
    expect(result).toBe('Hello...');
  });

  it('should use custom suffix', () => {
    const result = formatTruncate('Hello world', { length: 8, suffix: '>>>' });
    expect(result).toBe('Hello>>>');
  });

  it('should break words', () => {
    const result = formatTruncate('Hello world', { length: 11, breakWords: true });
    expect(result).toBe('Hello wo...');
  });

  it('should not truncate short strings', () => {
    const result = formatTruncate('Hi', { length: 10 });
    expect(result).toBe('Hi');
  });

  it('should handle empty string', () => {
    const result = formatTruncate('');
    expect(result).toBe('');
  });
});

describe('formatCase', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(formatCase.capitalize('hello')).toBe('Hello');
    });

    it('should lowercase rest', () => {
      expect(formatCase.capitalize('hELLO')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(formatCase.capitalize('h')).toBe('H');
    });

    it('should handle empty string', () => {
      expect(formatCase.capitalize('')).toBe('');
    });
  });

  describe('titleCase', () => {
    it('should capitalize each word', () => {
      expect(formatCase.titleCase('hello world')).toBe('Hello World');
    });

    it('should handle multiple words', () => {
      expect(formatCase.titleCase('the quick brown fox')).toBe(
        'The Quick Brown Fox'
      );
    });
  });

  describe('camelCase', () => {
    it('should convert to camelCase', () => {
      expect(formatCase.camelCase('hello world')).toBe('helloWorld');
    });

    it('should handle kebab-case', () => {
      expect(formatCase.camelCase('hello-world')).toBe('helloWorld');
    });

    it('should handle snake_case', () => {
      expect(formatCase.camelCase('hello_world')).toBe('helloWorld');
    });
  });

  describe('pascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(formatCase.pascalCase('hello world')).toBe('HelloWorld');
    });

    it('should handle kebab-case', () => {
      expect(formatCase.pascalCase('hello-world')).toBe('HelloWorld');
    });
  });

  describe('snakeCase', () => {
    it('should convert to snake_case', () => {
      expect(formatCase.snakeCase('helloWorld')).toBe('hello_world');
    });

    it('should handle spaces', () => {
      expect(formatCase.snakeCase('hello world')).toBe('hello_world');
    });
  });

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(formatCase.kebabCase('helloWorld')).toBe('hello-world');
    });

    it('should handle spaces', () => {
      expect(formatCase.kebabCase('hello world')).toBe('hello-world');
    });
  });

  describe('constantCase', () => {
    it('should convert to CONSTANT_CASE', () => {
      expect(formatCase.constantCase('helloWorld')).toBe('HELLO_WORLD');
    });

    it('should handle kebab-case', () => {
      expect(formatCase.constantCase('hello-world')).toBe('HELLO_WORLD');
    });
  });

  describe('sentenceCase', () => {
    it('should capitalize first letter', () => {
      expect(formatCase.sentenceCase('hello world')).toBe('Hello world');
    });

    it('should lowercase rest', () => {
      expect(formatCase.sentenceCase('HELLO WORLD')).toBe('Hello world');
    });
  });
});

describe('formatIndent', () => {
  it('should indent all lines', () => {
    const result = formatIndent('line1\nline2');
    expect(result).toBe('  line1\n  line2');
  });

  it('should indent first line', () => {
    const result = formatIndent('line1\nline2', { firstLine: true });
    expect(result).toBe('  line1\n  line2');
  });

  it('should not indent first line', () => {
    const result = formatIndent('line1\nline2', { firstLine: false });
    expect(result).toBe('line1\n  line2');
  });

  it('should use custom indent', () => {
    const result = formatIndent('line1\nline2', { indent: '    ' });
    expect(result).toBe('    line1\n    line2');
  });

  it('should handle single line', () => {
    const result = formatIndent('line1');
    expect(result).toBe('  line1');
  });

  it('should handle empty string', () => {
    const result = formatIndent('');
    expect(result).toBe('  ');
  });
});

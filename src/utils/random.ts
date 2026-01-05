/**
 * Random value generation utilities
 */

/**
 * Generate random float between min and max
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.float(0, 10) // Random number between 0 and 10
 * ```
 */
export function float(min = 0, max = 1): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max (inclusive)
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.int(1, 10) // Random integer between 1 and 10
 * ```
 */
export function int(min = 0, max = 1): number {
  return Math.floor(float(min, max + 1));
}

/**
 * Get random element from array
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.element([1, 2, 3, 4, 5]) // Random element
 * ```
 */
export function element<T>(arr: readonly T[]): T | undefined {
  return arr[int(0, arr.length - 1)];
}

/**
 * Get multiple random elements from array
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.elements([1, 2, 3, 4, 5], 2) // 2 random elements
 * ```
 */
export function elements<T>(arr: readonly T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Generate random boolean
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.boolean() // true or false
 * ```
 */
export function boolean(): boolean {
  return Math.random() < 0.5;
}

/**
 * Generate random string of specified length
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.string(10) // 'aB3xY9pQ2m'
 * ```
 */
export function string(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(int(0, charset.length - 1));
  }
  return result;
}

/**
 * Generate random hexadecimal string
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.hex(10) // '3a7f2b9c1e'
 * ```
 */
export function hex(length = 10): string {
  return string(length, '0123456789abcdef');
}

/**
 * Generate random base64 string
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.base64(10) // 'SGVsbG8gV29ybGQ='
 * ```
 */
export function base64(length = 10): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  return string(length, charset);
}

/**
 * Generate random alphanumeric string
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.alphanumeric(10) // 'aB3xY9pQ2m'
 * ```
 */
export function alphanumeric(length = 10): string {
  return string(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}

/**
 * Generate random alphabetic string
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.alpha(10) // 'aBxYpQmKl'
 * ```
 */
export function alpha(length = 10): string {
  return string(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
}

/**
 * Generate random numeric string
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.numeric(10) // '1234567890'
 * ```
 */
export function numeric(length = 10): string {
  return string(length, '0123456789');
}

/**
 * Pick random keys from object
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.keys({ a: 1, b: 2, c: 3 }, 2) // Random 2 keys
 * ```
 */
export function keys<T extends object>(obj: T, count: number): (keyof T)[] {
  const allKeys = Object.keys(obj) as (keyof T)[];
  return elements(allKeys, count);
}

/**
 * Pick random values from object
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.values({ a: 1, b: 2, c: 3 }, 2) // Random 2 values
 * ```
 */
export function values<T extends object>(obj: T, count: number): T[keyof T][] {
  const selectedKeys = keys(obj, count);
  return selectedKeys.map((key) => obj[key]);
}

/**
 * Pick random entries from object
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.entries({ a: 1, b: 2, c: 3 }, 2) // Random 2 entries
 * ```
 */
export function entries<T extends object>(obj: T, count: number): [keyof T, T[keyof T]][] {
  const selectedKeys = keys(obj, count);
  return selectedKeys.map((key) => [key, obj[key]]);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.shuffle([1, 2, 3, 4, 5]) // Random order
 * ```
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = int(0, i);
    const temp = result[i];
    const itemAtJ = result[j];
    if (itemAtJ !== undefined) {
      result[i] = itemAtJ;
    }
    if (temp !== undefined) {
      result[j] = temp;
    }
  }
  return result;
}

/**
 * Generate random UUID v4
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.uuid() // '550e8400-e29b-41d4-a716-446655440000'
 * ```
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate random color (hex)
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.color() // '#ff3a2b'
 * ```
 */
export function color(): string {
  return '#' + int(0, 16777215).toString(16).padStart(6, '0');
}

/**
 * Generate random date
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.date(new Date('2020-01-01'), new Date('2024-01-01'))
 * // Random date between 2020 and 2024
 * ```
 */
export function date(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(int(startTime, endTime));
}

/**
 * Generate random IP address
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.ip() // '192.168.1.45'
 * ```
 */
export function ip(): string {
  return [0, 0, 0, 0].map(() => int(0, 255)).join('.');
}

/**
 * Generate random MAC address
 *
 * @example
 * ```typescript
 * import { random } from '@oxog/kit/utils';
 *
 * random.mac() // '00:1a:2b:3c:4d:5e'
 * ```
 */
export function mac(): string {
  return Array.from({ length: 6 }, () => int(0, 255).toString(16).padStart(2, '0')).join(':');
}

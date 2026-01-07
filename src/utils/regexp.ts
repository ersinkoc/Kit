/**
 * Regular expression utilities
 */

/**
 * Test if string matches pattern
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.test('hello', /ell/) // true
 * regexp.test('hello', /xyz/) // false
 * ```
 */
export function test(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

/**
 * Get all matches in string
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.matches('hello world', /l/g) // ['l', 'l']
 * ```
 */
export function matches(str: string, pattern: RegExp): string[] {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const result: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = global.exec(str)) !== null) {
    result.push(match[0]);
  }

  return result;
}

/**
 * Get first match in string
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.firstMatch('hello world', /l/) // ['l', index: 2, ...]
 * ```
 */
export function firstMatch(str: string, pattern: RegExp): RegExpMatchArray | null {
  return str.match(pattern);
}

/**
 * Replace all occurrences
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.replaceAll('hello world', /l/g, 'x') // 'hexxo worxd'
 * ```
 */
export function replaceAll(str: string, pattern: RegExp, replacement: string): string {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  return str.replace(global, replacement);
}

/**
 * Escape special regex characters
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.escape('hello.world') // 'hello\\.world'
 * ```
 */
export function escape(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create regex from string (auto-escapes)
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.from('hello.world', 'g') // /hello\.world/g
 * ```
 */
export function from(str: string, flags = ''): RegExp {
  return new RegExp(escape(str), flags);
}

/**
 * Check if string is valid regex pattern
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.isValid('/hello/') // true
 * regexp.isValid('/hello(/') // false
 * ```
 */
export function isValid(patternStr: string): boolean {
  try {
    new RegExp(patternStr);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract groups from string
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.groups('2025-01-01', /(\d{4})-(\d{2})-(\d{2})/)
 * // { 1: '2025', 2: '01', 3: '01' }
 * ```
 */
export function groups(str: string, pattern: RegExp): Record<string, string> | null {
  const match = str.match(pattern);
  if (!match) return null;

  const result: Record<string, string> = {};
  for (let i = 1; i < match.length; i++) {
    result[String(i)] = match[i] ?? '';
  }

  if (match.groups) {
    for (const [key, value] of Object.entries(match.groups)) {
      result[key] = value ?? '';
    }
  }

  return result;
}

/**
 * Count occurrences of pattern
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.count('hello world', /l/g) // 3
 * ```
 */
export function count(str: string, pattern: RegExp): number {
  return matches(str, pattern).length;
}

/**
 * Split string by regex
 *
 * @example
 * ```typescript
 * import { regexp } from '@oxog/kit/utils';
 *
 * regexp.split('a,b,c', /,/) // ['a', 'b', 'c']
 * ```
 */
export function split(str: string, pattern: RegExp): string[] {
  return str.split(pattern);
}

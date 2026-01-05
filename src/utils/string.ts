/**
 * String manipulation utilities
 */

/**
 * Convert string to camelCase
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.camelCase('hello-world') // 'helloWorld'
 * string.camelCase('Hello World') // 'helloWorld'
 * ```
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase());
}

/**
 * Convert string to PascalCase
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.pascalCase('hello-world') // 'HelloWorld'
 * string.pascalCase('hello world') // 'HelloWorld'
 * ```
 */
export function pascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

/**
 * Convert string to snake_case
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.snakeCase('helloWorld') // 'hello_world'
 * string.snakeCase('HelloWorld') // 'hello_world'
 * ```
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * Convert string to kebab-case
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.kebabCase('helloWorld') // 'hello-world'
 * string.kebabCase('hello_world') // 'hello-world'
 * ```
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/**
 * Capitalize first letter
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.capitalize('hello') // 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize first letter of each word
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.capitalizeWords('hello world') // 'Hello World'
 * ```
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Convert string to lowercase
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.lowerCase('HELLO WORLD') // 'hello world'
 * ```
 */
export function lowerCase(str: string): string {
  return str.toLowerCase();
}

/**
 * Convert string to uppercase
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.upperCase('hello world') // 'HELLO WORLD'
 * ```
 */
export function upperCase(str: string): string {
  return str.toUpperCase();
}

/**
 * Truncate string to specified length
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.truncate('Hello World', 5) // 'Hello...'
 * ```
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Remove whitespace from both ends
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.trim('  hello  ') // 'hello'
 * ```
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * Remove whitespace from left side
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.trimLeft('  hello') // 'hello'
 * ```
 */
export function trimLeft(str: string): string {
  return str.trimStart();
}

/**
 * Remove whitespace from right side
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.trimRight('hello  ') // 'hello'
 * ```
 */
export function trimRight(str: string): string {
  return str.trimEnd();
}

/**
 * Remove all whitespace from string
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.trimAll('  he llo  ') // 'hello'
 * ```
 */
export function trimAll(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Pad string on left side
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.padLeft('5', 3, '0') // '005'
 * ```
 */
export function padLeft(str: string, length: number, char = ' '): string {
  return str.padStart(length, char);
}

/**
 * Pad string on right side
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.padRight('5', 3, '0') // '500'
 * ```
 */
export function padRight(str: string, length: number, char = ' '): string {
  return str.padEnd(length, char);
}

/**
 * Count occurrences of substring
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.count('hello world hello', 'hello') // 2
 * ```
 */
export function count(str: string, substring: string): number {
  let count = 0;
  let pos = 0;

  while ((pos = str.indexOf(substring, pos)) !== -1) {
    count++;
    pos += substring.length;
  }

  return count;
}

/**
 * Check if string contains substring
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.contains('hello world', 'world') // true
 * ```
 */
export function contains(str: string, substring: string): boolean {
  return str.includes(substring);
}

/**
 * Check if string starts with substring
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.startsWith('hello world', 'hello') // true
 * ```
 */
export function startsWith(str: string, substring: string): boolean {
  return str.startsWith(substring);
}

/**
 * Check if string ends with substring
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.endsWith('hello world', 'world') // true
 * ```
 */
export function endsWith(str: string, substring: string): boolean {
  return str.endsWith(substring);
}

/**
 * Replace all occurrences of substring
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.replaceAll('hello world hello', 'hello', 'hi') // 'hi world hi'
 * ```
 */
export function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}

/**
 * Reverse a string
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.reverse('hello') // 'olleh'
 * ```
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Split string into lines
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.lines('hello\nworld') // ['hello', 'world']
 * ```
 */
export function lines(str: string): string[] {
  return str.split(/\r?\n/);
}

/**
 * Join lines with newline
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.unlines(['hello', 'world']) // 'hello\nworld'
 * ```
 */
export function unlines(lines: string[]): string {
  return lines.join('\n');
}

/**
 * Split string into words
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.words('hello world') // ['hello', 'world']
 * ```
 */
export function words(str: string): string[] {
  return str.split(/\s+/).filter(Boolean);
}

/**
 * Join words with space
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.unwords(['hello', 'world']) // 'hello world'
 * ```
 */
export function unwords(words: string[]): string {
  return words.join(' ');
}

/**
 * Repeat string n times
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.repeat('ha', 3) // 'hahaha'
 * ```
 */
export function repeat(str: string, times: number): string {
  return str.repeat(times);
}

/**
 * Check if string is empty
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.isEmpty('') // true
 * string.isEmpty('hello') // false
 * ```
 */
export function isEmpty(str: string): boolean {
  return str.length === 0;
}

/**
 * Check if string is blank (empty or whitespace only)
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.isBlank('') // true
 * string.isBlank('  ') // true
 * string.isBlank('hello') // false
 * ```
 */
export function isBlank(str: string): boolean {
  return trim(str).length === 0;
}

/**
 * Get string length
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.length('hello') // 5
 * ```
 */
export function length(str: string): number {
  return str.length;
}

/**
 * Get substring
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.substring('hello', 1, 4) // 'ell'
 * ```
 */
export function substring(str: string, start: number, end?: number): string {
  return str.substring(start, end);
}

/**
 * Get character at index
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.charAt('hello', 1) // 'e'
 * ```
 */
export function charAt(str: string, index: number): string {
  return str.charAt(index);
}

/**
 * Get character code at index
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.charCodeAt('hello', 0) // 104
 * ```
 */
export function charCodeAt(str: string, index: number): number {
  return str.charCodeAt(index);
}

/**
 * Format string with placeholders
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.format('Hello {name}!', { name: 'World' }) // 'Hello World!'
 * ```
 */
export function format(str: string, values: Record<string, unknown>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

/**
 * Abbreviate string
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.abbreviate('Hello World', 5) // 'He...'
 * ```
 */
export function abbreviate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

/**
 * Wrap string to specified width
 *
 * @example
 * ```typescript
 * import { string } from '@oxog/kit/utils';
 *
 * string.wrap('hello world', 5) // 'hello\nworld'
 * ```
 */
export function wrap(str: string, width: number): string {
  const result: string[] = [];
  let currentLine = '';

  for (const word of words(str)) {
    if ((currentLine + ' ' + word).trim().length > width) {
      if (currentLine) result.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }

  if (currentLine) result.push(currentLine.trim());

  return unlines(result);
}

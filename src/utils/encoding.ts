/**
 * Encoding/decoding utilities
 */

/**
 * Encode string to base64
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.base64Encode('hello') // 'aGVsbG8='
 * ```
 */
export function base64Encode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decode base64 to string
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.base64Decode('aGVsbG8=') // 'hello'
 * ```
 */
export function base64Decode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(str)));
}

/**
 * Encode string to URL-safe base64
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.base64UrlEncode('hello?') // 'aGVsbG8/'
 * ```
 */
export function base64UrlEncode(str: string): string {
  return base64Encode(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode URL-safe base64 to string
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.base64UrlDecode('aGVsbG8') // 'hello'
 * ```
 */
export function base64UrlDecode(str: string): string {
  let padded = str;
  while (padded.length % 4 !== 0) {
    padded += '=';
  }
  return base64Decode(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

/**
 * Encode URI component
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.urlEncode('hello world') // 'hello%20world'
 * ```
 */
export function urlEncode(str: string): string {
  return encodeURIComponent(str);
}

/**
 * Decode URI component
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.urlDecode('hello%20world') // 'hello world'
 * ```
 */
export function urlDecode(str: string): string {
  return decodeURIComponent(str);
}

/**
 * Encode query string
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.queryEncode({ a: 1, b: 'hello' }) // 'a=1&b=hello'
 * ```
 */
export function queryEncode(obj: Record<string, string | number | boolean | string[]>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${urlEncode(key)}=${urlEncode(String(v))}`).join('&');
      }
      return `${urlEncode(key)}=${urlEncode(String(value))}`;
    })
    .join('&');
}

/**
 * Decode query string
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.queryDecode('a=1&b=hello') // { a: '1', b: 'hello' }
 * ```
 */
export function queryDecode(str: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  const pairs = str.split('&');

  for (const pair of pairs) {
    const parts = pair.split('=');
    const key = parts[0];
    const value = parts[1];

    if (key === undefined) continue;

    const decodedKey = urlDecode(key);
    const decodedValue = value !== undefined ? urlDecode(value) : '';

    if (decodedKey in result) {
      const existing = result[decodedKey];
      if (Array.isArray(existing)) {
        result[decodedKey] = [...existing, decodedValue];
      } else if (existing !== undefined) {
        result[decodedKey] = [existing, decodedValue];
      }
    } else {
      result[decodedKey] = decodedValue;
    }
  }

  return result;
}

/**
 * Encode string to hexadecimal
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.hexEncode('hello') // '68656c6c6f'
 * ```
 */
export function hexEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('hex');
  }
  return [...str]
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Decode hexadecimal to string
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.hexDecode('68656c6c6f') // 'hello'
 * ```
 */
export function hexDecode(hex: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(hex, 'hex').toString('utf-8');
  }
  const matches = hex.match(/.{2}/g);
  return matches?.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('') ?? '';
}

/**
 * Percent encode (like URL encode but more conservative)
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.percentEncode('hello world') // 'hello%20world'
 * ```
 */
export function percentEncode(str: string): string {
  return [...str]
    .map((c) => {
      const code = c.charCodeAt(0);
      if ((code >= 48 && code <= 57) || // 0-9
          (code >= 65 && code <= 90) || // A-Z
          (code >= 97 && code <= 122) || // a-z
          c === '-' || c === '_' || c === '.' || c === '~') {
        return c;
      }
      return `%${code.toString(16).toUpperCase().padStart(2, '0')}`;
    })
    .join('');
}

/**
 * Decode percent encoded string
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.percentDecode('hello%20world') // 'hello world'
 * ```
 */
export function percentDecode(str: string): string {
  return str.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * HTML escape
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.htmlEscape('<div>') // '&lt;div&gt;'
 * ```
 */
export function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * HTML unescape
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.htmlUnescape('&lt;div&gt;') // '<div>'
 * ```
 */
export function htmlUnescape(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x60;/g, '`');
}

/**
 * JSON stringify with error handling
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.jsonEncode({ a: 1 }) // '{"a":1}'
 * ```
 */
export function jsonEncode(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * JSON parse with error handling
 *
 * @example
 * ```typescript
 * import { encoding } from '@oxog/kit/utils';
 *
 * encoding.jsonDecode('{"a":1}') // { a: 1 }
 * ```
 */
export function jsonDecode<T = unknown>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

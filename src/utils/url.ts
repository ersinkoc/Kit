/**
 * URL manipulation utilities
 */

/**
 * Parsed URL components
 */
export interface ParsedUrl {
  protocol?: string;
  auth?: string;
  host?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

/**
 * Parse URL into components
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.parse('https://user:pass@example.com:8080/path?a=1#hash')
 * // { protocol: 'https:', auth: 'user:pass', host: 'example.com', port: '8080', pathname: '/path', search: '?a=1', hash: '#hash' }
 * ```
 */
export function parse(urlStr: string): ParsedUrl {
  const pattern = /^([^:]+):\/\/(?:([^:@]+)(?::([^@]+))?@)?([^:/?#]+)(?::(\d+))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/;
  const match = urlStr.match(pattern);

  if (!match) {
    // Try parsing as relative URL
    const relativeMatch = urlStr.match(/^([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/);
    if (relativeMatch) {
      return {
        pathname: relativeMatch[1],
        search: relativeMatch[2] !== undefined ? `?${relativeMatch[2]}` : undefined,
        hash: relativeMatch[3] !== undefined ? `#${relativeMatch[3]}` : undefined,
      };
    }
    return {};
  }

  return {
    protocol: match[1],
    auth: match[2] ? (match[3] ? `${match[2]}:${match[3]}` : match[2]) : undefined,
    host: match[4],
    port: match[5],
    pathname: match[6],
    search: match[7] !== undefined ? `?${match[7]}` : undefined,
    hash: match[8] !== undefined ? `#${match[8]}` : undefined,
  };
}

/**
 * Build URL from components
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.build({
 *   protocol: 'https:',
 *   host: 'example.com',
 *   pathname: '/path'
 * }) // 'https://example.com/path'
 * ```
 */
export function build(parts: ParsedUrl): string {
  let result = '';

  if (parts.protocol) {
    result += `${parts.protocol}//`;
  }

  if (parts.auth) {
    result += `${parts.auth}@`;
  }

  if (parts.host) {
    result += parts.host;
  }

  if (parts.port) {
    result += `:${parts.port}`;
  }

  if (parts.pathname) {
    result += parts.pathname;
  }

  if (parts.search) {
    result += parts.search;
  }

  if (parts.hash) {
    result += parts.hash;
  }

  return result;
}

/**
 * Join URL segments
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.join('https://example.com/path', 'to/resource') // 'https://example.com/path/to/resource'
 * ```
 */
export function join(baseUrl: string, ...paths: string[]): string {
  const parsed = parse(baseUrl);
  const joinedPath = [parsed.pathname ?? '/', ...paths].join('/').replace(/\/+/g, '/');
  parsed.pathname = joinedPath;
  return build(parsed);
}

/**
 * Resolve URL against base
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.resolve('https://example.com/path/', '../other') // 'https://example.com/other'
 * ```
 */
export function resolve(base: string, relative: string): string {
  const baseParsed = parse(base);
  const relParsed = parse(relative);

  // If relative URL is absolute, return it
  if (relParsed.protocol) {
    return relative;
  }

  const result = { ...baseParsed };

  if (relative.startsWith('/')) {
    result.pathname = relative;
  } else {
    const basePath = baseParsed.pathname ?? '/';
    const path = basePath.endsWith('/') ? basePath : `${basePath}/`;
    result.pathname = path + relative;
  }

  // Normalize path
  if (result.pathname) {
    result.pathname = result.pathname.replace(/\/+/g, '/');
    const segments = result.pathname.split('/').filter(Boolean);
    const resolved: string[] = [];

    for (const segment of segments) {
      if (segment === '.') {
        continue;
      } else if (segment === '..') {
        resolved.pop();
      } else {
        resolved.push(segment);
      }
    }

    result.pathname = '/' + resolved.join('/');
  }

  if (relParsed.search !== undefined) {
    result.search = relParsed.search;
  }

  if (relParsed.hash !== undefined) {
    result.hash = relParsed.hash;
  }

  return build(result);
}

/**
 * Parse query string into object
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.parseQuery('?a=1&b=2') // { a: '1', b: '2' }
 * ```
 */
export function parseQuery(search: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  const params = search.startsWith('?') ? search.slice(1) : search;

  if (!params) return result;

  for (const pair of params.split('&')) {
    const parts = pair.split('=');
    const key = parts[0];
    const value = parts[1];

    if (!key) continue;

    const decodedKey = decodeURIComponent(key);
    const decodedValue = value ? decodeURIComponent(value) : '';

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
 * Build query string from object
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.buildQuery({ a: '1', b: '2' }) // 'a=1&b=2'
 * ```
 */
export function buildQuery(obj: Record<string, string | number | boolean | string[]>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
}

/**
 * Add query parameters to URL
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.addQuery('https://example.com', { a: '1' }) // 'https://example.com?a=1'
 * ```
 */
export function addQuery(urlStr: string, params: Record<string, string | number | boolean | string[]>): string {
  const parsed = parse(urlStr);
  const existingQuery = parsed.search ? parseQuery(parsed.search) : {};
  const mergedQuery = { ...existingQuery, ...params };
  const newSearch = buildQuery(mergedQuery);
  parsed.search = newSearch ? `?${newSearch}` : undefined;
  return build(parsed);
}

/**
 * Remove query parameters from URL
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.removeQuery('https://example.com?a=1&b=2', ['a']) // 'https://example.com?b=2'
 * ```
 */
export function removeQuery(urlStr: string, keys: string[]): string {
  const parsed = parse(urlStr);
  if (!parsed.search) return urlStr;

  const query = parseQuery(parsed.search);
  for (const key of keys) {
    delete query[key];
  }

  const newSearch = buildQuery(query);
  parsed.search = newSearch ? `?${newSearch}` : undefined;
  return build(parsed);
}

/**
 * Get domain from URL
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.domain('https://sub.example.com/path') // 'example.com'
 * ```
 */
export function domain(urlStr: string): string | null {
  const parsed = parse(urlStr);
  if (!parsed.host) return null;

  const parts = parsed.host.split('.');
  if (parts.length < 2) return parsed.host;

  return parts.slice(-2).join('.');
}

/**
 * Get subdomain from URL
 *
 * @example
 * ```typescript
 * import { url } from '@oxog/kit/utils';
 *
 * url.subdomain('https://sub.example.com/path') // 'sub'
 * ```
 */
export function subdomain(urlStr: string): string | null {
  const parsed = parse(urlStr);
  if (!parsed.host) return null;

  const parts = parsed.host.split('.');
  if (parts.length < 3) return null;

  return parts.slice(0, -2).join('.');
}

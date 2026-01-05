/**
 * Path manipulation utilities (cross-platform)
 */

/**
 * Join path segments
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.join('a', 'b', 'c') // 'a/b/c' (Unix) or 'a\\b\\c' (Windows)
 * ```
 */
export function join(...segments: string[]): string {
  return segments
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/');
}

/**
 * Normalize path (resolve . and ..)
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.normalize('a/b/../c') // 'a/c'
 * ```
 */
export function normalize(pathStr: string): string {
  const segments = pathStr.split('/').filter(Boolean);
  const result: string[] = [];

  for (const segment of segments) {
    if (segment === '.') {
      continue;
    } else if (segment === '..') {
      result.pop();
    } else {
      result.push(segment);
    }
  }

  return result.join('/');
}

/**
 * Get directory name
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.dirname('/a/b/c') // '/a/b'
 * ```
 */
export function dirname(pathStr: string): string {
  const normalized = normalize(pathStr);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? '' : normalized.slice(0, lastSlash);
}

/**
 * Get file name (with extension)
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.basename('/a/b/c.txt') // 'c.txt'
 * ```
 */
export function basename(pathStr: string, ext?: string): string {
  const normalized = normalize(pathStr);
  const fileName = normalized.split('/').pop() ?? '';
  if (ext && fileName.endsWith(ext)) {
    return fileName.slice(0, -ext.length);
  }
  return fileName;
}

/**
 * Get file extension
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.extname('/a/b/c.txt') // '.txt'
 * ```
 */
export function extname(pathStr: string): string {
  const fileName = basename(pathStr);
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.slice(lastDot);
}

/**
 * Get file name without extension
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.name('/a/b/c.txt') // 'c'
 * ```
 */
export function name(pathStr: string): string {
  return basename(pathStr, extname(pathStr));
}

/**
 * Resolve absolute path
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.resolve('/a/b', '../c') // '/a/c'
 * ```
 */
export function resolve(...segments: string[]): string {
  if (segments.length === 0) return '/';

  let result = segments[0] ?? '';
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;

    if (segment.startsWith('/')) {
      result = segment;
    } else {
      result = join(result, segment);
    }
  }

  return normalize(result);
}

/**
 * Get relative path from A to B
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.relative('/a/b/c', '/a/d') // '../../d'
 * ```
 */
export function relative(from: string, to: string): string {
  const fromSegments = normalize(from).split('/');
  const toSegments = normalize(to).split('/');

  let common = 0;
  while (
    common < fromSegments.length &&
    common < toSegments.length &&
    fromSegments[common] === toSegments[common]
  ) {
    common++;
  }

  const up = fromSegments.length - common;
  const down = toSegments.slice(common);

  return [...Array(up).fill('..'), ...down].join('/');
}

/**
 * Check if path is absolute
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.isAbsolute('/a/b') // true
 * path.isAbsolute('a/b') // false
 * ```
 */
export function isAbsolute(pathStr: string): boolean {
  return pathStr.startsWith('/');
}

/**
 * Parse path into components
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.parse('/a/b/c.txt')
 * // { root: '/', dir: '/a/b', base: 'c.txt', ext: '.txt', name: 'c' }
 * ```
 */
export function parse(pathStr: string): {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
} {
  const root = isAbsolute(pathStr) ? '/' : '';
  const dir = dirname(pathStr);
  const base = basename(pathStr);
  const ext = extname(pathStr);
  const nameWithoutExt = name(pathStr);

  return { root, dir, base, ext, name: nameWithoutExt };
}

/**
 * Format path components into string
 *
 * @example
 * ```typescript
 * import { path } from '@oxog/kit/utils';
 *
 * path.format({ dir: '/a/b', name: 'c', ext: '.txt' }) // '/a/b/c.txt'
 * ```
 */
export function format(pathObject: {
  root?: string;
  dir?: string;
  base?: string;
  ext?: string;
  name?: string;
}): string {
  const dir = pathObject.dir ?? '';
  const base = pathObject.base ?? (pathObject.name ?? '') + (pathObject.ext ?? '');
  return dir ? join(dir, base) : base;
}

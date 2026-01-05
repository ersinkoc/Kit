/**
 * Slug generation utilities
 */

/**
 * Create URL-friendly slug from string
 *
 * @example
 * ```typescript
 * import { slug } from '@oxog/kit/utils';
 *
 * slug.create('Hello World!') // 'hello-world'
 * slug.create('Café & Restaurant') // 'cafe-restaurant'
 * ```
 */
export function create(str: string, options: { separator?: string; lowercase?: boolean } = {}): string {
  const { separator = '-', lowercase = true } = options;

  let result = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, separator); // Replace spaces with separator

  if (lowercase) {
    result = result.toLowerCase();
  }

  // Remove consecutive separators
  result = result.replace(new RegExp(`${separator}+`, 'g'), separator);

  return result;
}

/**
 * Create unique slug by adding suffix if needed
 *
 * @example
 * ```typescript
 * import { slug } from '@oxog/kit/utils';
 *
 * const existing = ['hello-world', 'hello-world-2'];
 * slug.unique('Hello World!', existing) // 'hello-world-3'
 * ```
 */
export function unique(str: string, existing: string[], options: { separator?: string } = {}): string {
  const { separator = '-' } = options;
  let base = create(str, { separator });
  let result = base;
  let counter = 1;

  while (existing.includes(result)) {
    result = `${base}${separator}${counter}`;
    counter++;
  }

  return result;
}

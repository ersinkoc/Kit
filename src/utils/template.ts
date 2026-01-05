/**
 * Template string utilities
 */

/**
 * Compile a template string with placeholders
 *
 * @example
 * ```typescript
 * import { template } from '@oxog/kit/utils';
 *
 * const compiled = template.compile('Hello {{name}}!');
 * compiled({ name: 'World' }); // 'Hello World!'
 * ```
 */
export function compile(
  str: string,
  options: {
    open?: string;
    close?: string;
  } = {}
): (data: Record<string, unknown>) => string {
  const { open = '{{', close = '}}' } = options;

  const pattern = new RegExp(`${escapeRegex(open)}(.*?)${escapeRegex(close)}`, 'g');

  return (data: Record<string, unknown>) => {
    return str.replace(pattern, (_, key) => {
      const value = getNestedValue(data, key.trim());
      return value !== undefined ? String(value) : '';
    });
  };
}

/**
 * Render a template string with data
 *
 * @example
 * ```typescript
 * import { template } from '@oxog/kit/utils';
 *
 * template.render('Hello {{name}}!', { name: 'World' }); // 'Hello World!'
 * ```
 */
export function render(
  str: string,
  data: Record<string, unknown>,
  options: {
    open?: string;
    close?: string;
  } = {}
): string {
  return compile(str, options)(data);
}

/**
 * Render template with safe escaping
 *
 * @example
 * ```typescript
 * import { template } from '@oxog/kit/utils';
 *
 * template.safe('<div>{{content}}</div>', { content: '<script>' });
 * // '<div>&lt;script&gt;</div>'
 * ```
 */
export function safe(
  str: string,
  data: Record<string, unknown>,
  options: {
    open?: string;
    close?: string;
  } = {}
): string {
  const { open = '{{', close = '}}' } = options;

  const pattern = new RegExp(`${escapeRegex(open)}(.*?)${escapeRegex(close)}`, 'g');

  return str.replace(pattern, (_, key) => {
    const value = getNestedValue(data, key.trim());
    if (value === undefined) return '';
    return escapeHtml(String(value));
  });
}

/**
 * Create template with custom delimiters
 *
 * @example
 * ```typescript
 * import { template } from '@oxog/kit/utils';
 *
 * const tmpl = template.create('<% value %>', { open: '<%', close: '%>' });
 * tmpl({ value: 'Hello' }); // 'Hello'
 * ```
 */
export function create(
  str: string,
  options: {
    open?: string;
    close?: string;
  } = {}
): (data: Record<string, unknown>) => string {
  return compile(str, options);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value === null || typeof value !== 'object') {
      return undefined;
    }
    value = (value as Record<string, unknown>)[key];
  }

  return value;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitization utilities for cleaning and normalizing data
 */

/**
 * HTML sanitization options
 */
export interface SanitizeHTMLOptions {
  /** Allowed tags */
  allowedTags?: string[];
  /** Allowed attributes */
  allowedAttributes?: Record<string, string[]>;
  /** Allow all tags */
  allowAll?: boolean;
}

/**
 * Default allowed HTML tags
 */
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
];

/**
 * Default allowed HTML attributes
 */
const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target'],
};

/**
 * Sanitize HTML by removing dangerous tags and attributes
 */
export function sanitizeHTML(
  html: string,
  options: SanitizeHTMLOptions = {}
): string {
  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
  } = options;

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove comments
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  if (options.allowAll) {
    return sanitized;
  }

  // Build regex for allowed tags
  const allowedTagsPattern = allowedTags.join('|');
  const tagPattern = new RegExp(`<(?!\\/?(?:${allowedTagsPattern})\\b)[^>]+>`, 'gi');
  sanitized = sanitized.replace(tagPattern, '');

  // Remove dangerous attributes from allowed tags
  for (const tag of allowedTags) {
    const attrs = allowedAttributes[tag] || [];
    const attrPattern = new RegExp(
      `<(${tag})([^>]*)\\s+([^=>\\s]+)(?:\\s*=[\\s"']*[^"'>\\s]*)`,
      'gi'
    );

    sanitized = sanitized.replace(attrPattern, (match, tagName, beforeAttr, attrName) => {
      if (!attrs.includes(attrName) && !attrName.startsWith('data-')) {
        return `<${tagName}${beforeAttr}>`;
      }
      return match;
    });
  }

  return sanitized;
}

/**
 * Sanitize a string by removing null bytes and trimming
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Sanitize SQL input (basic SQL injection prevention)
 */
export function sanitizeSQL(input: string): string {
  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/;/g, '') // Remove semicolons
    .trim();
}

/**
 * Escape SQL value (safer alternative to sanitization)
 */
export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/**
 * Sanitize file name
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255); // Truncate to 255 chars
}

/**
 * Sanitize email address (basic format check and cleanup)
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ''); // Remove spaces
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url.trim());
    // Only allow http, https, ftp, ftps
    if (!['http:', 'https:', 'ftp:', 'ftps:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number (keep only digits and common separators)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
}

/**
 * Sanitize number input (remove non-numeric characters)
 */
export function sanitizeNumber(input: string): string {
  return input.replace(/[^\d.-]/g, '').trim();
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const lower = input.toLowerCase().trim();
    return ['true', '1', 'yes', 'on'].includes(lower);
  }
  if (typeof input === 'number') return input !== 0;
  return Boolean(input);
}

/**
 * Trim and limit string length
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  const sanitized = sanitizeString(str);
  if (sanitized.length <= maxLength) return sanitized;
  return sanitized.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Remove all HTML tags
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escape special regex characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape special JSON characters
 */
export function escapeJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    sanitizeKeys?: boolean;
    sanitizeStrings?: boolean;
    sanitizeHTML?: boolean;
    removeNull?: boolean;
    removeUndefined?: boolean;
  } = {}
): T {
  const result = { ...obj };

  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key];

      // Skip null/undefined if configured
      if (value === null && options.removeNull) {
        delete result[key];
        continue;
      }
      if (value === undefined && options.removeUndefined) {
        delete result[key];
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = sanitizeObject(value as Record<string, unknown>, options) as unknown as T[Extract<keyof T, string>];
        continue;
      }

      // Sanitize arrays
      if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>, options)
            : item
        ) as unknown as T[Extract<keyof T, string>];
        continue;
      }

      // Sanitize strings
      if (typeof value === 'string' && options.sanitizeStrings) {
        result[key] = sanitizeString(value) as unknown as T[Extract<keyof T, string>];
      }

      // Sanitize HTML
      if (typeof value === 'string' && options.sanitizeHTML) {
        result[key] = sanitizeHTML(value) as unknown as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Sanitize class for chainable sanitization
 */
export class Sanitizer<T = unknown> {
  private value: T;
  private options: {
    sanitizeStrings?: boolean;
    sanitizeHTML?: boolean;
    sanitizeNumbers?: boolean;
    trim?: boolean;
    maxLength?: number;
  } = {};

  constructor(value: T) {
    this.value = value;
  }

  /**
   * Enable string sanitization
   */
  cleanStrings(): Sanitizer<T> {
    this.options.sanitizeStrings = true;
    return this;
  }

  /**
   * Enable HTML sanitization
   */
  cleanHTML(allowedTags?: string[]): Sanitizer<T> {
    this.options.sanitizeHTML = true;
    return this;
  }

  /**
   * Enable number sanitization
   */
  cleanNumbers(): Sanitizer<T> {
    this.options.sanitizeNumbers = true;
    return this;
  }

  /**
   * Enable trimming
   */
  trim(): Sanitizer<T> {
    this.options.trim = true;
    return this;
  }

  /**
   * Set max length for strings
   */
  limit(length: number): Sanitizer<T> {
    this.options.maxLength = length;
    return this;
  }

  /**
   * Execute sanitization and return result
   */
  exec(): T {
    let result = this.value;

    if (typeof result === 'string') {
      if (this.options.sanitizeStrings) {
        result = sanitizeString(result as string) as T;
      }
      if (this.options.sanitizeHTML) {
        result = sanitizeHTML(result as string) as T;
      }
      if (this.options.trim) {
        result = (result as string).trim() as T;
      }
      if (this.options.maxLength) {
        result = truncate(result as string, this.options.maxLength) as T;
      }
    }

    if (typeof result === 'object' && result !== null) {
      result = sanitizeObject(result as Record<string, unknown>, {
        sanitizeStrings: this.options.sanitizeStrings,
        sanitizeHTML: this.options.sanitizeHTML,
      }) as T;
    }

    return result;
  }

  /**
   * Execute sanitization and return value
   */
  valueOf(): T {
    return this.exec();
  }
}

/**
 * Create a new sanitizer
 */
export function sanitizer<T = unknown>(value: T): Sanitizer<T> {
  return new Sanitizer(value);
}

/**
 * Sanitize any value automatically
 */
export function sanitize<T = unknown>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeString(value) as T;
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return sanitizeObject(value as Record<string, unknown>, {
      sanitizeStrings: true,
    }) as T;
  }
  return value;
}

/**
 * Default sanitizer instance
 */
export const sanitize_default = sanitizer;

/**
 * XSS prevention utilities
 */
export const xss = {
  /** Escape HTML entities */
  escapeHTML: (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /** Escape HTML attributes */
  escapeAttribute: (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },

  /** Escape JavaScript string */
  escapeJS: (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\v/g, '\\v')
      .replace(/\0/g, '\\0');
  },
};

/**
 * Input normalization utilities
 */
export const normalize = {
  /** Whitespace normalization */
  whitespace: (str: string): string =>
    str.replace(/\s+/g, ' ').trim(),

  /** Line ending normalization */
  lineEndings: (str: string): string =>
    str.replace(/\r\n/g, '\n').replace(/\r/g, '\n'),

  /** Path normalization */
  path: (pathStr: string): string =>
    pathStr.replace(/\\/g, '/').replace(/\/+/g, '/'),

  /** URL normalization */
  url: (urlStr: string): string => {
    try {
      const url = new URL(urlStr.trim());
      url.hash = '';
      url.searchParams.sort();
      return url.href;
    } catch {
      return urlStr.trim();
    }
  },

  /** Phone number normalization (to E.164 format) */
  phone: (phone: string, countryCode = '1'): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+${countryCode}${digits}`;
    }
    if (digits.startsWith('+')) {
      return digits;
    }
    return `+${digits}`;
  },
};

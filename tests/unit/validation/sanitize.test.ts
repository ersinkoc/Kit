/**
 * Tests for sanitize module
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeHTML,
  sanitizeString,
  sanitizeSQL,
  escapeSQL,
  sanitizeFilename,
  sanitizeEmail,
  sanitizeURL,
  sanitizePhone,
  sanitizeNumber,
  sanitizeBoolean,
  truncate,
  stripHTML,
  escapeRegex,
  escapeJSON,
  sanitizeObject,
  Sanitizer,
  sanitizer,
  sanitize,
  xss,
  normalize,
} from '@oxog/kit/validation';

describe('sanitizeHTML', () => {
  it('should remove script tags', () => {
    const result = sanitizeHTML('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Hello</p>');
  });

  it('should remove style tags', () => {
    const result = sanitizeHTML('<p>Hello</p><style>body{display:none}</style>');
    expect(result).not.toContain('<style');
    expect(result).toContain('<p>Hello</p>');
  });

  it('should remove HTML comments', () => {
    const result = sanitizeHTML('<p>Hello</p><!-- comment --><p>World</p>');
    expect(result).not.toContain('<!--');
    expect(result).not.toContain('comment');
  });

  it('should remove event handlers', () => {
    const result = sanitizeHTML('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('should remove javascript: protocol', () => {
    const result = sanitizeHTML('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain('javascript:');
  });

  it('should allow specified tags', () => {
    const result = sanitizeHTML('<p>Hello</p><div>World</div>', {
      allowedTags: ['p'],
    });
    expect(result).toContain('<p>');
    expect(result).not.toContain('<div>');
  });

  it('should allow all tags with allowAll option', () => {
    const result = sanitizeHTML('<p>Hello</p><div>World</div>', {
      allowAll: true,
    });
    expect(result).toContain('<p>');
    expect(result).toContain('<div>');
  });

  it('should keep default allowed tags', () => {
    const result = sanitizeHTML('<p>Para</p><strong>Bold</strong><em>Italic</em>');
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });
});

describe('sanitizeString', () => {
  it('should remove null bytes', () => {
    expect(sanitizeString('hello\0world')).toBe('helloworld');
  });

  it('should remove control characters', () => {
    expect(sanitizeString('hello\x00\x01\x02world')).toBe('helloworld');
  });

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('should handle combined sanitization', () => {
    expect(sanitizeString('  hello\0\x01world  ')).toBe('helloworld');
  });
});

describe('sanitizeSQL', () => {
  it('should remove single quotes', () => {
    expect(sanitizeSQL("hello'world")).toBe('helloworld');
  });

  it('should remove double quotes', () => {
    expect(sanitizeSQL('hello"world')).toBe('helloworld');
  });

  it('should remove backslashes', () => {
    expect(sanitizeSQL('hello\\world')).toBe('helloworld');
  });

  it('should remove SQL comments', () => {
    expect(sanitizeSQL('hello--DROP TABLE')).toBe('helloDROP TABLE');
  });

  it('should remove semicolons', () => {
    expect(sanitizeSQL('hello;DROP TABLE')).toBe('helloDROP TABLE');
  });

  it('should trim result', () => {
    expect(sanitizeSQL('  hello  ')).toBe('hello');
  });
});

describe('escapeSQL', () => {
  it('should escape single quotes', () => {
    expect(escapeSQL("hello'world")).toBe("hello''world");
  });

  it('should escape backslashes', () => {
    expect(escapeSQL('hello\\world')).toBe('hello\\\\world');
  });
});

describe('sanitizeFilename', () => {
  it('should replace invalid characters', () => {
    expect(sanitizeFilename('file/name.txt')).toBe('file_name.txt');
    expect(sanitizeFilename('file:name.txt')).toBe('file_name.txt');
    expect(sanitizeFilename('file<name>.txt')).toBe('file_name_.txt');
  });

  it('should collapse multiple underscores', () => {
    expect(sanitizeFilename('file__name.txt')).toBe('file_name.txt');
  });

  it('should remove leading dots', () => {
    expect(sanitizeFilename('...file.txt')).toBe('file.txt');
  });

  it('should truncate long filenames', () => {
    const longName = 'a'.repeat(300) + '.txt';
    expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255);
  });

  it('should allow valid characters', () => {
    expect(sanitizeFilename('file-name_123.txt')).toBe('file-name_123.txt');
  });
});

describe('sanitizeEmail', () => {
  it('should lowercase email', () => {
    expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
  });

  it('should trim whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
  });

  it('should remove internal spaces', () => {
    expect(sanitizeEmail('user @ example.com')).toBe('user@example.com');
  });
});

describe('sanitizeURL', () => {
  it('should validate and normalize URL', () => {
    expect(sanitizeURL('https://example.com/path')).toBe('https://example.com/path');
  });

  it('should trim whitespace', () => {
    expect(sanitizeURL('  https://example.com  ')).toBe('https://example.com/');
  });

  it('should reject invalid URLs', () => {
    expect(sanitizeURL('not-a-url')).toBe('');
  });

  it('should reject disallowed protocols', () => {
    expect(sanitizeURL('file:///etc/passwd')).toBe('');
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('should allow http, https, ftp, ftps', () => {
    expect(sanitizeURL('http://example.com')).toBe('http://example.com/');
    expect(sanitizeURL('https://example.com')).toBe('https://example.com/');
    expect(sanitizeURL('ftp://example.com')).toBe('ftp://example.com/');
    expect(sanitizeURL('ftps://example.com')).toBe('ftps://example.com');
  });
});

describe('sanitizePhone', () => {
  it('should keep digits and common separators', () => {
    expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
  });

  it('should remove invalid characters', () => {
    expect(sanitizePhone('+1-555-123-4567abc')).toBe('+1-555-123-4567');
  });

  it('should trim result', () => {
    expect(sanitizePhone('  +1-555-123-4567  ')).toBe('+1-555-123-4567');
  });
});

describe('sanitizeNumber', () => {
  it('should keep digits, dots, and minus', () => {
    expect(sanitizeNumber('-123.45')).toBe('-123.45');
  });

  it('should remove non-numeric characters', () => {
    expect(sanitizeNumber('$1,234.56')).toBe('1234.56');
  });

  it('should trim result', () => {
    expect(sanitizeNumber('  123  ')).toBe('123');
  });
});

describe('sanitizeBoolean', () => {
  it('should pass through booleans', () => {
    expect(sanitizeBoolean(true)).toBe(true);
    expect(sanitizeBoolean(false)).toBe(false);
  });

  it('should convert truthy strings', () => {
    expect(sanitizeBoolean('true')).toBe(true);
    expect(sanitizeBoolean('1')).toBe(true);
    expect(sanitizeBoolean('yes')).toBe(true);
    expect(sanitizeBoolean('on')).toBe(true);
  });

  it('should convert falsy strings', () => {
    expect(sanitizeBoolean('false')).toBe(false);
    expect(sanitizeBoolean('0')).toBe(false);
    expect(sanitizeBoolean('no')).toBe(false);
  });

  it('should convert numbers', () => {
    expect(sanitizeBoolean(1)).toBe(true);
    expect(sanitizeBoolean(0)).toBe(false);
    expect(sanitizeBoolean(-1)).toBe(true);
  });

  it('should convert other values', () => {
    expect(sanitizeBoolean(null)).toBe(false);
    expect(sanitizeBoolean(undefined)).toBe(false);
    expect(sanitizeBoolean({})).toBe(true);
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should sanitize before truncating', () => {
    expect(truncate('hello\0world', 15)).toBe('helloworld');
  });

  it('should use custom suffix', () => {
    expect(truncate('hello world', 8, '…')).toBe('hello w…');
  });
});

describe('stripHTML', () => {
  it('should remove all HTML tags', () => {
    expect(stripHTML('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
  });

  it('should handle self-closing tags', () => {
    expect(stripHTML('Hello<br/>World')).toBe('HelloWorld');
  });

  it('should handle empty string', () => {
    expect(stripHTML('')).toBe('');
  });
});

describe('escapeRegex', () => {
  it('should escape special regex characters', () => {
    expect(escapeRegex('a.b*c?d+e^f$g|h\\i')).toBe('a\\.b\\*c\\?d\\+e\\^f\\$g\\|h\\\\i');
  });

  it('should escape brackets', () => {
    expect(escapeRegex('[a-z]')).toBe('\\[a-z\\]');
  });

  it('should escape parentheses', () => {
    expect(escapeRegex('(a|b)')).toBe('\\(a\\|b\\)');
  });

  it('should escape braces', () => {
    expect(escapeRegex('{1,2}')).toBe('\\{1,2\\}');
  });
});

describe('escapeJSON', () => {
  it('should escape backslashes', () => {
    expect(escapeJSON('hello\\world')).toBe('hello\\\\world');
  });

  it('should escape quotes', () => {
    expect(escapeJSON('hello"world')).toBe('hello\\"world');
  });

  it('should escape newlines', () => {
    expect(escapeJSON('hello\nworld')).toBe('hello\\nworld');
  });

  it('should escape carriage returns', () => {
    expect(escapeJSON('hello\rworld')).toBe('hello\\rworld');
  });

  it('should escape tabs', () => {
    expect(escapeJSON('hello\tworld')).toBe('hello\\tworld');
  });
});

describe('sanitizeObject', () => {
  it('should sanitize string values', () => {
    const result = sanitizeObject({ name: '  hello\0  ' }, { sanitizeStrings: true });
    expect(result.name).toBe('hello');
  });

  it('should remove null values', () => {
    const result = sanitizeObject({ a: 1, b: null }, { removeNull: true });
    expect(result).toEqual({ a: 1 });
  });

  it('should remove undefined values', () => {
    const result = sanitizeObject({ a: 1, b: undefined }, { removeUndefined: true });
    expect(result).toEqual({ a: 1 });
  });

  it('should recursively sanitize nested objects', () => {
    const result = sanitizeObject(
      { user: { name: '  hello\0  ' } },
      { sanitizeStrings: true }
    );
    expect(result.user.name).toBe('hello');
  });

  it('should sanitize arrays', () => {
    const result = sanitizeObject(
      { items: [{ name: '  hello\0  ' }] },
      { sanitizeStrings: true }
    );
    expect(result.items[0].name).toBe('hello');
  });
});

describe('Sanitizer', () => {
  it('should sanitize strings with cleanStrings()', () => {
    const result = new Sanitizer('  hello\0world  ')
      .cleanStrings()
      .exec();
    expect(result).toBe('helloworld');
  });

  it('should sanitize HTML with cleanHTML()', () => {
    const result = new Sanitizer('<script>alert(1)</script><p>Hello</p>')
      .cleanHTML()
      .exec();
    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>');
  });

  it('should trim strings with trim()', () => {
    const result = new Sanitizer('  hello  ')
      .trim()
      .exec();
    expect(result).toBe('hello');
  });

  it('should limit string length with limit()', () => {
    const result = new Sanitizer('hello world')
      .limit(8)
      .exec();
    expect(result).toBe('hello...');
  });

  it('should chain operations', () => {
    const result = new Sanitizer('  HELLO WORLD  ')
      .trim()
      .cleanStrings()
      .exec();
    expect(result).toBe('HELLO WORLD');
  });

  it('should sanitize objects', () => {
    const result = new Sanitizer({ name: '  hello\0  ' })
      .cleanStrings()
      .exec() as { name: string };
    expect(result.name).toBe('hello');
  });

  it('should return value with valueOf()', () => {
    const result = new Sanitizer('  hello  ')
      .trim()
      .valueOf();
    expect(result).toBe('hello');
  });
});

describe('sanitizer', () => {
  it('should create a new Sanitizer instance', () => {
    const s = sanitizer('hello');
    expect(s).toBeInstanceOf(Sanitizer);
  });

  it('should work with chaining', () => {
    const result = sanitizer('  hello  ')
      .trim()
      .exec();
    expect(result).toBe('hello');
  });
});

describe('sanitize', () => {
  it('should sanitize strings automatically', () => {
    expect(sanitize('  hello\0  ')).toBe('hello');
  });

  it('should sanitize objects automatically', () => {
    const result = sanitize({ name: '  hello\0  ' }) as { name: string };
    expect(result.name).toBe('hello');
  });

  it('should return non-string/object values unchanged', () => {
    expect(sanitize(123)).toBe(123);
    expect(sanitize(true)).toBe(true);
    expect(sanitize(null)).toBe(null);
  });
});

describe('xss utilities', () => {
  describe('escapeAttribute', () => {
    it('should escape HTML entities', () => {
      expect(xss.escapeAttribute('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape quotes', () => {
      expect(xss.escapeAttribute('"hello"')).toBe('&quot;hello&quot;');
      expect(xss.escapeAttribute("'hello'")).toBe('&#x27;hello&#x27;');
    });

    it('should escape ampersands', () => {
      expect(xss.escapeAttribute('a&b')).toBe('a&amp;b');
    });
  });

  describe('escapeJS', () => {
    it('should escape backslashes', () => {
      expect(xss.escapeJS('hello\\world')).toBe('hello\\\\world');
    });

    it('should escape quotes', () => {
      expect(xss.escapeJS("hello'world")).toBe("hello\\'world");
      expect(xss.escapeJS('hello"world')).toBe('hello\\"world');
    });

    it('should escape newlines', () => {
      expect(xss.escapeJS('hello\nworld')).toBe('hello\\nworld');
    });

    it('should escape null bytes', () => {
      expect(xss.escapeJS('hello\0world')).toBe('hello\\0world');
    });
  });

  // Note: xss.escapeHTML uses document.createElement which is not available in Node.js
  // This test would need to be run in a browser environment or with jsdom
});

describe('normalize utilities', () => {
  describe('whitespace', () => {
    it('should normalize whitespace', () => {
      expect(normalize.whitespace('hello   world')).toBe('hello world');
      expect(normalize.whitespace('  hello   world  ')).toBe('hello world');
    });
  });

  describe('lineEndings', () => {
    it('should normalize line endings to LF', () => {
      expect(normalize.lineEndings('hello\r\nworld')).toBe('hello\nworld');
      expect(normalize.lineEndings('hello\rworld')).toBe('hello\nworld');
    });
  });

  describe('path', () => {
    it('should normalize path separators', () => {
      expect(normalize.path('path\\to\\file')).toBe('path/to/file');
    });

    it('should collapse multiple slashes', () => {
      expect(normalize.path('path//to//file')).toBe('path/to/file');
    });
  });

  describe('url', () => {
    it('should normalize URL', () => {
      const result = normalize.url('https://example.com/path#hash');
      expect(result).toBe('https://example.com/path');
    });

    it('should sort query parameters', () => {
      const result = normalize.url('https://example.com?b=2&a=1');
      expect(result).toBe('https://example.com/?a=1&b=2');
    });

    it('should return trimmed string for invalid URLs', () => {
      expect(normalize.url('  not-a-url  ')).toBe('not-a-url');
    });
  });

  describe('phone', () => {
    it('should normalize to E.164 format', () => {
      expect(normalize.phone('555-123-4567')).toBe('+15551234567');
    });

    it('should use custom country code', () => {
      expect(normalize.phone('555-123-4567', '44')).toBe('+445551234567');
    });

    it('should handle numbers with plus prefix', () => {
      expect(normalize.phone('+15551234567')).toBe('+15551234567');
    });
  });
});

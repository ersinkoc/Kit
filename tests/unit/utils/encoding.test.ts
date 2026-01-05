/**
 * Tests for encoding utility module
 */
import { describe, it, expect } from 'vitest';
import { encoding } from '@oxog/kit/utils';

describe('encoding utilities', () => {
  describe('base64', () => {
    it('base64Encode encodes string', () => {
      expect(encoding.base64Encode('hello')).toBe('aGVsbG8=');
      expect(encoding.base64Encode('Hello World')).toBe('SGVsbG8gV29ybGQ=');
    });

    it('base64Decode decodes string', () => {
      expect(encoding.base64Decode('aGVsbG8=')).toBe('hello');
      expect(encoding.base64Decode('SGVsbG8gV29ybGQ=')).toBe('Hello World');
    });

    it('roundtrips base64', () => {
      const original = 'Test string with special chars: äöü';
      const encoded = encoding.base64Encode(original);
      const decoded = encoding.base64Decode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe('base64Url', () => {
    it('base64UrlEncode encodes URL-safe', () => {
      const result = encoding.base64UrlEncode('hello?');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });

    it('base64UrlDecode decodes URL-safe', () => {
      const encoded = encoding.base64UrlEncode('hello world');
      const decoded = encoding.base64UrlDecode(encoded);
      expect(decoded).toBe('hello world');
    });

    it('roundtrips base64Url', () => {
      const original = 'test?query=value&other=123';
      const encoded = encoding.base64UrlEncode(original);
      const decoded = encoding.base64UrlDecode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe('url encoding', () => {
    it('urlEncode encodes URI component', () => {
      expect(encoding.urlEncode('hello world')).toBe('hello%20world');
      expect(encoding.urlEncode('a=b&c=d')).toBe('a%3Db%26c%3Dd');
    });

    it('urlDecode decodes URI component', () => {
      expect(encoding.urlDecode('hello%20world')).toBe('hello world');
      expect(encoding.urlDecode('a%3Db%26c%3Dd')).toBe('a=b&c=d');
    });

    it('roundtrips url encoding', () => {
      const original = 'key=value&special=äöü';
      const encoded = encoding.urlEncode(original);
      const decoded = encoding.urlDecode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe('query string', () => {
    it('queryEncode encodes object to query string', () => {
      expect(encoding.queryEncode({ a: 1, b: 'hello' })).toBe('a=1&b=hello');
    });

    it('queryEncode handles arrays', () => {
      const result = encoding.queryEncode({ tags: ['a', 'b'] });
      expect(result).toContain('tags=a');
      expect(result).toContain('tags=b');
    });

    it('queryEncode handles special characters', () => {
      const result = encoding.queryEncode({ q: 'hello world' });
      expect(result).toBe('q=hello%20world');
    });

    it('queryDecode decodes query string', () => {
      expect(encoding.queryDecode('a=1&b=hello')).toEqual({ a: '1', b: 'hello' });
    });

    it('queryDecode handles duplicate keys as array', () => {
      const result = encoding.queryDecode('a=1&a=2');
      expect(result).toEqual({ a: ['1', '2'] });
    });

    it('queryDecode handles empty values', () => {
      const result = encoding.queryDecode('a=&b=2');
      expect(result).toEqual({ a: '', b: '2' });
    });
  });

  describe('hex encoding', () => {
    it('hexEncode encodes string to hex', () => {
      expect(encoding.hexEncode('hello')).toBe('68656c6c6f');
    });

    it('hexDecode decodes hex to string', () => {
      expect(encoding.hexDecode('68656c6c6f')).toBe('hello');
    });

    it('roundtrips hex encoding', () => {
      const original = 'Test string';
      const encoded = encoding.hexEncode(original);
      const decoded = encoding.hexDecode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe('percent encoding', () => {
    it('percentEncode encodes conservatively', () => {
      expect(encoding.percentEncode('hello world')).toBe('hello%20world');
      expect(encoding.percentEncode('abc-_.~')).toBe('abc-_.~'); // Unreserved chars
    });

    it('percentDecode decodes', () => {
      expect(encoding.percentDecode('hello%20world')).toBe('hello world');
    });

    it('roundtrips percent encoding', () => {
      const original = 'Hello World!';
      const encoded = encoding.percentEncode(original);
      const decoded = encoding.percentDecode(encoded);
      expect(decoded).toBe(original);
    });
  });

  describe('HTML escaping', () => {
    it('htmlEscape escapes HTML entities', () => {
      expect(encoding.htmlEscape('<div>')).toBe('&lt;div&gt;');
      expect(encoding.htmlEscape('"hello"')).toBe('&quot;hello&quot;');
      expect(encoding.htmlEscape("'test'")).toBe('&#039;test&#039;');
      expect(encoding.htmlEscape('a & b')).toBe('a &amp; b');
    });

    it('htmlUnescape unescapes HTML entities', () => {
      expect(encoding.htmlUnescape('&lt;div&gt;')).toBe('<div>');
      expect(encoding.htmlUnescape('&quot;hello&quot;')).toBe('"hello"');
      expect(encoding.htmlUnescape('&#039;test&#039;')).toBe("'test'");
      expect(encoding.htmlUnescape('a &amp; b')).toBe('a & b');
    });

    it('htmlUnescape handles alternative escapes', () => {
      expect(encoding.htmlUnescape('&#x27;')).toBe("'");
      expect(encoding.htmlUnescape('&#x60;')).toBe('`');
    });

    it('roundtrips HTML escaping', () => {
      const original = '<script>alert("xss")</script>';
      const escaped = encoding.htmlEscape(original);
      const unescaped = encoding.htmlUnescape(escaped);
      expect(unescaped).toBe(original);
    });
  });

  describe('JSON', () => {
    it('jsonEncode encodes object', () => {
      expect(encoding.jsonEncode({ a: 1 })).toBe('{"a":1}');
    });

    it('jsonEncode handles arrays', () => {
      expect(encoding.jsonEncode([1, 2, 3])).toBe('[1,2,3]');
    });

    it('jsonEncode handles primitives', () => {
      expect(encoding.jsonEncode('hello')).toBe('"hello"');
      expect(encoding.jsonEncode(42)).toBe('42');
      expect(encoding.jsonEncode(true)).toBe('true');
      expect(encoding.jsonEncode(null)).toBe('null');
    });

    it('jsonDecode decodes JSON string', () => {
      expect(encoding.jsonDecode('{"a":1}')).toEqual({ a: 1 });
      expect(encoding.jsonDecode('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('jsonDecode returns null for invalid JSON', () => {
      expect(encoding.jsonDecode('invalid')).toBe(null);
      expect(encoding.jsonDecode('{invalid}')).toBe(null);
    });

    it('jsonDecode with type', () => {
      interface MyType { a: number }
      const result = encoding.jsonDecode<MyType>('{"a":1}');
      expect(result?.a).toBe(1);
    });

    it('roundtrips JSON', () => {
      const original = { name: 'test', values: [1, 2, 3], nested: { x: true } };
      const encoded = encoding.jsonEncode(original);
      const decoded = encoding.jsonDecode(encoded);
      expect(decoded).toEqual(original);
    });
  });
});
